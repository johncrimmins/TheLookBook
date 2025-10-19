// Right sidebar component - pinnable sidebar with Properties and Layers panels
'use client';

import { useEffect, useRef } from 'react';
import { Pin, PinOff, ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useObjectsStore } from '../lib/objectsStore';
import { SidebarPanel } from './SidebarPanel';
import { LayersPlaceholder } from './LayersPlaceholder';
import { useCanvasStore } from '@/features/canvas/lib/canvasStore';
import { useObjects } from '../hooks/useObjects';
import { PropertyInput } from './PropertyInput';
import { ColorPicker } from './ColorPicker';
import { Separator } from '@/shared/components/ui/separator';

interface RightSidebarProps {
  canvasId: string;
}

/**
 * Properties content component - shows properties or placeholder
 */
function PropertiesContent({ canvasId }: { canvasId: string }) {
  const propertiesPanel = useCanvasStore((state) => state.propertiesPanel);
  const { objectsMap, updateObject } = useObjects(canvasId);

  // Show placeholder if no object selected
  if (!propertiesPanel || !propertiesPanel.objectId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <p className="text-sm">No object selected</p>
        <p className="text-xs text-gray-400 mt-1">Select an object to edit properties</p>
      </div>
    );
  }

  const object = objectsMap[propertiesPanel.objectId];
  
  if (!object) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <p className="text-sm">Object not found</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: number | string | { x: number; y: number }) => {
    updateObject(propertiesPanel.objectId, { [property]: value });
  };

  return (
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
  );
}

/**
 * Right sidebar component with Properties and Layers panels
 * Supports pinning and collapsing
 */
export function RightSidebar({ canvasId }: RightSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const isOpen = useObjectsStore((state) => state.isRightSidebarOpen);
  const isPinned = useObjectsStore((state) => state.isRightSidebarPinned);
  const isPropertiesExpanded = useObjectsStore((state) => state.isPropertiesPanelExpanded);
  const isLayersExpanded = useObjectsStore((state) => state.isLayersPanelExpanded);
  
  const toggleSidebar = useObjectsStore((state) => state.toggleRightSidebar);
  const togglePin = useObjectsStore((state) => state.toggleRightSidebarPin);
  const toggleProperties = useObjectsStore((state) => state.togglePropertiesPanel);
  const toggleLayers = useObjectsStore((state) => state.toggleLayersPanel);
  const setOpen = useObjectsStore((state) => state.setRightSidebarOpen);

  // Handle outside click when unpinned
  useEffect(() => {
    if (!isPinned && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPinned, isOpen, setOpen]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed right-0 top-16 h-[calc(100vh-64px)] bg-white border-l border-gray-200 z-40 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[320px]' : 'w-[40px]'
      }`}
    >
      {/* Header with controls */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-2">
        {isOpen ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePin}
              className="h-8 w-8"
              aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isPinned ? (
                <Pin className="w-4 h-4" />
              ) : (
                <PinOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 mx-auto"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        )}
      </div>

      {/* Content - only visible when open */}
      {isOpen && (
        <div className="flex flex-col h-[calc(100%-48px)]">
          {/* Properties Panel - 61% */}
          <div className="flex-[61] overflow-hidden">
            <SidebarPanel
              title="Properties"
              isExpanded={isPropertiesExpanded}
              onToggle={toggleProperties}
            >
              <PropertiesContent canvasId={canvasId} />
            </SidebarPanel>
          </div>

          {/* Layers Panel - 39% */}
          <div className="flex-[39] overflow-hidden">
            <SidebarPanel
              title="Layers"
              isExpanded={isLayersExpanded}
              onToggle={toggleLayers}
            >
              <LayersPlaceholder />
            </SidebarPanel>
          </div>
        </div>
      )}
    </div>
  );
}

