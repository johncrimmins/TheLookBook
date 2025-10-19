// SelectionBox component for marquee selection
import { Rect } from 'react-konva';
import { Point } from '@/shared/types';

interface SelectionBoxProps {
  startPos: Point;
  currentPos: Point;
}

/**
 * Visual marquee selection box
 * Displays a semi-transparent blue rectangle during drag selection
 */
export function SelectionBox({ startPos, currentPos }: SelectionBoxProps) {
  // Calculate box dimensions handling drag in any direction
  const x = Math.min(startPos.x, currentPos.x);
  const y = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="#3B82F6" // Blue-500
      opacity={0.2} // Semi-transparent
      stroke="#3B82F6" // Blue-500
      strokeWidth={2}
      listening={false} // Don't block other interactions
    />
  );
}

