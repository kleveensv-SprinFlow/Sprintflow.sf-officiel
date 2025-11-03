import { CourseBlockData } from '../components/workouts/CourseBlockForm';

export interface Record {
  id: string;
  type: 'run' | 'exercise' | 'jump' | 'throw';
  name: string;
  value: number;
  unit: string;
  date: string;
  timing_method?: 'manual' | 'automatic';
  distance_method?: 'decameter' | 'theodolite';
  wind_speed?: number;
  is_hill?: boolean;
  hill_location?: string;
  shoe_type?: 'spikes' | 'sneakers';
  exercice_reference_id?: string;
  exercice_personnalise_id?: string;
}

export type WorkoutMuscu = {
  exercice_id: string;
  exercice_nom: string;
  series: number;
  reps: number;
  poids: number;
  name?: string; // for block templates
};

export type TextBlock = {
  id: string;
  content: string;
};

export type Workout = {
  id: string;
  user_id: string; // L'athlète qui a réalisé la séance
  date: string; // La date de réalisation effective
  title: string;
  tag_seance?: string; // Ajout du tag pour le type de séance

  // Données de la séance
  workout_data: { blocs: any[] }; // Performances réelles de l'athlète
  planned_data?: { blocs: any[] }; // Plan initial du coach
  type: 'guidé' | 'manuscrit'; // Type de séance

  // Métadonnées de planification
  status: 'planned' | 'completed';
  scheduled_date?: string; // Date prévue par le coach
  coach_id?: string; // Coach qui a planifié
  assigned_to_user_id?: string; // Si assigné à un athlète
  assigned_to_group_id?: string; // Si assigné à un groupe

  // Feedback
  rpe?: number; // RPE de l'athlète
  notes?: string;

  // Champs techniques
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
};

// Generic Profile type based on what the app uses
export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  [key: string]: any; // Allow other properties
};

// App-wide navigation view types
export type View =
  | 'dashboard'
  | 'workouts'
  | 'add-workout'
  | 'records'
  | 'add-record'
  | 'bodycomp'
  | 'add-bodycomp'
  | 'ai'
  | 'groups'
  | 'chat'
  | 'planning'
  | 'coach-planning'
  | 'profile'
  | 'partnerships'
  | 'nutrition'
  | 'add-food'
  | 'sleep'
  | 'developer'
  | 'settings'
  | 'contact';

export type DefaultWorkoutType = {
  id: string;
  name: string;
  color: string;
};

export type CustomWorkoutType = {
  id: string;
  created_at: string;
  coach_id: string;
  name: string;
  color: string;
};