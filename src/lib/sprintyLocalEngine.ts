// Petit moteur "local" pour Sprinty, sans appel à une API IA externe.

export type SprintyMode = 'simplified' | 'expert';

export interface SprintyResponse {
  text: string;
}

/**
 * Détection très simple d'intentions à partir de mots-clés.
 * On pourra enrichir plus tard (regex, mapping, etc.).
 */
function detectIntent(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('vo2')) return 'INTENT_VO2_EXPLAIN';
  if (q.includes('record') || q.includes('record') || q.includes('perso')) {
    return 'INTENT_RECORDS';
  }
  if (q.includes('planning') || q.includes('entrainement') || q.includes('entraînement')) {
    return 'INTENT_PLANNING';
  }
  if (q.includes('poids') || q.includes('puissance')) {
    return 'INTENT_POIDS_PUISSANCE';
  }
  if (q.includes('nutrition') || q.includes('manger') || q.includes('repas')) {
    return 'INTENT_NUTRITION';
  }

  return 'INTENT_GENERIC';
}

/**
 * Réponses “corpus” codées en dur.
 * Tu pourras les remplacer par des extraits de src/data/corpus.md si tu veux parser le Markdown.
 */
function getCorpusAnswer(intent: string, mode: SprintyMode): string | null {
  switch (intent) {
    case 'INTENT_VO2_EXPLAIN':
      return mode === 'expert'
        ? `La VO2 max correspond à la consommation maximale d’oxygène qu’un athlète peut utiliser par minute et par kilogramme de masse corporelle. C’est un indicateur clé de la capacité aérobie. Elle se travaille principalement via des séances d’intervalles à intensité élevée (90–100 % VMA ou 90–95 % de la FCmax), avec des récupérations incomplètes.`
        : `La VO2 max, c’est la quantité maximale d’oxygène que ton corps peut utiliser pendant un effort intense. Plus elle est élevée, plus tu peux tenir un gros effort longtemps. On la développe surtout avec des séances de fractionné assez dures.`;

    case 'INTENT_NUTRITION':
      return `Pour la nutrition d’un athlète, l’objectif est :
- Avoir assez de glucides autour des séances importantes (avant / après).
- Viser environ 1,6 à 2,2 g de protéines par kg de poids de corps par jour.
- Organiser tes repas pour ne pas arriver “vidé” à l’entraînement, ni trop lourd.`;

    default:
      return null;
  }
}

/**
 * Moteur principal : prend la question et renvoie une réponse texte sans IA externe.
 * Tu pourras plus tard l’enrichir avec des appels Supabase (records, planning, etc.).
 */
export async function sprintyLocalAnswer(
  question: string,
  mode: SprintyMode = 'simplified'
): Promise<SprintyResponse> {
  const intent = detectIntent(question);

  // 1) Essayer de répondre via le "corpus" (réponses codées)
  const corpusAnswer = getCorpusAnswer(intent, mode);
  if (corpusAnswer) {
    return { text: corpusAnswer };
  }

  // 2) Ici tu pourras plus tard ajouter :
  // - appel Supabase RPC pour les records / planning
  // - composition de phrase en fonction des données

  // 3) Fallback générique
  return {
    text:
      "Je n’utilise pas d’IA externe ici, mais je peux déjà t’aider sur la VO2 max, la nutrition et ton planning. Reformule ta question en mentionnant clairement ce que tu veux (par exemple : “Explique-moi la VO2 max” ou “Parle-moi de ma nutrition avant une compétition”).",
  };
}