// src/types/index.ts

export interface Profile {
  id: string;
  role: 'athlete' | 'coach' | 'encadrant' | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  full_name?: string | null;
  photo_url?: string | null;
  avatar_url?: string | null;
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
  | 'settings'
  | 'contact'
  | 'partnerships'
  | 'developer-panel'
  | 'chat'
  | 'new-workout'
  | 'add-record'
  | 'add-sleep';