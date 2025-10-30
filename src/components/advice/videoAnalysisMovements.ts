export interface Movement {
  name: string;
  // Le guide peut être étendu pour inclure plus d'infos, comme des images ou des vidéos d'exemple
  guide: string; 
  specId: string; // Un identifiant unique pour lancer la bonne routine d'analyse
}

export interface MovementCategory {
  category: string;
  icon: string; // Nom de l'icône Lucide à afficher
  movements: Movement[];
}

// C'est ici que nous définirons tous les mouvements disponibles pour l'analyse.
// Pour le MVP, seul le Squat est actif.
export const videoAnalysisMovements: MovementCategory[] = [
  {
    category: "Musculation",
    icon: "Dumbbell",
    movements: [
      { name: "Squat", guide: "Guide pour le Squat", specId: "squat_mvp" }
      // Prochainement: { name: "Soulevé de Terre", guide: "Guide pour le SDT", specId: "deadlift" },
    ]
  },
  {
    category: "Sprint",
    icon: "Wind",
    movements: [
      // Prochainement: { name: "Départ (Blocks)", guide: "Guide pour le départ", specId: "sprint_start" },
    ]
  },
  {
    category: "Lancer",
    icon: "Disc",
    movements: [] // Aucun mouvement pour l'instant
  },
  {
    category: "Saut",
    icon: "ChevronsUp",
    movements: [] // Aucun mouvement pour l'instant
  },
  {
    category: "Haltérophilie",
    icon: "Barbell",
    movements: [] // Aucun mouvement pour l'instant
  }
];
