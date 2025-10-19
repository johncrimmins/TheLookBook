// Canvas toolbar component - zoom controls and tools
'use client';

import { useCanvas } from '../hooks/useCanvas';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function CanvasToolbar() {
  const { viewport, zoom, resetViewport } = useCanvas();
  
  return (
    <Card className="flex items-center gap-2 px-4 py-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => zoom(-1)}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={resetViewport}
        title="Reset zoom"
      >
        {Math.round(viewport.scale * 100)}%
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => zoom(1)}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-2" />
      
      <div className="text-xs text-muted-foreground">
        Click and drag to pan
      </div>
    </Card>
  );
}

