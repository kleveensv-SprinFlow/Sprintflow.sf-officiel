export interface CourseBlock {
  type: 'course';
  id: string;
  series: number;
  reps: number;
  distance: number;
  restBetweenReps: string;
  restBetweenSeries: string;
  chronos?: (number | null)[][];
}

export interface MuscuBlock {
  type: 'musculation';
  id: string;
  exerciceId: string;
  exerciceNom: string;
  series: number;
  reps: number;
  poids: number | null;
  restTime: string;
  charges?: (number | null)[][];
}

export type WorkoutBlock = CourseBlock | MuscuBlock;

export interface WorkoutTemplate {
  id: string;
  name: string;
  workout_data: any; // Vous pouvez affiner ce type plus tard
}
