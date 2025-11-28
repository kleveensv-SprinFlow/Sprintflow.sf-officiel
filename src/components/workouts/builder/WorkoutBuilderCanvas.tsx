import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { WorkoutBlock, CourseBlock, MuscuBlock, RestBlock, TechniqueBlock } from '../../../types/workout';
import { BlockCard } from './BlockCard';
import { SmartLibrary } from './SmartLibrary';
import { BlockCockpit } from './BlockCockpit';

interface WorkoutBuilderCanvasProps {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
  readOnly?: boolean;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const WorkoutBuilderCanvas: React.FC<WorkoutBuilderCanvasProps> = ({ blocks, onChange, readOnly = false }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [isLibraryOpen, setLibraryOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // Prevent drag on simple tap
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  const handleAddBlock = (type: 'course' | 'musculation' | 'repos' | 'technique') => {
      let newBlock: WorkoutBlock;
      const id = uuidv4();

      switch(type) {
          case 'course':
              newBlock = {
                  type: 'course',
                  id,
                  series: 1,
                  reps: 1,
                  distance: 100,
                  restBetweenReps: "0'",
                  restBetweenSeries: "3'",
                  duration_estimated: 120,
                  intensity_score: 5
              } as CourseBlock;
              break;
          case 'musculation':
              newBlock = {
                  type: 'musculation',
                  id,
                  exerciceId: '',
                  exerciceNom: 'Nouvel exercice',
                  series: 3,
                  reps: 10,
                  poids: null,
                  restTime: "2'",
                  intensity_score: 7
              } as MuscuBlock;
              break;
          case 'repos':
              newBlock = {
                  type: 'repos',
                  id,
                  duration: 180, // 3 min default
                  label: 'Repos',
                  intensity_score: 1
              } as RestBlock;
              break;
          case 'technique':
              newBlock = {
                  type: 'technique',
                  id,
                  name: 'Gammes',
                  duration: 300, // 5 min
                  intensity_score: 3
              } as TechniqueBlock;
              break;
      }
      onChange([...blocks, newBlock]);
      // Auto-open cockpit for the new block
      setEditingBlockId(id);
  };

  const handleRemoveBlock = (id: string) => {
      onChange(blocks.filter(b => b.id !== id));
  };

  const handleUpdateBlock = (updatedBlock: WorkoutBlock) => {
      onChange(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  };

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;
  const editingBlock = editingBlockId ? blocks.find(b => b.id === editingBlockId) : null;

  return (
    <div className="relative min-h-[400px] pb-32">
        {/* Timeline Line (Visual guide) */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />

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
                <div className="space-y-4 p-2">
                    {blocks.map((block, index) => (
                        <BlockCard
                            key={block.id}
                            block={block}
                            index={index}
                            onRemove={handleRemoveBlock}
                            onClick={(b) => setEditingBlockId(b.id)}
                        />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeBlock ? (
                     <div className="opacity-90 scale-105">
                         <BlockCard
                            block={activeBlock}
                            index={blocks.findIndex(b => b.id === activeId)}
                            onRemove={() => {}}
                            onClick={() => {}}
                        />
                     </div>
                ) : null}
            </DragOverlay>
        </DndContext>

        {/* Floating Add Button (if not read only) */}
        {!readOnly && (
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                <button
                    onClick={() => setLibraryOpen(true)}
                    className="pointer-events-auto bg-sprint-primary text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 font-bold active:scale-95 transition-transform"
                >
                    <Plus size={20} />
                    <span>Ajouter un bloc</span>
                </button>
            </div>
        )}

        {/* Smart Library Sheet */}
        <SmartLibrary
            isOpen={isLibraryOpen}
            onClose={() => setLibraryOpen(false)}
            onAddBlock={handleAddBlock}
        />

        {/* Cockpit Drawer */}
        <BlockCockpit
            block={editingBlock || null}
            isOpen={!!editingBlock}
            onClose={() => setEditingBlockId(null)}
            onUpdate={handleUpdateBlock}
        />
    </div>
  );
};
