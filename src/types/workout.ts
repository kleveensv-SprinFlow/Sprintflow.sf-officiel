export interface BaseBlock {
  id: string;
  duration_estimated?: number; // en secondes
  intensity_score?: number; // 1-10
}

export interface CourseBlock extends BaseBlock {
  type: 'course';
  series: number;
  reps: number;
  distance: number;
  restBetweenReps: string;
  restBetweenSeries: string;
  chronos?: (number | null)[][];
}

export interface MuscuBlock extends BaseBlock {
  type: 'musculation';
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
  duration: number; // en secondes
  label?: string; // ex: "Récupération passive"
}

export interface TechniqueBlock extends BaseBlock {
  type: 'technique';
  name: string; // ex: "Gammes", "Drills"
  description?: string;
  duration: number; // en secondes
}

export type WorkoutBlock = CourseBlock | MuscuBlock | RestBlock | TechniqueBlock;

export interface WorkoutTemplate {
  id: string;
  name: string;
  workout_data: any;
}
