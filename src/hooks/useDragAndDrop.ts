import { useState, useRef, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  draggedOverIndex: number | null;
}

export const useDragAndDrop = <T,>(items: T[], onReorder: (newItems: T[]) => void) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    draggedOverIndex: null
  });

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragState({
      isDragging: true,
      draggedIndex: index,
      draggedOverIndex: null
    });
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDragState(prev => ({
      ...prev,
      draggedOverIndex: index
    }));
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newItems = [...items];
      const draggedItemContent = newItems[dragItem.current];
      newItems.splice(dragItem.current, 1);
      newItems.splice(dragOverItem.current, 0, draggedItemContent);

      onReorder(newItems);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    setDragState({
      isDragging: false,
      draggedIndex: null,
      draggedOverIndex: null
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return {
    dragState,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleDragOver
  };
};
