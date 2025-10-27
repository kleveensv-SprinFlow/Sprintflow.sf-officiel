import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { produce } from 'immer';
import { useExercices } from '../../hooks/useExercices';

// Types based on user request and existing structure
export type WorkoutBlock = CourseBlock | MuscuBlock;

export interface CourseBlock {
  type: 'course';
  id: string;
  series: number;
  reps: number;
  distance: number;
  restBetweenReps: string; // e.g., "2m"
  restBetweenSeries: string; // e.g., "8m"
}

export interface MuscuBlock {
  type: 'musculation';
  id: string;
  exerciceId: string; // from exercices_db
  exerciceNom: string;
  series: number;
  reps: number;
  poids: number;
  restTime: string; // e.g., "3m"
}

interface WorkoutBuilderProps {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
}

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ blocks, onChange }) => {
  const { exercices } = useExercices();

  const addBlock = (type: 'course' | 'musculation') => {
    const newBlock: WorkoutBlock =
      type === 'course'
        ? {
            type: 'course',
            id: generateId(),
            series: 1,
            reps: 1,
            distance: 100,
            restBetweenReps: '2m',
            restBetweenSeries: '5m',
          }
        : {
            type: 'musculation',
            id: generateId(),
            exerciceId: '',
            exerciceNom: '',
            series: 3,
            reps: 10,
            poids: 50,
            restTime: '2m',
          };
    onChange(produce(blocks, draft => {
      draft.unshift(newBlock);
    }));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
  };

  const updateBlock = (id: string, updatedFields: Partial<WorkoutBlock>) => {
    onChange(produce(blocks, draft => {
      const index = draft.findIndex(block => block.id === id);
      if (index !== -1) {
        draft[index] = { ...draft[index], ...updatedFields };
      }
    }));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    onChange(produce(blocks, draft => {
      const [movedBlock] = draft.splice(index, 1);
      draft.splice(newIndex, 0, movedBlock);
    }));
  };

  const renderBlock = (block: WorkoutBlock) => {
    if (block.type === 'course') {
      return (
        <div className="space-y-3 pr-12">
          <h4 className="font-semibold text-blue-600 dark:text-blue-400">Bloc Course / Piste</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Séries</label>
              <input
                type="number"
                value={block.series}
                onChange={(e) => updateBlock(block.id, { ...block, series: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Répétitions</label>
              <input
                type="number"
                value={block.reps}
                onChange={(e) => updateBlock(block.id, { ...block, reps: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance (m)</label>
              <input
                type="number"
                value={block.distance}
                onChange={(e) => updateBlock(block.id, { ...block, distance: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Repos / Rép</label>
              <input
                type="text"
                placeholder="ex: 2m30s"
                value={block.restBetweenReps}
                onChange={(e) => updateBlock(block.id, { ...block, restBetweenReps: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Repos / Série</label>
              <input
                type="text"
                placeholder="ex: 8m"
                value={block.restBetweenSeries}
                onChange={(e) => updateBlock(block.id, { ...block, restBetweenSeries: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        </div>
      );
    }
    if (block.type === 'musculation') {
      return (
        <div className="space-y-3 pr-12">
          <h4 className="font-semibold text-green-600 dark:text-green-400">Bloc Musculation / Force</h4>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Exercice</label>
            <select
              value={block.exerciceId}
              onChange={(e) => {
                const selectedExercice = exercices.find(ex => ex.id === e.target.value);
                updateBlock(block.id, {
                  ...block,
                  exerciceId: e.target.value,
                  exerciceNom: selectedExercice?.nom || ''
                });
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
            >
              <option value="">Sélectionner un exercice...</option>
              {exercices.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.nom}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Séries</label>
              <input
                type="number"
                value={block.series}
                onChange={(e) => updateBlock(block.id, { ...block, series: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Répétitions</label>
              <input
                type="number"
                value={block.reps}
                onChange={(e) => updateBlock(block.id, { ...block, reps: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.5"
                value={block.poids}
                onChange={(e) => updateBlock(block.id, { ...block, poids: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Repos</label>
              <input
                type="text"
                placeholder="ex: 3m"
                value={block.restTime}
                onChange={(e) => updateBlock(block.id, { ...block, restTime: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={() => addBlock('course')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Ajouter Bloc Course
        </button>
        <button
          type="button"
          onClick={() => addBlock('musculation')}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Ajouter Bloc Muscu
        </button>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Commencez par ajouter un bloc à votre séance.
          </p>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative">
              <div className="absolute top-2 right-2 flex items-center space-x-1">
                <button type="button" onClick={() => moveBlock(block.id, 'up')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => moveBlock(block.id, 'down')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeBlock(block.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {renderBlock(block)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};