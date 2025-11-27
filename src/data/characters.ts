export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  gradient: string;
  shadowColor: string;
  predefinedQuestions: string[];
}

export const CHARACTERS: Character[] = [
  {
    id: 'sprinty',
    name: 'SPRINTY',
    role: 'Assistant Coach IA',
    description: "Je suis là pour répondre à toutes tes questions sur l'application et t'aider à gérer ton groupe.",
    color: '#4F46E5', // Indigo-500
    gradient: 'from-indigo-400 to-indigo-600',
    shadowColor: 'rgba(79, 70, 229, 0.5)',
    predefinedQuestions: [
      "Comment créer une séance ?",
      "Ajouter un athlète",
      "Planifier la semaine",
      "Analyser les performances"
    ]
  },
  {
    id: 'kalo',
    name: 'KALO',
    role: 'Nutritionniste',
    description: "Je t'aide à optimiser la nutrition de tes athlètes pour la performance et la récupération.",
    color: '#22c55e', // Green-500
    gradient: 'from-green-400 to-green-600',
    shadowColor: 'rgba(34, 197, 94, 0.5)',
    predefinedQuestions: [
      "Idée repas avant compétition",
      "Hydratation",
      "Récupération post-séance",
      "Gérer le poids"
    ]
  },
  {
    id: 'zoom',
    name: 'ZOOM',
    role: 'Analyste Technique',
    description: "Je suis spécialisé dans l'analyse biomécanique et technique de la course et des mouvements.",
    color: '#06b6d4', // Cyan-500
    gradient: 'from-cyan-400 to-blue-600',
    shadowColor: 'rgba(6, 182, 212, 0.5)',
    predefinedQuestions: [
      "Analyser un départ",
      "Technique de sprint",
      "Améliorer la foulée",
      "Correction de posture"
    ]
  },
  {
    id: 'mentor',
    name: 'MENTOR',
    role: 'Préparateur Mental',
    description: "Je travaille sur la motivation, la concentration et la gestion du stress de tes athlètes.",
    color: '#8b5cf6', // Violet-500
    gradient: 'from-violet-400 to-indigo-600',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    predefinedQuestions: [
      "Gérer le stress",
      "Motivation avant course",
      "Fixer des objectifs",
      "Confiance en soi"
    ]
  },
  {
    id: 'snooze',
    name: 'SNOOZE',
    role: 'Expert Récupération',
    description: "Je te conseille sur le sommeil et les stratégies de récupération pour éviter le surentraînement.",
    color: '#a5b4fc', // Indigo-300
    gradient: 'from-indigo-300 to-blue-400',
    shadowColor: 'rgba(165, 180, 252, 0.5)',
    predefinedQuestions: [
      "Améliorer le sommeil",
      "Signes de fatigue",
      "Routine du soir",
      "Sieste flash"
    ]
  },
  {
    id: 'statix',
    name: 'STATIX',
    role: 'Data Scientist',
    description: "J'analyse les données de performance pour identifier les tendances et les axes de progression.",
    color: '#f97316', // Orange-500
    gradient: 'from-orange-400 to-red-500',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
    predefinedQuestions: [
      "Progression sur 3 mois",
      "Comparaison saisonnière",
      "Pic de forme",
      "Stats de groupe"
    ]
  },
];
