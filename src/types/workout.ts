// types/workout.ts

export interface BaseBlock {
  id: string;
  intensity_score?: number; // 1-10 RPE
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
  rest_duration_seconds: number;
  activity_type: 'passif' | 'marche' | 'trot';
}

export interface TechniqueBlock extends BaseBlock {
  type: 'technique';
  title: string;
  duration_estimated_seconds: number;
  description?: string;
  video_link?: string;
}

export interface SeriesBlock extends BaseBlock {
  type: 'series';
  seriesCount: number;
  restBetweenSeries: string;
  blocks: WorkoutBlock[];
}

export type WorkoutBlock = CourseBlock | MuscuBlock | RestBlock | TechniqueBlock | SeriesBlock;

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
