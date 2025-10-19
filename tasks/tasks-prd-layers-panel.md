# Tasks: Layers Panel (Feature 5B-2)

**Source PRD:** `prd-layers-panel.md`  
**Status:** Ready for Implementation  
**Priority:** High  
**Estimated Effort:** 2-3 days  
**Dependencies:** Feature 5B-1 ✅ COMPLETE

---

## Relevant Files

- `src/features/objects/types/index.ts` - UPDATE: Extend CanvasObject interface with name, visible, locked properties
- `src/features/objects/lib/objectsStore.ts` - UPDATE: Add layer management methods (reorderLayer, toggleLayerVisibility, toggleLayerLock)
- `src/features/objects/components/LayerThumbnail.tsx` - NEW: 32x32 canvas preview for shapes
- `src/features/objects/components/LayerItem.tsx` - NEW: Individual layer row with drag-drop, rename, visibility, lock
- `src/features/objects/components/LayerPanel.tsx` - NEW: Layer list panel with z-order display and interactions
- `src/features/objects/components/RightSidebar.tsx` - UPDATE: Replace LayersPlaceholder with LayerPanel (one line)
- `src/features/objects/components/ObjectRenderer.tsx` - UPDATE: Filter hidden objects from rendering
- `src/features/objects/components/Rectangle.tsx` - UPDATE: Add locked state handling
- `src/features/objects/components/Circle.tsx` - UPDATE: Add locked state handling
- `src/features/objects/index.ts` - UPDATE: Export new components

### Notes

- All operations use existing `updateObject()` infrastructure for automatic real-time sync
- SidebarPanel component from 5B-1 provides the wrapper
- ShadCN components already installed: Tooltip, ScrollArea, Button, Input
- Two-way sync: clicking layer selects on canvas, selecting on canvas highlights in panel
- Drag-to-reorder uses HTML5 drag-drop API

---

## Tasks

- [ ] 1.0 Update data models and store infrastructure
  - [ ] 1.1 Update `src/features/objects/types/index.ts`
    - [ ] 1.1.1 Extend CanvasObject interface with `name?: string` (optional, auto-generated default)
    - [ ] 1.1.2 Extend CanvasObject interface with `visible?: boolean` (optional, default: true)
    - [ ] 1.1.3 Extend CanvasObject interface with `locked?: boolean` (optional, default: false)
    - [ ] 1.1.4 Verify backwards compatibility (all new fields are optional)
  - [ ] 1.2 Update `src/features/objects/lib/objectsStore.ts`
    - [ ] 1.2.1 Create helper function `generateLayerName(type: string, id: string): string`
      - Returns `${capitalize(type)} ${id.slice(0, 4)}`
      - Example: "Rectangle a3f2" or "Circle b7e1"
    - [ ] 1.2.2 Update `addObject` to include auto-generated name if not provided
    - [ ] 1.2.3 Implement `reorderLayer(draggedId: string, targetId: string): void`
      - Get dragged and target objects
      - Calculate new order value (insert dragged above target)
      - Call `updateObject` with new order
      - Handle edge cases (drag to top, drag to bottom)
    - [ ] 1.2.4 Implement `toggleLayerVisibility(id: string): void`
      - Get object by id
      - Toggle visible property (undefined/true → false, false → true)
      - Call `updateObject` with new visible state
    - [ ] 1.2.5 Implement `toggleLayerLock(id: string): void`
      - Get object by id
      - Toggle locked property (undefined/false → true, true → false)
      - Call `updateObject` with new locked state
    - [ ] 1.2.6 Update `updateObject` to handle name changes (propagate to Firebase)

- [ ] 2.0 Create layer thumbnail component
  - [ ] 2.1 Create `src/features/objects/components/LayerThumbnail.tsx`
    - [ ] 2.1.1 Define props interface: `{ object: CanvasObject }`
    - [ ] 2.1.2 Create canvas ref with `useRef<HTMLCanvasElement>(null)`
    - [ ] 2.1.3 Set canvas dimensions to 32x32 pixels
    - [ ] 2.1.4 Implement useEffect to draw shape when object changes
      - Get 2D context from canvas
      - Clear canvas with white background
      - Calculate scale factor to fit shape in 32x32 (leave 4px padding)
      - Draw rectangle if type is 'rectangle'
      - Draw circle if type is 'circle'
      - Use object's fill color
      - Add subtle border (1px gray)
    - [ ] 2.1.5 Return canvas element with proper styling (border, rounded corners)
    - [ ] 2.1.6 Handle edge cases (missing object, unsupported shape type)

- [ ] 3.0 Create layer item component
  - [ ] 3.1 Create `src/features/objects/components/LayerItem.tsx`
    - [ ] 3.1.1 Define props interface: `{ object: CanvasObject, isSelected: boolean, onSelect: (id: string) => void, onReorder: (draggedId: string, targetId: string) => void }`
    - [ ] 3.1.2 Import ShadCN components: Button, Input, Tooltip
    - [ ] 3.1.3 Import icons: Eye, EyeOff, Lock, Unlock from lucide-react
    - [ ] 3.1.4 Create local state for rename mode: `isRenaming` (boolean) and `editedName` (string)
  - [ ] 3.2 Implement layer display and selection
    - [ ] 3.2.1 Render layer item with flex layout (thumbnail, name, controls)
    - [ ] 3.2.2 Display LayerThumbnail component
    - [ ] 3.2.3 Display layer name (truncate with ellipsis if > 50 chars)
    - [ ] 3.2.4 Show default name if name is undefined (use generateLayerName)
    - [ ] 3.2.5 Highlight layer if isSelected is true (blue background)
    - [ ] 3.2.6 Handle click on layer row to call onSelect(object.id)
  - [ ] 3.3 Implement inline rename functionality
    - [ ] 3.3.1 Handle double-click on name to enter rename mode
    - [ ] 3.3.2 Replace name display with ShadCN Input when isRenaming is true
    - [ ] 3.3.3 Auto-focus input when entering rename mode
    - [ ] 3.3.4 Handle Enter key to save (call updateObject with new name, exit rename mode)
    - [ ] 3.3.5 Handle Escape key to cancel (restore original name, exit rename mode)
    - [ ] 3.3.6 Handle blur to save changes (same as Enter)
    - [ ] 3.3.7 Enforce 50 character maximum for names
    - [ ] 3.3.8 Prevent single-click selection while in rename mode
  - [ ] 3.4 Implement visibility toggle
    - [ ] 3.4.1 Create Eye/EyeOff button (ShadCN Button with icon)
    - [ ] 3.4.2 Show Eye icon if visible is true/undefined
    - [ ] 3.4.3 Show EyeOff icon if visible is false
    - [ ] 3.4.4 Wrap button in Tooltip showing "Toggle Visibility"
    - [ ] 3.4.5 Handle click to call toggleLayerVisibility(object.id)
    - [ ] 3.4.6 Stop event propagation (don't trigger selection)
  - [ ] 3.5 Implement lock toggle
    - [ ] 3.5.1 Create Lock/Unlock button (ShadCN Button with icon)
    - [ ] 3.5.2 Show Unlock icon if locked is false/undefined
    - [ ] 3.5.3 Show Lock icon if locked is true
    - [ ] 3.5.4 Wrap button in Tooltip showing "Toggle Lock"
    - [ ] 3.5.5 Handle click to call toggleLayerLock(object.id)
    - [ ] 3.5.6 Stop event propagation (don't trigger selection)
  - [ ] 3.6 Implement drag-to-reorder with HTML5 drag-drop
    - [ ] 3.6.1 Add `draggable={true}` to layer item container
    - [ ] 3.6.2 Handle `onDragStart` event
      - Set dataTransfer.effectAllowed to 'move'
      - Store dragged object id in dataTransfer
      - Add visual feedback (reduce opacity to 0.5)
    - [ ] 3.6.3 Handle `onDragEnd` event (restore opacity)
    - [ ] 3.6.4 Handle `onDragOver` event
      - Prevent default to allow drop
      - Add visual drop indicator (border-top or border-bottom)
    - [ ] 3.6.5 Handle `onDrop` event
      - Get dragged id from dataTransfer
      - Call onReorder(draggedId, object.id)
      - Clear drop indicator
    - [ ] 3.6.6 Handle `onDragLeave` event (clear drop indicator)

- [ ] 4.0 Create layer panel component
  - [ ] 4.1 Create `src/features/objects/components/LayerPanel.tsx`
    - [ ] 4.1.1 Import LayerItem and LayerThumbnail components
    - [ ] 4.1.2 Import ShadCN ScrollArea component
    - [ ] 4.1.3 Get objects from objectsStore using zustand
    - [ ] 4.1.4 Get selectedObject from objectsStore
    - [ ] 4.1.5 Get store methods: selectObject, reorderLayer, toggleLayerVisibility, toggleLayerLock
  - [ ] 4.2 Implement layer list display
    - [ ] 4.2.1 Sort objects by order descending (front to back)
    - [ ] 4.2.2 Use useMemo to optimize sorting performance
    - [ ] 4.2.3 Map sorted objects to LayerItem components
    - [ ] 4.2.4 Pass isSelected prop (compare object.id with selectedObject?.id)
    - [ ] 4.2.5 Pass onSelect handler (calls selectObject)
    - [ ] 4.2.6 Pass onReorder handler (calls reorderLayer)
    - [ ] 4.2.7 Add unique key prop (use object.id)
  - [ ] 4.3 Implement empty state
    - [ ] 4.3.1 Check if objects array is empty
    - [ ] 4.3.2 Display centered message: "No objects on canvas"
    - [ ] 4.3.3 Display helper text: "Create a shape to see it here"
    - [ ] 4.3.4 Style with gray text and padding
  - [ ] 4.4 Wrap in ScrollArea
    - [ ] 4.4.1 Use ShadCN ScrollArea for layer list
    - [ ] 4.4.2 Set max height to fill available space
    - [ ] 4.4.3 Enable vertical scrolling
    - [ ] 4.4.4 Hide horizontal scrollbar

- [ ] 5.0 Integrate layers panel into right sidebar
  - [ ] 5.1 Update `src/features/objects/components/RightSidebar.tsx`
    - [ ] 5.1.1 Replace import: `import { LayersPlaceholder } from './LayersPlaceholder';` → `import { LayerPanel } from './LayerPanel';`
    - [ ] 5.1.2 Replace component: `<LayersPlaceholder />` → `<LayerPanel />`
    - [ ] 5.1.3 Verify 39% height allocation is preserved
  - [ ] 5.2 Update `src/features/objects/index.ts`
    - [ ] 5.2.1 Add LayerPanel to exports
    - [ ] 5.2.2 Add LayerItem to exports
    - [ ] 5.2.3 Add LayerThumbnail to exports
  - [ ] 5.3 Optional cleanup
    - [ ] 5.3.1 Consider removing LayersPlaceholder.tsx (no longer needed)
    - [ ] 5.3.2 Remove LayersPlaceholder from exports if deleted

- [ ] 6.0 Update rendering logic for visibility
  - [ ] 6.1 Update `src/features/objects/components/ObjectRenderer.tsx`
    - [ ] 6.1.1 Import useMemo from React
    - [ ] 6.1.2 Create visibleObjects with useMemo
      - Filter objects where visible !== false (include true and undefined)
      - Sort by order ascending (back to front for rendering)
      - Depend on objects array
    - [ ] 6.1.3 Replace objects array with visibleObjects in rendering loop
    - [ ] 6.1.4 Verify hidden objects are not rendered
    - [ ] 6.1.5 Verify hidden objects are not selectable

- [ ] 7.0 Update shape components for locked state
  - [ ] 7.1 Update `src/features/objects/components/Rectangle.tsx`
    - [ ] 7.1.1 Get locked property from object
    - [ ] 7.1.2 Create isLocked boolean: `object.locked === true`
    - [ ] 7.1.3 Pass isLocked to useShapeInteractions hook
    - [ ] 7.1.4 Conditionally disable all event handlers if isLocked is true
      - Skip onDragStart, onDragEnd, onTransformEnd
    - [ ] 7.1.5 Add visual indicator when locked and selected
      - Display 🔒 emoji centered on shape
      - Use Konva Text component with fontSize 24
    - [ ] 7.1.6 Disable transformer if locked (pass to useShapeInteractions)
  - [ ] 7.2 Update `src/features/objects/components/Circle.tsx`
    - [ ] 7.2.1 Get locked property from object
    - [ ] 7.2.2 Create isLocked boolean: `object.locked === true`
    - [ ] 7.2.3 Pass isLocked to useShapeInteractions hook
    - [ ] 7.2.4 Conditionally disable all event handlers if isLocked is true
    - [ ] 7.2.5 Add visual indicator when locked and selected (🔒 emoji)
    - [ ] 7.2.6 Disable transformer if locked
  - [ ] 7.3 Update `src/features/objects/hooks/useShapeInteractions.ts`
    - [ ] 7.3.1 Accept optional isLocked parameter in hook
    - [ ] 7.3.2 Skip all interaction handlers if isLocked is true
    - [ ] 7.3.3 Return disabled handlers (no-ops) when locked
    - [ ] 7.3.4 Prevent context menu on locked objects (or show limited menu)

- [ ] 8.0 Testing and validation
  - [ ] 8.1 Display tests
    - [ ] 8.1.1 Verify objects appear in correct z-order (front to back)
    - [ ] 8.1.2 Verify thumbnails render correctly for rectangles
    - [ ] 8.1.3 Verify thumbnails render correctly for circles
    - [ ] 8.1.4 Verify auto-generated names display correctly
    - [ ] 8.1.5 Verify selected layer is highlighted in panel
    - [ ] 8.1.6 Verify empty state shows when no objects exist
  - [ ] 8.2 Layer interaction tests
    - [ ] 8.2.1 Test drag-to-reorder works (visual feedback during drag)
    - [ ] 8.2.2 Test drag-to-reorder updates z-index correctly
    - [ ] 8.2.3 Test clicking layer in panel selects object on canvas
    - [ ] 8.2.4 Test selecting object on canvas highlights in panel
    - [ ] 8.2.5 Test two-way sync works in both directions
  - [ ] 8.3 Rename tests
    - [ ] 8.3.1 Test double-click on name enters rename mode
    - [ ] 8.3.2 Test Enter key saves new name
    - [ ] 8.3.3 Test Escape key cancels rename
    - [ ] 8.3.4 Test blur saves new name
    - [ ] 8.3.5 Test 50 character limit is enforced
    - [ ] 8.3.6 Test name persists after saving
  - [ ] 8.4 Visibility tests
    - [ ] 8.4.1 Test eye icon toggles visibility
    - [ ] 8.4.2 Test hidden objects are not rendered on canvas
    - [ ] 8.4.3 Test hidden objects are not selectable
    - [ ] 8.4.4 Test hidden objects still appear in panel with eye-off icon
    - [ ] 8.4.5 Test visibility state persists
  - [ ] 8.5 Lock tests
    - [ ] 8.5.1 Test lock icon toggles locked state
    - [ ] 8.5.2 Test locked objects cannot be moved
    - [ ] 8.5.3 Test locked objects cannot be resized
    - [ ] 8.5.4 Test locked objects cannot be edited via properties panel
    - [ ] 8.5.5 Test locked objects show 🔒 emoji when selected
    - [ ] 8.5.6 Test context menu disabled or limited on locked objects
    - [ ] 8.5.7 Test locked state persists
  - [ ] 8.6 Real-time sync tests
    - [ ] 8.6.1 Test reordering syncs to other users
    - [ ] 8.6.2 Test rename syncs to other users
    - [ ] 8.6.3 Test visibility toggle syncs to other users
    - [ ] 8.6.4 Test lock toggle syncs to other users
    - [ ] 8.6.5 Test selection syncs between canvas and panel
  - [ ] 8.7 History tests
    - [ ] 8.7.1 Test undo/redo works for reordering
    - [ ] 8.7.2 Test undo/redo works for rename
    - [ ] 8.7.3 Test undo/redo works for visibility toggle
    - [ ] 8.7.4 Test undo/redo works for lock toggle
  - [ ] 8.8 Edge cases
    - [ ] 8.8.1 Test with no objects (empty state displays)
    - [ ] 8.8.2 Test with all objects hidden (panel shows all with eye-off icons)
    - [ ] 8.8.3 Test selecting hidden object via panel (disallow or auto-show)
    - [ ] 8.8.4 Test long layer names (truncate with ellipsis)
    - [ ] 8.8.5 Test drag-to-reorder with many objects (>20)
    - [ ] 8.8.6 Test scrolling in layer panel (ScrollArea works)
  - [ ] 8.9 Performance tests
    - [ ] 8.9.1 Test drag updates are <100ms (smooth feedback)
    - [ ] 8.9.2 Test layer list renders efficiently with 50+ objects
    - [ ] 8.9.3 Test filtering hidden objects doesn't cause lag
  - [ ] 8.10 Regression tests
    - [ ] 8.10.1 Verify existing object creation still works
    - [ ] 8.10.2 Verify existing object editing still works
    - [ ] 8.10.3 Verify context menu still works
    - [ ] 8.10.4 Verify properties panel still works
    - [ ] 8.10.5 Verify z-index operations still work
    - [ ] 8.10.6 Verify copy/paste still works
    - [ ] 8.10.7 Verify undo/redo still works for all operations

---

**Implementation Status:** Ready to begin  
**Estimated Time:** 2-3 days  
**Dependencies:** Feature 5B-1 ✅ COMPLETE

