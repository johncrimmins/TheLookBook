// Circle component - renders a draggable circle shape
'use client';

import { useMemo } from 'react';
import { Circle as KonvaCircle, Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasObject } from '../types';
import { useShapeInteractions } from '../hooks/useShapeInteractions';

interface CircleProps {
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

export function Circle({
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
}: CircleProps) {
  const radius = Math.min(object.width, object.height) / 2;

  // Position transform to handle radius offset
  // Circle is rendered at center point, but our position is top-left corner
  const positionTransform = useMemo(() => ({
    toCanvas: (x: number, y: number) => ({
      x: x - radius,
      y: y - radius,
    }),
    fromCanvas: (x: number, y: number) => ({
      x: x + radius,
      y: y + radius,
    }),
  }), [radius]);

  const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Circle>({
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
    positionTransform,
    isBeingTransformedByOther,
    transformingUserName,
  });

  return (
    <>
      <KonvaCircle
        ref={shapeRef}
        x={object.position.x + radius}
        y={object.position.y + radius}
        radius={radius}
        fill={object.fill}
        opacity={object.opacity}
        draggable
        {...handlers}
      />
      
      {isSelected && (
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

