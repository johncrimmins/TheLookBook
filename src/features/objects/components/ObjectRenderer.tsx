// Object renderer - renders all canvas objects
'use client';

import { useEffect, useMemo } from 'react';
import { CanvasObject } from '../types';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { useSelectionStore } from '../lib/selectionStore';
import { useObjectsStore } from '../lib/objectsStore';
import { isObjectSelectable, isObjectEditable } from '../lib/selectionUtils';

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
  
  // Read layers from store for visibility/lock filtering
  const layers = useObjectsStore((state) => state.layers);
  const getLayerById = useObjectsStore((state) => state.getLayerById);
  
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
  // Filter: only render objects that are selectable (considering layer visibility)
  // Sort: Lower order renders first (back), higher order renders last (front)
  const visibleObjects = useMemo(() => {
    return [...objects]
      .filter(obj => {
        const layer = obj.layerId ? getLayerById(obj.layerId) : undefined;
        return isObjectSelectable(obj, layer);
      })
      .sort((a, b) => a.order - b.order);
  }, [objects, layers, getLayerById]);
  
  return (
    <>
      {visibleObjects.map((object) => {
        const isSelected = selectedIds.includes(object.id);
        const isBeingTransformedByOther = !!(object.transformingBy && object.transformingBy !== currentUserId);
        const transformingUserName = object.transformingBy && presenceUsers[object.transformingBy]?.displayName;
        
        // Check if object is editable (considering layer lock state)
        const layer = object.layerId ? getLayerById(object.layerId) : undefined;
        const isEditable = isObjectEditable(object, layer);
        
        if (object.type === 'rectangle') {
          return (
            <Rectangle
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={() => handleSelect(object.id)}
              onDragStart={() => isEditable && handleDragStart(object.id)}
              onDragMove={(pos) => isEditable && handleDragMove(object.id, pos)}
              onDragEnd={(pos) => isEditable && handleDragEnd(object.id, pos)}
              onTransformStart={() => isEditable && handleTransformStart(object.id)}
              onTransform={(updates) => isEditable && handleTransform(object.id, updates)}
              onTransformEnd={(updates) => isEditable && handleTransformEnd(object.id, updates)}
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
              onDragStart={() => isEditable && handleDragStart(object.id)}
              onDragMove={(pos) => isEditable && handleDragMove(object.id, pos)}
              onDragEnd={(pos) => isEditable && handleDragEnd(object.id, pos)}
              onTransformStart={() => isEditable && handleTransformStart(object.id)}
              onTransform={(updates) => isEditable && handleTransform(object.id, updates)}
              onTransformEnd={(updates) => isEditable && handleTransformEnd(object.id, updates)}
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

