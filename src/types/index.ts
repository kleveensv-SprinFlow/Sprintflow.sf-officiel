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
  user_id: string;
  date: string;
  title: string;
  tag_seance: string;
  courses_json: CourseBlockData[];
  muscu_json: WorkoutMuscu[];
  sauts_json: []; // To be defined
  lancers_json: []; // To be defined
  autres_activites?: string;
  echelle_effort?: number;
  notes?: string;
  meteo?: string;
  temperature?: number;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
  wellness_log?: { rpe_difficulty: number }[];
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
  | 'developer';
