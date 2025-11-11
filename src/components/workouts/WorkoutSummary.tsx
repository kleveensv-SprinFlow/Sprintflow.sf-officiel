import React from 'react';
import { CourseBlockData } from './CourseBlockForm';
import { WorkoutMuscu } from '../../types';

interface WorkoutSummaryProps {
  courseBlocks: CourseBlockData[];
  muscuBlocks: WorkoutMuscu[];
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ courseBlocks, muscuBlocks }) => {
  const totalVolume = courseBlocks.reduce((acc, block) => {
    const series = Number(block.series) || 0;
    const reps = Number(block.reps) || 0;
    const distance = Number(block.distance) || 0;
    return acc + (series * reps * distance);
  }, 0);

  const totalTonnage = muscuBlocks.reduce((acc, exo) => {
    const series = Number(exo.series) || 0;
    const reps = Number(exo.reps) || 0;
    const poids = Number(exo.poids) || 0;
    // Only include exercises with weight
    if (poids > 0) {
      return acc + (series * reps * poids);
    }
    return acc;
  }, 0);

  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex justify-around text-center text-sm">
      <div>
        <span className="font-bold text-gray-800 dark:text-white block">{totalVolume.toLocaleString('fr-FR')}</span>
        <span className="text-gray-600 dark:text-gray-300">mètres</span>
      </div>
      <div>
        <span className="font-bold text-gray-800 dark:text-white block">{totalTonnage.toLocaleString('fr-FR')}</span>
        <span className="text-gray-600 dark:text-gray-300">kg</span>
      </div>
    </div>
  );
};
