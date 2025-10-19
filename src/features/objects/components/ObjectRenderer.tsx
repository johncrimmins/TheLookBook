// Object renderer - renders all canvas objects
'use client';

import { useState, useEffect, useMemo } from 'react';
import { CanvasObject } from '../types';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Deselect when trigger changes
  useEffect(() => {
    if (deselectTrigger !== undefined) {
      setSelectedId(null);
      if (onObjectSelect) {
        onObjectSelect(null);
      }
    }
  }, [deselectTrigger, onObjectSelect]);
  
  const handleSelect = (id: string) => {
    setSelectedId(id);
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
  
  // Sort objects by order for correct rendering (Konva best practice)
  // Lower order renders first (back), higher order renders last (front)
  const sortedObjects = useMemo(() => {
    return [...objects].sort((a, b) => a.order - b.order);
  }, [objects]);
  
  return (
    <>
      {sortedObjects.map((object) => {
        const isSelected = object.id === selectedId;
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

