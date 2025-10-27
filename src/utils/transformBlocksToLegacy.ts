import { WorkoutBlock } from '../components/workouts/WorkoutBuilder';
import { WorkoutRun, WorkoutMuscu } from '../types';

export const transformBlocksToLegacy = (blocks: WorkoutBlock[]): { courses: WorkoutRun[], muscu: WorkoutMuscu[] } => {
  const courses: WorkoutRun[] = [];
  const muscu: WorkoutMuscu[] = [];

  blocks.forEach(block => {
    if (block.type === 'course') {
      for (let i = 0; i < block.series; i++) {
        for (let j = 0; j < block.reps; j++) {
          courses.push({
            distance: `${block.distance}m`,
            temps: 0, // Athlete will fill this
            type_chrono: 'manuel',
            repos: i === block.series - 1 && j === block.reps - 1 ? '' : (j < block.reps - 1 ? block.restBetweenReps : block.restBetweenSeries),
            chaussures: 'pointes',
            terrain: 'piste'
          });
        }
      }
    } else if (block.type === 'musculation') {
        muscu.push({
            exercice_id: block.exerciceId,
            exercice_nom: block.exerciceNom,
            series: block.series,
            reps: block.reps,
            poids: block.poids
        });
    }
  });

  return { courses, muscu };
};