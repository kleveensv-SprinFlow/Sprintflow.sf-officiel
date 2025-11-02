export interface CourseBlock {
  type: 'course';
  id: string;
  series: number;
  reps: number;
  distance: number;
  restBetweenReps: string;
  restBetweenSeries: string;
}

export interface MuscuBlock {
  type: 'musculation';
  id: string;
  exerciceId: string;
  exerciceNom: string;
  series: number;
  reps: number;
  poids: number;
  restTime: string;
}

export type WorkoutBlock = CourseBlock | MuscuBlock;
