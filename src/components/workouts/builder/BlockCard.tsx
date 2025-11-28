import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Settings2, Timer, Dumbbell, Activity, BedDouble } from 'lucide-react';
import { WorkoutBlock } from '../../../types/workout';
import { clsx } from 'clsx';

interface BlockCardProps {
  block: WorkoutBlock;
  onRemove: (id: string) => void;
  onClick: (block: WorkoutBlock) => void;
  index: number;
}

const getBlockIcon = (type: string) => {
    switch(type) {
        case 'course': return <Activity size={18} />;
        case 'musculation': return <Dumbbell size={18} />;
        case 'repos': return <BedDouble size={18} />;
        case 'technique': return <Settings2 size={18} />;
        default: return <Activity size={18} />;
    }
}

const getBlockColor = (type: string) => {
    switch(type) {
        case 'course': return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
        case 'musculation': return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
        case 'repos': return 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10';
        case 'technique': return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10';
        default: return 'border-l-gray-500';
    }
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onRemove, onClick, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderDetails = () => {
      switch(block.type) {
          case 'course':
              return (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <span>{block.series}x</span>
                      {block.reps > 1 && <span>({block.reps}x)</span>}
                      <span>{block.distance}m</span>
                      {block.restBetweenReps && <span className="text-xs text-gray-500 font-normal ml-1">R:{block.restBetweenReps}</span>}
                  </div>
              );
          case 'musculation':
              return (
                  <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{block.exerciceNom || "Exercice"}</span>
                      <span className="text-xs text-gray-500">{block.series} séries x {block.reps} reps</span>
                  </div>
              );
          case 'repos':
               return (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <Timer size={14} />
                      <span>{Math.floor((block as any).duration / 60)}'{ (block as any).duration % 60 || '' }</span>
                  </div>
              );
          case 'technique':
              return (
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {(block as any).name}
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
          "relative flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 mb-2 overflow-hidden border-l-4 touch-manipulation",
          getBlockColor(block.type),
          isDragging && "shadow-xl scale-105"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mr-3 text-gray-400 cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded"
      >
        <GripVertical size={20} />
      </div>

      {/* Content Area - Clickable to Edit */}
      <div
        onClick={() => onClick(block)}
        className="flex-1 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
             <div className="p-2 rounded-full bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-300 shadow-sm">
                 {getBlockIcon(block.type)}
             </div>
             <div>
                 {renderDetails()}
             </div>
        </div>
      </div>

      {/* Delete Action */}
      <button
        onClick={(e) => {
            e.stopPropagation();
            onRemove(block.id);
        }}
        className="ml-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
      >
        <X size={18} />
      </button>

      {/* Index Badge */}
      <div className="absolute top-1 right-1 text-[9px] text-gray-300 font-mono">
          #{index + 1}
      </div>
    </div>
  );
};
