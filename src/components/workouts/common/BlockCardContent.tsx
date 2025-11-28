import React from 'react';
import { WorkoutBlock } from '../../../types/workout';
import { Clock, Activity, Repeat, Dumbbell, Play } from 'lucide-react';

export const BlockCardContent: React.FC<{ block: WorkoutBlock }> = ({ block }) => {
  // Render minimal details based on type
  switch (block.type) {
    case 'course':
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Activity size={20} />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">
              {block.distance}m
            </div>
            <div className="text-xs text-gray-500">
               {block.reps > 1 ? `${block.series}x${block.reps} reps` : 'Course simple'}
            </div>
          </div>
          {block.intensity_score && (
             <div className="ml-auto flex flex-col items-end">
                <span className="text-xs font-bold text-orange-500">RPE {block.intensity_score}</span>
             </div>
          )}
        </div>
      );
    case 'repos':
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Clock size={20} />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">
              {block.rest_duration_seconds}s Repos
            </div>
            <div className="text-xs text-gray-500 capitalize">
               {block.activity_type}
            </div>
          </div>
        </div>
      );
    case 'musculation':
        return (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Dumbbell size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {block.exerciceNom || 'Exercice'}
                </div>
                <div className="text-xs text-gray-500">
                   {block.series}x{block.reps} • {block.poids || 0}kg
                </div>
              </div>
            </div>
        );
    case 'technique':
        return (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Play size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {block.title || 'Technique'}
                </div>
                <div className="text-xs text-gray-500">
                   {Math.floor(block.duration_estimated_seconds / 60)} min
                </div>
              </div>
            </div>
        );
     case 'series':
        return (
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Repeat size={20} />
                </div>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                        Série {block.seriesCount}x
                    </div>
                    <div className="text-xs text-gray-500">
                        {block.blocks.length} exercices
                    </div>
                </div>
            </div>
        );
    default:
      return <div>Type inconnu</div>;
  }
};
