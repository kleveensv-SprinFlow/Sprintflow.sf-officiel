import { Plus, Zap, Trophy, Bot, Video, Users, Calendar, Dumbbell } from 'lucide-react';

// --- IMPORTS IMAGES ATHLETE (PNG) ---
import imgWorkout from '../assets/hub/ajouter-un-entrainement.png';
import imgRecord from '../assets/hub/Record.png';
import imgVideo from '../assets/hub/analyse-video.png';
import imgLive from '../assets/hub/live.png';
import imgNutrition from '../assets/hub/nutrition.png';

// --- IMPORTS IMAGES COACH (CORRECTION EXTENSION .PNG) ---
// Le système voit des .png, on s'adapte pour éliminer l'erreur
import imgPlanningCoach from '../assets/hub/planning.png';
import imgMesSuivis from '../assets/hub/mes-suivie.png';

export type AthleteActionType = 'new-workout' | 'live-workout' | 'new-record' | 'nutrition' | 'video-analysis';
export type CoachActionType = 'my-follow-ups' | 'manage-planning' | 'exercise-library';
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
    id: 'my-follow-ups', 
    title: "Mes suivis", 
    subtitle: "Suivez la progression de vos athlètes.",
    Icon: Users, 
    image: imgMesSuivis
  },
  { 
    id: 'manage-planning', 
    title: "Gestion de planning", 
    subtitle: "Gérez les programmes d'entraînement.",
    Icon: Calendar, 
    image: imgPlanningCoach
  },
  {
    id: 'exercise-library',
    title: "Bibliothèque d'exercices",
    subtitle: "Gérez vos exercices.",
    Icon: Dumbbell,
    image: imgWorkout // Placeholder image using existing asset
  }
];
