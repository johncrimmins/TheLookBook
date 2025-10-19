// Right sidebar component - pinnable sidebar with Properties and Layers panels
'use client';

import { useEffect, useRef } from 'react';
import { Pin, PinOff, ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useUIPreferencesStore } from '../lib/uiPreferencesStore';
import { SidebarPanel } from './SidebarPanel';
import { LayerList } from './LayerList';
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
 * Supports both single and multi-select
 */
function PropertiesContent({ canvasId }: { canvasId: string }) {
  const propertiesPanel = useCanvasStore((state) => state.propertiesPanel);
  const { objectsMap, updateObject, bulkUpdateProperty, selectedIds } = useObjects(canvasId);

  // Check for multi-select first (takes precedence)
  const isMultiSelect = selectedIds.length > 1;

  // Multi-select mode
  if (isMultiSelect) {
    const selectedObjects = selectedIds.map(id => objectsMap[id]).filter(Boolean);
    
    if (selectedObjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
          <p className="text-sm">No objects selected</p>
        </div>
      );
    }

    // For multi-select, use first object's values as defaults
    const firstObject = selectedObjects[0];

    const handleBulkPropertyChange = (property: string, value: number | string) => {
      bulkUpdateProperty(property, value);
    };

    return (
      <div className="space-y-6">
        {/* Multi-select header */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <span className="text-sm font-semibold text-blue-600">{selectedObjects.length}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {selectedObjects.length} objects selected
            </p>
            <p className="text-xs text-gray-500">Editing shared properties</p>
          </div>
        </div>

        {/* Shared Properties - Only show properties that apply to all selected objects */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Shared Properties</h3>
          
          <ColorPicker
            label="Fill Color"
            value={firstObject.fill}
            onChange={(value) => handleBulkPropertyChange('fill', value)}
          />
          
          <PropertyInput
            label="Opacity"
            value={Math.round(firstObject.opacity * 100)}
            onChange={(value) => handleBulkPropertyChange('opacity', value / 100)}
            min={0}
            max={100}
            suffix="%"
          />
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          <p>💡 Tip: Changes apply to all {selectedObjects.length} selected objects</p>
        </div>
      </div>
    );
  }

  // Single select mode
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
  
  const isOpen = useUIPreferencesStore((state) => state.isRightSidebarOpen);
  const isPinned = useUIPreferencesStore((state) => state.isRightSidebarPinned);
  const isPropertiesExpanded = useUIPreferencesStore((state) => state.isPropertiesPanelExpanded);
  const isLayersExpanded = useUIPreferencesStore((state) => state.isLayersPanelExpanded);
  
  const toggleSidebar = useUIPreferencesStore((state) => state.toggleRightSidebar);
  const togglePin = useUIPreferencesStore((state) => state.toggleRightSidebarPin);
  const toggleProperties = useUIPreferencesStore((state) => state.togglePropertiesPanel);
  const toggleLayers = useUIPreferencesStore((state) => state.toggleLayersPanel);
  const setOpen = useUIPreferencesStore((state) => state.setRightSidebarOpen);

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
          <div className="flex-[39] overflow-hidden flex flex-col">
            <SidebarPanel
              title="Layers"
              isExpanded={isLayersExpanded}
              onToggle={toggleLayers}
            >
              <LayerList />
            </SidebarPanel>
          </div>
        </div>
      )}
    </div>
  );
}

