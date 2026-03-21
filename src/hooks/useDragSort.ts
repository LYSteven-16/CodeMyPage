import { useState, useRef, useCallback, useEffect } from 'react';

export interface DragSortItem {
  id: string;
  [key: string]: any;
}

export interface UseDragSortOptions<T extends DragSortItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  itemHeight: number;
  gap?: number;
  containerRef?: React.RefObject<HTMLElement>;
}

export interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  draggedIndex: number;
  draggedY: number;
  targetIndex: number;
  offsets: number[];
}

export function useDragSort<T extends DragSortItem>({
  items,
  onReorder,
  itemHeight,
  gap = 0,
}: UseDragSortOptions<T>) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    draggedIndex: -1,
    draggedY: 0,
    targetIndex: -1,
    offsets: [],
  });

  const dragStartY = useRef(0);
  const dragStartIndex = useRef(-1);
  const animationFrame = useRef<number | undefined>(undefined);

  const totalItemHeight = itemHeight + gap;

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, id: string, index: number) => {
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartY.current = clientY;
    dragStartIndex.current = index;

    const offsets = items.map((_, i) => i * totalItemHeight);

    setDragState({
      isDragging: true,
      draggedId: id,
      draggedIndex: index,
      draggedY: index * totalItemHeight,
      targetIndex: index,
      offsets,
    });
  }, [items, totalItemHeight]);

  const moveDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || dragState.draggedIndex < 0) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY.current;
    const newDraggedY = Math.max(0, Math.min(
      (items.length - 1) * totalItemHeight,
      dragStartIndex.current * totalItemHeight + deltaY
    ));

    const newTargetIndex = Math.round(newDraggedY / totalItemHeight);
    const clampedTargetIndex = Math.max(0, Math.min(items.length - 1, newTargetIndex));

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      setDragState(prev => {
        if (!prev.isDragging) return prev;

        const newOffsets = items.map((_, i) => {
          if (i === prev.draggedIndex) {
            return i * totalItemHeight;
          }

          if (prev.draggedIndex < clampedTargetIndex) {
            if (i > prev.draggedIndex && i <= clampedTargetIndex) {
              return (i - 1) * totalItemHeight;
            }
          } else if (prev.draggedIndex > clampedTargetIndex) {
            if (i >= clampedTargetIndex && i < prev.draggedIndex) {
              return (i + 1) * totalItemHeight;
            }
          }

          return i * totalItemHeight;
        });

        return {
          ...prev,
          draggedY: newDraggedY,
          targetIndex: clampedTargetIndex,
          offsets: newOffsets,
        };
      });
    });
  }, [dragState.isDragging, dragState.draggedIndex, items.length, totalItemHeight]);

  const endDrag = useCallback(() => {
    if (!dragState.isDragging || dragState.draggedIndex < 0) return;

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    const { draggedIndex, targetIndex } = dragState;

    if (draggedIndex !== targetIndex && targetIndex >= 0) {
      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      onReorder(newItems);
    }

    setDragState({
      isDragging: false,
      draggedId: null,
      draggedIndex: -1,
      draggedY: 0,
      targetIndex: -1,
      offsets: [],
    });
  }, [dragState, items, onReorder]);

  useEffect(() => {
    if (dragState.isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => moveDrag(e);
      const handleEnd = () => endDrag();

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [dragState.isDragging, moveDrag, endDrag]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    if (!dragState.isDragging) {
      return {
        transform: `translateY(${index * totalItemHeight}px)`,
        transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        zIndex: 0,
      };
    }

    if (index === dragState.draggedIndex) {
      return {
        transform: `translateY(${dragState.draggedY}px) scale(1.02)`,
        transition: 'none',
        zIndex: 1000,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
      };
    }

    return {
      transform: `translateY(${dragState.offsets[index] ?? index * totalItemHeight}px)`,
      transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
      zIndex: 0,
    };
  }, [dragState, totalItemHeight]);

  return {
    dragState,
    startDrag,
    getItemStyle,
    totalHeight: items.length * totalItemHeight - gap,
  };
}
