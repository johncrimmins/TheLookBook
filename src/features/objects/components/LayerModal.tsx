// Layer Modal - bulk object assignment to layers
'use client';

import { useState, useMemo } from 'react';
import { CanvasObject } from '../types';
import { useObjectsStore } from '../lib/objectsStore';
import { LayerThumbnail } from './LayerThumbnail';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Search, X } from 'lucide-react';

interface LayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layerId: string;
  allObjects: CanvasObject[];
}

/**
 * LayerModal - modal for managing object assignments to a layer
 * Features:
 * - Checkbox list of all objects
 * - Pre-check objects already in layer
 * - Search/filter (when > 20 objects)
 * - Save updates all object assignments
 */
export function LayerModal({ isOpen, onClose, layerId, allObjects }: LayerModalProps) {
  const layer = useObjectsStore((state) => state.getLayerById(layerId));
  const assignObjectsToLayer = useObjectsStore((state) => state.assignObjectsToLayer);
  
  // Initialize selected objects (those currently in this layer)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(allObjects.filter(obj => obj.layerId === layerId).map(obj => obj.id))
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter objects by search query
  const filteredObjects = useMemo(() => {
    if (!searchQuery.trim()) return allObjects;
    const query = searchQuery.toLowerCase();
    return allObjects.filter(obj => 
      obj.name?.toLowerCase().includes(query) || 
      obj.type.toLowerCase().includes(query)
    );
  }, [allObjects, searchQuery]);

  const handleToggle = (objectId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId);
    } else {
      newSelected.add(objectId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredObjects.map(obj => obj.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = () => {
    // Update all objects: assign selected to this layer, unassign unselected from this layer
    const objectsToAssign = Array.from(selectedIds);
    assignObjectsToLayer(objectsToAssign, layerId);
    
    // For objects that were in this layer but are now unselected, move to Default
    const unselectedIds = allObjects
      .filter(obj => obj.layerId === layerId && !selectedIds.has(obj.id))
      .map(obj => obj.id);
    
    if (unselectedIds.length > 0) {
      assignObjectsToLayer(unselectedIds, 'default');
    }
    
    onClose();
  };

  if (!isOpen || !layer) return null;

  const showSearch = allObjects.length > 20;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage Objects in {layer.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search (if more than 20 objects) */}
        {showSearch && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search objects..."
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            {selectedIds.size} of {allObjects.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>

        {/* Object List */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-3 space-y-1">
            {filteredObjects.length > 0 ? (
              filteredObjects.map((obj) => (
                <label
                  key={obj.id}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(obj.id)}
                    onChange={() => handleToggle(obj.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <LayerThumbnail object={obj} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {obj.name || 'Unnamed'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{obj.type}</div>
                  </div>
                </label>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                {searchQuery ? 'No objects match your search' : 'No objects available'}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

