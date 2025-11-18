// Moteur "local" pour Sprinty : aucune API externe, uniquement des règles + ton corpus codé en dur.
// On pourra plus tard ajouter des appels Supabase pour les records, le planning, etc.

export type SprintyMode = 'simplified' | 'expert';

export interface SprintyResponse {
  text: string;
}

/**
 * Détection très simple d'intentions à partir de mots-clés.
 * Plus tard, tu pourras affiner (regex, mapping plus complet...).
 */
function detectIntent(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('vo2')) return 'INTENT_VO2_EXPLAIN';
  if (q.includes('record') || q.includes('records') || q.includes('perso')) {
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
 * Réponses "corpus" codées en dur.
 * Si tu veux, on pourra plus tard parser src/data/corpus.md pour éviter de dupliquer.
 */
function getCorpusAnswer(intent: string, mode: SprintyMode): string | null {
  switch (intent) {
    case 'INTENT_VO2_EXPLAIN':
      return mode === 'expert'
        ? `La VO2 max correspond à la consommation maximale d’oxygène qu’un athlète peut utiliser par minute et par kilogramme de masse corporelle. C’est un indicateur clé de la capacité aérobie.

On la développe principalement avec :
- Des séances de fractionné à intensité élevée (90–100 % de la VMA ou 90–95 % de la FCmax),
- Des répétitions relativement courtes (2 à 5 minutes) avec une récupération incomplète,
- Une progression contrôlée de la charge (volume x intensité) pour limiter le risque de surmenage.`
        : `La VO2 max, c’est la quantité maximale d’oxygène que ton corps peut utiliser pendant un effort intense. Plus ta VO2 max est élevée, plus tu peux maintenir un gros effort longtemps.

En pratique, on la travaille surtout avec des séances de fractionné assez dures (par exemple des 3 à 5 minutes rapides avec une récupération incomplète).`;

    case 'INTENT_NUTRITION':
      return `Pour la nutrition d’un athlète, l’objectif est :

- Apporter assez de glucides autour des séances importantes (avant / après),
- Avoir un apport protéique suffisant (environ 1,6 à 2,2 g de protéines par kg de poids de corps par jour),
- Éviter d’arriver "vidé" ou trop lourd à l’entraînement.

Avant une séance intense :
- Un repas ou encas riche en glucides 2–3 h avant,
- Éviter les aliments trop gras ou difficiles à digérer.

Après la séance :
- Une source de glucides + protéines dans les 1–2 h pour optimiser la récupération.`;

    default:
      return null;
  }
}

/**
 * Moteur principal : prend la question et renvoie une réponse texte SANS IA externe.
 * À enrichir ensuite avec des appels Supabase pour les données athlètes (records, planning...).
 */
export async function sprintyLocalAnswer(
  question: string,
  mode: SprintyMode = 'simplified'
): Promise<SprintyResponse> {
  const intent = detectIntent(question);

  // 1) Réponse "corpus" si on reconnaît l’intention
  const corpusAnswer = getCorpusAnswer(intent, mode);
  if (corpusAnswer) {
    return { text: corpusAnswer };
  }

  // 2) Plus tard : branchement sur les données de l’athlète (records, planning, etc.)

  // 3) Fallback générique
  return {
    text:
      "Je fonctionne ici en mode local sans IA externe. Je peux déjà t’aider sur la VO2 max, la nutrition, le planning et les records si tu les mentionnes clairement dans ta question. Par exemple : “Explique-moi la VO2 max” ou “Aide-moi pour ma nutrition avant une compétition”.",
  };
}