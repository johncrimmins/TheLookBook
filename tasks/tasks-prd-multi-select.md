# Feature 6: Multi-Select - Complete Task List

## Relevant Files

- `src/features/objects/lib/selectionUtils.ts` - NEW: Utility functions for bounds checking and marquee intersection logic
- `src/features/objects/components/SelectionBox.tsx` - NEW: Visual marquee component (blue border, semi-transparent fill)
- `src/features/objects/lib/objectsStore.ts` - UPDATE: Add selection state (`selectedIds[]`) and bulk operation methods
- `src/features/objects/types/index.ts` - UPDATE: Add selection-related TypeScript types
- `src/features/canvas/components/Canvas.tsx` - UPDATE: Add marquee interaction handlers (mousedown, mousemove, mouseup)
- `src/features/objects/components/ContextMenu.tsx` - UPDATE: Add bulk actions (Delete All, Duplicate All, Copy)
- `src/features/objects/components/PropertiesPanel.tsx` - UPDATE: Add multi-select UI with bulk property controls
- `src/features/objects/components/ObjectRenderer.tsx` - UPDATE: Wire selection state to object rendering
- `src/features/objects/hooks/useObjects.ts` - UPDATE: Add bulk operation hooks and selection management
- `src/features/objects/hooks/useShapeInteractions.ts` - UPDATE: Wire click selection to store state
- `src/shared/lib/clipboard.ts` - UPDATE: Extend to support multi-object copy/paste

### Notes
- This feature maximizes reuse of existing components (ContextMenu, PropertiesPanel, useShapeInteractions)
- Selection state is local only (not synced across users)
- All bulk operations use existing Last-Write-Wins conflict resolution
- Performance target: 60 FPS marquee, support up to 100 selected objects
- **Important for Feature 7**: Write `isObjectSelectable()` as an extensible utility function that can be enhanced for layer-based filtering

---

## Tasks

- [ ] **1.0 Setup Selection State & Utilities**
  - [ ] 1.1 Create `src/features/objects/types/index.ts` - Add `SelectionState` interface with `selectedIds: string[]`
  - [ ] 1.2 Create `src/features/objects/lib/selectionUtils.ts` - Implement `isObjectSelectable(object)` function (check visible/locked)
  - [ ] 1.3 Add `getBoundingBox(object)` function to calculate object bounds for intersection testing
  - [ ] 1.4 Add `doBoxesIntersect(box1, box2)` function for marquee intersection logic
  - [ ] 1.5 Add `getObjectsInBox(objects, selectionBox)` function to filter objects intersecting marquee
  - [ ] 1.6 Update `objectsStore.ts` - Add `selectedIds: string[]` to store state (initialize as empty array)
  - [ ] 1.7 Add `selectObject(id: string)` method (replaces current selection with single object)
  - [ ] 1.8 Add `selectMultiple(ids: string[])` method (replaces current selection with array)
  - [ ] 1.9 Add `clearSelection()` method (resets selectedIds to empty array)
  - [ ] 1.10 Add computed selector `getSelectedObjects()` that returns full object data for selected IDs

- [ ] **2.0 Implement Marquee Selection**
  - [ ] 2.1 Create `src/features/objects/components/SelectionBox.tsx` - Create functional component accepting `startPos`, `currentPos` props
  - [ ] 2.2 Add styling: `border-2 border-blue-500 bg-blue-100 bg-opacity-20` (semi-transparent blue)
  - [ ] 2.3 Calculate box dimensions from start/current positions (handle drag in any direction)
  - [ ] 2.4 Position absolutely on canvas using Konva `Rect` component
  - [ ] 2.5 Update `Canvas.tsx` - Add local state: `isDrawingMarquee`, `marqueeStart`, `marqueeCurrent`
  - [ ] 2.6 Add `handleCanvasMouseDown` - Check if click on empty space, set marquee start position
  - [ ] 2.7 Add `handleCanvasMouseMove` - If drawing marquee, throttle to 16ms (60 FPS), update current position
  - [ ] 2.8 Add `handleCanvasMouseUp` - Calculate final marquee box, call `getObjectsInBox()`, update selection, clear marquee
  - [ ] 2.9 Conditionally render `<SelectionBox>` when `isDrawingMarquee === true`
  - [ ] 2.10 Add click on empty canvas to call `clearSelection()` (when not dragging)

- [ ] **3.0 Implement Single-Click Selection**
  - [ ] 3.1 Update `useShapeInteractions.ts` - Modify `handleClick` to call `selectObject(objectId)` instead of local state
  - [ ] 3.2 Ensure clicking an object clears previous selections (single-select behavior)
  - [ ] 3.3 Verify click respects `isObjectSelectable()` - don't select hidden objects
  - [ ] 3.4 Update `ObjectRenderer.tsx` - Read `selectedIds` from store and pass to shape components
  - [ ] 3.5 Update shape components (Rectangle, Circle) - Accept `isSelected` prop to show selection state
  - [ ] 3.6 Add visual feedback for selected objects (use existing transformer/selection indicators)

- [ ] **4.0 Implement Bulk Operations (Move, Delete, Duplicate, Copy/Paste)**
  - [ ] 4.1 Update `objectsStore.ts` - Add `deleteSelected()` method that calls `deleteObject()` for each selected ID
  - [ ] 4.2 Add `duplicateSelected()` method - Clone all selected objects with 20px x/y offset, generate new UUIDs
  - [ ] 4.3 Add `moveSelected(deltaX, deltaY)` method - Update position for all selected objects maintaining relative positions
  - [ ] 4.4 Ensure all bulk operations create single history entry (group by timestamp window <100ms)
  - [ ] 4.5 Update `useShapeInteractions.ts` - Modify `handleDragMove` to check if dragged object is in selection
  - [ ] 4.6 If dragging selected object, calculate delta and call `moveSelected()` for all
  - [ ] 4.7 Update `shared/lib/clipboard.ts` - Modify `copyToClipboard()` to accept array of objects
  - [ ] 4.8 Modify `pasteFromClipboard()` to handle array, create all objects with 20px offset
  - [ ] 4.9 Update `useObjects.ts` - Add `useBulkDelete()`, `useBulkDuplicate()`, `useBulkCopy()`, `useBulkPaste()` hooks
  - [ ] 4.10 Wire hooks to expose bulk operations to UI components

- [ ] **5.0 Integrate Multi-Select with Properties Panel**
  - [ ] 5.1 Update `PropertiesPanel.tsx` - Read `selectedIds` from store
  - [ ] 5.2 Add conditional rendering: if `selectedIds.length > 1` show multi-select UI
  - [ ] 5.3 Display "{count} objects selected" header when multiple selected
  - [ ] 5.4 Show only shared properties that apply to all selected object types (fill, stroke, strokeWidth)
  - [ ] 5.5 Add `handleBulkPropertyChange(property, value)` function
  - [ ] 5.6 Implement bulk update: iterate selected objects, call `updateObject()` for each with new property value
  - [ ] 5.7 Ensure property changes create single undo/redo entry (timestamp grouping)
  - [ ] 5.8 Update ColorPicker integration to work with bulk selections
  - [ ] 5.9 Add property input components (stroke width, etc.) that update all selected objects
  - [ ] 5.10 Show empty state or disable properties panel when no selection

- [ ] **6.0 Integrate Multi-Select with Context Menu**
  - [ ] 6.1 Update `ContextMenu.tsx` - Read `selectedIds` from store
  - [ ] 6.2 Add conditional logic: if `selectedIds.length > 1` show bulk action menu items
  - [ ] 6.3 Add "Delete All ({count})" menu item that calls `deleteSelected()`
  - [ ] 6.4 Add "Duplicate All ({count})" menu item that calls `duplicateSelected()`
  - [ ] 6.5 Add "Copy ({count})" menu item that calls bulk copy
  - [ ] 6.6 Update existing menu items to show "Delete", "Duplicate", "Copy" for single selection
  - [ ] 6.7 Add keyboard hints to menu items (even though shortcuts not implemented yet)
  - [ ] 6.8 Ensure menu positioning works correctly regardless of selection count
  - [ ] 6.9 Test menu on multi-selected objects with different types (circles + rectangles)
  - [ ] 6.10 Verify "Bring to Front" / "Send to Back" work with bulk selections

- [ ] **7.0 Add Visual Feedback & Polish**
  - [ ] 7.1 Add selection count badge/indicator visible during multi-select (in properties panel header)
  - [ ] 7.2 Ensure marquee box renders correctly when dragging in any direction (top-left, bottom-right, etc.)
  - [ ] 7.3 Add smooth transition/animation for selection state changes (<300ms)
  - [ ] 7.4 Test marquee performance with 100+ objects on canvas (target 60 FPS)
  - [ ] 7.5 Verify selection state clears when switching tools (Select → Rectangle tool)
  - [ ] 7.6 Add cursor feedback: crosshair when marquee drawing, default when hovering objects
  - [ ] 7.7 Test multi-select with locked objects (should be selectable but not editable)
  - [ ] 7.8 Test multi-select with hidden objects (should not be selectable)
  - [ ] 7.9 Verify all bulk operations work with undo/redo
  - [ ] 7.10 Perform end-to-end testing: marquee → bulk move → bulk delete → undo → redo

---

**Estimated Effort:** 3-4 days  
**Status:** Ready for Implementation  
**Next Feature:** Feature 7 (Hierarchical Layers) - Will extend `isObjectSelectable()` with layer-based filtering

