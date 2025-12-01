import { Plus, Zap, Trophy, Bot, Video, Users, Calendar, BarChart4, TrendingUp } from 'lucide-react';

// --- IMPORTS IMAGES ATHLETE (PNG) ---
import imgWorkout from '../assets/hub/ajouter-un-entrainement.png';
import imgRecord from '../assets/hub/Record.png';
import imgVideo from '../assets/hub/analyse-video.png';
import imgLive from '../assets/hub/live.png';
import imgNutrition from '../assets/hub/nutrition.png';

// --- IMPORTS IMAGES COACH ---
import imgPlanningCoach from '../assets/hub/planning.png';
import imgMesSuivis from '../assets/hub/mes-suivie.png';

export type AthleteActionType = 'new-workout' | 'live-workout' | 'new-record' | 'nutrition' | 'video-analysis';
// Mise à jour des types d'actions Coach
export type CoachActionType = 'my-athletes' | 'weekly-planning' | 'periodization'; 
export type ActionType = AthleteActionType | CoachActionType;

export interface Action {
  id: ActionType;
  title: string;
  subtitle?: string;
  Icon: React.ElementType;
  image: string;
}

export const athleteActions: Action[] = [
  { 
    id: 'new-workout', 
    title: "Ajouter un entraînement", 
    subtitle: "Planifiez votre prochaine session.",
    Icon: Plus, 
    image: imgWorkout
  },
  { 
    id: 'live-workout', 
    title: "Entraînement live",
    subtitle: "Suivez une séance en temps réel.", 
    Icon: Zap, 
    image: imgLive
  },
  { 
    id: 'new-record', 
    title: "Ajouter un record", 
    subtitle: "Enregistrez une nouvelle performance.",
    Icon: Trophy, 
    image: imgRecord
  },
  { 
    id: 'nutrition', 
    title: "Nutrition", 
    subtitle: "Suivez votre alimentation.",
    Icon: Bot, 
    image: imgNutrition
  },
  { 
    id: 'video-analysis', 
    title: "Analyse vidéo", 
    subtitle: "Analysez votre technique.",
    Icon: Video, 
    image: imgVideo
  },
];

export const coachActions: Action[] = [
  { 
    id: 'my-athletes', // Ancien 'my-follow-ups'
    title: "Mes Athlètes (Suivi 360)", 
    subtitle: "État de forme, charge et progression.",
    Icon: Users, 
    image: imgMesSuivis
  },
  { 
    id: 'weekly-planning', // Ancien 'manage-planning' (partiel)
    title: "Planning Hebdomadaire", 
    subtitle: "Gérez les séances de la semaine.",
    Icon: Calendar, 
    image: imgPlanningCoach
  },
  { 
    id: 'periodization', // Nouvelle action distincte
    title: "Périodisation & Macrocycles", 
    subtitle: "Structurez la saison et les blocs.",
    Icon: TrendingUp, // Icône plus "stratégique"
    image: imgPlanningCoach // On peut réutiliser l'image ou en mettre une spécifique "Graphique"
  },
];