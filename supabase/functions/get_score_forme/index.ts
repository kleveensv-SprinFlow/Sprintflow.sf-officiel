import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const athleteId = userData.user.id;
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const { data: profile } = await supabase
      .from('profiles')
      .select('date_de_naissance')
      .eq('id', athleteId)
      .maybeSingle();

    let age = 25;
    if (profile?.date_de_naissance) {
      const birthDate = new Date(profile.date_de_naissance);
      age = today.getFullYear() - birthDate.getFullYear();
    }

    const { data: sleepData, count: sleepCount } = await supabase
      .from('sommeil_journalier')
      .select('duree_heures, qualite_ressentie', { count: 'exact' })
      .eq('athlete_id', athleteId)
      .gte('date', threeDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    const { data: workoutsData, count: workoutsCount } = await supabase
      .from('workouts')
      .select('date', { count: 'exact' })
      .eq('user_id', athleteId)
      .gte('date', threeDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (!sleepCount || sleepCount < 3 || !workoutsCount || workoutsCount === 0) {
      return new Response(
        JSON.stringify({
          score: null,
          calibration: true,
          jours_manquants_sommeil: sleepCount ? Math.max(0, 3 - sleepCount) : 3,
          jours_manquants_entrainement: workoutsCount === 0 ? 1 : 0,
          message: 'Mode Calibration en cours. Continue de remplir ton journal pendant 3 jours pour débloquer tes scores.',
          message_id: null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let miniScoreRecuperation = 0;
    let miniScoreCharge = 0;
    const details: any = {};
    let causeFormeBasse = null;

    if (sleepData && sleepData.length >= 3) {
      const avgDuree = sleepData.reduce((sum, s) => sum + s.duree_heures, 0) / sleepData.length;
      const avgQualite = sleepData.reduce((sum, s) => sum + s.qualite_ressentie, 0) / sleepData.length;

      let scoreDuree = 0;
      if (avgDuree >= 8.5) scoreDuree = 100;
      else if (avgDuree >= 8) scoreDuree = 95;
      else if (avgDuree >= 7.5) scoreDuree = 85;
      else if (avgDuree >= 7) scoreDuree = 75;
      else if (avgDuree >= 6.5) scoreDuree = 60;
      else if (avgDuree >= 6) scoreDuree = 40;
      else if (avgDuree >= 5.5) scoreDuree = 25;
      else scoreDuree = 10;

      const scoreQualite = (avgQualite / 5) * 100;

      miniScoreRecuperation = Math.round((scoreDuree + scoreQualite) / 2);

      const ageModifier = age < 25 ? 1.05 : age > 30 ? 0.95 : 1.0;
      miniScoreRecuperation = Math.round(miniScoreRecuperation * ageModifier);
      miniScoreRecuperation = Math.min(100, Math.max(0, miniScoreRecuperation));

      if (miniScoreRecuperation < 50) {
        causeFormeBasse = 'SOMMEIL';
      }

      details.recuperation = {
        moyenne_duree: Math.round(avgDuree * 10) / 10,
        moyenne_qualite: Math.round(avgQualite * 10) / 10,
        age_modifier: ageModifier,
        mini_score: miniScoreRecuperation,
      };
    }

    const { data: workoutsLast7 } = await supabase
      .from('workouts')
      .select('date')
      .eq('user_id', athleteId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    const { data: latestAnalysis } = await supabase
      .from('workout_analyses')
      .select('fatigue_drop_off_pct')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (workoutsLast7) {
      const workoutDates = workoutsLast7.map(w => w.date);
      const uniqueDates = new Set(workoutDates);
      const joursEntrainement = uniqueDates.size;
      const joursRepos = 7 - joursEntrainement;

      let scoreFrequence = 0;
      if (joursRepos === 0) {
        scoreFrequence = 10;
        if (!causeFormeBasse) causeFormeBasse = 'CHARGE';
      } else if (joursRepos === 1) {
        scoreFrequence = 70;
      } else if (joursRepos === 2) {
        scoreFrequence = 100;
      } else if (joursRepos === 3) {
        scoreFrequence = 95;
      } else if (joursRepos === 4) {
        scoreFrequence = 80;
      } else {
        scoreFrequence = 60;
      }

      let scoreFatigue = 50;
      if (latestAnalysis?.fatigue_drop_off_pct !== null && latestAnalysis?.fatigue_drop_off_pct !== undefined) {
        const dropOff = latestAnalysis.fatigue_drop_off_pct;
        if (dropOff <= 2) scoreFatigue = 100;
        else if (dropOff <= 3) scoreFatigue = 90;
        else if (dropOff <= 5) scoreFatigue = 75;
        else if (dropOff <= 7) scoreFatigue = 60;
        else if (dropOff <= 10) scoreFatigue = 40;
        else scoreFatigue = 20;

        if (dropOff > 7 && !causeFormeBasse) {
          causeFormeBasse = 'SEANCE_DURE';
        }
      }

      miniScoreCharge = Math.round((scoreFrequence + scoreFatigue) / 2);

      details.charge = {
        jours_entrainement: joursEntrainement,
        jours_repos: joursRepos,
        fatigue_drop_off: latestAnalysis?.fatigue_drop_off_pct || null,
        mini_score: miniScoreCharge,
      };
    }

    const scoreFinal = Math.round(
      miniScoreRecuperation * 0.5 +
      miniScoreCharge * 0.5
    );

    let messageId = null;
    if (scoreFinal < 50) {
      if (causeFormeBasse === 'SOMMEIL') {
        messageId = 'FORME_BAS_SOMMEIL';
      } else if (causeFormeBasse === 'CHARGE') {
        messageId = 'FORME_BAS_CHARGE';
      } else if (causeFormeBasse === 'SEANCE_DURE') {
        messageId = 'FORME_BAS_SEANCE_DURE';
      } else {
        messageId = 'FORME_BAS_GENERAL';
      }
    } else if (scoreFinal >= 80) {
      messageId = 'FORME_HAUT';
    } else {
      messageId = 'FORME_MOYEN';
    }

    return new Response(
      JSON.stringify({
        score: scoreFinal,
        calibration: false,
        mini_scores: {
          recuperation: miniScoreRecuperation,
          charge: miniScoreCharge,
        },
        message_id: messageId,
        cause: causeFormeBasse,
        details,
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