// Object renderer - renders all canvas objects
'use client';

import { useEffect, useMemo } from 'react';
import { CanvasObject } from '../types';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { useSelectionStore } from '../lib/selectionStore';

interface ObjectRendererProps {
  objects: CanvasObject[];
  onObjectUpdate: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectDragStart?: (objectId: string) => void;
  onObjectDragMove?: (objectId: string, position: { x: number; y: number }) => void;
  onObjectDragEnd?: (objectId: string, position: { x: number; y: number }) => void;
  onObjectTransformStart?: (objectId: string) => void;
  onObjectTransform?: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectTransformEnd?: (objectId: string) => void;
  onObjectSelect?: (objectId: string | null) => void;
  onObjectContextMenu?: (objectId: string, position: { x: number; y: number }) => void;
  currentUserId?: string;
  presenceUsers?: Record<string, { displayName: string }>;
  deselectTrigger?: number; // Increment this to trigger deselection
}

export function ObjectRenderer({ 
  objects, 
  onObjectUpdate, 
  onObjectDragStart,
  onObjectDragMove,
  onObjectDragEnd,
  onObjectTransformStart,
  onObjectTransform,
  onObjectTransformEnd,
  onObjectSelect,
  onObjectContextMenu,
  currentUserId,
  presenceUsers = {},
  deselectTrigger,
}: ObjectRendererProps) {
  // Use selection store for selection state
  const { selectedIds, selectObject, clearSelection } = useSelectionStore();
  
  // Deselect when trigger changes
  useEffect(() => {
    if (deselectTrigger !== undefined) {
      clearSelection();
      if (onObjectSelect) {
        onObjectSelect(null);
      }
    }
  }, [deselectTrigger, onObjectSelect, clearSelection]);
  
  const handleSelect = (id: string) => {
    // Don't change selection if clicking an already-selected object
    // This prevents right-click from clearing multi-selection
    if (!selectedIds.includes(id)) {
      selectObject(id);
    }
    if (onObjectSelect) {
      onObjectSelect(id);
    }
  };
  
  const handleDragStart = (objectId: string) => {
    if (onObjectDragStart) {
      onObjectDragStart(objectId);
    }
  };
  
  const handleDragMove = (objectId: string, position: { x: number; y: number }) => {
    if (onObjectDragMove) {
      onObjectDragMove(objectId, position);
    }
  };
  
  const handleDragEnd = (objectId: string, position: { x: number; y: number }) => {
    if (onObjectDragEnd) {
      onObjectDragEnd(objectId, position);
    }
  };

  const handleTransformStart = (objectId: string) => {
    if (onObjectTransformStart) {
      onObjectTransformStart(objectId);
    }
  };

  const handleTransform = (objectId: string, updates: Partial<CanvasObject>) => {
    if (onObjectTransform) {
      onObjectTransform(objectId, updates);
    }
  };
  
  const handleTransformEnd = (objectId: string, updates: Partial<CanvasObject>) => {
    onObjectUpdate(objectId, updates);
    if (onObjectTransformEnd) {
      onObjectTransformEnd(objectId);
    }
  };

  const handleContextMenu = (objectId: string, position: { x: number; y: number }) => {
    if (onObjectContextMenu) {
      onObjectContextMenu(objectId, position);
    }
  };
  
  // Filter visible objects and sort by order for correct rendering (Konva best practice)
  // Filter: only render objects where visible !== false (includes true and undefined)
  // Sort: Lower order renders first (back), higher order renders last (front)
  const visibleObjects = useMemo(() => {
    return [...objects]
      .filter(obj => obj.visible !== false)
      .sort((a, b) => a.order - b.order);
  }, [objects]);
  
  return (
    <>
      {visibleObjects.map((object) => {
        const isSelected = selectedIds.includes(object.id);
        const isBeingTransformedByOther = !!(object.transformingBy && object.transformingBy !== currentUserId);
        const transformingUserName = object.transformingBy && presenceUsers[object.transformingBy]?.displayName;
        
        if (object.type === 'rectangle') {
          return (
            <Rectangle
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={() => handleSelect(object.id)}
              onDragStart={() => handleDragStart(object.id)}
              onDragMove={(pos) => handleDragMove(object.id, pos)}
              onDragEnd={(pos) => handleDragEnd(object.id, pos)}
              onTransformStart={() => handleTransformStart(object.id)}
              onTransform={(updates) => handleTransform(object.id, updates)}
              onTransformEnd={(updates) => handleTransformEnd(object.id, updates)}
              onContextMenu={(pos: { x: number; y: number }) => handleContextMenu(object.id, pos)}
              isBeingTransformedByOther={isBeingTransformedByOther}
              transformingUserName={transformingUserName}
            />
          );
        }
        
        if (object.type === 'circle') {
          return (
            <Circle
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={() => handleSelect(object.id)}
              onDragStart={() => handleDragStart(object.id)}
              onDragMove={(pos) => handleDragMove(object.id, pos)}
              onDragEnd={(pos) => handleDragEnd(object.id, pos)}
              onTransformStart={() => handleTransformStart(object.id)}
              onTransform={(updates) => handleTransform(object.id, updates)}
              onTransformEnd={(updates) => handleTransformEnd(object.id, updates)}
              onContextMenu={(pos: { x: number; y: number }) => handleContextMenu(object.id, pos)}
              isBeingTransformedByOther={isBeingTransformedByOther}
              transformingUserName={transformingUserName}
            />
          );
        }
        
        return null;
      })}
    </>
  );
}

