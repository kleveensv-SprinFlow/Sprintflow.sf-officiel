import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// KEYS
// Ensure these are set in Supabase Secrets:
// MISTRAL_API_KEY
// GOOGLE_SEARCH_KEY
// GOOGLE_SEARCH_CX

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, message } = await req.json()

    if (!user_id || !message) {
      throw new Error('Missing user_id or message')
    }

    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
    if (!MISTRAL_API_KEY) {
       throw new Error("MISTRAL_API_KEY not set")
    }
    const GOOGLE_SEARCH_KEY = Deno.env.get('GOOGLE_SEARCH_KEY')
    const GOOGLE_SEARCH_CX = Deno.env.get('GOOGLE_SEARCH_CX')
    const SPRINTY_ID = "00000000-0000-0000-0000-000000000000"

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch Context
    const [
      { data: workouts },
      { data: records },
      { data: wellness },
      { data: bodycomp },
      { data: nutrition },
      { data: profile }
    ] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', user_id).eq('status', 'completed').order('date', { ascending: false }).limit(5),
      supabase.from('records').select('*').eq('user_id', user_id).order('date', { ascending: false }).limit(20),
      supabase.from('wellness_log').select('*').eq('user_id', user_id).order('date', { ascending: false }).limit(7),
      supabase.from('donnees_corporelles').select('*').eq('athlete_id', user_id).order('date', { ascending: false }).limit(1),
      supabase.from('journal_alimentaire').select('*').eq('athlete_id', user_id).order('date', { ascending: false }).limit(20),
      supabase.from('profiles').select('*').eq('id', user_id).single()
    ])

    // Format Context
    const context = `
    PROFIL ATHLÈTE:
    Nom: ${profile?.first_name || 'Athlète'}
    Discipline: ${profile?.discipline || 'Non spécifié'}
    
    DERNIERS ENTRAÎNEMENTS COMPLÉTÉS (5 derniers):
    ${JSON.stringify(workouts?.map(w => ({ date: w.date, type: w.type, rpe: w.rpe, duration: w.duration_minutes })))}

    RECORDS PERSONNELS (PRs récents):
    ${JSON.stringify(records?.map(r => ({ exercise: r.name, value: r.value, unit: r.unit, date: r.date })))}

    BIEN-ÊTRE (7 derniers jours):
    ${JSON.stringify(wellness?.map(w => ({ date: w.date, sommeil: w.ressenti_sommeil, stress: w.stress_level, fatigue: w.muscle_fatigue })))}

    DONNÉES CORPORELLES (Actuel):
    ${JSON.stringify(bodycomp?.[0] || 'Aucune donnée')}

    NUTRITION (Récents):
    ${JSON.stringify(nutrition?.map(n => ({ date: n.date, aliment: n.aliment_nom, kcal: n.kcal, proteines: n.proteines_g })))}
    `

    // 2. Search (optional - only if keys are configured)
    let searchResultsText = ""
    if (GOOGLE_SEARCH_KEY && GOOGLE_SEARCH_CX) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${encodeURIComponent(message)}`
        const searchRes = await fetch(searchUrl)
        const searchData = await searchRes.json()
        if (searchData.items && searchData.items.length > 0) {
          searchResultsText = searchData.items.slice(0, 3).map((item: any) => `- ${item.title}: ${item.snippet}`).join('\n')
        }
      } catch (e) {
        console.error("Search failed", e)
      }
    }

    // 3. Call Mistral
    const systemPrompt = `
    Tu es Sprinty, un coach sportif virtuel expert en athlétisme de haut niveau, nutrition et physiologie.
    
    CONTEXTE DE L'ATHLÈTE :
    ${context}

    RÉSULTATS DE RECHERCHE WEB (Info fraîche) :
    ${searchResultsText}

    CONSIGNES :
    1. Analyse les données de l'athlète pour personnaliser ta réponse.
    2. Utilise les infos du web si pertinent.
    3. Ton ton est professionnel, calme, très encourageant et tu inspires confiance.
    4. Utilise le Markdown (Gras, listes) pour la lisibilité.
    5. Ne donne JAMAIS de conseil médical.
    6. Réponds toujours en Français.
    `

    const mistralPayload = {
        model: "mistral-small-latest", // Or use env var MISTRAL_MODEL
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
    }

    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify(mistralPayload)
    })

    if (!mistralRes.ok) {
        const errTxt = await mistralRes.text()
        throw new Error(`Mistral Error: ${mistralRes.status} - ${errTxt}`)
    }

    const mistralData = await mistralRes.json()
    const aiResponse = mistralData.choices?.[0]?.message?.content || "Désolé, je n'ai pas réussi à formuler une réponse."

    // 4. Save Response
    const { error: insertError } = await supabase
      .from('individual_chat_messages')
      .insert({
        sender_id: SPRINTY_ID,
        receiver_id: user_id,
        message: aiResponse
      })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
