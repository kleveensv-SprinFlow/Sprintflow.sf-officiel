import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Helper for linear interpolation
function interpolate(value: number, points: { x: number, y: number }[]): number {
  let p1 = points[0];
  let p2 = points[points.length - 1];

  if (value <= p1.x) return p1.y;
  if (value >= p2.x) return p2.y;

  for (let i = 0; i < points.length - 1; i++) {
    if (value >= points[i].x && value <= points[i+1].x) {
      p1 = points[i];
      p2 = points[i+1];
      break;
    }
  }

  const weight = (value - p1.x) / (p2.x - p1.x);
  return p1.y + weight * (p2.y - p1.y);
}

// Score calculation for body composition
function calculateCompositionScore(data: { masse_musculaire_kg?: number, masse_grasse_pct?: number, imc?: number, poids_kg?: number, sexe?: string }): { score: number, mode: 'muscle' | 'expert' | 'standard', value: number } {
  const { masse_musculaire_kg, masse_grasse_pct, imc, poids_kg, sexe } = data;

  // 1. Priority: Muscle Mass (if available)
  if (masse_musculaire_kg && poids_kg && poids_kg > 0) {
    const musclePct = (masse_musculaire_kg / poids_kg) * 100;
    
    // Heuristic ranges for Muscle % (Skeletal Muscle Mass)
    // Men: 40-50% is excellent. <33% low.
    // Women: 30-40% is excellent. <24% low.
    // Using InBody/Tanita standard approximations for athletes.
    
    let points;
    if (sexe === 'femme') {
       points = [
         { x: 20, y: 20 },
         { x: 24, y: 50 },
         { x: 28, y: 75 },
         { x: 33, y: 100 },
         { x: 40, y: 100 }
       ];
    } else {
       // Men
       points = [
         { x: 28, y: 20 },
         { x: 33, y: 50 },
         { x: 38, y: 75 },
         { x: 44, y: 100 },
         { x: 55, y: 100 }
       ];
    }
    
    const score = interpolate(musclePct, points);
    return { score: Math.round(score), mode: 'muscle', value: Math.round(musclePct * 10) / 10 };
  }

  // 2. Fallback: Fat Mass
  if (masse_grasse_pct) {
    const mg = masse_grasse_pct;
    // Optimal: 8-12 -> 100, 15 -> 75, 18 -> 60, >20 -> <40
    const points = [
      { x: 8, y: 100 },
      { x: 12, y: 100 },
      { x: 15, y: 75 },
      { x: 18, y: 60 },
      { x: 20, y: 40 },
      { x: 25, y: 20 } // Extrapolation
    ];
    // Invert interpolation for fat mass (lower is better)
    const invertedPoints = points.sort((a,b) => a.x - b.x);
    let score = interpolate(mg, invertedPoints);
     if (mg < 8) score = 100 - (8-mg)*5; // Penalty for being too low
    return { score: Math.max(0, Math.min(100, score)), mode: 'expert', value: mg };
  }

  // 3. Fallback: BMI (IMC)
  if (imc) {
    // Optimal: 20-23 -> 100, 19/24 -> 75, 18/25 -> 50
    const points = [
        { x: 17, y: 30 },
        { x: 18, y: 50 },
        { x: 19, y: 75 },
        { x: 21.5, y: 100 }, // Midpoint of optimal range
        { x: 24, y: 75 },
        { x: 25, y: 50 },
        { x: 26, y: 30 }
    ];
    return { score: Math.max(0, Math.min(100, interpolate(imc, points))), mode: 'standard', value: imc };
  }

  return { score: 50, mode: 'standard', value: 0 }; // Default score if no data
}


// Score calculation for a single exercise performance
function calculatePerformanceScore(ratio: number, base?: number, avance?: number, elite?: number): number {
    if (!base || !avance || !elite || ratio < 0) return 0;

    const points = [
        { x: 0, y: 0 },
        { x: base, y: 25 },
        { x: avance, y: 75 },
        { x: elite, y: 100 },
        { x: elite * 1.1, y: 105 } // Bonus for exceeding elite
    ];
    
    return Math.round(Math.max(0, Math.min(105, interpolate(ratio, points))));
}


Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const athleteId = userData.user.id;

    // 1. Get athlete's body data and profile
    const { data: profile } = await supabase.from('profiles').select('taille_cm, sexe').eq('id', athleteId).single();
    const { data: latestBodyComp } = await supabase
      .from('donnees_corporelles')
      .select('poids_kg, masse_grasse_pct, masse_musculaire_kg')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestBodyComp?.poids_kg) {
      return new Response(JSON.stringify({ error: 'Poids corporel manquant.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const poidsKg = latestBodyComp.poids_kg;
    const imc = profile?.taille_cm ? poidsKg / Math.pow(profile.taille_cm / 100, 2) : undefined;
    
    // 2. Calculate Body Composition Score (40% of total)
    const compoData = calculateCompositionScore({ 
      masse_musculaire_kg: latestBodyComp.masse_musculaire_kg,
      masse_grasse_pct: latestBodyComp.masse_grasse_pct, 
      imc,
      poids_kg: poidsKg,
      sexe: profile?.sexe
    });
    const scoreComposition = Math.round(compoData.score);
    
    // 3. Calculate Relative Strength Score (60% of total)
    const { data: allRecords, error: recordsError } = await supabase
      .from('records')
      .select(`
        value,
        exercice_reference:exercices_reference (qualite_cible, unite, ratio_base, ratio_avance, ratio_elite),
        exercice_personnalise:exercices_personnalises (
            qualite_cible,
            ref:exercices_reference (unite, ratio_base, ratio_avance, ratio_elite)
        )
      `)
      .eq('user_id', athleteId);

    if (recordsError) throw recordsError;

    let bestExplosiviteScore = 0;
    let bestForceMaxScore = 0;

    for (const record of allRecords) {
        const ref = record.exercice_reference || record.exercice_personnalise?.ref;
        if (!ref) continue;

        const ratio = ref.unite === 'kg' ? record.value / poidsKg : record.value;
        const performanceScore = calculatePerformanceScore(ratio, ref.ratio_base, ref.ratio_avance, ref.ratio_elite);
        
        const qualiteCible = record.exercice_reference?.qualite_cible || record.exercice_personnalise?.qualite_cible;

        if (qualiteCible && qualiteCible.toLowerCase().includes('explosivité')) {
            if (performanceScore > bestExplosiviteScore) {
                bestExplosiviteScore = performanceScore;
            }
        } else if (qualiteCible && qualiteCible.toLowerCase().includes('force maximale')) {
            if (performanceScore > bestForceMaxScore) {
                bestForceMaxScore = performanceScore;
            }
        }
    }

    let scoreForceRelative = 0;
    const hasExplo = bestExplosiviteScore > 0;
    const hasForceMax = bestForceMaxScore > 0;

    if (hasExplo && hasForceMax) {
        scoreForceRelative = Math.round((bestExplosiviteScore * 0.7) + (bestForceMaxScore * 0.3));
    } else if (hasExplo) {
        scoreForceRelative = bestExplosiviteScore;
    } else if (hasForceMax) {
        scoreForceRelative = bestForceMaxScore;
    } else {
        scoreForceRelative = 50; // Default if no relevant records
    }
    
    // 4. Final Score Calculation
    const scoreFinal = Math.round((scoreComposition * 0.4) + (scoreForceRelative * 0.6));

    return new Response(
      JSON.stringify({
        score: scoreFinal,
        mini_scores: {
          composition: scoreComposition,
          force: scoreForceRelative
        },
        details: {
          composition: {
            mode: compoData.mode,
            value: Math.round(compoData.value * 10) / 10
          },
          force: {
            score_explosivite: bestExplosiviteScore,
            score_force_maximale: bestForceMaxScore
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur in get_indice_performance:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
