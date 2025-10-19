'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { CanvasObject } from '../types';
import { LayerThumbnail } from './LayerThumbnail';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useObjectsStore } from '../lib/objectsStore';
import { generateLayerName } from '../lib/objectsStore';

interface LayerItemProps {
  object: CanvasObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

/**
 * LayerItem represents a single layer in the layers panel
 * Supports drag-to-reorder, inline rename, visibility toggle, and lock toggle
 */
export function LayerItem({ object, isSelected, onSelect, onReorder }: LayerItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(object.name || generateLayerName(object.type, object.id));
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { updateObject, toggleLayerVisibility, toggleLayerLock } = useObjectsStore();

  // Auto-focus input when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleDoubleClick = () => {
    setIsRenaming(true);
    setEditedName(object.name || generateLayerName(object.type, object.id));
  };

  const handleSaveRename = () => {
    const trimmedName = editedName.trim().slice(0, 50); // Enforce 50 char max
    if (trimmedName) {
      updateObject(object.id, { name: trimmedName });
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setEditedName(object.name || generateLayerName(object.type, object.id));
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayerVisibility(object.id);
  };

  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayerLock(object.id);
  };

  const handleClick = () => {
    if (!isRenaming) {
      onSelect(object.id);
    }
  };

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', object.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== object.id) {
      onReorder(draggedId, object.id);
    }
    setIsDropTarget(false);
  };

  const displayName = object.name || generateLayerName(object.type, object.id);
  const isVisible = object.visible !== false;
  const isLocked = object.locked === true;

  return (
    <div
      draggable={!isRenaming}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-2 py-1.5 cursor-pointer
        border-b border-gray-100 transition-colors
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isDropTarget ? 'border-t-2 border-t-blue-500' : ''}
      `}
    >
      {/* Thumbnail */}
      <LayerThumbnail object={object} />

      {/* Name (editable on double-click) */}
      <div className="flex-1 min-w-0" onDoubleClick={handleDoubleClick}>
        {isRenaming ? (
          <Input
            ref={inputRef}
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            maxLength={50}
            className="h-6 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate block" title={displayName}>
            {displayName}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {/* Visibility Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleVisibilityToggle}
              >
                {isVisible ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Visibility</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Lock Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleLockToggle}
              >
                {isLocked ? (
                  <Lock className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Lock</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

