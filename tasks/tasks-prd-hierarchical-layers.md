# Feature 7: Hierarchical Layers System - Complete Task List

## Relevant Files

### NEW Files
- `src/features/objects/types/layer.ts` - Layer entity interface, layer-related type definitions
- `src/features/objects/components/Layer.tsx` - Single layer row component (expandable, controls, inline rename)
- `src/features/objects/components/LayerList.tsx` - Hierarchical display of all layers with nested objects
- `src/features/objects/components/LayerModal.tsx` - Modal for bulk object assignment to layers (checkboxes)
- `src/features/objects/components/CreateLayerButton.tsx` - "+ New Layer" button component

### UPDATE Files
- `src/features/objects/lib/objectsStore.ts` - Add layer state (layers array), CRUD methods, layer-aware filtering
- `src/features/objects/types/index.ts` - Extend CanvasObject with `layerId` property, add layer types
- `src/features/objects/components/RightSidebar.tsx` - Replace LayerPanel placeholder with new LayerList
- `src/features/objects/components/ObjectRenderer.tsx` - Filter by layer visibility when rendering objects
- `src/features/objects/components/ContextMenu.tsx` - Add "Move to Layer" submenu with layer options
- `src/features/objects/hooks/useShapeInteractions.ts` - Check layer lock state before allowing edits
- `src/features/objects/services/objectsService.ts` - Add Firestore sync for layer CRUD operations
- `src/features/objects/lib/selectionUtils.ts` - Extend `isObjectSelectable()` to check layer visibility/lock

### REUSE Files
- `src/features/objects/components/LayerThumbnail.tsx` - 32x32 canvas preview for objects within layers
- ShadCN components: `Tooltip`, `ScrollArea`, `Button`, `Input`, `Popover`

### Notes
- This feature replaces the incorrect flat layers implementation from Feature 5B-2
- Layers are organizational groups (NOT tied to z-index/stacking)
- Default Layer cannot be deleted/renamed, automatically contains new objects
- Layer `expanded` state is local only (localStorage), not synced
- Layer visibility/lock uses AND logic with object visibility/lock
- Integration with Feature 6 (Multi-Select): marquee respects layer state
- Performance target: <16ms expand/collapse, <100ms modal open (100+ objects), <50ms visibility toggle

---

## Tasks

- [ ] **1.0 Setup Layer Data Model & Store Foundation**
  - [ ] 1.1 Create `src/features/objects/types/layer.ts` - Define `Layer` interface with id, name, visible, locked, expanded, createdAt, updatedAt
  - [ ] 1.2 Add TypeScript constants: `DEFAULT_LAYER_ID = 'default'`, `DEFAULT_LAYER_NAME = 'Default Layer'`
  - [ ] 1.3 Update `src/features/objects/types/index.ts` - Extend `CanvasObject` interface to include `layerId: string` property
  - [ ] 1.4 Add layer-related types: `LayerState`, `LayerWithObjects` for computed data
  - [ ] 1.5 Update `objectsStore.ts` - Add `layers: Layer[]` to store state (initialize as empty array)
  - [ ] 1.6 Add `layerExpandedState: Record<string, boolean>` for local UI state (not synced)
  - [ ] 1.7 Add computed selector `getLayerById(id: string)` to retrieve single layer
  - [ ] 1.8 Add computed selector `getObjectsByLayerId(layerId: string)` to filter objects by layer
  - [ ] 1.9 Add computed selector `getLayersWithObjects()` to return hierarchical structure (layers + nested objects)
  - [ ] 1.10 Add helper function `getNextLayerName()` to generate "Layer 2", "Layer 3", etc.

- [ ] **2.0 Implement Layer CRUD Operations**
  - [ ] 2.1 Update `objectsStore.ts` - Add `createLayer(name?: string)` method
  - [ ] 2.2 Generate UUID for layer ID, use `getNextLayerName()` if name not provided
  - [ ] 2.3 Set defaults: `visible: true`, `locked: false`, `expanded: true`, timestamps with Date.now()
  - [ ] 2.4 Add new layer to `layers` array, call service to sync to Firestore
  - [ ] 2.5 Add `updateLayer(id: string, updates: Partial<Layer>)` method with timestamp update
  - [ ] 2.6 Prevent updates to Default Layer name or ID (add validation check)
  - [ ] 2.7 Add `deleteLayer(id: string)` method - validate not Default Layer
  - [ ] 2.8 When deleting layer, reassign all objects to Default Layer (update each object's layerId)
  - [ ] 2.9 Remove layer from `layers` array, sync deletion to Firestore
  - [ ] 2.10 Add `toggleLayerExpanded(id: string)` method - update local `layerExpandedState` only (localStorage)

- [ ] **3.0 Build Layer UI Components**
  - [ ] 3.1 Create `Layer.tsx` - Accept props: `layer`, `objects`, `isExpanded`, `onToggleExpanded`, `onUpdate`, `onDelete`
  - [ ] 3.2 Render layer row: arrow icon (▶/▼), layer name, eye icon, lock icon, menu icon (⋯)
  - [ ] 3.3 Add inline rename: double-click name to edit, Enter saves, Escape cancels (max 50 chars)
  - [ ] 3.4 Add click handler on arrow/name to toggle expanded state
  - [ ] 3.5 When expanded, render nested object list with 16px indent (use map over objects)
  - [ ] 3.6 For each object, render: `<LayerThumbnail>` + name + eye icon + lock icon
  - [ ] 3.7 Add collapsed state: show "Layer Name ({count} objects)" badge
  - [ ] 3.8 Style Default Layer with light background (#f9fafb) and prevent rename on double-click
  - [ ] 3.9 Add Popover menu (⋯) with "Manage Objects", "Rename Layer", "Delete Layer" options
  - [ ] 3.10 Wire visibility/lock toggles to call `updateLayer()` with partial updates
  - [ ] 3.11 Create `LayerList.tsx` - Read `getLayersWithObjects()` from store
  - [ ] 3.12 Render ScrollArea wrapper for overflow handling
  - [ ] 3.13 Map over layers, render `<Layer>` component for each with appropriate props
  - [ ] 3.14 Ensure Default Layer always renders at top (sort layers before mapping)
  - [ ] 3.15 Create `CreateLayerButton.tsx` - Render "+ New Layer" button at bottom of list
  - [ ] 3.16 Add click handler to call `createLayer()` from store
  - [ ] 3.17 Style button: full width, subtle styling, hover state
  - [ ] 3.18 Create `LayerModal.tsx` - Accept props: `isOpen`, `onClose`, `layerId`, `allObjects`
  - [ ] 3.19 Render modal with list of all objects (checkboxes + thumbnails + names)
  - [ ] 3.20 Pre-check objects already assigned to the layer
  - [ ] 3.21 Add "Save" button that updates all checked objects' layerId property
  - [ ] 3.22 Add "Cancel" button to close without saving
  - [ ] 3.23 Use ShadCN Dialog/Sheet component for modal structure
  - [ ] 3.24 Add search/filter if more than 20 objects (optional enhancement)

- [ ] **4.0 Implement Object-to-Layer Assignment**
  - [ ] 4.1 Update `objectsStore.ts` - Add `assignObjectsToLayer(objectIds: string[], layerId: string)` method
  - [ ] 4.2 Iterate over objectIds, call `updateObject()` for each with `{ layerId }` update
  - [ ] 4.3 Ensure updates sync to Firestore via existing `updateObject` flow
  - [ ] 4.4 Add bulk assignment support for multi-selected objects (use Feature 6 selection state)
  - [ ] 4.5 Update `ContextMenu.tsx` - Add "Move to Layer" submenu item
  - [ ] 4.6 Create submenu that lists all available layers (read from store)
  - [ ] 4.7 Add click handler for each layer option to call `assignObjectsToLayer()`
  - [ ] 4.8 Support single object assignment (clicked object) and bulk assignment (all selected)
  - [ ] 4.9 Show current layer with checkmark or different styling in submenu
  - [ ] 4.10 Update Layer component menu - wire "Manage Objects" to open `<LayerModal>` with current layer

- [ ] **5.0 Implement Visibility & Lock Inheritance**
  - [ ] 5.1 Update `selectionUtils.ts` - Extend `isObjectSelectable(object)` to accept optional `layer` parameter
  - [ ] 5.2 Implement AND logic: object selectable if `object.visible !== false AND layer.visible !== false`
  - [ ] 5.3 Add `isObjectEditable(object, layer)` function with AND logic: `object.locked !== true AND layer.locked !== true`
  - [ ] 5.4 Update `ObjectRenderer.tsx` - Read layers from store when rendering objects
  - [ ] 5.5 For each object, get its layer via `getLayerById(object.layerId)`
  - [ ] 5.6 Filter out objects where `!isObjectSelectable(object, layer)` before rendering
  - [ ] 5.7 Pass `isEditable` flag to shape components based on `isObjectEditable(object, layer)`
  - [ ] 5.8 Update `useShapeInteractions.ts` - Check `isObjectEditable()` before allowing drag/transform
  - [ ] 5.9 Add layer lock check in `handleDragStart` - prevent drag if layer locked
  - [ ] 5.10 Add layer visibility check in marquee selection - skip hidden layer objects

- [ ] **6.0 Integrate with Multi-Select & Context Menu**
  - [ ] 6.1 Update `Canvas.tsx` marquee logic - Read layers when calculating `getObjectsInBox()`
  - [ ] 6.2 Filter objects by `isObjectSelectable(object, layer)` before adding to selection
  - [ ] 6.3 Ensure marquee respects both object-level and layer-level visibility/lock
  - [ ] 6.4 Update bulk operations (move, delete, duplicate) - verify editable state before executing
  - [ ] 6.5 Update `PropertiesPanel.tsx` - Show layer name for single selected object
  - [ ] 6.6 Add layer info display: "Layer: {layerName}" (read-only, informational)
  - [ ] 6.7 Test bulk "Move to Layer" with multiple selected objects from different layers
  - [ ] 6.8 Verify context menu "Move to Layer" works for both single and multi-selection
  - [ ] 6.9 Test interaction: select objects → lock their layer → verify objects become non-editable
  - [ ] 6.10 Test interaction: hide layer → verify objects disappear and can't be selected

- [ ] **7.0 Add Default Layer Migration & Sync**
  - [ ] 7.1 Update `objectsService.ts` - Add `syncLayers(canvasId: string)` function
  - [ ] 7.2 Subscribe to `canvases/{canvasId}/layers` collection with real-time listener
  - [ ] 7.3 On snapshot update, call `objectsStore` to update layers array
  - [ ] 7.4 Add `createLayerInFirestore(canvasId: string, layer: Layer)` function
  - [ ] 7.5 Add `updateLayerInFirestore(canvasId: string, layerId: string, updates)` function
  - [ ] 7.6 Add `deleteLayerInFirestore(canvasId: string, layerId: string)` function
  - [ ] 7.7 Update `objectsStore.ts` - Add `initializeDefaultLayer()` method
  - [ ] 7.8 Check if Default Layer exists, create if missing with hardcoded DEFAULT_LAYER_ID
  - [ ] 7.9 Call `initializeDefaultLayer()` on canvas load (in subscription setup)
  - [ ] 7.10 Add migration logic: assign `layerId: DEFAULT_LAYER_ID` to objects missing layerId property
  - [ ] 7.11 Update Firestore security rules - allow authenticated users to read/write layers in their canvas
  - [ ] 7.12 Add localStorage persistence for `layerExpandedState` (load on init, save on change)

- [ ] **8.0 Visual Polish & Performance Optimization**
  - [ ] 8.1 Update `RightSidebar.tsx` - Replace LayersPlaceholder with `<LayerList>`
  - [ ] 8.2 Ensure 39% height allocation for layers section (existing 61/39 split)
  - [ ] 8.3 Add smooth expand/collapse animation for layers (<300ms transition)
  - [ ] 8.4 Add hover states for layer rows (subtle background change)
  - [ ] 8.5 Test performance: expand/collapse with 20+ layers (<16ms target)
  - [ ] 8.6 Test performance: LayerModal open with 100+ objects (<100ms target)
  - [ ] 8.7 Test performance: toggle layer visibility with 50+ objects (<50ms canvas update)
  - [ ] 8.8 Add icon styling: Eye/EyeOff from Lucide icons, Lock/Unlock icons
  - [ ] 8.9 Ensure LayerThumbnail renders correctly for nested objects (reuse from Feature 5B-2)
  - [ ] 8.10 Add keyboard accessibility: Enter to rename, Escape to cancel, Tab navigation
  - [ ] 8.11 Test with real-time sync: two users, one creates layer, verify other sees it
  - [ ] 8.12 Test undo/redo integration: create layer → undo → verify layer removed
  - [ ] 8.13 Verify Default Layer styling is distinct and cannot be deleted via UI
  - [ ] 8.14 Add empty state: "No layers yet" when only Default Layer exists (optional)
  - [ ] 8.15 End-to-end test: create layer → assign objects → lock layer → verify objects non-editable → delete layer → verify objects move to Default

---

**Estimated Effort:** 3-4 days  
**Status:** Ready for Implementation  
**Dependencies:** Feature 5B-1 (Toolbar Refactor) ✅, Feature 6 (Multi-Select) ✅

