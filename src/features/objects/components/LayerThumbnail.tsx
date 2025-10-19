'use client';

import { useRef, useEffect } from 'react';
import { CanvasObject } from '../types';

interface LayerThumbnailProps {
  object: CanvasObject;
}

/**
 * LayerThumbnail renders a 32x32 canvas preview of a shape
 * Used in the layers panel to show a visual representation
 */
export function LayerThumbnail({ object }: LayerThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 32, 32);

    // Calculate scale to fit shape in 32x32 with 4px padding
    const padding = 4;
    const availableSize = 32 - padding * 2;
    const scaleX = availableSize / object.width;
    const scaleY = availableSize / object.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate scaled dimensions
    const scaledWidth = object.width * scale;
    const scaledHeight = object.height * scale;

    // Center the shape
    const x = (32 - scaledWidth) / 2;
    const y = (32 - scaledHeight) / 2;

    // Draw shape based on type
    ctx.fillStyle = object.fill;

    if (object.type === 'rectangle') {
      ctx.fillRect(x, y, scaledWidth, scaledHeight);
    } else if (object.type === 'circle') {
      const centerX = x + scaledWidth / 2;
      const centerY = y + scaledHeight / 2;
      const radiusX = scaledWidth / 2;
      const radiusY = scaledHeight / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add subtle border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 31, 31);
  }, [object]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={32}
      className="border border-gray-200 rounded"
      style={{ width: '32px', height: '32px' }}
    />
  );
}

