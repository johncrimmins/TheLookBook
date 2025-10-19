// Rectangle component - renders a draggable rectangle shape
'use client';

import { Rect, Transformer, Text } from 'react-konva';
import Konva from 'konva';
import { CanvasObject } from '../types';
import { useShapeInteractions } from '../hooks/useShapeInteractions';

interface RectangleProps {
  object: CanvasObject;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragStart?: () => void;
  onDragMove?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onTransformStart?: () => void;
  onTransform?: (updates: Partial<CanvasObject>) => void;
  onTransformEnd?: (updates: Partial<CanvasObject>) => void;
  onContextMenu?: (position: { x: number; y: number }) => void;
  isBeingTransformedByOther?: boolean;
  transformingUserName?: string;
}

export function Rectangle({
  object,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformStart,
  onTransform,
  onTransformEnd,
  onContextMenu,
  isBeingTransformedByOther,
  transformingUserName,
}: RectangleProps) {
  const isLocked = object.locked === true;
  
  const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Rect>({
    objectId: object.id,
    isSelected,
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTransformStart,
    onTransform,
    onTransformEnd,
    onContextMenu,
    isBeingTransformedByOther,
    transformingUserName,
    isLocked,
  });

  return (
    <>
      <Rect
        ref={shapeRef}
        x={object.position.x}
        y={object.position.y}
        width={object.width}
        height={object.height}
        fill={object.fill}
        opacity={object.opacity}
        rotation={object.rotation}
        draggable={!isLocked}
        {...handlers}
      />
      
      {/* Lock indicator when locked and selected */}
      {isLocked && isSelected && (
        <Text
          x={object.position.x + object.width / 2}
          y={object.position.y + object.height / 2}
          text="🔒"
          fontSize={24}
          offsetX={12}
          offsetY={12}
          listening={false}
        />
      )}
      
      {/* Transformer only shown when selected and not locked */}
      {isSelected && !isLocked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

