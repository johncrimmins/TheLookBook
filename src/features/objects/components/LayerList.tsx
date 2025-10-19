// Layer List - hierarchical display of all layers with nested objects
'use client';

import { useState } from 'react';
import { useObjectsStore } from '../lib/objectsStore';
import { Layer } from './Layer';
import { LayerModal } from './LayerModal';
import { CreateLayerButton } from './CreateLayerButton';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

/**
 * LayerList - displays hierarchical list of layers with nested objects
 * Features:
 * - Expandable/collapsible layers
 * - Default Layer always at top
 * - Scrollable area for overflow
 * - Create new layer button at bottom
 */
export function LayerList() {
  const layersWithObjects = useObjectsStore((state) => state.getLayersWithObjects());
  const toggleLayerExpanded = useObjectsStore((state) => state.toggleLayerExpanded);
  const allObjects = useObjectsStore((state) => Object.values(state.objects));
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; layerId: string | null }>({
    isOpen: false,
    layerId: null,
  });

  const handleOpenModal = (layerId: string) => {
    setModalState({ isOpen: true, layerId });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, layerId: null });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {layersWithObjects.map(({ layer, objects, isExpanded }) => (
            <Layer
              key={layer.id}
              layer={layer}
              objects={objects}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleLayerExpanded(layer.id)}
              onOpenModal={() => handleOpenModal(layer.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Create Layer Button */}
      <div className="border-t border-gray-200 p-2">
        <CreateLayerButton />
      </div>

      {/* Layer Modal for managing objects */}
      {modalState.isOpen && modalState.layerId && (
        <LayerModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          layerId={modalState.layerId}
          allObjects={allObjects}
        />
      )}
    </div>
  );
}

