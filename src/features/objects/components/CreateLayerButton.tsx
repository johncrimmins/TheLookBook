// Create Layer Button - adds new layer to canvas
'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useObjectsStore } from '../lib/objectsStore';

/**
 * Button to create a new layer
 * Displayed at the bottom of the layers panel
 */
export function CreateLayerButton() {
  const createLayer = useObjectsStore((state) => state.createLayer);

  const handleClick = () => {
    createLayer(); // Auto-generates name like "Layer 2", "Layer 3"
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className="w-full justify-start gap-2 h-9 px-3 text-sm font-normal text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    >
      <Plus className="w-4 h-4" />
      New Layer
    </Button>
  );
}

