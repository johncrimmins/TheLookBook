// Properties panel for editing canvas objects
'use client';

import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { useCanvasStore } from '@/features/canvas/lib/canvasStore';
import { useObjects } from '../hooks/useObjects';
import { PropertyInput } from './PropertyInput';
import { ColorPicker } from './ColorPicker';

interface PropertiesPanelProps {
  canvasId: string;
}

export function PropertiesPanel({ canvasId }: PropertiesPanelProps) {
  const propertiesPanel = useCanvasStore((state) => state.propertiesPanel);
  const setPropertiesPanel = useCanvasStore((state) => state.setPropertiesPanel);
  const { objectsMap, updateObject } = useObjects(canvasId);

  // Don't render if no properties panel is active
  if (!propertiesPanel || !propertiesPanel.objectId) {
    return null;
  }

  const object = objectsMap[propertiesPanel.objectId];
  
  // Object might have been deleted
  if (!object) {
    setPropertiesPanel(null);
    return null;
  }

  const handlePropertyChange = (property: string, value: number | string | { x: number; y: number }) => {
    updateObject(propertiesPanel.objectId, { [property]: value });
  };

  const handleClose = () => {
    setPropertiesPanel(null);
  };

  return (
    <>
      {/* Backdrop for click outside to close */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={handleClose}
      />
      
      {/* Properties Panel - slides in from right */}
      <div className="fixed right-0 top-0 h-full z-50 w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {object.type === 'rectangle' ? 'Rectangle' : 'Circle'} Properties
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Basic Properties Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Basic Properties</h3>
              
              <ColorPicker
                label="Fill Color"
                value={object.fill}
                onChange={(value) => handlePropertyChange('fill', value)}
              />
              
              <PropertyInput
                label="Width"
                value={object.width}
                onChange={(value) => handlePropertyChange('width', value)}
                min={5}
                suffix="px"
              />
              
              <PropertyInput
                label="Height"
                value={object.height}
                onChange={(value) => handlePropertyChange('height', value)}
                min={5}
                suffix="px"
              />
              
              <PropertyInput
                label="Rotation"
                value={object.rotation}
                onChange={(value) => handlePropertyChange('rotation', value)}
                min={0}
                max={359}
                suffix="°"
              />
            </div>

            <Separator />

            {/* Advanced Properties Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Advanced Properties</h3>
              
              <PropertyInput
                label="Position X"
                value={Math.round(object.position.x)}
                onChange={(value) => handlePropertyChange('position', { 
                  x: value, 
                  y: object.position.y 
                })}
                suffix="px"
              />
              
              <PropertyInput
                label="Position Y"
                value={Math.round(object.position.y)}
                onChange={(value) => handlePropertyChange('position', { 
                  x: object.position.x, 
                  y: value 
                })}
                suffix="px"
              />
              
              <PropertyInput
                label="Opacity"
                value={Math.round(object.opacity * 100)}
                onChange={(value) => handlePropertyChange('opacity', value / 100)}
                min={0}
                max={100}
                suffix="%"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

