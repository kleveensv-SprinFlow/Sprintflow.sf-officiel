// types/workout.ts

export type StartType = 'standing' | 'block' | 'flying' | 'crouch';

export interface WorkoutRound {
  id: string;            // Unique ID for the key React
  
  // Données de charge
  distance?: number;     // ex: 60 (mètres)
  duration?: number;     // ex: 300 (secondes, pour le temps d'effort)
  weight?: number;       // ex: 80 (kg, pour la muscu)
  reps_count?: number;   // ex: 1 (pour sprint) ou 10 (pour muscu)
  
  // Variables d'intensité & Récup
  intensity_value?: number; // ex: 95 (%) ou 8 (RPE)
  intensity_type: 'percent' | 'rpe' | 'zone';
  recovery_time?: number;   // ex: 180 (secondes) - Temps de repos APRÈS cette rep
  
  // Métadonnées spécifiques (activables via Config)
  target_time?: string;     // ex: "10.50" (Chrono cible)
  start_type?: StartType;   // Type de départ
  notes?: string;           // Consigne spécifique pour cette rep
  
  // Champs universels (Phase 3)
  performance_value?: string; // ex: "1.65", "NM", "X" pour UniversalBlock
}

export interface WorkoutBlockConfig {
  // Colonnes principales
  show_distance: boolean;    // Distance (m)
  show_duration: boolean;    // Durée (s)
  show_reps_count: boolean;  // Nombre de reps
  
  // Variables de charge
  show_intensity: boolean;   // % Vmax ou RPE
  show_weight: boolean;      // Charge (Kg)
  show_recovery: boolean;    // Récupération (R:)
  
  // Détails avancés
  show_target_time: boolean; // Chrono cible (Target)
  show_start_type: boolean;  // Type de départ (Start)
  show_notes: boolean;       // Colonne pour ajouter une petite note par ligne
}

export interface BaseBlock {
  id: string;
  intensity_score?: number; // 1-10 RPE
  
  // New flexible structure
  title?: string;
  rounds?: WorkoutRound[];
  config?: WorkoutBlockConfig;
}

export interface CourseBlock extends BaseBlock {
  type: 'course';
  // Legacy fields
  series: number;
  reps: number;
  distance: number;
  restBetweenReps: string;
  restBetweenSeries: string;
  chronos?: (number | null)[][];
}

export interface MuscuBlock extends BaseBlock {
  type: 'musculation';
  // Legacy fields
  exerciceId: string;
  exerciceNom: string;
  series: number;
  reps: number;
  poids: number | null;
  restTime: string;
  charges?: (number | null)[][];
}

export interface RestBlock extends BaseBlock {
  type: 'repos';
  rest_duration_seconds: number;
  activity_type: 'passif' | 'marche' | 'trot';
}

export interface TechniqueBlock extends BaseBlock {
  type: 'technique';
  // Legacy fields
  title: string; // Override BaseBlock title? No, BaseBlock has optional title.
  duration_estimated_seconds: number;
  description?: string;
  video_link?: string;
}

export interface SeriesBlock extends BaseBlock {
  type: 'series';
  // Legacy fields
  seriesCount: number;
  restBetweenSeries: string;
  blocks: WorkoutBlock[];
}

// Phase 3: Nouveaux Blocs
export interface NoteBlock extends BaseBlock {
  type: 'note';
  content: string;
}

export interface UniversalBlock extends BaseBlock {
  type: 'universal';
  metric_name: string; // ex: "Hauteur", "Lattes", "Distance"
}

export type WorkoutBlock = CourseBlock | MuscuBlock | RestBlock | TechniqueBlock | SeriesBlock | NoteBlock | UniversalBlock;

export interface WorkoutTemplate {
  id: string;
  name: string;
  workout_data: {
    tag_seance: string;
    type: 'guidé' | 'manuscrit' | 'modèle';
    notes?: string;
    blocs: WorkoutBlock[];
  };
}
