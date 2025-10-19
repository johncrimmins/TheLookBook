// Canvas component - main canvas using Konva.js
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer as KonvaLayer } from 'react-konva';
import Konva from 'konva';
import { useCanvas } from '../hooks/useCanvas';
import { usePresence } from '@/features/presence';
import { UserCursor } from '@/features/presence';
import { Point } from '@/shared/types';
import { SelectionBox } from '@/features/objects/components/SelectionBox';
import { getObjectsInBox } from '@/features/objects/lib/selectionUtils';
import { useObjectsStore } from '@/features/objects/lib/objectsStore';
import { useSelectionStore } from '@/features/objects/lib/selectionStore';
import { Layer as LayerType } from '@/features/objects/types/layer';

interface CanvasProps {
  canvasId: string;
  tool?: 'select' | 'rectangle' | 'circle' | 'pan';
  children?: React.ReactNode;
  onCanvasClick?: (position?: Point) => void;
  onCursorMove?: (position: Point) => void;
}

export function Canvas({ canvasId, tool = 'select', children, onCanvasClick, onCursorMove }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState<Point | null>(null);
  const [isOverShape, setIsOverShape] = useState(false);
  
  // Marquee selection state
  const [isDrawingMarquee, setIsDrawingMarquee] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<Point | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<Point | null>(null);
  const lastMarqueeUpdateRef = useRef<number>(0);
  
  const { viewport, pan, zoom, screenToCanvas } = useCanvas();
  const { cursors, broadcastCursor } = usePresence(canvasId);
  const { objects, layers } = useObjectsStore();
  const { selectMultiple, clearSelection } = useSelectionStore();
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Handle mouse wheel for zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      
      const stage = e.currentTarget as HTMLDivElement;
      const rect = stage.getBoundingClientRect();
      
      const centerPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      zoom(e.deltaY > 0 ? -1 : 1, centerPoint);
    },
    [zoom]
  );
  
  // Handle mouse down for panning, deselection, and shape placement
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Get pointer position relative to stage
      const stage = stageRef.current;
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      // (accounting for pan/zoom transformations)
      const canvasPos = screenToCanvas(pointerPosition);
      
      // Check if clicking on a shape (use screen coords for intersection test)
      const clickedOnShape = stage.getIntersection(pointerPosition);
      
      // If clicking on empty canvas with select tool, start marquee selection
      if (e.button === 0 && !clickedOnShape && tool === 'select') {
        setIsDrawingMarquee(true);
        setMarqueeStart(canvasPos);
        setMarqueeCurrent(canvasPos);
        clearSelection(); // Clear previous selection when starting new marquee
        e.preventDefault();
        return;
      }
      
      // If clicking on empty canvas, trigger canvas click callback
      if (e.button === 0 && !clickedOnShape) {
        if (onCanvasClick) {
          // For select tool, pass no position (for deselection)
          // For shape tools, pass canvas coordinates (for placement)
          onCanvasClick(tool !== 'select' && tool !== 'pan' ? canvasPos : undefined);
        }
      }
      
      // Allow panning if:
      // 1. Pan tool is active (left click)
      // 2. Middle mouse button
      // 3. OR space key is pressed (we can add this later if needed)
      const shouldPan = (tool === 'pan' && e.button === 0 && !clickedOnShape) || e.button === 1;
      
      if (shouldPan) {
        setIsPanning(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    },
    [tool, onCanvasClick, screenToCanvas, clearSelection]
  );
  
  // Handle mouse move for panning, cursor broadcasting, and preview tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const stage = stageRef.current;
      
      // Get canvas coordinates for both cursor and shape preview
      if (stage) {
        const pointerPosition = stage.getPointerPosition();
        if (pointerPosition) {
          // Convert screen coordinates to canvas coordinates
          // (accounting for pan/zoom transformations)
          const canvasPos = screenToCanvas(pointerPosition);
          
          // Handle marquee selection update (throttled to 60 FPS = 16ms)
          if (isDrawingMarquee && marqueeStart) {
            const now = Date.now();
            if (now - lastMarqueeUpdateRef.current >= 16) {
              setMarqueeCurrent(canvasPos);
              lastMarqueeUpdateRef.current = now;
            }
            return; // Skip other interactions while drawing marquee
          }
          
          // Broadcast cursor position in canvas coordinates
          // Each user will convert to their own screen space for display
          broadcastCursor(canvasPos);
          
          // Notify parent of cursor position in canvas coordinates
          if (onCursorMove) {
            onCursorMove(canvasPos);
          }
          
          // Check if hovering over a shape (for cursor style)
          if (tool === 'select' && !isPanning) {
            const hoveredShape = stage.getIntersection(pointerPosition);
            setIsOverShape(!!hoveredShape);
          }
        }
      }
      
      // Handle panning
      if (isPanning && lastPos) {
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        pan(dx, dy);
        setLastPos({ x: e.clientX, y: e.clientY });
      }
    },
    [isPanning, lastPos, pan, broadcastCursor, tool, onCursorMove, screenToCanvas, isDrawingMarquee, marqueeStart]
  );
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // Complete marquee selection
    if (isDrawingMarquee && marqueeStart && marqueeCurrent) {
      // Calculate final marquee box
      const x = Math.min(marqueeStart.x, marqueeCurrent.x);
      const y = Math.min(marqueeStart.y, marqueeCurrent.y);
      const width = Math.abs(marqueeCurrent.x - marqueeStart.x);
      const height = Math.abs(marqueeCurrent.y - marqueeStart.y);
      
      // Only select if marquee has meaningful size (> 5px in both dimensions)
      if (width > 5 && height > 5) {
        const selectionBox = { x, y, width, height };
        // Convert layers array to record for getObjectsInBox
        const layersRecord = layers.reduce((acc, layer) => {
          acc[layer.id] = layer;
          return acc;
        }, {} as Record<string, LayerType>);
        const selectedIds = getObjectsInBox(objects, selectionBox, layersRecord);
        selectMultiple(selectedIds);
      } else {
        // If marquee is too small, treat as click (clear selection)
        clearSelection();
      }
      
      // Clear marquee state
      setIsDrawingMarquee(false);
      setMarqueeStart(null);
      setMarqueeCurrent(null);
    }
    
    setIsPanning(false);
    setLastPos(null);
  }, [isDrawingMarquee, marqueeStart, marqueeCurrent, objects, selectMultiple, clearSelection]);
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setLastPos(null);
    setIsOverShape(false);
    
    // Cancel marquee selection if user leaves canvas
    if (isDrawingMarquee) {
      setIsDrawingMarquee(false);
      setMarqueeStart(null);
      setMarqueeCurrent(null);
    }
  }, [isDrawingMarquee]);
  
  // Determine cursor style based on state
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (isDrawingMarquee) return 'crosshair';
    if (tool === 'pan') return 'grab';
    if (tool === 'select') {
      return isOverShape ? 'move' : 'default';
    }
    return 'crosshair';
  };
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: getCursorStyle() }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        x={viewport.x}
        y={viewport.y}
      >
        <KonvaLayer>
          {/* Grid background */}
          {/* TODO: Add grid rendering */}
        </KonvaLayer>
        
        <KonvaLayer>
          {/* Objects will be rendered here */}
          {children}
          
          {/* Marquee selection box */}
          {isDrawingMarquee && marqueeStart && marqueeCurrent && (
            <SelectionBox startPos={marqueeStart} currentPos={marqueeCurrent} />
          )}
        </KonvaLayer>
      </Stage>
      
      {/* Render other users' cursors */}
      {Object.values(cursors).map((cursor) => (
        <UserCursor key={cursor.userId} cursor={cursor} viewport={viewport} />
      ))}
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700">
        {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  );
}

