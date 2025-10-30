import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const calculateNavyBodyFat = (gender: 'male' | 'female', heightCm: number, waistCm: number, neckCm: number, hipCm?: number): number => {
  if (gender === 'male') {
    return 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  } else {
    if (!hipCm) return 0;
    return 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
  }
};

const getDisciplineWeights = (discipline: string | null) => {
  const defaultWeights = {
    halterophilie: 0.30,
    muscu_bas: 0.30,
    muscu_haut: 0.20,
    unilateral: 0.10,
    pliometrie: 0.10,
  };

  switch (discipline) {
    case 'sprint':
      return { ...defaultWeights, halterophilie: 0.40, muscu_bas: 0.40, muscu_haut: 0.15, pliometrie: 0.05 };
    case 'sauts':
      return { ...defaultWeights, pliometrie: 0.30, halterophilie: 0.30, muscu_bas: 0.30, unilateral: 0.10 };
    case 'lancers':
      return { ...defaultWeights, muscu_haut: 0.40, halterophilie: 0.35, muscu_bas: 0.20, pliometrie: 0.05 };
    case 'demi-fond':
      return { ...defaultWeights, unilateral: 0.30, muscu_bas: 0.30, muscu_haut: 0.20, pliometrie: 0.20 };
    default:
      return defaultWeights;
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("taille_cm, sexe, tour_taille_cm, tour_cou_cm, tour_hanches_cm, discipline")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
      throw new Error(`Database error: ${profileError.message}`);
    }

    const { data: latestCorpo, error: corpoError } = await supabase
      .from("donnees_corporelles")
      .select("poids_kg, masse_grasse_pct")
      .eq("athlete_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (corpoError && corpoError.code !== 'PGRST116') {
      console.error("Body composition error:", corpoError);
    }
    
    const { data: records, error: recordsError } = await supabase
      .from("records")
      .select("exercice_id, value")
      .eq("user_id", user.id)
      .not("exercice_id", "is", null);

    if (recordsError) {
      console.error("Records error:", recordsError);
      throw new Error(`Database error: ${recordsError.message}`);
    }

    const { data: exercices, error: exercicesError } = await supabase
      .from("exercices_reference")
      .select("*");
      
    if (exercicesError) {
      console.error("Exercices error:", exercicesError);
      throw new Error(`Database error: ${exercicesError.message}`);
    }

    let scoreCompo = 50;
    let compoMethod = 'default';
    const poids = latestCorpo?.poids_kg || 75;
    const taille = ((profile?.taille_cm || 175) / 100);

    const masseGrasse = latestCorpo?.masse_grasse_pct;
    
    if (masseGrasse) {
      compoMethod = 'Masse Grasse';
      if (masseGrasse <= 10) scoreCompo = 100;
      else if (masseGrasse <= 12) scoreCompo = 95;
      else if (masseGrasse <= 14) scoreCompo = 85;
      else if (masseGrasse <= 16) scoreCompo = 75;
      else if (masseGrasse <= 18) scoreCompo = 65;
      else if (masseGrasse <= 20) scoreCompo = 50;
      else scoreCompo = Math.max(30, 50 - (masseGrasse - 20) * 2);
    } else if (profile?.sexe && profile?.tour_cou_cm && profile?.tour_taille_cm && profile?.taille_cm) {
      const estimatedFat = calculateNavyBodyFat(
        profile.sexe as 'male' | 'female', 
        profile.taille_cm, 
        profile.tour_taille_cm, 
        profile.tour_cou_cm, 
        profile.tour_hanches_cm || undefined
      );
      compoMethod = 'Formule Navy (Estimation)';
      if (estimatedFat <= 10) scoreCompo = 100;
      else if (estimatedFat <= 12) scoreCompo = 95;
      else if (estimatedFat <= 14) scoreCompo = 85;
      else if (estimatedFat <= 16) scoreCompo = 75;
      else if (estimatedFat <= 18) scoreCompo = 65;
      else if (estimatedFat <= 20) scoreCompo = 50;
      else scoreCompo = Math.max(30, 50 - (estimatedFat - 20) * 2);
    } else {
      compoMethod = 'IMC (Estimation)';
      const imc = poids / (taille * taille);
      if (imc < 20) scoreCompo = 80;
      else if (imc < 22) scoreCompo = 90;
      else if (imc < 24) scoreCompo = 75;
      else if (imc < 26) scoreCompo = 60;
      else scoreCompo = Math.max(30, 60 - (imc - 26) * 5);
    }

    const exMap = new Map((exercices || []).map(e => [e.id, e]));
    const allScores: Record<string, number[]> = {};

    for (const rec of records || []) {
      const ex = exMap.get(rec.exercice_id);
      if (!ex || !rec.value) continue;

      const ratio = rec.value / poids;
      let score = 0;

      if (ratio >= ex.bareme_elite) score = 100;
      else if (ratio >= ex.bareme_avance) score = 80 + ((ratio - ex.bareme_avance) / (ex.bareme_elite - ex.bareme_avance)) * 20;
      else if (ratio >= ex.bareme_intermediaire) score = 60 + ((ratio - ex.bareme_intermediaire) / (ex.bareme_avance - ex.bareme_intermediaire)) * 20;
      else score = Math.max(0, (ratio / ex.bareme_intermediaire) * 60);
      
      score = Math.min(100, Math.round(score));

      if (!allScores[ex.categorie]) {
        allScores[ex.categorie] = [];
      }
      allScores[ex.categorie].push(score);
    }

    const categorieScores: Record<string, number> = {};
    for (const cat in allScores) {
      const sortedScores = allScores[cat].sort((a, b) => b - a);
      const topScores = sortedScores.slice(0, 2);
      const avgScore = topScores.reduce((sum, s, i) => sum + s * (i === 0 ? 0.7 : 0.3), 0) / (topScores.length > 1 ? 1.0 : 0.7);
      categorieScores[cat] = Math.round(avgScore);
    }

    const weights = getDisciplineWeights(profile?.discipline || null);
    let scoreForce = 0;
    let totalWeight = 0;

    for (const [cat, weight] of Object.entries(weights)) {
      if (categorieScores[cat]) {
        scoreForce += categorieScores[cat] * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      scoreForce /= totalWeight;
    }

    const indice = Math.round(scoreCompo * 0.4 + scoreForce * 0.6);

    return new Response(
      JSON.stringify({
        indice,
        scoreCompo: Math.round(scoreCompo),
        scoreForce: Math.round(scoreForce),
        categorieScores,
        context: { 
          poids, 
          masseGrasse,
          compoMethod,
          discipline: profile?.discipline || 'Non spécifiée' 
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
