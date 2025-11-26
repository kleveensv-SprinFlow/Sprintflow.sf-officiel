import { Plus, Zap, Trophy, Bot, Video, Users, Search, Calendar } from 'lucide-react';

export type AthleteActionType = 'new-workout' | 'live-workout' | 'new-record' | 'nutrition' | 'video-analysis';
export type CoachActionType = 'my-follow-ups' | 'my-athletes-360' | 'manage-planning';
export type ActionType = AthleteActionType | CoachActionType;

export interface Action {
  id: ActionType;
  title: string;
  subtitle?: string; // Ajout d'un sous-titre optionnel
  Icon: React.ElementType;
  image: string;
}

const placeholderImage = "/assets/images/hub/placeholder.jpg";

export const athleteActions: Action[] = [
  { 
    id: 'new-workout', 
    title: "Ajouter un entraînement", 
    subtitle: "Planifiez votre prochaine session.",
    Icon: Plus, 
    image: placeholderImage
  },
  { 
    id: 'live-workout', 
    title: "Entraînement live",
    subtitle: "Suivez une séance en temps réel.", 
    Icon: Zap, 
    image: placeholderImage
  },
  { 
    id: 'new-record', 
    title: "Ajouter un record", 
    subtitle: "Enregistrez une nouvelle performance.",
    Icon: Trophy, 
    image: placeholderImage
  },
  { 
    id: 'nutrition', 
    title: "Nutrition", 
    subtitle: "Suivez votre alimentation.",
    Icon: Bot, 
    image: placeholderImage
  },
  { 
    id: 'video-analysis', 
    title: "Analyse vidéo", 
    subtitle: "Analysez votre technique.",
    Icon: Video, 
    image: placeholderImage
  },
];

export const coachActions: Action[] = [
  { 
    id: 'my-follow-ups', 
    title: "Mes suivis", 
    subtitle: "Consultez le progrès de vos athlètes.",
    Icon: Users, 
    image: placeholderImage
  },
  { 
    id: 'my-athletes-360', 
    title: "Mes athlètes 360", 
    subtitle: "Vue d'ensemble de vos athlètes.",
    Icon: Search, 
    image: placeholderImage
  },
  { 
    id: 'manage-planning', 
    title: "Gestion de planning", 
    subtitle: "Organisez les entraînements.",
    Icon: Calendar, 
    image: placeholderImage
  },
];
