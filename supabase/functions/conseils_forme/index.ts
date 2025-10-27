import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { scoreData } = await req.json();

    if (!scoreData) {
      return new Response(
        JSON.stringify({ error: "Données manquantes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const score = scoreData.indice || scoreData.score || 0;
    const details = scoreData.details || {};

    const sommeilData = details.sommeil || {};
    const moyenneSommeil = sommeilData.moyenne_duree || 0;
    const qualiteSommeil = sommeilData.moyenne_qualite || 0;

    const sommeilStatus = moyenneSommeil >= 7 && qualiteSommeil >= 3.5 ? 'good' :
                         moyenneSommeil >= 6 && qualiteSommeil >= 3 ? 'warning' : 'alert';

    const sommeilComment = moyenneSommeil >= 7 && qualiteSommeil >= 3.5
      ? "Excellent sommeil ! Continue sur cette lancée."
      : moyenneSommeil >= 6
      ? "Ton sommeil est correct mais pourrait être optimisé. Vise 7-9h par nuit."
      : "Attention, ton sommeil est insuffisant. C'est crucial pour la récupération et la performance.";

    const recuperationStatus = score >= 70 ? 'good' : score >= 50 ? 'warning' : 'alert';
    const recuperationValue = score >= 70 ? "Excellente" : score >= 50 ? "Correcte" : "Insuffisante";
    const recuperationComment = score >= 70
      ? "Ta récupération est optimale. Tu peux maintenir ton volume d'entraînement."
      : score >= 50
      ? "Ta récupération est acceptable mais pourrait être améliorée avec plus de repos."
      : "Ta récupération est compromise. Prévois des jours de repos complets.";

    const chargeStatus = details.charge_entrainement ?
      (details.charge_entrainement > 80 ? 'alert' : details.charge_entrainement > 60 ? 'warning' : 'good') : 'good';
    const chargeValue = details.charge_entrainement ? `${details.charge_entrainement}%` : "Modérée";
    const chargeComment = chargeStatus === 'alert'
      ? "Charge d'entraînement élevée. Attention au risque de surmenage."
      : chargeStatus === 'warning'
      ? "Charge d'entraînement importante. Surveille ta fatigue."
      : "Charge d'entraînement bien gérée.";

    const objectifs: string[] = [];
    if (moyenneSommeil < 7) {
      objectifs.push(`Augmenter ton sommeil à minimum 7h par nuit (actuellement ${moyenneSommeil}h)`);
    }
    if (qualiteSommeil < 4) {
      objectifs.push("Améliorer la qualité de ton sommeil en établissant une routine régulière");
    }
    if (score < 70) {
      objectifs.push("Atteindre un indice de forme de 70+ en optimisant récupération et sommeil");
    }
    if (details.charge_entrainement > 70) {
      objectifs.push("Réduire légèrement la charge d'entraînement pour favoriser la récupération");
    }
    if (objectifs.length === 0) {
      objectifs.push("Maintenir ton excellent niveau de forme actuel");
      objectifs.push("Continuer à suivre tes indicateurs de récupération");
    }

    const conseils: string[] = [];

    if (moyenneSommeil < 7) {
      conseils.push("Établis une routine de sommeil : couche-toi à heures fixes, même le week-end. Vise 7-9h par nuit.");
    }
    if (qualiteSommeil < 4) {
      conseils.push("Améliore ta qualité de sommeil : évite les écrans 1h avant de dormir, garde ta chambre fraîche (18-20°C) et sombre.");
    }
    if (score < 50) {
      conseils.push("Ton indice de forme est bas. Prévois impérativement une journée de repos complet et privilégie les séances légères.");
    } else if (score < 70) {
      conseils.push("Ton indice de forme est correct mais peut être amélioré. Intègre plus de récupération active (étirements, mobilité).");
    }
    if (details.charge_entrainement > 80) {
      conseils.push("Ta charge d'entraînement est très élevée. Réduis le volume ou l'intensité cette semaine pour éviter le surmenage.");
    }
    if (details.derniere_seance?.fatigue_drop_off > 10) {
      conseils.push("Drop-off élevé détecté lors de ta dernière séance. Assure-toi de bien t'échauffer et de bien récupérer entre les séries.");
    }

    conseils.push("Hydrate-toi suffisamment tout au long de la journée (2-3L d'eau minimum).");
    conseils.push("Nutrition post-entraînement : consomme des protéines (20-30g) et des glucides dans les 2h après l'effort.");

    if (score >= 80) {
      conseils.push("Bravo ! Ta forme est excellente. Continue à suivre tes indicateurs pour maintenir ce niveau.");
    }

    const response = {
      sommeil: {
        moyenne: `${moyenneSommeil}`,
        qualite: qualiteSommeil,
        status: sommeilStatus,
        comment: sommeilComment,
      },
      recuperation: {
        value: recuperationValue,
        status: recuperationStatus,
        comment: recuperationComment,
      },
      charge: {
        value: chargeValue,
        status: chargeStatus,
        comment: chargeComment,
      },
      objectifs,
      conseils,
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
    console.error("Erreur conseils_forme:", error);
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
