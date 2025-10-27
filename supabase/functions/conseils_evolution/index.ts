import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization manquante" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { scoreData } = await req.json();
    const score = scoreData?.indice || 0;

    const now = new Date();
    const date30j = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const date90j = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const { data: workouts } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const { data: records } = await supabase
      .from("records")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const workouts30j = workouts?.filter((w: any) => new Date(w.date) >= date30j) || [];
    const workouts90j = workouts?.filter((w: any) => new Date(w.date) >= date90j) || [];

    const nbSeances30j = workouts30j.length;
    const nbSeances90j = workouts90j.length;

    const status30j = nbSeances30j >= 8 ? 'good' : nbSeances30j >= 5 ? 'warning' : 'alert';
    const comment30j = nbSeances30j >= 8
      ? `Excellente régularité ! ${nbSeances30j} séances en 30 jours.`
      : nbSeances30j >= 5
      ? `Bonne régularité avec ${nbSeances30j} séances. Vise 8-12 séances par mois.`
      : `Régularité insuffisante avec seulement ${nbSeances30j} séances. Augmente la fréquence.`;

    const status90j = nbSeances90j >= 24 ? 'good' : nbSeances90j >= 15 ? 'warning' : 'alert';
    const comment90j = nbSeances90j >= 24
      ? `Excellente constance sur 3 mois ! ${nbSeances90j} séances.`
      : nbSeances90j >= 15
      ? `Bonne constance avec ${nbSeances90j} séances sur 3 mois.`
      : `Constance à améliorer : ${nbSeances90j} séances sur 3 mois.`;

    const recordsRecents = records?.filter((r: any) => new Date(r.date) >= date90j) || [];
    const recordsStatus = recordsRecents.length >= 3 ? 'good' : recordsRecents.length >= 1 ? 'warning' : 'alert';
    const recordsComment = recordsRecents.length >= 3
      ? `${recordsRecents.length} records battus ces 3 derniers mois ! Excellente progression.`
      : recordsRecents.length >= 1
      ? `${recordsRecents.length} record(s) battu(s). Continue à te challenger.`
      : "Aucun record battu récemment. Fixe-toi de nouveaux objectifs.";

    const tendances: any[] = [];

    if (nbSeances30j > 10) {
      tendances.push({
        emoji: "🔥",
        titre: "Très forte activité",
        description: `${nbSeances30j} séances ce mois-ci ! Assure-toi de bien récupérer.`
      });
    }

    if (nbSeances30j < nbSeances90j / 3 - 2) {
      tendances.push({
        emoji: "📉",
        titre: "Baisse d'activité",
        description: "Tu t'entraînes moins ce mois-ci. Reprends un rythme régulier."
      });
    }

    if (recordsRecents.length >= 2) {
      tendances.push({
        emoji: "📈",
        titre: "Progression confirmée",
        description: "Plusieurs records battus récemment. Ton travail paye !"
      });
    }

    const seanceVMax = workouts30j?.filter((w: any) => w.tag_seance === 'vitesse_max') || [];
    const seanceLactique = workouts30j?.filter((w: any) => w.tag_seance === 'lactique_piste' || w.tag_seance === 'lactique_cote') || [];
    const seanceMuscu = workouts30j?.filter((w: any) => w.tag_seance === 'musculation') || [];

    if (seanceVMax.length < 2) {
      tendances.push({
        emoji: "⚡",
        titre: "Manque de vitesse maximale",
        description: "Seulement " + seanceVMax.length + " séance(s) VMax ce mois-ci. Vise 2-3 par mois."
      });
    }

    if (seanceMuscu.length < 2) {
      tendances.push({
        emoji: "💪",
        titre: "Renforcement insuffisant",
        description: "Peu de séances de musculation. Intègre 2-3 séances par semaine."
      });
    }

    const objectifs: string[] = [];

    if (nbSeances30j < 8) {
      objectifs.push(`Atteindre 8-12 séances par mois (actuellement ${nbSeances30j})`);
    }

    if (recordsRecents.length === 0) {
      objectifs.push("Battre au moins 1 record personnel dans les 30 prochains jours");
    }

    if (score < 70) {
      objectifs.push(`Améliorer ton indice d'évolution à 70+ (actuellement ${score})`);
    }

    objectifs.push("Maintenir une progression régulière sur tous tes exercices principaux");

    if (seanceVMax.length < 2) {
      objectifs.push("Effectuer 2-3 séances de vitesse maximale par mois");
    }

    const conseils: string[] = [];

    if (nbSeances30j < 5) {
      conseils.push("Ta fréquence d'entraînement est trop faible. Planifie tes séances à l'avance et bloque ces créneaux dans ton agenda.");
    }

    if (score < 50) {
      conseils.push("Ton indice d'évolution est faible. Fixe-toi des objectifs mesurables et suis-les régulièrement.");
    }

    conseils.push("Varie tes séances : vitesse max, lactique, musculation, technique. Chaque type a son importance.");
    conseils.push("Analyse tes performances après chaque séance et ajuste ton programme en fonction.");
    conseils.push("Teste-toi régulièrement (toutes les 3-4 semaines) sur tes distances de prédilection.");

    if (recordsRecents.length >= 2) {
      conseils.push("Excellente progression ! Continue ce que tu fais, c'est efficace.");
    }

    if (seanceVMax.length < 2) {
      conseils.push("Intègre plus de séances de vitesse maximale (sprints courts 30-80m, récupération complète).");
    }

    if (seanceMuscu.length < 2) {
      conseils.push("Augmente le volume de musculation : squats, fentes, pliométrie 2-3x par semaine.");
    }

    const prochains_objectifs: any[] = [];

    const record60m = records?.find((r: any) => r.distance === '60m');
    if (record60m) {
      const objectif60 = record60m.temps - 0.1;
      prochains_objectifs.push({
        discipline: "60m",
        objectif: `${objectif60.toFixed(2)}s`,
        ecart: `À améliorer de 0.10s (record: ${record60m.temps}s)`
      });
    }

    const record100m = records?.find((r: any) => r.distance === '100m');
    if (record100m) {
      const objectif100 = record100m.temps - 0.15;
      prochains_objectifs.push({
        discipline: "100m",
        objectif: `${objectif100.toFixed(2)}s`,
        ecart: `À améliorer de 0.15s (record: ${record100m.temps}s)`
      });
    }

    if (prochains_objectifs.length === 0) {
      prochains_objectifs.push({
        discipline: "Objectif général",
        objectif: "Établir tes premiers records",
        ecart: "Commence par enregistrer tes performances actuelles"
      });
    }

    const response = {
      periodes: {
        trente_jours: `${nbSeances30j} séances`,
        status_30j,
        comment_30j,
        quatre_vingt_dix_jours: `${nbSeances90j} séances`,
        status_90j,
        comment_90j,
      },
      records: {
        valeur: `${recordsRecents.length} record(s) battu(s) (90j)`,
        status: recordsStatus,
        comment: recordsComment,
      },
      tendances,
      objectifs,
      conseils,
      prochains_objectifs,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  } catch (error) {
    console.error("Erreur conseils_evolution:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  }
});
