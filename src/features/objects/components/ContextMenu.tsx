// Context menu for canvas objects - traditional right-click action menu
'use client';

import { useEffect, useCallback } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { useCanvasStore } from '@/features/canvas/lib/canvasStore';
import { useObjects } from '../hooks/useObjects';

interface ContextMenuProps {
  canvasId: string;
  onDuplicate?: (objectId: string) => void;
  onCopy?: (objectId: string) => void;
}

export function ContextMenu({ canvasId, onDuplicate, onCopy }: ContextMenuProps) {
  const contextMenu = useCanvasStore((state) => state.contextMenu);
  const setContextMenu = useCanvasStore((state) => state.setContextMenu);
  const setPropertiesPanel = useCanvasStore((state) => state.setPropertiesPanel);
  const { objectsMap, deleteObject, bringToFront, sendToBack } = useObjects(canvasId);

  // Close menu on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    },
    [setContextMenu]
  );

  // Add ESC key listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Don't render if no context menu is active
  if (!contextMenu || !contextMenu.objectId) {
    return null;
  }

  const object = objectsMap[contextMenu.objectId];
  
  // Object might have been deleted
  if (!object) {
    setContextMenu(null);
    return null;
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    // Close menu if clicking on backdrop
    if (e.target === e.currentTarget) {
      setContextMenu(null);
    }
  };

  const handleFormatShape = () => {
    setPropertiesPanel({ objectId: contextMenu.objectId });
    setContextMenu(null);
  };

  const handleDelete = async () => {
    await deleteObject(contextMenu.objectId);
    setContextMenu(null);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(contextMenu.objectId);
    }
    setContextMenu(null);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(contextMenu.objectId);
    }
    setContextMenu(null);
  };

  const handleBringToFront = () => {
    bringToFront(contextMenu.objectId);
    setContextMenu(null);
  };

  const handleSendToBack = () => {
    sendToBack(contextMenu.objectId);
    setContextMenu(null);
  };

  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleClickOutside}
      />
      
      {/* Context menu - traditional action menu */}
      <Card
        className="fixed z-50 w-48 p-1 shadow-lg"
        style={{
          left: contextMenu.position.x,
          top: contextMenu.position.y,
        }}
      >
        <div className="space-y-0.5">
          {/* Format Shape - opens properties panel */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm font-normal"
            onClick={handleFormatShape}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Format Shape
          </Button>

          <Separator />

          {/* Copy */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm font-normal"
            onClick={handleCopy}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
            <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
          </Button>

          {/* Duplicate */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm font-normal"
            onClick={handleDuplicate}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Duplicate
            <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
          </Button>

          <Separator />

          {/* Delete */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </Button>

          <Separator />

          {/* Bring to Front */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm font-normal"
            onClick={handleBringToFront}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 11 12 6 7 11" />
              <polyline points="17 18 12 13 7 18" />
            </svg>
            Bring to Front
            <span className="ml-auto text-xs text-gray-400">Ctrl+Shift+]</span>
          </Button>

          {/* Send to Back */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm font-normal"
            onClick={handleSendToBack}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
            Send to Back
            <span className="ml-auto text-xs text-gray-400">Ctrl+Shift+[</span>
          </Button>
        </div>
      </Card>
    </>
  );
}

