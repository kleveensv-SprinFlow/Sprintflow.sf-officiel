import React from 'react';
import { Trash2, Dumbbell, Navigation, Pencil } from 'lucide-react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { WorkoutBlock, MuscuBlock } from '../../types/workout';

export type { WorkoutBlock };

interface WorkoutBuilderProps {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
  onRemoveBlock: (id: string) => void;
  onEditBlock: (id: string) => void;
  isAddingOrEditing: boolean;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  blocks,
  onChange,
  onRemoveBlock,
  onEditBlock,
  isAddingOrEditing,
}) => {
  const { dragState, handleDragStart, handleDragEnter, handleDragEnd, handleDragOver } = useDragAndDrop(blocks, onChange);

  const renderBlockSummary = (block: WorkoutBlock) => {
    let summary = '';
    let icon = null;
    let title = '';

    if (block.type === 'course') {
      title = 'Course';
      icon = <Navigation className="w-6 h-6 text-blue-500" />;
      summary = `${block.series}x ${block.reps}x ${block.distance}m`;
    } else if (block.type === 'musculation') {
      const muscuBlock = block as MuscuBlock;
      title = muscuBlock.exerciceNom || 'Musculation';
      icon = <Dumbbell className="w-6 h-6 text-green-500" />;
      summary = `${muscuBlock.series}x ${muscuBlock.reps}`;
      if (muscuBlock.poids !== null && muscuBlock.poids !== undefined && muscuBlock.poids > 0) {
        summary += ` @ ${muscuBlock.poids}kg`;
      }
    }

    return (
      <div className="flex-1 flex items-center space-x-4">
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
          {icon}
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-white capitalize">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{summary}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {blocks.length === 0 && !isAddingOrEditing ? (
        <div className="text-center py-12">
          <div className="inline-block p-6 card-glass">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">Aucun bloc ajouté</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Commencez par ajouter un bloc à votre séance</p>
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
            className={`card-glass p-4 flex justify-between items-center transition-all duration-200 relative cursor-grab active:cursor-grabbing ${dragState.isDragging && dragState.draggedIndex === index ? 'opacity-40 scale-95 ring-2 ring-primary-500' : ''} ${dragState.draggedOverIndex === index && dragState.draggedIndex !== index ? 'ring-2 ring-primary-400 ring-dashed scale-105' : ''}`}
          >
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md">
              {index + 1}
            </div>
            {renderBlockSummary(block)}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEditBlock(block.id)}
                className="p-2.5 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all active:scale-90"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveBlock(block.id)}
                className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all active:scale-90"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};