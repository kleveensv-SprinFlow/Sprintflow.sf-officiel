export interface Performance {
  time?: number;
  distance?: number;
  weight?: number;
  wind_speed?: number;
}

export interface SetData {
  set_number: number;
  performances: Performance[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  set_data?: SetData[];
}

export interface Stairs {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  location?: string;
  rest_time?: number;
  set_data?: SetData[];
}

export interface Run {
  id: string;
  distance: number;
  time: number;
  series?: number;
  reps?: number;
  rest_time?: number;
  timing_method?: 'manual' | 'automatic';
  wind_speed?: number;
  is_hill?: boolean;
  hill_location?: string;
  shoe_type?: 'spikes' | 'sneakers';
  set_data?: SetData[];
}

export interface Jump {
  id: string;
  discipline: string;
  distance: number;
  distance_method?: 'decameter' | 'theodolite';
  wind_speed?: number;
  shoe_type?: 'spikes' | 'sneakers';
  attempts?: Performance[];
}

export interface Throw {
  id: string;
  discipline: string;
  distance: number;
  distance_method?: 'decameter' | 'theodolite';
  wind_speed?: number;
  shoe_type?: 'spikes' | 'sneakers';
  attempts?: Performance[];
}

export interface WorkoutRun {
  distance: string;
  temps?: number;
  type_chrono: 'manuel' | 'electronique';
  chaussures?: 'pointes' | 'baskets';
  terrain?: 'piste' | 'cote';
  repos?: string;
  series?: number;
  reps?: number;
  chronos?: number[];
  en_cote?: boolean;
  lieu_cote?: string;
}

export interface WorkoutMuscu {
  exercice_id: string;
  exercice_nom: string;
  series: number;
  reps: number;
  poids: number;
  chronos?: number[];
}

export interface WorkoutSaut {
  discipline: string;
  series: number;
  reps: number;
  distances?: number[];
  mesure: 'decametre' | 'theodolite';
  chaussures?: 'pointes' | 'baskets';
}

export interface WorkoutLancer {
  discipline: string;
  series: number;
  reps: number;
  distances: number[];
  mesure: 'decametre' | 'theodolite';
}

export interface Workout {
  id: string;
  user_id?: string;
  date: string;
  title?: string;
  tag_seance?: 'vitesse_max' | 'endurance_lactique' | 'technique_recup' | 'lactique_piste' | 'lactique_cote' | 'aerobie' | 'musculation';
  courses_json?: WorkoutRun[];
  muscu_json?: WorkoutMuscu[];
  sauts_json?: WorkoutSaut[];
  lancers_json?: WorkoutLancer[];
  autres_activites?: string;
  echelle_effort?: number;
  notes?: string;
  meteo?: string;
  temperature?: number;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
  runs?: Run[];
  jumps?: Jump[];
  throws?: Throw[];
  exercises?: Exercise[];
  stairs?: Stairs[];
}

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
  exercice_id?: string;
}

export interface BodyComposition {
  id: string;
  date: string;
  weight: number;
  height: number;
  waterPercentage: number;
  totalMuscle: number;
  skeletalMuscle: number;
  bodyFatPercentage: number;
  measurement_method?: 'scale' | 'dexa' | 'bioimpedance';
}

export interface SessionTemplate {
  id: string;
  coach_id: string;
  group_id: string;
  name: string;
  description: string;
  session_type: 'training' | 'recovery' | 'rest';
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  exercises: any[];
  created_at: string;
  updated_at?: string;
}

export interface Partnership {
  id: string;
  name: string;
  description?: string;
  photo_url?: string;
  promo_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  categories?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    'energy_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sodium_100g'?: number;
  };
  image_url?: string;
}

export interface FoodItem {
  nom: string;
  kcal_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  fibres_100g?: number;
  sodium_100mg?: number;
  source_type?: 'off' | 'personnel' | 'recette' | 'ciqual';
  source_id?: string;
}

export interface RecettePersonnelle {
  id: string;
  athlete_id: string;
  nom: string;
  ingredients: any[];
  poids_total_recette_g: number;
  nombre_portions_default: number;
  kcal_total: number;
  proteines_total_g: number;
  glucides_total_g: number;
  lipides_total_g: number;
  fibres_total_g?: number;
  sodium_total_mg?: number;
  potassium_total_mg?: number;
  created_at: string;
  updated_at: string;
}

export interface UnitOption {
  label: string;
  grams: number;
}

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
  | 'profile'
  | 'subscription'
  | 'partnerships'
  | 'developer'
  | 'nutrition'
  | 'add-sleep';