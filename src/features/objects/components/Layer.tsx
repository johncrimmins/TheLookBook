// Layer component - single layer row with expandable object list
'use client';

import { useState, KeyboardEvent } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, MoreVertical } from 'lucide-react';
import { CanvasObject, Layer as LayerType, DEFAULT_LAYER_ID } from '../types';
import { LayerThumbnail } from './LayerThumbnail';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import { useObjectsStore } from '../lib/objectsStore';

interface LayerProps {
  layer: LayerType;
  objects: CanvasObject[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onOpenModal: () => void;
}

/**
 * Layer component - displays single layer with nested objects
 * Features:
 * - Expandable/collapsible
 * - Inline rename (double-click, Enter/Escape)
 * - Visibility and lock toggles
 * - Menu with Manage Objects, Rename, Delete
 * - Default Layer has special styling and cannot be renamed/deleted
 */
export function Layer({ layer, objects, isExpanded, onToggleExpanded, onOpenModal }: LayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const updateLayer = useObjectsStore((state) => state.updateLayer);
  const deleteLayer = useObjectsStore((state) => state.deleteLayer);
  const updateObject = useObjectsStore((state) => state.updateObject);

  const isDefaultLayer = layer.id === DEFAULT_LAYER_ID;
  const objectCount = objects.length;

  // Inline rename handlers
  const handleDoubleClick = () => {
    if (!isDefaultLayer) {
      setIsEditing(true);
      setEditName(layer.name);
    }
  };

  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const saveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== layer.name && trimmed.length <= 50) {
      updateLayer(layer.id, { name: trimmed });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(layer.name);
    setIsEditing(false);
  };

  // Toggle handlers
  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  };

  // Menu actions
  const handleDelete = () => {
    if (!isDefaultLayer) {
      deleteLayer(layer.id);
      setMenuOpen(false);
    }
  };

  const handleManageObjects = () => {
    onOpenModal();
    setMenuOpen(false);
  };

  // Toggle visibility for individual objects
  const handleToggleObjectVisibility = (objectId: string, currentVisible: boolean | undefined) => {
    updateObject(objectId, { visible: currentVisible === false ? true : false });
  };

  // Toggle lock for individual objects
  const handleToggleObjectLock = (objectId: string, currentLocked: boolean | undefined) => {
    updateObject(objectId, { locked: currentLocked === true ? false : true });
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Layer Row */}
      <div
        className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${
          isDefaultLayer ? 'bg-gray-50/50' : ''
        }`}
      >
        {/* Expand/Collapse Arrow */}
        <button
          onClick={onToggleExpanded}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label={isExpanded ? 'Collapse layer' : 'Expand layer'}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Layer Name */}
        <div className="flex-1 min-w-0" onDoubleClick={handleDoubleClick}>
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={saveName}
              maxLength={50}
              autoFocus
              className="h-6 px-2 py-0 text-sm"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-sm truncate ${isDefaultLayer ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                {layer.name}
              </span>
              {!isExpanded && (
                <span className="text-xs text-gray-500">({objectCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Visibility Toggle */}
        <button
          onClick={handleToggleVisibility}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={handleToggleLock}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* Menu */}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label="Layer menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-normal"
              onClick={handleManageObjects}
            >
              Manage Objects
            </Button>
            {!isDefaultLayer && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                >
                  Rename Layer
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  Delete Layer
                </Button>
              </>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Expanded Object List */}
      {isExpanded && objects.length > 0 && (
        <div className="pl-6 pr-3 py-1 bg-gray-50/30">
          {objects.map((obj) => (
            <div
              key={obj.id}
              className="flex items-center gap-2 py-1.5 hover:bg-gray-100/50 rounded px-2 transition-colors"
            >
              <LayerThumbnail object={obj} />
              <span className="flex-1 text-sm text-gray-700 truncate">{obj.name || 'Unnamed'}</span>
              
              {/* Object Visibility */}
              <button
                onClick={() => handleToggleObjectVisibility(obj.id, obj.visible)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                aria-label={obj.visible === false ? 'Show object' : 'Hide object'}
              >
                {obj.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              
              {/* Object Lock */}
              <button
                onClick={() => handleToggleObjectLock(obj.id, obj.locked)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                aria-label={obj.locked === true ? 'Unlock object' : 'Lock object'}
              >
                {obj.locked === true ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && objects.length === 0 && (
        <div className="pl-6 pr-3 py-3 text-xs text-gray-400 italic">
          No objects in this layer
        </div>
      )}
    </div>
  );
}

