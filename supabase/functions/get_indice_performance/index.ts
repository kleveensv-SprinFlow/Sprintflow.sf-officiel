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
    let miniScoreComposition = 0;
    let miniScoreForce = 0;
    const details: any = {};
    let modeExpert = false;
    let causeIndiceBas = null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('taille_cm, date_de_naissance')
      .eq('id', athleteId)
      .maybeSingle();

    let age = 25;
    if (profile?.date_de_naissance) {
      const birthDate = new Date(profile.date_de_naissance);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const { data: latestBodyComp } = await supabase
      .from('donnees_corporelles')
      .select('poids_kg, masse_grasse_pct, masse_musculaire_kg')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestBodyComp?.poids_kg) {
      return new Response(
        JSON.stringify({
          score: 50,
          mode_expert: false,
          mini_scores: { composition: 50, force: 50 },
          message_id: 'DONNEES_MANQUANTES',
          cause: null,
          details: { message: 'Poids corporel manquant. Ajoutez vos données de composition corporelle.' },
          rapport_poids_puissance: null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const poidsKg = latestBodyComp.poids_kg;

    if (latestBodyComp.masse_grasse_pct) {
      modeExpert = true;
      const mg = latestBodyComp.masse_grasse_pct;

      if (mg >= 6 && mg <= 10) {
        miniScoreComposition = 100;
      } else if (mg > 10 && mg <= 12) {
        miniScoreComposition = 95;
      } else if (mg > 12 && mg <= 14) {
        miniScoreComposition = 85;
      } else if (mg > 14 && mg <= 16) {
        miniScoreComposition = 70;
      } else if (mg > 16 && mg <= 18) {
        miniScoreComposition = 55;
      } else if (mg > 18 && mg <= 20) {
        miniScoreComposition = 40;
      } else if (mg < 6) {
        miniScoreComposition = 50;
      } else {
        miniScoreComposition = 25;
        causeIndiceBas = 'COMP_CORP';
      }

      details.composition = {
        mode: 'expert',
        masse_grasse_pct: mg,
        mini_score: miniScoreComposition,
        evaluation: mg <= 10 ? 'Optimal' : mg <= 14 ? 'Très bon' : mg <= 16 ? 'Bon' : mg <= 18 ? 'Moyen' : 'À améliorer'
      };
    } else if (profile?.taille_cm && poidsKg) {
      const imc = poidsKg / Math.pow(profile.taille_cm / 100, 2);

      if (imc >= 20 && imc <= 23) miniScoreComposition = 100;
      else if (imc >= 19 && imc < 20 || imc > 23 && imc <= 24) miniScoreComposition = 85;
      else if (imc >= 18 && imc < 19 || imc > 24 && imc <= 25) miniScoreComposition = 70;
      else if (imc >= 17 && imc < 18 || imc > 25 && imc <= 26) miniScoreComposition = 55;
      else {
        miniScoreComposition = 40;
        if (!causeIndiceBas) causeIndiceBas = 'COMP_CORP';
      }

      details.composition = { mode: 'standard', imc: Math.round(imc * 10) / 10, mini_score: miniScoreComposition };
    } else {
      miniScoreComposition = 50;
    }

    const { data: exercicesDB } = await supabase
      .from('exercices_sprint')
      .select('nom_fr, nom_en, categorie, ratio_excellent, ratio_tres_bon, ratio_bon, utilisable_pour_indice')
      .eq('utilisable_pour_indice', true);

    const { data: allRecords } = await supabase
      .from('records')
      .select('exercise_name, value')
      .eq('user_id', athleteId);

    const subScores: any[] = [];
    const evaluationsForce: any[] = [];

    if (allRecords && exercicesDB && allRecords.length > 0) {
      for (const record of allRecords) {
        const exerciceRef = exercicesDB.find(e => {
          const nomLower = record.exercise_name.toLowerCase();
          const nomFrLower = e.nom_fr.toLowerCase();
          const nomEnLower = e.nom_en?.toLowerCase() || '';

          return nomLower.includes(nomFrLower) ||
                 (nomEnLower && nomLower.includes(nomEnLower)) ||
                 nomFrLower.includes(nomLower) ||
                 (nomEnLower && nomEnLower.includes(nomLower));
        });

        if (!exerciceRef || !exerciceRef.ratio_bon) continue;

        const ratio = record.value / poidsKg;
        let score = 0;

        const ratioInter = exerciceRef.ratio_bon;
        const ratioAvance = exerciceRef.ratio_tres_bon;
        const ratioElite = exerciceRef.ratio_excellent;

        if (ratio <= ratioInter) {
          score = (ratio / ratioInter) * 50;
        } else if (ratio < ratioAvance) {
          const rangeRatio = (ratio - ratioInter) / (ratioAvance - ratioInter);
          score = 50 + (rangeRatio * 25);
        } else if (ratio < ratioElite) {
          const rangeRatio = (ratio - ratioAvance) / (ratioElite - ratioAvance);
          score = 75 + (rangeRatio * 25);
        } else {
          score = 100;
        }

        score = Math.min(100, Math.max(0, Math.round(score)));

        evaluationsForce.push({
          exercice: record.exercise_name,
          categorie: exerciceRef.categorie,
          ratio: Math.round(ratio * 100) / 100,
          score: score,
          poids: record.value
        });

        subScores.push(score);
      }
    }

    if (subScores.length > 0) {
      miniScoreForce = Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length);
    } else {
      miniScoreForce = 50;
    }

    if (miniScoreForce < 50 && !causeIndiceBas) {
      causeIndiceBas = 'FORCE';
    }

    const meilleurExo = evaluationsForce.length > 0
      ? evaluationsForce.reduce((prev, current) => (prev.score > current.score) ? prev : current)
      : null;

    details.force = {
      nb_exercices_evalues: subScores.length,
      meilleur_exercice: meilleurExo?.exercice || null,
      meilleur_ratio: meilleurExo?.ratio || null,
      mini_score: miniScoreForce,
      evaluations: evaluationsForce
    };

    const ageModificateur = age < 20 ? 1.05 : age > 30 ? 0.95 : 1.0;

    const scoreFinal = Math.round(
      (miniScoreComposition * 0.35 + miniScoreForce * 0.65) * ageModificateur
    );

    let messageId = 'INDICE_MOYEN';
    if (scoreFinal < 55) {
      messageId = causeIndiceBas ? `INDICE_BAS_${causeIndiceBas}` : 'INDICE_BAS_GENERAL';
    } else if (scoreFinal >= 85) {
      messageId = 'INDICE_HAUT';
    }

    let rapportPoidsPuissance = null;
    if (meilleurExo) {
      let evaluation = '';
      let couleur = '';

      if (meilleurExo.ratio >= 2.0) {
        evaluation = 'Excellent';
        couleur = 'green';
      } else if (meilleurExo.ratio >= 1.5) {
        evaluation = 'Très bon';
        couleur = 'blue';
      } else if (meilleurExo.ratio >= 1.2) {
        evaluation = 'Bon';
        couleur = 'yellow';
      } else if (meilleurExo.ratio >= 0.9) {
        evaluation = 'Moyen';
        couleur = 'orange';
      } else {
        evaluation = 'À améliorer';
        couleur = 'red';
      }

      rapportPoidsPuissance = {
        ratio: meilleurExo.ratio,
        exercice: meilleurExo.exercice,
        poids_kg: poidsKg,
        evaluation,
        couleur,
      };
    }

    return new Response(
      JSON.stringify({
        score: scoreFinal,
        mode_expert: modeExpert,
        age: age,
        age_modificateur: ageModificateur,
        mini_scores: { composition: miniScoreComposition, force: miniScoreForce },
        message_id: messageId,
        cause: causeIndiceBas,
        details,
        rapport_poids_puissance: rapportPoidsPuissance,
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