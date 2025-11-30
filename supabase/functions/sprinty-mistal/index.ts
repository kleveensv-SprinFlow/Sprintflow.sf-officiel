import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keys from environment variables
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY') ?? '';
const MISTRAL_MODEL   = Deno.env.get('MISTRAL_MODEL')   ?? 'mistral-small-latest';
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')    ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
// Keys for Google Search (optional but recommended for live data)
const GOOGLE_SEARCH_KEY = Deno.env.get('GOOGLE_SEARCH_KEY') ?? '';
const GOOGLE_SEARCH_CX  = Deno.env.get('GOOGLE_SEARCH_CX')  ?? '';

interface RequestPayload {
  question: string;
  userId: string;
  userRole: string; // 'athlete' | 'coach'
  language: 'fr' | 'en' | 'es';
  conversationHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      question,
      userId,
      userRole = 'athlete',
      language = 'fr',
      conversationHistory = []
    } = await req.json() as RequestPayload;

    if (!question || question.trim().length === 0) {
      throw new Error('Question vide');
    }

    if (!MISTRAL_API_KEY) {
      throw new Error('Clé API Mistral manquante. Définissez MISTRAL_API_KEY.');
    }

    // 1. Fetch User Context (Workouts, Records, Wellness, etc.)
    // We use the Service Role Key to bypass RLS for fetching context quickly.
    // In a stricter environment, we could use the user's JWT.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let contextText = "Aucune donnée spécifique disponible.";

    if (userId) {
      const [
        { data: workouts },
        { data: records },
        { data: wellness },
        { data: bodycomp },
        { data: nutrition },
        { data: profile }
      ] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', userId).eq('status', 'completed').order('date', { ascending: false }).limit(5),
        supabase.from('records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10),
        supabase.from('wellness_log').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
        supabase.from('donnees_corporelles').select('*').eq('athlete_id', userId).order('date', { ascending: false }).limit(1),
        supabase.from('journal_alimentaire').select('*').eq('athlete_id', userId).order('date', { ascending: false }).limit(5),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ]);

      const userName = profile?.first_name || 'Athlète';
      const userDiscipline = profile?.discipline || 'Non spécifié';

      contextText = `
      PROFIL DE L'UTILISATEUR:
      - Nom: ${userName}
      - Rôle: ${userRole}
      - Discipline: ${userDiscipline}

      DERNIERS ENTRAÎNEMENTS COMPLÉTÉS (5 derniers):
      ${workouts?.length ? JSON.stringify(workouts.map(w => ({ date: w.date, type: w.type, rpe: w.rpe, duration: w.duration_minutes }))) : "Aucun entraînement récent."}

      RECORDS PERSONNELS (PRs récents):
      ${records?.length ? JSON.stringify(records.map(r => ({ exercise: r.name, value: r.value, unit: r.unit, date: r.date }))) : "Aucun record récent."}

      BIEN-ÊTRE (7 derniers jours):
      ${wellness?.length ? JSON.stringify(wellness.map(w => ({ date: w.date, sommeil: w.ressenti_sommeil, stress: w.stress_level, fatigue: w.muscle_fatigue }))) : "Aucune donnée de bien-être."}

      DONNÉES CORPORELLES (Actuel):
      ${bodycomp?.length ? JSON.stringify(bodycomp[0]) : 'Aucune donnée récente.'}
      `;
    }

    // 2. Google Search (Optional)
    let searchResultsText = "";
    if (GOOGLE_SEARCH_KEY && GOOGLE_SEARCH_CX) {
      // Basic heuristic: Perform search if question contains "Actu", "Recherche", "News" or is long enough to be complex
      // For now, we search for almost everything to be safe, or we could be smarter.
      // Let's just do a search to augment knowledge.
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${encodeURIComponent(question)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          searchResultsText = searchData.items.slice(0, 3).map((item: any) => `- ${item.title}: ${item.snippet}`).join('\n');
        }
      } catch (e) {
        console.error("Search failed:", e);
      }
    }

    // 3. Construct System Prompt based on Role
    let systemPromptBase = "";
    
    if (userRole === 'coach' || userRole === 'encadrant') {
      // COACH PERSONA
      systemPromptBase = `
Tu es Sprinty, l'assistant IA pour les Coachs sur SprintFlow.
Ton interlocuteur est un COACH sportif.

TES OBJECTIFS :
1. Être un partenaire de réflexion stratégique.
2. Simplifier l'analyse des données complexes.
3. Suggérer des adaptations d'entraînement basées sur les données.

TON STYLE :
- Professionnel, Concis, Analytique.
- Tu ne tutoies pas forcément, sauf si demandé, mais reste respectueux.
- Tu proposes des solutions ("Je suggère...", "D'après les données...").
- Pas d'emojis superflus, juste pour structurer si besoin.

RÈGLES DE SÉCURITÉ :
- Ne donne JAMAIS de conseil médical strict.
- Reste dans le domaine de la performance sportive.
      `;
    } else {
      // ATHLETE PERSONA (Default)
      systemPromptBase = `
Tu es Sprinty, le coach virtuel et partenaire d'entraînement sur SprintFlow.
Ton interlocuteur est un ATHLÈTE.

TES OBJECTIFS :
1. Motiver et encourager l'athlète à se dépasser.
2. Expliquer les concepts d'entraînement simplement (pédagogie).
3. Analyser ses progrès et féliciter les réussites.

TON STYLE :
- Chaleureux, Dynamique, Motivant !
- Tu peux tutoyer pour créer de la proximité ("Salut Champion !", "Bravo pour ta séance").
- Utilise des émojis pour rendre la conversation vivante (🔥, 🏃, 💪) mais sans excès.
- Orienté progression et sensations.

RÈGLES DE SÉCURITÉ :
- Ne donne JAMAIS de conseil médical strict.
- En cas de douleur signalée, conseille toujours de voir un médecin ou kiné.
      `;
    }

    const finalSystemPrompt = `
${systemPromptBase}

CONTEXTE DE L'UTILISATEUR (Données réelles) :
${contextText}

RÉSULTATS DE RECHERCHE WEB (Pour information à jour) :
${searchResultsText ? searchResultsText : "Pas de résultats de recherche spécifiques."}

INSTRUCTIONS FINALES :
- Utilise le contexte pour personnaliser ta réponse (cite les dernières séances ou records si pertinent).
- Si la recherche web apporte une info utile, intègre-la.
- Réponds toujours en ${language === 'en' ? 'Anglais' : language === 'es' ? 'Espagnol' : 'Français'}.
- Utilise le Markdown pour la mise en forme.
    `;

    // 4. Call Mistral AI
    const messages = [
      { role: 'system', content: finalSystemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: question },
    ];

    console.log('Appel Mistral API avec le nouveau système unifié.');

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Mistral API :', response.status, errorText);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? 'Aucune réponse disponible.';

    // Optionnel : Sauvegarder la réponse dans 'individual_chat_messages' si on veut garder une trace serveur
    // Le client le fait aussi dans SprintyContext, mais c'est bien d'avoir une redondance ou de laisser le serveur gérer.
    // Pour l'instant, on laisse le client gérer l'insertion de la réponse pour éviter les doublons si le client le fait déjà.

    return new Response(
      JSON.stringify({
        answer,
        userRole,
        language,
        model: MISTRAL_MODEL,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );

  } catch (error) {
    console.error('Erreur dans sprinty-mistal :', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
        details: 'Erreur interne du serveur Edge.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
