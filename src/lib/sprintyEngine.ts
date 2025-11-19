// src/lib/sprintyLocalEngine.ts
export type SprintyMode = 'simplified' | 'expert';

export interface SprintyResponse {
  text: string;
}

/**
 * Détection d'intention par mots‑clés.
 * Les expressions sont volontairement larges (accents retirés) pour couvrir un maximum de formulations.
 */
function detectIntent(rawQuestion: string): string {
  const q = rawQuestion
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // retire accents

  if (/vo2/.test(q)) return 'INTENT_VO2_EXPLAIN';
  if (/nutrition|manger|repas|aliment|calorie|proteine/.test(q)) return 'INTENT_NUTRITION';
  if (/vma|vitesse maximale/.test(q)) return 'INTENT_VMA';
  if (/poids.*puissance|rapport.*poids|indice poids/.test(q)) return 'INTENT_WEIGHT_POWER';
  if (/charge.*entrainement|ratio aigue|ratio aigu/.test(q)) return 'INTENT_LOAD_MANAGEMENT';
  if (/recuperation|repos|sommeil/.test(q)) return 'INTENT_RECUPERATION';
  if (/record|chrono/.test(q)) return 'INTENT_RECORDS';
  if (/planning|programme|entrainement demain|seance/.test(q)) return 'INTENT_PLANNING';
  return 'INTENT_GENERIC';
}

/**
 * Réponse locale en fonction de l'intention et du mode.
 * On s'appuie sur les informations du corpus (VO₂ max, VMA, indice poids/puissance, charge, nutrition, récupération).
 */
export async function sprintyLocalAnswer(
  question: string,
  mode: SprintyMode = 'simplified'
): Promise<SprintyResponse> {
  const intent = detectIntent(question);

  // VO₂ max
  if (intent === 'INTENT_VO2_EXPLAIN') {
    return {
      text:
        mode === 'expert'
          ? `La VO₂ max est la consommation maximale d'oxygène (en ml·min⁻¹·kg⁻¹) qu'un athlète peut utiliser lors d'un effort intense. C’est un plafond physiologique déterminant pour la capacité aérobie. Pour la développer, on privilégie des intervalles à 90‑100 % de la VMA (ou 90‑95 % de la FCmax) sur 2 à 5 min avec des récupérations incomplètes, en veillant à progresser graduellement la charge afin de limiter la fatigue et le risque de blessure.`
          : `La VO₂ max désigne la quantité d’oxygène que ton corps est capable de consommer lorsqu’il travaille à pleine capacité. Plus elle est élevée, plus tu peux maintenir un effort intense longtemps. On l'améliore avec des séances de fractionné soutenu (par ex. des blocs de 3 à 5 min rapides suivis d'une récupération courte).`,
    };
  }

  // Nutrition générale
  if (intent === 'INTENT_NUTRITION') {
    return {
      text:
        `Une bonne nutrition t’aide à soutenir tes entraînements et ta récupération.\n\n` +
        `**Avant une séance (2–3 h avant)** : privilégie les glucides (pâtes, riz, pommes de terre, pain) et une source modérée de protéines (poulet, œufs, yaourt), en limitant les graisses lourdes.\n\n` +
        `**Après l’entraînement (dans l’heure qui suit)** : consomme des glucides (fruits, compotes, féculents) et des protéines (lait, œufs, poulet, tofu) pour reconstituer tes réserves et favoriser la réparation musculaire.\n\n` +
        `Au quotidien, vise ~1,6–2,2 g de protéines/kg/jour et assure‑toi de bien dormir (7–9 h/nuit) pour optimiser ta récupération.`
    };
  }

  // VMA (Vitesse Maximale Aérobie)
  if (intent === 'INTENT_VMA') {
    return {
      text:
        mode === 'expert'
          ? `La VMA est la vitesse minimale à laquelle ta VO₂ max est atteinte. Elle se détermine sur le terrain (tests demi‑Cooper, VAMEVAL, 6 minutes…). Elle sert de base pour calibrer les allures : endurance fondamentale à ~60–70 % VMA, seuil à 80–90 %, intervalles VO₂ max à 95–105 %.`
          : `La VMA est la vitesse à partir de laquelle tu atteins ta consommation d’oxygène maximale. On la mesure grâce à des tests de course et on s’en sert pour régler ses allures d’entraînement (ex. endurance à 60–70 % de VMA, fractionné autour de 100 %).`,
    };
  }

  // Indice Poids/Puissance
  if (intent === 'INTENT_WEIGHT_POWER') {
    return {
      text:
        `L’indice poids/puissance compare ta masse corporelle à ta capacité à produire de la force, notamment en sprint ou en côte. L’objectif est d’améliorer ce ratio : développer ta puissance maximale tout en évitant de prendre de la masse grasse. Un excès de poids pénalise la vitesse et l’accélération. ` +
        (mode === 'expert'
          ? `\n\nPour l’optimiser : 1) renforce ta musculature explosive (sprints, pliométrie, musculation), 2) veille à un apport protéique suffisant (~1,6–2 g/kg/jour), 3) surveille ta composition corporelle via des bilans réguliers.`
          : `\n\nFais régulièrement des exercices explosifs (sprints, sauts) et adopte une alimentation équilibrée pour rester puissant sans prise de poids inutile.`),
    };
  }

  // Gestion de la charge d’entraînement
  if (intent === 'INTENT_LOAD_MANAGEMENT') {
    return {
      text:
        `La charge d’entraînement est suivie à court terme (charge aiguë : sur 7 jours) et à plus long terme (charge chronique : sur 28 jours). Le ratio aiguë/chronique indique si la progression est maîtrisée : ` +
        `un ratio < 0,8 peut signer un sous‑entraînement, entre 0,8 et 1,3 la zone est optimale, et au‑delà de 1,5 le risque de blessure augmente. Ajuste ton programme en conséquence.`
    };
  }

  // Récupération et sommeil
  if (intent === 'INTENT_RECUPERATION') {
    return {
      text:
        `Une bonne récupération est cruciale pour progresser. Dors 7–9 h par nuit, garde des horaires réguliers et limite l’exposition aux écrans avant de te coucher. Les étirements légers, la mobilité et l’hydratation favorisent également la récupération.`
    };
  }

  // Records et planning : renvoi vers les fonctionnalités de l’app
  if (intent === 'INTENT_RECORDS') {
    return {
      text:
        `Pour consulter tes records personnels (chrono, puissance), rends‑toi dans l’onglet **Records** du tableau de bord. Tu y trouveras tes meilleures performances classées par discipline.`
    };
  }

  if (intent === 'INTENT_PLANNING') {
    return {
      text:
        `Le détail de tes séances futures se trouve dans l’onglet **Planning**. N’hésite pas à le consulter pour connaître tes entraînements de demain ou de la semaine.`
    };
  }

  // Fallback générique
  return {
    text:
      `Je fonctionne en mode local sans IA externe.\n\n` +
      `Je peux t’expliquer la VO₂ max, la VMA, la nutrition, la récupération, la gestion de la charge d’entraînement et l’indice poids/puissance. Pour le reste, consulte ton coach ou les autres sections de l’application.`
  };
}
