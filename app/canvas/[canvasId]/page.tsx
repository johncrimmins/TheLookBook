// Dynamic canvas page - loads specific Lookbook
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { ProtectedRoute, useAuthStore } from '@/features/auth';
import { useCanvasStore, useLeftToolbar } from '@/features/canvas';
import { usePresenceStore } from '@/features/presence';
import { useObjects, useSelectionStore, broadcastShapePreview, subscribeToShapePreviews } from '@/features/objects';
import { subscribeToLookbook, useLookbooksStore } from '@/features/lookbooks';
import type { ShapePreview as ShapePreviewType } from '@/features/objects/types';
import { useHistory } from '@/features/history';
import { Point } from '@/shared/types';
import { throttle } from '@/shared/lib/utils';
import { copyToClipboard, pasteFromClipboard } from '@/shared/lib/clipboard';

// Dynamically import Canvas and Konva-dependent components to avoid SSR issues
const Canvas = dynamicImport(() => import('@/features/canvas').then(mod => ({ default: mod.Canvas })), { ssr: false });
const LeftToolbar = dynamicImport(() => import('@/features/canvas').then(mod => ({ default: mod.LeftToolbar })), { ssr: false });
const ObjectRenderer = dynamicImport(() => import('@/features/objects').then(mod => ({ default: mod.ObjectRenderer })), { ssr: false });
const ShapePreviewComponent = dynamicImport(() => import('@/features/objects/components/ShapePreview').then(mod => ({ default: mod.ShapePreview })), { ssr: false });
const ContextMenu = dynamicImport(() => import('@/features/objects').then(mod => ({ default: mod.ContextMenu })), { ssr: false });
const RightSidebar = dynamicImport(() => import('@/features/objects').then(mod => ({ default: mod.RightSidebar })), { ssr: false });
const CanvasToolbar = dynamicImport(() => import('@/features/canvas').then(mod => ({ default: mod.CanvasToolbar })), { ssr: false });

// Tell Next.js not to prerender this page
export const dynamic = 'force-dynamic';

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const canvasId = params?.canvasId as string;
  
  const user = useAuthStore((state) => state.user);
  const presence = usePresenceStore((state) => state.presence);
  const setContextMenu = useCanvasStore((state) => state.setContextMenu);
  const { setCurrentLookbook } = useLookbooksStore();
  
  // Use left toolbar hook for tool selection with keyboard shortcuts
  const { activeTool, setActiveTool } = useLeftToolbar();
  const tool = activeTool; // Keep all tools including 'pan'
  const [deselectTrigger, setDeselectTrigger] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [shapePreviews, setShapePreviews] = useState<Record<string, ShapePreviewType>>({});
  const [pastePreview, setPastePreview] = useState<ShapePreviewType | null>(null);
  const [isPasteMode, setIsPasteMode] = useState(false);
  
  // Get selection state from store
  const { selectedIds } = useSelectionStore();
  
  const { 
    objects, 
    createObject, 
    updateObject, 
    deleteObject,
    addObject,
    broadcastObjectMove,
    broadcastObjectTransformStart,
    broadcastObjectTransform,
    broadcastObjectTransformEnd,
    startObjectDrag,
    finishObjectDrag,
    bringToFront,
    sendToBack,
    bulkDelete,
    bulkDuplicate,
    bulkCopy,
  } = useObjects(canvasId);
  
  // Setup undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  useHistory({
    addObject,
    updateObject,
    deleteObject,
  });
  
  // Load Lookbook metadata and handle deletion
  useEffect(() => {
    if (!canvasId) return;
    
    // Subscribe to metadata changes
    const unsubscribe = subscribeToLookbook(canvasId, (lookbook) => {
      if (!lookbook) {
        // Canvas was deleted - redirect to mylookbooks
        // This handles when owner deletes while others are viewing (Feature 9)
        router.push('/mylookbooks');
      } else {
        setCurrentLookbook(lookbook);
      }
    });
    
    return () => {
      unsubscribe();
      setCurrentLookbook(null);
    };
  }, [canvasId, setCurrentLookbook, router]);
  
  // Subscribe to shape previews from other users
  useEffect(() => {
    if (!canvasId) return;
    
    const unsubscribe = subscribeToShapePreviews(canvasId, (previews) => {
      setShapePreviews(previews);
    });
    
    return unsubscribe;
  }, [canvasId]);
  
  // One-time cleanup of any stale previews on mount
  useEffect(() => {
    if (!canvasId || !user) return;
    
    // Clear our own preview on mount in case we left with a preview active
    const clearPreview = async () => {
      try {
        await broadcastShapePreview(canvasId, null, user.id);
        console.log('[Preview] Cleared stale preview on mount');
      } catch (error) {
        console.error('[Preview] Failed to clear preview on mount:', error);
      }
    };
    
    clearPreview();
  }, [canvasId, user]);
  
  // Throttled function to broadcast shape preview
  // Track drag start positions for multi-select
  const dragStartPositionsRef = useRef<Record<string, Point>>({});
  
  const throttledBroadcastPreview = useRef(
    throttle(async (canvasId: string, preview: ShapePreviewType | null, userId: string) => {
      try {
        await broadcastShapePreview(canvasId, preview, userId);
      } catch (error) {
        console.error('Failed to broadcast shape preview:', error);
      }
    }, 16) // 60fps
  ).current;
  
  // Broadcast shape preview when cursor moves in shape creation mode OR paste mode
  useEffect(() => {
    if (!canvasId || !user) return;
    
    // Handle paste mode preview (local only, not broadcast)
    if (isPasteMode && cursorPosition) {
      const clipboardData = pasteFromClipboard();
      if (clipboardData && clipboardData.objects && clipboardData.objects[0]) {
        const firstObject = clipboardData.objects[0];
        const preview: ShapePreviewType = {
          type: firstObject.type as 'rectangle' | 'circle',
          position: { 
            x: cursorPosition.x - firstObject.width / 2, 
            y: cursorPosition.y - firstObject.height / 2 
          },
          width: firstObject.width,
          height: firstObject.height,
          fill: firstObject.fill,
          userId: user.id,
          userName: user.displayName || user.email || 'Anonymous',
        };
        setPastePreview(preview);
      }
      return;
    } else {
      setPastePreview(null);
    }
    
    // Clear preview if switching to select tool or no cursor position
    if (tool === 'select' || !cursorPosition) {
      // Use non-throttled immediate clear
      broadcastShapePreview(canvasId, null, user.id).then(() => {
        console.log('[Preview] Cleared preview (tool or cursor changed)');
      }).catch(console.error);
      return;
    }
    
    // Broadcast preview for rectangle or circle
    // Position should match where the shape will be placed (centered on cursor)
    const preview: ShapePreviewType = {
      type: tool,
      position: { x: cursorPosition.x - 50, y: cursorPosition.y - 50 },
      width: 100,
      height: 100,
      fill: '#3B82F6',
      userId: user.id,
      userName: user.displayName || user.email || 'Anonymous',
    };
    
    // Throttle the preview updates for performance
    throttledBroadcastPreview(canvasId, preview, user.id);
  }, [canvasId, user, tool, cursorPosition, isPasteMode, throttledBroadcastPreview]);
  
  // Cleanup: Clear shape preview on unmount or when leaving the canvas
  useEffect(() => {
    return () => {
      if (canvasId && user) {
        broadcastShapePreview(canvasId, null, user.id).catch(console.error);
      }
    };
  }, [canvasId, user]);
  
  const handlePlaceShape = useCallback(async (position: Point) => {
    if (!canvasId || tool === 'select') return;
    
    // IMMEDIATELY clear the preview BEFORE creating object
    // This ensures no throttled updates come after
    if (user) {
      await broadcastShapePreview(canvasId, null, user.id);
      console.log('[Preview] Cleared preview before placing shape');
    }
    
    // Create shape at clicked position
    await createObject({
      type: tool,
      x: position.x - 50, // Center the shape on cursor
      y: position.y - 50,
      width: 100,
      height: 100,
      fill: '#3B82F6',
    });
    
    // Switch back to select tool after placing
    // The effect will handle clearing preview when tool changes
    setActiveTool('select');
  }, [canvasId, tool, createObject, user, setActiveTool]);
  
  const handlePlacePastedObject = useCallback(async (position: Point) => {
    if (!canvasId || !isPasteMode) return;
    
    // Get data from clipboard
    const clipboardData = pasteFromClipboard();
    if (!clipboardData || !clipboardData.objects || clipboardData.objects.length === 0) {
      setIsPasteMode(false);
      setPastePreview(null);
      return;
    }
    
    try {
      // Create object from clipboard at clicked position
      const firstObject = clipboardData.objects[0];
      const pasteParams = {
        type: firstObject.type,
        x: position.x - firstObject.width / 2, // Center on cursor
        y: position.y - firstObject.height / 2,
        width: firstObject.width,
        height: firstObject.height,
        fill: firstObject.fill,
      };
      
      // Create the pasted object
      const newObject = await createObject(pasteParams);
      
      // Auto-select the pasted object
      if (newObject) {
        const { selectObject } = useSelectionStore.getState();
        selectObject(newObject.id);
        console.log('Pasted object from clipboard');
      }
      
      // Exit paste mode and clear preview
      setIsPasteMode(false);
      setPastePreview(null);
    } catch (error) {
      console.error('Failed to paste object:', error);
      setIsPasteMode(false);
      setPastePreview(null);
    }
  }, [canvasId, isPasteMode, createObject]);
  
  const handleCanvasClick = useCallback((position?: Point) => {
    // Handle paste mode - place pasted object
    if (isPasteMode && position) {
      handlePlacePastedObject(position);
      return;
    }
    
    if (tool === 'select') {
      // Increment trigger to deselect all objects
      setDeselectTrigger(prev => prev + 1);
    } else if (position) {
      // Place the shape at the clicked position
      handlePlaceShape(position);
    }
  }, [tool, isPasteMode, handlePlaceShape, handlePlacePastedObject]);
  
  const handleCursorMove = useCallback((position: Point) => {
    setCursorPosition(position);
  }, []);
  
  const handleObjectSelect = useCallback(() => {
    // This callback is kept for backwards compatibility but selection is now managed by store
    // ObjectRenderer will call store methods directly
  }, []);

  const handleObjectContextMenu = useCallback((objectId: string, position: { x: number; y: number }) => {
    // Set context menu state to show menu
    setContextMenu({
      objectId,
      position,
    });
  }, [setContextMenu]);
  
  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.length > 0 && canvasId) {
      try {
        await bulkDelete();
      } catch (error) {
        console.error('Failed to delete selected objects:', error);
      }
    }
  }, [selectedIds, canvasId, bulkDelete]);
  
  const handleDuplicateObject = useCallback(async (objectId?: string) => {
    if (!canvasId) return;
    
    // If no specific objectId provided, use bulk duplicate for selected objects
    if (!objectId && selectedIds.length > 0) {
      try {
        await bulkDuplicate();
      } catch (error) {
        console.error('Failed to duplicate selected objects:', error);
      }
      return;
    }
    
    // Single object duplicate (from context menu with specific ID)
    if (objectId) {
      const originalObject = objects.find(obj => obj.id === objectId);
      if (!originalObject) return;
      
      try {
        // Create duplicate with offset position (+20px X, +20px Y)
        const duplicateParams = {
          type: originalObject.type,
          x: originalObject.position.x + 20,
          y: originalObject.position.y + 20,
          width: originalObject.width,
          height: originalObject.height,
          fill: originalObject.fill,
        };
        
        // Create the duplicate object
        const newObject = await createObject(duplicateParams);
        
        // Auto-select the duplicate
        if (newObject) {
          const { selectObject } = useSelectionStore.getState();
          selectObject(newObject.id);
        }
      } catch (error) {
        console.error('Failed to duplicate object:', error);
      }
    }
  }, [canvasId, selectedIds, objects, createObject, bulkDuplicate]);
  
  const handleCopyObject = useCallback((objectId?: string) => {
    if (!canvasId) return;
    
    // If no specific objectId provided, use bulk copy for selected objects
    if (!objectId && selectedIds.length > 0) {
      const success = bulkCopy();
      if (success) {
        console.log(`Copied ${selectedIds.length} object(s) to clipboard`);
      }
      return;
    }
    
    // Single object copy (from context menu with specific ID)
    if (objectId) {
      const objectToCopy = objects.find(obj => obj.id === objectId);
      if (!objectToCopy) return;
      
      // Copy to clipboard (localStorage)
      const success = copyToClipboard(objectToCopy, canvasId);
      if (success) {
        console.log('Copied object to clipboard');
      }
    }
  }, [canvasId, selectedIds, objects, bulkCopy]);
  
  const handlePasteObject = useCallback(() => {
    if (!canvasId || !user) return;
    
    // Get data from clipboard
    const clipboardData = pasteFromClipboard();
    if (!clipboardData) {
      console.log('No valid clipboard data to paste');
      return;
    }
    
    // Enter paste mode - show preview
    setIsPasteMode(true);
    setActiveTool('select'); // Switch to select tool to avoid conflicts
    
    console.log('Entered paste mode - click to place object');
  }, [canvasId, user, setActiveTool]);
  
  // Keyboard shortcuts for delete, duplicate, copy, paste, and z-index
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key - cancel paste mode
      if (e.key === 'Escape' && isPasteMode) {
        setIsPasteMode(false);
        setPastePreview(null);
        console.log('Paste mode cancelled');
        return;
      }
      
      // Delete key only (not Backspace)
      if (e.key === 'Delete' && selectedIds.length > 0) {
        e.preventDefault();
        handleDeleteSelected();
      }
      
      // Duplicate with Ctrl+D or Cmd+D (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault(); // Prevent browser bookmark dialog
        handleDuplicateObject();
      }
      
      // Copy with Ctrl+C or Cmd+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault(); // Prevent default browser copy
        handleCopyObject();
      }
      
      // Paste with Ctrl+V or Cmd+V (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault(); // Prevent default browser paste
        handlePasteObject();
      }
      
      // Z-Index shortcuts (only when single object is selected)
      if (selectedIds.length === 1) {
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        
        // Bring to Front: Ctrl+Shift+]
        if (ctrl && shift && e.key === ']') {
          e.preventDefault();
          bringToFront(selectedIds[0]);
        }
        
        // Send to Back: Ctrl+Shift+[
        if (ctrl && shift && e.key === '[') {
          e.preventDefault();
          sendToBack(selectedIds[0]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, isPasteMode, handleDeleteSelected, handleDuplicateObject, handleCopyObject, handlePasteObject, bringToFront, sendToBack]);
  
  if (!canvasId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-gray-50">
        {/* Canvas Toolbar with Lookbook name and back button */}
        <CanvasToolbar canvasId={canvasId} />
        
        {/* Main Layout with Toolbars */}
        <div className="relative h-screen overflow-hidden">
          {/* Left Toolbar */}
          <LeftToolbar 
            activeTool={activeTool} 
            onToolChange={setActiveTool}
          />
          
          {/* Main Canvas Area */}
          <div className="ml-[60px] h-[calc(100vh-64px)] mt-16">
            <Canvas 
              canvasId={canvasId} 
              tool={isPasteMode ? 'rectangle' : tool}  // Use crosshair cursor in paste mode
              onCanvasClick={handleCanvasClick}
              onCursorMove={handleCursorMove}
            >
              <ObjectRenderer
                objects={objects}
                onObjectUpdate={(objectId, updates) => {
                  updateObject(objectId, updates);
                }}
                onObjectDragStart={(objectId) => {
                  // Track start positions for multi-select drag
                  if (selectedIds.includes(objectId) && selectedIds.length > 1) {
                    // Store start positions of ALL selected objects
                    dragStartPositionsRef.current = {};
                    selectedIds.forEach(id => {
                      const obj = objects.find(o => o.id === id);
                      if (obj) {
                        dragStartPositionsRef.current[id] = { ...obj.position };
                      }
                    });
                  } else {
                    // Single object drag
                    startObjectDrag(objectId);
                  }
                }}
                onObjectDragMove={(objectId, position) => {
                  // Check if this is a multi-select drag
                  if (selectedIds.includes(objectId) && selectedIds.length > 1 && dragStartPositionsRef.current[objectId]) {
                    // Calculate delta from start position
                    const startPos = dragStartPositionsRef.current[objectId];
                    const deltaX = position.x - startPos.x;
                    const deltaY = position.y - startPos.y;
                    
                    // Move all selected objects by the same delta
                    selectedIds.forEach(id => {
                      const startObjPos = dragStartPositionsRef.current[id];
                      if (startObjPos) {
                        const newPos = {
                          x: startObjPos.x + deltaX,
                          y: startObjPos.y + deltaY,
                        };
                        broadcastObjectMove(id, newPos);
                      }
                    });
                  } else {
                    // Single object drag
                    broadcastObjectMove(objectId, position);
                  }
                }}
                onObjectDragEnd={async (objectId, position) => {
                  // Check if this was a multi-select drag
                  if (selectedIds.includes(objectId) && selectedIds.length > 1 && dragStartPositionsRef.current[objectId]) {
                    // Calculate final delta
                    const startPos = dragStartPositionsRef.current[objectId];
                    const deltaX = position.x - startPos.x;
                    const deltaY = position.y - startPos.y;
                    
                    // Persist all moved objects
                    await Promise.all(
                      selectedIds.map(id => {
                        const startObjPos = dragStartPositionsRef.current[id];
                        if (startObjPos) {
                          const finalPos = {
                            x: startObjPos.x + deltaX,
                            y: startObjPos.y + deltaY,
                          };
                          return finishObjectDrag(id, finalPos);
                        }
                        return Promise.resolve();
                      })
                    );
                    
                    // Clear tracking
                    dragStartPositionsRef.current = {};
                  } else {
                    // Single object drag
                    finishObjectDrag(objectId, position);
                  }
                }}
                onObjectTransformStart={(objectId) => {
                  broadcastObjectTransformStart(objectId);
                }}
                onObjectTransform={(objectId, updates) => {
                  broadcastObjectTransform(objectId, updates);
                }}
                onObjectTransformEnd={(objectId) => {
                  broadcastObjectTransformEnd(objectId);
                }}
                onObjectSelect={handleObjectSelect}
                onObjectContextMenu={handleObjectContextMenu}
                currentUserId={user?.id}
                presenceUsers={presence}
                deselectTrigger={deselectTrigger}
              />
              
              {/* Render shape previews from all users */}
              {Object.entries(shapePreviews).map(([userId, preview]) => {
                return (
                  <ShapePreviewComponent key={userId} preview={preview} />
                );
              })}
              
              {/* Render paste preview (local only) */}
              {pastePreview && (
                <ShapePreviewComponent preview={pastePreview} />
              )}
            </Canvas>
          </div>
          
          {/* Right Sidebar */}
          {canvasId && <RightSidebar canvasId={canvasId} />}
          
          {/* Context Menu */}
          {canvasId && <ContextMenu canvasId={canvasId} onDuplicate={handleDuplicateObject} onCopy={handleCopyObject} />}
        </div>
      </div>
    </ProtectedRoute>
  );
}

