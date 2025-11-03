import React, { useState } from 'react';
import { Trash2, Dumbbell, Navigation, GripVertical, Edit } from 'lucide-react';
import { useExercices } from '../../hooks/useExercices';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { WorkoutBlock } from '../../types/workout';
import { CourseBlockForm } from './CourseBlockForm';
import { MuscuBlockForm } from './MuscuBlockForm';

export type { WorkoutBlock };

interface WorkoutBuilderProps {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
}

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ blocks, onChange }) => {
  const [openBlockIds, setOpenBlockIds] = useState<string[]>([]);
  const { exercices } = useExercices();
  const { dragState, handleDragStart, handleDragEnter, handleDragEnd, handleDragOver } = useDragAndDrop(blocks, onChange);

  const toggleBlock = (id: string) => {
    setOpenBlockIds(prev => 
      prev.includes(id) ? prev.filter(blockId => blockId !== id) : [...prev, id]
    );
  };

  const addBlock = (type: 'course' | 'musculation') => {
    const newId = generateId();
    const newBlock: WorkoutBlock =
      type === 'course'
        ? {
            type: 'course', id: newId, series: 1, reps: 1, distance: 400,
            restBetweenReps: '02:00', restBetweenSeries: '05:00',
          }
        : {
            type: 'musculation', id: newId, exerciceId: '', exerciceNom: '',
            series: 3, reps: 10, poids: 50, restTime: '02:00',
          };
    onChange([newBlock, ...blocks]);
    setOpenBlockIds(prev => [...prev, newId]);
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    onChange(newBlocks);
    setOpenBlockIds(prev => prev.filter(blockId => blockId !== id));
  };

  const updateBlock = (id: string, updatedFields: Partial<WorkoutBlock>) => {
    onChange(blocks.map(block =>
      block.id === id ? { ...block, ...updatedFields } : block
    ));
  };

  const handleValidate = (id: string) => {
    setOpenBlockIds(prev => prev.filter(blockId => blockId !== id));
  };

  const renderBlock = (block: WorkoutBlock, index: number) => {
    const isEditing = openBlockIds.includes(block.id);

    if (!isEditing) {
      const blockNumber = blocks.length - index;
      let summary = '';
      let title = '';

      if (block.type === 'course') {
        title = `Course ${blockNumber}`;
        summary = `${block.series}x${block.reps}x${block.distance}m`;
      } else if (block.type === 'musculation') {
        title = `Muscu ${blockNumber}`;
        summary = `${block.series}x${block.reps} @ ${block.poids}kg - ${block.exerciceNom || 'N/A'}`;
      }

      return (
        <div onClick={() => toggleBlock(block.id)} className="cursor-pointer p-4 flex justify-between items-center">
          <div>
            <p className="font-bold text-lg text-gray-800 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{summary}</p>
          </div>
          <Edit className="w-5 h-5 text-gray-400" />
        </div>
      );
    }

    if (block.type === 'course') {
      return <CourseBlockForm block={block} onChange={(updatedBlock) => updateBlock(block.id, updatedBlock)} onValidate={() => handleValidate(block.id)} />;
    }
    if (block.type === 'musculation') {
      return <MuscuBlockForm block={block} onChange={(updatedBlock) => updateBlock(block.id, updatedBlock)} onValidate={() => handleValidate(block.id)} />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button type="button" onClick={() => addBlock('course')} className="group relative px-6 py-5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-95 overflow-hidden">
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <Navigation className="w-6 h-6" />
            <span className="text-lg">Ajouter Bloc Course</span>
          </div>
        </button>
        <button type="button" onClick={() => addBlock('musculation')} className="group relative px-6 py-5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-200 active:scale-95 overflow-hidden">
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
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Aucun bloc ajouté</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Commencez par ajouter un bloc Course ou Musculation</p>
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
              className={`bg-white dark:bg-gray-800 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-200 relative ${dragState.isDragging && dragState.draggedIndex === index ? 'opacity-40 scale-95 border-blue-500' : 'border-gray-200 dark:border-gray-700'} ${dragState.draggedOverIndex === index && dragState.draggedIndex !== index ? 'border-blue-400 border-dashed scale-105' : ''}`}
            >
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(block.id);
                  }}
                  className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {renderBlock(block, index)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};