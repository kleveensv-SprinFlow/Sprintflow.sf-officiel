// src/types/index.ts
import { WorkoutBlock } from './workout';

export interface Profile {
  id: string;
  role: 'athlete' | 'coach' | 'encadrant' | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  full_name?: string | null;
  photo_url?: string | null;
  height?: number | null;
  weight?: number | null;
  body_fat_percentage?: number | null;
  training_frequency?: string | null;
  dietary_preferences?: string[] | null;
  personal_records?: Record<string, any> | null;
  created_at: string;
  updated_at?: string | null;
  date_de_naissance?: string | null;
  sexe?: 'homme' | 'femme' | 'autre' | null;
  discipline?: string | null;
  license_number?: string | null;
  role_specifique?: string | null;
}

export type View =
  | 'dashboard'
  | 'profile'
  | 'groups'
  | 'workouts'
  | 'planning'
  | 'nutrition'
  | 'ai'
  | 'records'
  | 'settings'
  | 'contact'
  | 'partnerships'
  | 'developer-panel'
  | 'chat'
  | 'advice'
  | 'partners'
  | 'new-workout'
  | 'add-record'
  | 'add-sleep'
  | 'add-food'
  | 'sleep'
  | 'share-performance'
  | 'sprinty-chat'
  | 'hub';

export interface EpreuveAthletisme {
  id: string;
  nom: string;
  categorie: string;
  type_mesure: 'temps' | 'distance' | 'hauteur';
  unite: string;
  created_at: string;
}

export interface Objectif {
  id: string;
  user_id: string;
  epreuve_id: string;
  valeur: number;
  created_at: string;
  epreuve?: EpreuveAthletisme;
}

export interface Record {
  id: string;
  type: 'exercise' | 'run' | 'jump' | 'throw';
  name: string;
  value: number;
  unit: 'kg' | 's' | 'm';
  date: string;
  exercice_reference_id?: string | null;
  category?: string;
}

export interface Workout {
  id: string;
  user_id?: string;
  coach_id?: string;
  assigned_to_group_id?: string;
  assigned_to_user_id?: string;
  date: string;
  tag_seance?: string;
  type: 'guidé' | 'manuscrit' | 'modèle';
  status: 'planned' | 'completed';
  notes?: string;
  planned_data?: {
    blocs: WorkoutBlock[];
  };
  workout_data?: {
    blocs: WorkoutBlock[];
  };
  rpe?: number;
  duration_minutes?: number;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
export interface GroupRecord {
  id: string;
  user_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_photo_url?: string | null;
  exercise_name: string;
  value: number;
  unit: string;
  date: string;
  type: string;
}
