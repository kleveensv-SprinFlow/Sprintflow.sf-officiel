import { LucideIcon } from 'lucide-react';

// --- IMPORTS DES IMAGES DEPUIS src/assets/hub ---
// C'est la méthode recommandée pour des images fixes incluses dans l'app.
// Le compilateur (Vite) va les optimiser et les inclure dans le build.
import imgWorkout from '../assets/hub/ajouter-un-entrainement.jpg';
import imgRecord from '../assets/hub/Record.jpg';
import imgVideo from '../assets/hub/analyse-video.jpg';
import imgLive from '../assets/hub/live.jpg';
import imgNutrition from '../assets/hub/nutrition.jpg';

export interface Action {
  id: string;
  title: string;
  subtitle?: string;
  image: string; // C'est maintenant le chemin optimisé par Vite
  icon?: LucideIcon;
  requiresPro?: boolean;
  color?: string;
}

export type ActionType = Action['id'];

// Actions disponibles pour l'ATHLÈTE
export const athleteActions: Action[] = [
  {
    id: 'new-workout',
    title: 'Nouvel Entraînement',
    subtitle: 'Enregistre ta séance du jour',
    image: imgWorkout, // Utilisation de la variable importée
    color: 'from-sprint-primary to-sprint-secondary',
  },
  {
    id: 'new-record',
    title: 'Nouveau Record',
    subtitle: 'Tu as battu ton PR ?',
    image: imgRecord,
    color: 'from-purple-600 to-blue-600',
  },
  {
    id: 'video-analysis',
    title: 'Analyse Vidéo',
    subtitle: 'Demande un feedback technique',
    image: imgVideo,
    requiresPro: true,
    color: 'from-red-600 to-orange-600',
  },
  {
    id: 'live-session',
    title: 'Session Live',
    subtitle: 'Rejoins un cours en direct',
    image: imgLive,
    requiresPro: true,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'nutrition-plan',
    title: 'Plan Nutrition',
    subtitle: 'Tes objectifs alimentaires',
    image: imgNutrition,
    color: 'from-yellow-500 to-orange-500',
  },
];

// Actions disponibles pour le COACH (Tu pourras ajouter d'autres images plus tard)
export const coachActions: Action[] = [
  {
    id: 'new-workout',
    title: 'Créer une Séance',
    subtitle: 'Planifie un entraînement pour tes athlètes',
    image: imgWorkout, // On réutilise la même image pour l'instant
    color: 'from-sprint-primary to-sprint-secondary',
  },
  {
    id: 'my-follow-ups',
    title: 'Mes Suivis',
    subtitle: 'Gère les analyses vidéo en attente',
    image: imgVideo, // On réutilise
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'my-athletes-360',
    title: 'Mes Athlètes 360°',
    subtitle: 'Vue globale de ton équipe',
    image: imgLive, // On réutilise
    color: 'from-indigo-600 to-purple-600',
  },
  {
    id: 'manage-planning',
    title: 'Gérer le Planning',
    subtitle: 'Organise les semaines à venir',
    image: imgRecord, // On réutilise
    color: 'from-orange-600 to-red-600',
  },
];