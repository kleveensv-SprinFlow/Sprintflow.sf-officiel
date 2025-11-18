// Moteur "local" pour Sprinty : aucune API externe, uniquement des règles + ton savoir métier.
// À terme, tu pourras brancher ici les appels Supabase pour les records, planning, etc.

export type SprintyMode = 'simplified' | 'expert';

export interface SprintyResponse {
  text: string;
}

/**
 * Détection simple d'intentions à partir de mots-clés.
 */
function detectIntent(question: string): string {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // enlève les accents

  if (q.includes('vo2')) return 'INTENT_VO2_EXPLAIN';

  if (
    q.includes('record') ||
    q.includes('perso') ||
    q.includes('meilleurs temps') ||
    q.includes('meilleur temps') ||
    q.includes('chrono')
  ) {
    return 'INTENT_RECORDS';
  }

  if (
    q.includes('planning') ||
    q.includes('entrainement') ||
    q.includes("entraînement") ||
    q.includes('seance') ||
    q.includes('séance') ||
    q.includes('programme')
  ) {
    return 'INTENT_PLANNING';
  }

  if (q.includes('poids') || q.includes('puissance') || q.includes('indice')) {
    return 'INTENT_POIDS_PUISSANCE';
  }

  if (
    q.includes('nutrition') ||
    q.includes('manger') ||
    q.includes('repas') ||
    q.includes('aliment') ||
    q.includes('calories')
  ) {
    return 'INTENT_NUTRITION';
  }

  return 'INTENT_GENERIC';
}

/**
 * Réponses "corpus" codées en dur.
 * On pourra plus tard les faire venir automatiquement de src/data/corpus.md.
 */
function getCorpusAnswer(intent: string, mode: SprintyMode): string | null {
  switch (intent) {
    case 'INTENT_VO2_EXPLAIN':
      return mode === 'expert'
        ? `La VO2 max correspond à la consommation maximale d’oxygène qu’un athlète peut utiliser par minute et par kilogramme de masse corporelle. C’est un indicateur clé de la capacité aérobie.

Plus ta VO2 max est élevée :
- plus ton système cardio-respiratoire peut fournir d’oxygène aux muscles,
- plus tu peux soutenir un effort intense longtemps.

En pratique, on la développe surtout avec :
- des séances de fractionné à intensité élevée (90–100 % de la VMA ou 90–95 % de la FCmax),
- des efforts de 2 à 5 minutes avec des récupérations incomplètes,
- une progression contrôlée de la charge (volume x intensité) pour limiter le risque de blessure.`
        : `La VO2 max, c’est la quantité maximale d’oxygène que ton corps peut utiliser pendant un effort intense.

Concrètement :
- plus ta VO2 max est élevée, plus tu peux tenir longtemps à haute intensité,
- on la travaille surtout avec des séances de fractionné assez dures (par exemple des blocs de 3 à 5 minutes rapides, avec une récupération courte).`;

    case 'INTENT_NUTRITION':
      return `Pour la nutrition d’un athlète, l’objectif est d’assurer :
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
pour favoriser la récupération musculaire.

Au quotidien :
- viser environ 1,6 à 2,2 g de protéines par kg de poids de corps par jour,
- ajuster les calories en fonction de la charge d’entraînement pour éviter de trop descendre en énergie.`;

    default:
      return null;
  }
}

/**
 * Moteur principal : prend la question et renvoie une réponse texte SANS IA externe.
 */
export async function sprintyLocalAnswer(
  question: string,
  mode: SprintyMode = 'simplified'
): Promise<SprintyResponse> {
  const intent = detectIntent(question);

  const corpusAnswer = getCorpusAnswer(intent, mode);
  if (corpusAnswer) {
    return { text: corpusAnswer };
  }

  // Fallback : informer clairement ce qui est possible
  return {
    text:
      "Je fonctionne ici en mode local sans IA externe.\n\n" +
      "Pour l’instant, je sais surtout répondre sur :\n" +
      "- la VO2 max (par ex. “Explique-moi la VO2 max”),\n" +
      "- la nutrition (par ex. “Que manger avant un entraînement intense ?”).\n\n" +
      "Je vais être enrichi progressivement pour te parler aussi de tes records et de ton planning avec tes vraies données.",
  };
}