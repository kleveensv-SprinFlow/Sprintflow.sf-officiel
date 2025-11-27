import { Plus, Zap, Trophy, Bot, Video, Users, Search, Calendar } from 'lucide-react';

// --- IMPORTS DES IMAGES LOCALES (.PNG) ---
import imgWorkout from '../assets/hub/ajouter-un-entrainement.png';
import imgRecord from '../assets/hub/Record.png';
import imgVideo from '../assets/hub/analyse-video.png';
import imgLive from '../assets/hub/live.png';
import imgNutrition from '../assets/hub/nutrition.png';

export type AthleteActionType = 'new-workout' | 'live-workout' | 'new-record' | 'nutrition' | 'video-analysis';
export type CoachActionType = 'my-follow-ups' | 'my-athletes-360' | 'manage-planning';
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
    subtitle: "Consultez le progrès de vos athlètes.",
    Icon: Users, 
    image: imgVideo // Réutilisation logique de l'image d'analyse
  },
  { 
    id: 'my-athletes-360', 
    title: "Mes athlètes 360", 
    subtitle: "Vue d'ensemble de vos athlètes.",
    Icon: Search, 
    image: imgLive // Réutilisation logique pour la vue d'ensemble
  },
  { 
    id: 'manage-planning', 
    title: "Gestion de planning", 
    subtitle: "Organisez les entraînements.",
    Icon: Calendar, 
    image: imgWorkout // Réutilisation logique de l'image d'entraînement
  },
];