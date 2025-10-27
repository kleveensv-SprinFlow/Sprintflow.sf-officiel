import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- Helper Functions ---

// US Navy Body Fat Formula
const calculateNavyBodyFat = (gender: 'male' | 'female', heightCm: number, waistCm: number, neckCm: number, hipCm?: number): number => {
  if (gender === 'male') {
    return 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  } else {
    if (!hipCm) return 0; // Hip measurement is required for females
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

// --- Main Function ---

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    // --- 1. Fetch Data ---
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("taille_cm, sexe, tour_taille_cm, tour_cou_cm, tour_hanches_cm, discipline")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const { data: latestCorpo, error: corpoError } = await supabase
      .from("donnees_corporelles")
      .select("poids_kg, masse_grasse_pct")
      .eq("athlete_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();
    
    // Allow for no body data to be present
    if (corpoError && corpoError.code !== 'PGRST116') throw corpoError;
    
    const { data: records, error: recordsError } = await supabase
      .from("records")
      .select("exercice_id, value")
      .eq("user_id", user.id)
      .not("exercice_id", "is", null);

    if (recordsError) throw recordsError;

    const { data: exercices, error: exercicesError } = await supabase
      .from("exercices_reference")
      .select("*");
      
    if (exercicesError) throw exercicesError;

    // --- 2. Calculate Composition Score ---
    let scoreCompo = 50;
    let compoMethod = 'default';
    const poids = latestCorpo?.poids_kg || 75; // Default to 75kg if no data
    const taille = (profile.taille_cm || 175) / 100; // Default to 175cm

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
    } else if (profile.sexe && profile.tour_cou_cm && profile.tour_taille_cm && profile.taille_cm) {
      const estimatedFat = calculateNavyBodyFat(profile.sexe, profile.taille_cm, profile.tour_taille_cm, profile.tour_cou_cm, profile.tour_hanches_cm);
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

    // --- 3. Calculate Strength Score ---
    const exMap = new Map(exercices.map(e => [e.id, e]));
    const allScores: Record<string, number[]> = {};

    for (const rec of records || []) {
      const ex = exMap.get(rec.exercice_id);
      if (!ex) continue;

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
      const topScores = sortedScores.slice(0, 2); // Take top 2 scores
      const avgScore = topScores.reduce((sum, s, i) => sum + s * (i === 0 ? 0.7 : 0.3), 0) / (topScores.length > 1 ? 1.0 : 0.7);
      categorieScores[cat] = Math.round(avgScore);
    }

    const weights = getDisciplineWeights(profile.discipline);
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

    // --- 4. Final Calculation ---
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
          discipline: profile.discipline || 'Non spécifiée' 
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});