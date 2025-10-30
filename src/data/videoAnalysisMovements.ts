// Fichier: src/data/videoAnalysisMovements.ts

export interface Movement {
  name: string;
  guide: string;
  specId: string;
}

export interface MovementCategory {
  category: string;
  icon: string;
  movements: Movement[];
}

export const videoAnalysisMovements: MovementCategory[] = [
  {
    category: "Musculation",
    icon: "Dumbbell",
    movements: [
      {
        name: "Squat",
        guide: "Filmez de côté, parallèle à vous. Assurez-vous que votre corps entier est visible. Gardez le téléphone stable, idéalement sur un trépied.",
        specId: "squat_mvp"
      }
    ]
  },
  {
    category: "Sprint",
    icon: "Wind",
    movements: []
  },
  {
    category: "Lancer",
    icon: "Disc",
    movements: []
  },
  {
    category: "Saut",
    icon: "ChevronsUp",
    movements: []
  },
  {
    category: "Haltérophilie",
    icon: "Dumbbell",
    movements: []
  }
];
