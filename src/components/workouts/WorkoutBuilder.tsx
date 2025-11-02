import React from 'react';
import { Trash2, ChevronUp, ChevronDown, Dumbbell, Navigation, GripVertical } from 'lucide-react';
import { produce } from 'immer';
import { useExercices } from '../../hooks/useExercices';
import { NumberStepper } from '../common/NumberStepper';
import { TimePicker } from '../common/TimePicker';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

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
  const { dragState, handleDragStart, handleDragEnter, handleDragEnd, handleDragOver } = useDragAndDrop(blocks, onChange);

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
        <div className="space-y-4 pl-16 pr-12">
          <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Bloc Course / Piste</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberStepper
              label="Séries"
              value={block.series}
              onChange={(val) => updateBlock(block.id, { ...block, series: val })}
              min={1}
              max={20}
            />
            <NumberStepper
              label="Répétitions"
              value={block.reps}
              onChange={(val) => updateBlock(block.id, { ...block, reps: val })}
              min={1}
              max={50}
            />
            <NumberStepper
              label="Distance"
              value={block.distance}
              onChange={(val) => updateBlock(block.id, { ...block, distance: val })}
              min={50}
              max={10000}
              step={50}
              suffix="m"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimePicker
              label="Repos entre répétitions"
              value={block.restBetweenReps}
              onChange={(val) => updateBlock(block.id, { ...block, restBetweenReps: val })}
            />
            <TimePicker
              label="Repos entre séries"
              value={block.restBetweenSeries}
              onChange={(val) => updateBlock(block.id, { ...block, restBetweenSeries: val })}
            />
          </div>
        </div>
      );
    }
    if (block.type === 'musculation') {
      return (
        <div className="space-y-4 pl-16 pr-12">
          <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center space-x-2">
            <Dumbbell className="w-5 h-5" />
            <span>Bloc Musculation / Force</span>
          </h4>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Exercice</label>
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
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="">Sélectionner un exercice...</option>
              {exercices.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.nom}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NumberStepper
              label="Séries"
              value={block.series}
              onChange={(val) => updateBlock(block.id, { ...block, series: val })}
              min={1}
              max={20}
            />
            <NumberStepper
              label="Répétitions"
              value={block.reps}
              onChange={(val) => updateBlock(block.id, { ...block, reps: val })}
              min={1}
              max={100}
            />
            <NumberStepper
              label="Poids"
              value={block.poids}
              onChange={(val) => updateBlock(block.id, { ...block, poids: val })}
              min={0}
              max={500}
              step={0.5}
              suffix="kg"
            />
            <TimePicker
              label="Repos"
              value={block.restTime}
              onChange={(val) => updateBlock(block.id, { ...block, restTime: val })}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => addBlock('course')}
          className="group relative px-6 py-5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <Navigation className="w-6 h-6" />
            <span className="text-lg">Ajouter Bloc Course</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => addBlock('musculation')}
          className="group relative px-6 py-5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-200 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <Dumbbell className="w-6 h-6" />
            <span className="text-lg">Ajouter Bloc Muscu</span>
          </div>
        </button>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                Aucun bloc ajouté
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Commencez par ajouter un bloc Course ou Musculation
              </p>
            </div>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              className={`
                bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-200 relative
                ${dragState.isDragging && dragState.draggedIndex === index ? 'opacity-40 scale-95 border-blue-500' : 'border-gray-200 dark:border-gray-700'}
                ${dragState.draggedOverIndex === index && dragState.draggedIndex !== index ? 'border-blue-400 border-dashed scale-105' : ''}
                cursor-move
              `}
            >
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 'up')}
                  className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all active:scale-90"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 'down')}
                  className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all active:scale-90"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
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