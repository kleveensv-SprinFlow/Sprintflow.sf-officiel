import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ObjectifSaisonData {
  objectif_saison: 'preparation' | 'maintien' | 'affutage';
  poids_cible_kg: number;
  date_cible: string;
  poids_actuel_kg?: number;
  sexe?: string;
  taille_cm?: number;
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
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const athleteId = userData.user.id;
    const requestData: ObjectifSaisonData = await req.json();

    const { objectif_saison, poids_cible_kg, date_cible, poids_actuel_kg, sexe, taille_cm } = requestData;

    if (!objectif_saison || !poids_cible_kg || !date_cible) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes: objectif_saison, poids_cible_kg, date_cible requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let poidsActuel = poids_actuel_kg;
    if (!poidsActuel) {
      const { data: lastWeight } = await supabase
        .from('donnees_corporelles')
        .select('poids_kg')
        .eq('athlete_id', athleteId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      poidsActuel = lastWeight?.poids_kg || poids_cible_kg;
    }

    const differenceKg = poids_cible_kg - poidsActuel;
    const dateActuelle = new Date();
    const dateCibleObj = new Date(date_cible);
    const joursRestants = Math.max(1, Math.ceil((dateCibleObj.getTime() - dateActuelle.getTime()) / (1000 * 60 * 60 * 24)));

    const kgParSemaine = (differenceKg / joursRestants) * 7;
    const deficitCaloriqueQuotidien = Math.round((kgParSemaine * 7700) / 7);

    let metabolismeBase = 1800;
    if (sexe && taille_cm && poidsActuel) {
      if (sexe === 'homme') {
        metabolismeBase = Math.round(10 * poidsActuel + 6.25 * taille_cm - 5 * 25 + 5);
      } else {
        metabolismeBase = Math.round(10 * poidsActuel + 6.25 * taille_cm - 5 * 25 - 161);
      }
    }

    const maintenanceKcal = Math.round(metabolismeBase * 1.5);

    let caloriesJourHaut: number;
    let caloriesJourBas: number;
    let caloriesJourRepos: number;

    if (objectif_saison === 'preparation') {
      caloriesJourHaut = maintenanceKcal + 300;
      caloriesJourBas = maintenanceKcal;
      caloriesJourRepos = maintenanceKcal - 200;
    } else if (objectif_saison === 'affutage') {
      const deficitEffectif = Math.abs(deficitCaloriqueQuotidien);
      caloriesJourHaut = maintenanceKcal - Math.round(deficitEffectif * 0.5);
      caloriesJourBas = maintenanceKcal - deficitEffectif;
      caloriesJourRepos = maintenanceKcal - Math.round(deficitEffectif * 1.2);
    } else {
      caloriesJourHaut = maintenanceKcal;
      caloriesJourBas = maintenanceKcal - 100;
      caloriesJourRepos = maintenanceKcal - 200;
    }

    const proteinesGKg = objectif_saison === 'affutage' ? 2.2 : 2.0;
    const lipidesPct = 0.25;
    const glucidesPct = 1 - lipidesPct - (proteinesGKg * poidsActuel * 4 / caloriesJourHaut);

    const objectifsData = [
      {
        type_jour: 'haut',
        kcal_objectif: caloriesJourHaut,
        proteines_objectif_g: Math.round(proteinesGKg * poidsActuel),
        glucides_objectif_g: Math.round((caloriesJourHaut * glucidesPct) / 4),
        lipides_objectif_g: Math.round((caloriesJourHaut * lipidesPct) / 9),
      },
      {
        type_jour: 'bas',
        kcal_objectif: caloriesJourBas,
        proteines_objectif_g: Math.round(proteinesGKg * poidsActuel),
        glucides_objectif_g: Math.round((caloriesJourBas * (glucidesPct - 0.1)) / 4),
        lipides_objectif_g: Math.round((caloriesJourBas * lipidesPct) / 9),
      },
      {
        type_jour: 'repos',
        kcal_objectif: caloriesJourRepos,
        proteines_objectif_g: Math.round(proteinesGKg * poidsActuel),
        glucides_objectif_g: Math.round((caloriesJourRepos * (glucidesPct - 0.15)) / 4),
        lipides_objectif_g: Math.round((caloriesJourRepos * lipidesPct) / 9),
      },
    ];

    const { data: existingObjectifs } = await supabase
      .from('objectifs_presets')
      .select('id, type_jour, verrouille_par_coach')
      .eq('athlete_id', athleteId);

    for (const objectif of objectifsData) {
      const existing = existingObjectifs?.find((o) => o.type_jour === objectif.type_jour);

      if (existing?.verrouille_par_coach) {
        continue;
      }

      if (existing) {
        await supabase
          .from('objectifs_presets')
          .update({
            ...objectif,
            derniere_modification_auto: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('objectifs_presets')
          .insert({
            athlete_id: athleteId,
            ...objectif,
            derniere_modification_auto: new Date().toISOString(),
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Objectifs calculés et sauvegardés',
        objectifs: objectifsData,
        details: {
          poids_actuel: poidsActuel,
          poids_cible: poids_cible_kg,
          difference_kg: differenceKg,
          jours_restants: joursRestants,
          deficit_quotidien: deficitCaloriqueQuotidien,
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