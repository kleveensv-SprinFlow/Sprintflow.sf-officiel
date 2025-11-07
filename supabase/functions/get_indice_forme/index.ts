import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WellnessData {
  heure_coucher: string;
  heure_lever: string;
  ressenti_sommeil: number;
  stress_level: number;
  muscle_fatigue: number;
}

function calculateSleepDurationScore(durationMinutes: number): number {
  if (durationMinutes < 300) return 10;
  if (durationMinutes < 360) return 40;
  if (durationMinutes < 420) return 75;
  if (durationMinutes <= 540) return 100;
  if (durationMinutes <= 570) return 90;
  return 70;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      heure_coucher,
      heure_lever,
      ressenti_sommeil,
      stress_level,
      muscle_fatigue,
    }: WellnessData = await req.json();

    if (!heure_coucher || !heure_lever || ressenti_sommeil === undefined || stress_level === undefined || muscle_fatigue === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const coucher = new Date(heure_coucher);
    const lever = new Date(heure_lever);
    const dureeSommeilMinutes = (lever.getTime() - coucher.getTime()) / (1000 * 60);

    const scoreDuree = calculateSleepDurationScore(dureeSommeilMinutes);
    const scoreSommeil = scoreDuree * (ressenti_sommeil / 100);

    const scoreFatigue = 100 - muscle_fatigue;
    const scoreStress = 100 - stress_level;

    const indiceDeForme = (scoreSommeil * 0.4) + (scoreFatigue * 0.4) + (scoreStress * 0.2);

    const responseData = {
      indice_de_forme: Math.round(indiceDeForme),
      duree_sommeil_calculee: Math.round(dureeSommeilMinutes),
      details: {
        score_sommeil_final: Math.round(scoreSommeil),
        score_duree_sommeil: scoreDuree,
        score_fatigue_normalise: scoreFatigue,
        score_stress_normalise: scoreStress,
      }
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});