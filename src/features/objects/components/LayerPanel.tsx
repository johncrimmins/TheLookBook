'use client';

import { useMemo } from 'react';
import { useObjectsStore } from '../lib/objectsStore';
import { useSelectionStore } from '../lib/selectionStore';
import { useObjects } from '../hooks/useObjects';
import { LayerItem } from './LayerItem';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

/**
 * LayerPanel displays all canvas objects in z-order (front to back)
 * Supports selection, reordering, visibility toggle, and lock toggle
 */
export function LayerPanel() {
  const { objects, selectedObject } = useObjects();
  const { selectObject } = useSelectionStore();
  const { reorderLayer } = useObjectsStore();

  // Sort objects by order descending (front to back for layer panel)
  const sortedObjects = useMemo(() => {
    return [...objects].sort((a, b) => b.order - a.order);
  }, [objects]);

  const handleSelect = (id: string) => {
    selectObject(id);
  };

  const handleReorder = (draggedId: string, targetId: string) => {
    reorderLayer(draggedId, targetId);
  };

  // Empty state
  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-sm text-gray-500">No objects on canvas</p>
        <p className="text-xs text-gray-400 mt-1">Create a shape to see it here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {sortedObjects.map((object) => (
          <LayerItem
            key={object.id}
            object={object}
            isSelected={selectedObject?.id === object.id}
            onSelect={handleSelect}
            onReorder={handleReorder}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

