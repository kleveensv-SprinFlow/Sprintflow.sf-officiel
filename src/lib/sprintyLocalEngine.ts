export type SprintyMode = 'simplified' | 'expert';

export interface SprintyResponse {
  text: string;
}

/**
 * Détection d'intentions à partir de mots-clés.
 */
function detectIntent(rawQuestion: string): string {
  const q = rawQuestion
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // enlève les accents

  let intent = 'INTENT_GENERIC';

  if (q.includes('vo2')) {
    intent = 'INTENT_VO2_EXPLAIN';
  } else if (
    q.includes('nutrition') ||
    q.includes('manger') ||
    q.includes('repas') ||
    q.includes('aliment') ||
    q.includes('calories') ||
    q.includes('calorique')
  ) {
    intent = 'INTENT_NUTRITION';
  }

  console.log('[SprintyLocalEngine] Question normalisée =', q, '| intent =', intent);
  return intent;
}

/**
 * Moteur principal : prend la question et renvoie une réponse texte SANS IA externe.
 */
export async function sprintyLocalAnswer(
  question: string,
  mode: SprintyMode = 'simplified'
): Promise<SprintyResponse> {
  const intent = detectIntent(question);

  // VO2
  if (intent === 'INTENT_VO2_EXPLAIN') {
    if (mode === 'expert') {
      return {
        text: `La VO2 max correspond à la consommation maximale d’oxygène qu’un athlète peut utiliser par minute et par kilogramme de masse corporelle. C’est un indicateur clé de la capacité aérobie.

Plus ta VO2 max est élevée :
- plus ton système cardio-respiratoire peut fournir d’oxygène aux muscles,
- plus tu peux soutenir un effort intense longtemps.

En pratique, on la développe surtout avec :
- des séances de fractionné à intensité élevée (90–100 % de la VMA ou 90–95 % de la FCmax),
- des efforts de 2 à 5 minutes avec des récupérations incomplètes,
- une progression contrôlée de la charge (volume x intensité) pour limiter le risque de blessure.`,
      };
    }

    return {
      text: `La VO2 max, c’est la quantité maximale d’oxygène que ton corps peut utiliser pendant un effort intense.

Concrètement :
- plus ta VO2 max est élevée, plus tu peux tenir longtemps à haute intensité,
- on la travaille surtout avec des séances de fractionné assez dures (par exemple des blocs de 3 à 5 minutes rapides, avec une récupération courte).`,
    };
  }

  // Nutrition
  if (intent === 'INTENT_NUTRITION') {
    return {
      text: `Pour la nutrition d’un athlète, l’objectif est d’assurer :
- assez de glucides autour des séances importantes,
- assez de protéines sur la journée,
- une digestion confortable avant l’effort.

Avant une séance importante (2–3 h avant) :
- un repas riche en glucides (riz, pâtes, pommes de terre, pain),
- une source de protéines modérée (poulet, œufs, yaourt),
- peu de graisses lourdes et d’aliments ultra-transformés.

Juste après la séance (dans les 1–2 h) :
- une source de glucides (fruits, jus, féculents),
- une source de protéines (lait, yaourt, œufs, poulet, tofu),
pour favoriser la récupération musculaire.`,
    };
  }

  // Fallback générique
  return {
    text:
      "Je fonctionne ici en mode local sans IA externe.\n\n" +
      "Pour l’instant, je sais surtout répondre sur :\n" +
      "- la VO2 max (par ex. “Explique-moi la VO2 max” ou “C’est quoi la VO2 max ?”),\n" +
      "- la nutrition (par ex. “Que manger avant un entraînement intense ?”).",
  };
}