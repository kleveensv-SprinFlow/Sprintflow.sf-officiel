import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Course {
  temps: number;
  type_chrono: 'manuel' | 'electronique';
  distance?: number;
}

interface WorkoutData {
  id: string;
  user_id: string;
  tag_seance?: 'vitesse_max' | 'endurance_lactique' | 'technique_recup';
  courses_json?: Course[];
  runs?: any[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, record: workout }: { type: string; record: WorkoutData } = await req.json();

    if (type !== 'INSERT' && type !== 'UPDATE') {
      return new Response(
        JSON.stringify({ error: 'Type d\'événement non supporté' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workoutId = workout.id;
    const athleteId = workout.user_id;
    const tagSeance = workout.tag_seance;

    let courses: Course[] = [];

    if (workout.courses_json && Array.isArray(workout.courses_json) && workout.courses_json.length > 0) {
      courses = workout.courses_json;
    } else if (workout.runs && Array.isArray(workout.runs) && workout.runs.length > 0) {
      courses = workout.runs.map((run: any) => ({
        temps: run.time || run.temps || 0,
        type_chrono: 'manuel',
        distance: run.distance || 100,
      }));
    }

    if (courses.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucune course à analyser',
          skipped: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tempsValides = courses.filter(c => c.temps > 0).map(c => c.temps);

    if (tempsValides.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucun temps valide à analyser',
          skipped: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const meilleurTemps = Math.min(...tempsValides);
    const premierTemps = tempsValides[0];
    const dernierTemps = tempsValides[tempsValides.length - 1];

    let performanceDuJourPct = null;
    const distance = courses[0]?.distance || 100;

    const { data: recordData } = await supabase
      .from('records')
      .select('value, exercise_name')
      .eq('user_id', athleteId)
      .or(`exercise_name.eq.${distance}m,exercise_name.ilike.%${distance}%`)
      .order('value', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (recordData?.value) {
      const recordTemps = recordData.value;
      performanceDuJourPct = Math.round((meilleurTemps / recordTemps) * 100);
    }

    let fatigueDropOffPct = 0;
    if (tempsValides.length > 1) {
      fatigueDropOffPct = Math.round(((dernierTemps - premierTemps) / premierTemps) * 100);
    }

    let evaluationContexte = '';

    if (tagSeance === 'vitesse_max') {
      if (fatigueDropOffPct > 5) {
        evaluationContexte = 'Attention: Drop-off élevé pour une séance de vitesse. Cela peut indiquer une fatigue importante ou un échauffement insuffisant.';
      } else if (fatigueDropOffPct <= 3) {
        evaluationContexte = 'Excellent: Drop-off minimal, la fraîcheur est bien préservée sur la séance de vitesse.';
      } else {
        evaluationContexte = 'Bon: Drop-off acceptable pour une séance de vitesse maximale.';
      }
    } else if (tagSeance === 'endurance_lactique') {
      if (fatigueDropOffPct > 15) {
        evaluationContexte = 'Normal: Drop-off important, cohérent avec l\'objectif d\'endurance lactique. La fatigue accumulée est volontaire.';
      } else if (fatigueDropOffPct < 8) {
        evaluationContexte = 'Attention: Drop-off faible pour une séance lactique. L\'intensité pourrait être augmentée si l\'objectif est de travailler la résistance.';
      } else {
        evaluationContexte = 'Bon: Drop-off modéré, adapté à une séance d\'endurance lactique.';
      }
    } else if (tagSeance === 'technique_recup') {
      if (fatigueDropOffPct > 5) {
        evaluationContexte = 'Attention: Drop-off élevé pour une séance technique/récupération. Vérifiez que l\'intensité reste modérée.';
      } else {
        evaluationContexte = 'Parfait: Drop-off faible, cohérent avec une séance de technique ou de récupération active.';
      }
    } else {
      evaluationContexte = `Drop-off de ${fatigueDropOffPct}% observé sur la séance.`;
    }

    const { data: existingAnalysis } = await supabase
      .from('workout_analyses')
      .select('id')
      .eq('workout_id', workoutId)
      .maybeSingle();

    if (existingAnalysis) {
      await supabase
        .from('workout_analyses')
        .update({
          performance_du_jour_pct: performanceDuJourPct,
          fatigue_drop_off_pct: fatigueDropOffPct,
          evaluation_contexte: evaluationContexte,
        })
        .eq('id', existingAnalysis.id);
    } else {
      await supabase
        .from('workout_analyses')
        .insert({
          workout_id: workoutId,
          athlete_id: athleteId,
          performance_du_jour_pct: performanceDuJourPct,
          fatigue_drop_off_pct: fatigueDropOffPct,
          evaluation_contexte: evaluationContexte,
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analyse de séance complétée',
        analysis: {
          workout_id: workoutId,
          performance_du_jour_pct: performanceDuJourPct,
          fatigue_drop_off_pct: fatigueDropOffPct,
          evaluation_contexte: evaluationContexte,
          meilleur_temps: meilleurTemps,
          nombre_courses: tempsValides.length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});