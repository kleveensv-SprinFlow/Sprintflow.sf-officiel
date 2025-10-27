export interface MessageData {
  short: string;
  long: string;
  color: 'green' | 'orange' | 'red' | 'blue';
}

export const MESSAGES: Record<string, MessageData> = {
  FORME_HAUT_INDICE_HAUT: {
    short: "LA ZONE. Tu es frais et ton potentiel est au max. C'est le jour pour un record.",
    long: "Tu es dans la zone optimale ! Ton Score de Forme est excellent (récupération et charge parfaites) ET ton Indice de Performance est au sommet. Toutes les conditions sont réunies pour une performance maximale. C'est le moment idéal pour tenter un record personnel ou une séance à haute intensité.",
    color: 'green',
  },

  FORME_HAUT_INDICE_BAS: {
    short: "Tu es parfaitement reposé. C'est le moment idéal pour travailler tes points faibles (force ou technique).",
    long: "Excellent niveau de fraîcheur ! Ton sommeil et ta charge d'entraînement sont optimaux. Cependant, ton potentiel athlétique peut encore progresser. Profite de cette disponibilité pour renforcer tes points faibles : travail de force en salle, exercices techniques, ou séances de développement spécifique.",
    color: 'green',
  },

  FORME_BAS_INDICE_HAUT: {
    short: "Attention. Ton potentiel est énorme, mais tu es fatigué. Ne grille pas ton moteur. Respecte la récupération.",
    long: "⚠️ Alerte fatigue ! Ton corps possède un potentiel athlétique élevé, mais tu es actuellement en déficit de récupération. Poursuivre l'entraînement intensif dans cet état risque de te mener au surentraînement ou à la blessure. Priorise absolument : sommeil de qualité (8h+), nutrition optimale, et si possible une journée de repos complet ou récupération active légère.",
    color: 'orange',
  },

  FORME_BAS_INDICE_BAS: {
    short: "Phase de reconstruction. Ne te frustre pas. Concentre-toi sur les bases : sommeil, nutrition, et une séance technique propre.",
    long: "Phase de développement fondamental. Ton score de forme et ton indice de performance indiquent que tu es en phase de construction. C'est normal et temporaire. Ne te compare pas aux autres en ce moment. Concentre-toi sur les fondamentaux : améliore la qualité de ton sommeil, respecte ta nutrition (notamment autour des entraînements), et privilégie des séances techniques propres à intensité modérée. Le potentiel se construit dans la durée.",
    color: 'red',
  },

  FORME_BAS_SOMMEIL: {
    short: "Ta batterie est faible. Ton manque de sommeil récent impacte directement ta forme.",
    long: "Déficit de sommeil détecté. Ta moyenne de sommeil des 3 dernières nuits est insuffisante pour une récupération optimale. Le sommeil est le facteur #1 de la performance athlétique : c'est pendant le sommeil profond que ton corps répare les tissus musculaires, consolide les adaptations, et recharge ton système nerveux. Action immédiate : vise 8-9h de sommeil cette nuit. Évite les écrans 1h avant le coucher, garde ta chambre fraîche (18°C), et considère une sieste de 20min aujourd'hui si possible.",
    color: 'red',
  },

  FORME_BAS_CHARGE: {
    short: "Alerte surentraînement. Tu n'as pas pris de jour de repos depuis trop longtemps. La récupération est une priorité.",
    long: "Signal de surentraînement. Tu accumules les jours d'entraînement sans repos suffisant. Ton corps n'a pas le temps de s'adapter et de progresser. Résultat : fatigue accumulée, risque de blessure élevé, et stagnation des performances. La progression ne se fait PAS pendant l'entraînement, mais pendant la récupération. Action : prends 1-2 jours de repos complet MAINTENANT. Ensuite, structure tes semaines avec au moins 2 jours off par semaine (récupération active possible).",
    color: 'red',
  },

  FORME_BAS_SEANCE_DURE: {
    short: "Ta dernière séance a été très intense (gros drop-off). Ton corps est en pleine réparation. Sois patient.",
    long: "Récupération post-séance intense. L'analyse de ta dernière séance montre un drop-off de fatigue élevé (> 7%), ce qui indique que tu as fortement sollicité ton système neuromusculaire. C'est le signe d'une séance de qualité, mais ton corps a maintenant besoin de temps pour se réparer et s'adapter. Les micro-déchirures musculaires, la fatigue du système nerveux central, et la déplétion énergétique demandent 48-72h de récupération. Ne cherche pas à forcer : respecte ce processus. Nutrition et sommeil sont cruciaux dans les 48h qui suivent.",
    color: 'orange',
  },

  FORME_HAUT: {
    short: "Tu es prêt à performer. Ta récupération (sommeil/charge) est excellente.",
    long: "Disponibilité maximale. Tous tes indicateurs de récupération sont au vert : sommeil de qualité et en quantité suffisante, charge d'entraînement bien gérée avec des jours de repos appropriés. Ton corps est frais et ton système nerveux est prêt. C'est dans cet état que tu peux donner le meilleur de toi-même. Profite de cette fenêtre pour des séances de qualité ou des tests de performance.",
    color: 'green',
  },

  FORME_MOYEN: {
    short: "Forme correcte. Tu peux t'entraîner normalement, mais reste à l'écoute de ton corps.",
    long: "État de forme standard. Tu n'es ni en surcapacité ni en sous-récupération marquée. Tu peux poursuivre ton plan d'entraînement normalement. Cependant, reste attentif aux signaux de ton corps pendant l'échauffement et la séance. Si tu te sens particulièrement lourd ou fatigué, n'hésite pas à adapter l'intensité ou le volume. La régularité à long terme prime sur une séance forcée.",
    color: 'blue',
  },

  INDICE_HAUT: {
    short: "Potentiel athlétique excellent. Ton physique et tes performances sont au top niveau.",
    long: "Profil d'athlète confirmé. Ton Indice de Performance est élevé, ce qui signifie que ton rapport entre composition corporelle, niveau de force, et vélocité pure est optimal pour le sprint. Tu possèdes les qualités physiques nécessaires pour performer au plus haut niveau. Continue à maintenir ces standards tout en travaillant la technique et la tactique de course.",
    color: 'green',
  },

  INDICE_MOYEN: {
    short: "Potentiel solide. Continue ton développement athlétique.",
    long: "Profil athlétique en développement. Ton Indice de Performance montre que tu as des bases solides et un potentiel réel. Plusieurs axes de progression sont identifiables dans tes mini-scores (composition, force, vélocité). Avec un travail ciblé sur tes points faibles et une approche structurée, tu peux significativement améliorer cet indice. Le potentiel se construit, il n'est pas figé.",
    color: 'blue',
  },

  INDICE_BAS_COMP_CORP: {
    short: "Ton potentiel est freiné par ta composition corporelle. L'affûtage sera une phase clé.",
    long: "Composition corporelle à optimiser. Ton indice de performance est limité par ton pourcentage de masse grasse (si en Mode Expert) ou ton IMC (si en Mode Standard) qui n'est pas dans la zone optimale pour un sprinter d'élite. Cela ne remet pas en cause tes qualités athlétiques, mais ajoute un poids mort à déplacer. Stratégie : une phase d'affûtage contrôlée (déficit calorique léger de 200-300 kcal/jour, maintien des protéines élevé à 2g/kg) te permettra d'améliorer significativement ton rapport poids/puissance. Attention : ne pas faire de restriction drastique qui détruirait ta masse musculaire.",
    color: 'orange',
  },

  INDICE_BAS_FORCE: {
    short: "Potentiel de force à développer. La force est la mère de la vitesse.",
    long: "Déficit de force relative détecté. Ton ratio Squat / Poids de Corps (ou Squat / Masse Musculaire en Mode Expert) est en dessous des standards pour un sprinter performant. La force maximale est la fondation de l'explosivité et de la vitesse. Sans une base de force solide, tu ne pourras pas exprimer pleinement ton potentiel de vélocité. Programme recommandé : intègre 2-3 séances de force par semaine (squats, soulevés de terre, travail pliométrique). Objectif : atteindre au minimum 2x ton poids de corps au squat (2.5x pour l'élite).",
    color: 'orange',
  },

  INDICE_BAS_VELOCITE: {
    short: "Tu es fort, mais tu dois convertir cette force en vitesse. Focus sur l'explosivité.",
    long: "Problème de transfert force → vitesse. Ton niveau de force peut être correct, mais ton record de vitesse pure (100m) ne reflète pas ce potentiel. Tu dois travailler la capacité à exprimer cette force de manière explosive et à haute vélocité. Focus d'entraînement : sprint départs lancés, travail de foulée technique, exercices pliométriques réactifs (bonds, sauts multiples), et courses de vélocité pure (20-30m départ lancé). Le travail de technique de course est aussi crucial : chaque défaut technique coûte des centièmes.",
    color: 'orange',
  },

  INDICE_BAS_GENERAL: {
    short: "Potentiel en construction. Travaille tes fondamentaux sur tous les plans.",
    long: "Phase de développement global. Ton Indice de Performance montre des marges de progression sur plusieurs composantes (composition, force, vélocité). C'est une opportunité ! Approche recommandée : travaille sur ces trois piliers de manière équilibrée. Un plan structuré combinant musculation (2-3x/semaine), sprint technique (2x/semaine), et nutrition optimisée te permettra de progresser rapidement. Le plus important : la régularité sur plusieurs mois. Le potentiel athlétique se construit, sois patient.",
    color: 'blue',
  },

  INDICE_AUGMENTE: {
    short: "Ton indice progresse ! Ton travail sur ton physique et tes performances paie. Continue.",
    long: "Progression confirmée ! Les données montrent que ton Indice de Performance s'améliore au fil du temps. Cela signifie que ton travail (force, affûtage, technique de course, etc.) produit des résultats mesurables. C'est la preuve que ton approche fonctionne. Continue dans cette voie, maintiens ta régularité, et peaufine les détails. Chaque pourcentage d'amélioration compte.",
    color: 'green',
  },
};

export function getCombinedMessage(scoreForme: number, indicePerf: number): string {
  const formeHaut = scoreForme >= 80;
  const formeBas = scoreForme < 50;
  const indiceHaut = indicePerf >= 85;
  const indiceBas = indicePerf < 60;

  if (formeHaut && indiceHaut) return 'FORME_HAUT_INDICE_HAUT';
  if (formeHaut && indiceBas) return 'FORME_HAUT_INDICE_BAS';
  if (formeBas && indiceHaut) return 'FORME_BAS_INDICE_HAUT';
  if (formeBas && indiceBas) return 'FORME_BAS_INDICE_BAS';

  return 'FORME_MOYEN';
}
