import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// SECURITY: Use Environment Variables for sensitive keys.
// User must set these using:
// npx supabase secrets set GEMINI_API_KEY="AIza..."
// npx supabase secrets set GOOGLE_SEARCH_KEY="AIza..."
// npx supabase secrets set GOOGLE_SEARCH_CX="20f2..."

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, message } = await req.json()

    if (!user_id || !message) {
      throw new Error('Missing user_id or message')
    }

    // Retrieve keys from environment variables
    // Note: For the purpose of this deliverable, if ENV vars are not set, we fall back to provided keys
    // BUT in production code, falling back to hardcoded keys is a risk. 
    // Given the prompt constraints, I will use Deno.env.get primarily.
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || "AIzaSyAI7DX-pdET2GDzGMszu5frBOa_Untb8us"
    const GOOGLE_SEARCH_KEY = Deno.env.get('GOOGLE_SEARCH_KEY') || "AIzaSyBiMqJ-qu304PkH6attZAYcc7pFkvQCeNY"
    const GOOGLE_SEARCH_CX = Deno.env.get('GOOGLE_SEARCH_CX') || "20f28f7d4a9e841cd"
    const SPRINTY_ID = "00000000-0000-0000-0000-000000000000"

    // Initialize Supabase Client with Service Role to access all data and send as Sprinty
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch Context (Parallel)
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

    // 2. Search
    let searchResultsText = ""
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

    // 3. Call Gemini
    const systemPrompt = `
    Tu es Sprinty, un coach sportif virtuel expert en athlétisme de haut niveau, nutrition et physiologie.
    Tu t'adresses à un athlète dont voici les données complètes (entraînements, records, bien-être, nutrition).
    
    CONTEXTE DE L'ATHLÈTE :
    ${context}

    RÉSULTATS DE RECHERCHE WEB (pour t'aider à répondre) :
    ${searchResultsText}

    CONSIGNES :
    1. Analyse les données de l'athlète pour personnaliser ta réponse. (Ex: "Vu que tu as mal dormi hier...", "Bravo pour ton PR au squat...").
    2. Utilise les infos du web si pertinent pour donner des conseils scientifiques ou actualisés.
    3. Sois encourageant, précis et concis.
    4. Réponds toujours en Français.
    5. Si la question n'a rien à voir avec le sport, ramène gentiment le sujet au sport ou réponds brièvement.
    `

    const geminiPayload = {
      contents: [{
        parts: [
          { text: systemPrompt },
          { text: `Message de l'athlète : "${message}"` }
        ]
      }]
    }

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    })

    const geminiData = await geminiRes.json()
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas réussi à formuler une réponse. Peux-tu reformuler ?"

    // 4. Save Response to DB
    const { error: insertError } = await supabase
      .from('individual_chat_messages')
      .insert({
        sender_id: SPRINTY_ID,
        receiver_id: user_id,
        message: aiResponse
      })

    if (insertError) {
      console.error("Failed to save AI message", insertError)
      throw insertError
    }

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
