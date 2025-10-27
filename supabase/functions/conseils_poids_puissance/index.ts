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

    const { data: bodyComps } = await supabase
      .from("body_compositions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5);

    const { data: records } = await supabase
      .from("records")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const poidsActuel = bodyComps?.[0]?.poids || null;
    const masseMaigreActuelle = bodyComps?.[0]?.masse_maigre || null;
    const poidsAnterier = bodyComps?.[1]?.poids || null;

    let poidsEvolution = null;
    if (poidsActuel && poidsAnterier) {
      const diff = poidsActuel - poidsAnterier;
      poidsEvolution = diff > 0 ? `+${diff.toFixed(1)}kg` : `${diff.toFixed(1)}kg`;
    }

    const poidsStatus = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'alert';
    const poidsComment = score >= 80
      ? "Excellent rapport poids/puissance ! Maintiens cette composition."
      : score >= 60
      ? "Bon rapport, mais une optimisation de ta composition corporelle peut encore améliorer tes performances."
      : "Ton rapport poids/puissance peut être significativement amélioré. Focus sur la composition corporelle.";

    const masseMaigreStatus = masseMaigreActuelle && masseMaigreActuelle > 40 ? 'good' : 'warning';
    const masseMaigreComment = masseMaigreStatus === 'good'
      ? "Bonne masse maigre. Continue le renforcement musculaire."
      : "Augmente ta masse maigre avec de la musculation spécifique (pliométrie, force).";

    const bestSprint = records?.find((r: any) => r.distance === '100m')?.temps;
    const performanceStatus = bestSprint && bestSprint < 12 ? 'good' : bestSprint && bestSprint < 13 ? 'warning' : 'alert';
    const performanceComment = performanceStatus === 'good'
      ? "Excellente performance sprint ! Continue ce travail."
      : performanceStatus === 'warning'
      ? "Bonne performance, mais tu peux encore progresser avec un meilleur rapport poids/puissance."
      : "Ta performance peut s'améliorer significativement en optimisant ton rapport poids/puissance.";

    const objectifs: string[] = [];
    if (poidsActuel && masseMaigreActuelle) {
      const masseGrasse = poidsActuel - masseMaigreActuelle;
      const pourcentageGras = (masseGrasse / poidsActuel) * 100;
      if (pourcentageGras > 12) {
        const objectifPoids = poidsActuel - (masseGrasse - (poidsActuel * 0.10));
        objectifs.push(`Réduire ton poids à environ ${objectifPoids.toFixed(1)}kg en diminuant la masse grasse`);
      }
    }
    if (!masseMaigreActuelle || masseMaigreActuelle < 45) {
      objectifs.push("Augmenter ta masse maigre de 2-3kg via musculation spécifique sprint");
    }
    if (score < 70) {
      objectifs.push(`Atteindre un indice poids/puissance de 70+ (actuellement ${score})`);
    }
    if (bestSprint && bestSprint > 11.5) {
      objectifs.push(`Améliorer ton 100m à moins de 11.5s (record actuel: ${bestSprint}s)`);
    }
    if (objectifs.length === 0) {
      objectifs.push("Maintenir ton excellent rapport poids/puissance");
    }

    const conseils: string[] = [];
    if (score < 60) {
      conseils.push("Priorise la perte de masse grasse tout en maintenant ta masse maigre. Déficit calorique modéré de 300-500 kcal/jour.");
    }
    if (!masseMaigreActuelle || masseMaigreActuelle < 45) {
      conseils.push("Intègre 2-3 séances de musculation par semaine : squats, fentes sautées, soulevé de terre, développé couché.");
    }
    conseils.push("Focus sur les exercices pliométriques : box jumps, bonds, sprints en côte pour développer la puissance explosive.");
    conseils.push("Travaille ta technique de sprint : posture, fréquence de foulée, poussée au sol.");

    if (poidsActuel && masseMaigreActuelle) {
      const masseGrasse = poidsActuel - masseMaigreActuelle;
      const pourcentageGras = (masseGrasse / poidsActuel) * 100;
      if (pourcentageGras > 12) {
        conseils.push(`Ton pourcentage de masse grasse est de ${pourcentageGras.toFixed(1)}%. Vise 8-12% pour optimiser ta performance.`);
      }
    }

    if (score >= 80) {
      conseils.push("Excellent ! Maintiens ce ratio en continuant musculation et travail technique.");
    }

    const nutrition: string[] = [
      "Apport protéique : 1.6-2g par kg de poids corporel pour maintenir/développer ta masse maigre",
      "Glucides autour de l'entraînement pour l'énergie et la récupération",
      "Privilégie les aliments à forte densité nutritionnelle : viandes maigres, poissons, œufs, légumes, fruits",
      "Évite les calories vides : sodas, snacks ultra-transformés, alcool",
    ];

    const response = {
      poids: {
        valeur: poidsActuel ? `${poidsActuel}kg` : "Non renseigné",
        evolution: poidsEvolution,
        status: poidsStatus,
        comment: poidsComment,
      },
      masseMaigre: {
        valeur: masseMaigreActuelle ? `${masseMaigreActuelle}kg` : "Non renseigné",
        evolution: null,
        status: masseMaigreStatus,
        comment: masseMaigreComment,
      },
      performance: {
        valeur: bestSprint ? `${bestSprint}s (100m)` : "Aucun record",
        evolution: null,
        status: performanceStatus,
        comment: performanceComment,
      },
      objectifs,
      conseils,
      nutrition,
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
    console.error("Erreur conseils_poids_puissance:", error);
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
