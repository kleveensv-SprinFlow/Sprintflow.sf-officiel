import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkoutBlock, SeriesBlock } from '../../../types/workout';
import { GripVertical, Clock, Activity, Repeat, Dumbbell, Play } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Card Components for the Canvas ---

interface BlockCardProps {
  block: WorkoutBlock;
  onTap: (block: WorkoutBlock) => void;
  isOverlay?: boolean;
}

const BlockCardContent: React.FC<{ block: WorkoutBlock }> = ({ block }) => {
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

const SortableBlockItem: React.FC<BlockCardProps> = ({ block, onTap }) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-3 touch-manipulation"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center p-3 active:scale-98 transition-transform"
        onClick={() => onTap(block)}
      >
        <div {...attributes} {...listeners} className="mr-3 text-gray-400 cursor-grab active:cursor-grabbing p-1">
          <GripVertical size={20} />
        </div>
        <div className="flex-1">
            <BlockCardContent block={block} />
        </div>
      </div>
    </div>
  );
};

// --- Main Canvas Component ---

interface WorkoutBuilderCanvasProps {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
  onEditBlock: (block: WorkoutBlock) => void;
  userRole: 'coach' | 'athlete';
}

export function WorkoutBuilderCanvas({ blocks, onChange, onEditBlock }: WorkoutBuilderCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      onChange(arrayMove(blocks, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  // Logic: Check for [A, B, A, B] pattern at the end of the list
  const detectPattern = () => {
      if (blocks.length < 4) return false;
      const last4 = blocks.slice(-4);

      // Simple type-based check for now (can be more strict on content equality later)
      const t = last4.map(b => b.type);

      // Check for A-B-A-B
      if (t[0] === t[2] && t[1] === t[3] && t[0] !== t[1]) {
          return true;
      }
      return false;
  };

  const showAutoSeriesSuggestion = detectPattern();

  const handleAutoSeries = () => {
      if (!detectPattern()) return;

      const patternLength = 2; // A-B
      const patternCount = 2; // repeated twice
      const totalItemsToRemove = patternLength * patternCount; // 4 items

      // Get the pattern blocks (A and B)
      const patternBlocks = blocks.slice(-totalItemsToRemove).slice(0, patternLength);

      // Create deep copies of blocks to put inside the series
      const newSeriesBlocks = patternBlocks.map(b => ({
          ...b,
          id: `nested_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      const newSeriesBlock: SeriesBlock = {
          id: `series_${Date.now()}`,
          type: 'series',
          seriesCount: 2,
          restBetweenSeries: "3'",
          blocks: newSeriesBlocks,
          intensity_score: 5 // Default
      };

      // Remove the last 4 blocks and add the new series block
      const newBlocks = [
          ...blocks.slice(0, blocks.length - totalItemsToRemove),
          newSeriesBlock
      ];

      onChange(newBlocks);
  };

  return (
    <div className="relative min-h-[300px] flex flex-col">

       <AnimatePresence>
       {showAutoSeriesSuggestion && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="mb-4 sticky top-0 z-10"
           >
               <button
                 onClick={handleAutoSeries}
                 className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse"
               >
                   <Repeat size={18} />
                   Transformer en Série (2x)
               </button>
           </motion.div>
       )}
       </AnimatePresence>

       <DndContext
         sensors={sensors}
         collisionDetection={closestCenter}
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
       >
         <SortableContext
           items={blocks.map(b => b.id)}
           strategy={verticalListSortingStrategy}
         >
           <div className="pb-24 space-y-2">
             {blocks.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                     <Dumbbell className="mb-2 opacity-20" size={48} />
                     <p>Glissez des blocs ici ou utilisez la bibliothèque</p>
                 </div>
             ) : (
                 blocks.map((block) => (
                   <SortableBlockItem
                     key={block.id}
                     block={block}
                     onTap={onEditBlock}
                   />
                 ))
             )}
           </div>
         </SortableContext>

         <DragOverlay>
            {activeId ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-500 shadow-2xl p-3 opacity-95 scale-105 rotate-2">
                     <BlockCardContent block={blocks.find(b => b.id === activeId)!} />
                </div>
            ) : null}
         </DragOverlay>
       </DndContext>
    </div>
  );
}
