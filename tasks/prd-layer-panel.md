# PRD: Layer Management Panel

**Feature ID**: Feature 5B  
**Status**: Ready for Implementation  
**Priority**: Medium  
**Effort**: Large (5-7 days)  
**Created**: 2025-10-19

---

## Overview

Photoshop-style layer management panel that organizes objects into named layers with visibility controls and drag-to-reorder functionality. Provides visual overview of canvas structure and quick access to layer operations.

## Goals

1. Organize objects into named layers (Photoshop-style)
2. Control layer visibility with eye icon (synced across users)
3. Drag-to-reorder z-index within and across layers
4. Collapsible layer groups for clean organization
5. Visual overview of entire canvas structure
6. Foundation for advanced layer features (locking, effects, etc.)

## User Stories

**As a canvas user:**
- I want to organize my objects into logical layers (e.g., "Background", "UI Elements", "Icons")
- I want to toggle layer visibility to focus on specific parts of my design
- I want to reorder layers and objects by dragging in the panel
- I want to see all objects at a glance in the layer panel
- I want to collapse layers I'm not actively working on

**As a collaborator:**
- I want to see when other users hide/show layers in real-time
- I want layer organization to be shared across all users
- I want to see what layers other users are working on

## Functional Requirements

### FR1: Layer Data Model
1. Add `layer` property to CanvasObject (string)
2. Default layer: `"Layer 1"` for new objects
3. Layers created implicitly when first object assigned
4. Layer metadata: name, visible, collapsed (in UI state only)

### FR2: Layer Panel UI
1. **Side panel** (right side, collapsible)
2. **Width**: 250-300px (resizable optional)
3. **Shows**: List of layers with nested objects
4. **Layer item**: Name, visibility toggle, object count, collapse/expand arrow
5. **Object item**: Type icon, truncated object description (e.g., "Rectangle 100x50")

### FR3: Visibility Toggle
1. **Eye icon** next to each layer
2. Click to toggle visibility (on/off)
3. Hidden layers: Objects invisible on canvas
4. **Synced across all users** (stored in Firestore or RTDB)
5. Hidden objects still selectable via layer panel (optional)

### FR4: Drag-to-Reorder
1. **Drag layer**: Reorder layer position (changes z-index of all objects in layer)
2. **Drag object within layer**: Change object's z-index within layer
3. **Drag object to different layer**: Move object to new layer, update z-index
4. Visual feedback: Drop indicator line, drag ghost

### FR5: Layer Collapse/Expand
1. Arrow icon next to layer name
2. Click to collapse (hide objects) or expand (show objects)
3. **UI state only** (not synced, per-user preference)
4. Default: All layers expanded

### FR6: Layer Selection
1. Click layer item: Select layer (highlight in panel, no canvas change)
2. Click object item: Select object on canvas and in panel
3. Selected object highlighted in both panel and canvas
4. Scroll to selected object in panel if off-screen

### FR7: Layer Context Menu (Optional)
1. Right-click layer: "Rename Layer" (future), "Delete Layer", "Duplicate Layer"
2. Right-click object: Same as canvas context menu
3. MVP: May defer complex actions to Phase 2

## Non-Functional Requirements

- Panel renders smoothly with 100+ objects
- Drag-to-reorder updates within 100ms
- Visibility toggle syncs to other users within 100ms
- Panel resizable and collapsible (doesn't block canvas)
- Keyboard navigation (up/down arrows, Enter to select)

## Technical Specifications

### Data Model Changes

**Extend CanvasObject**:
```typescript
interface CanvasObject {
  // ... existing properties
  layer: string;     // Default: "Layer 1"
  visible: boolean;  // Default: true (layer-level or object-level?)
}
```

**Layer Metadata** (extend objectsStore):
```typescript
interface LayerState {
  name: string;
  collapsed: boolean;  // UI only, per-user
  visible: boolean;    // Synced across users
}

// Extend existing objectsStore (src/features/objects/lib/objectsStore.ts)
interface ObjectsState {
  // ... existing object properties
  layers: Record<string, LayerState>;
  setLayerVisible: (layerName: string, visible: boolean) => void;
  setLayerCollapsed: (layerName: string, collapsed: boolean) => void;
}
```

### Architecture

**Extend Objects Feature** (not a separate feature):
```
src/features/objects/
  ├─ components/
  │   ├─ ObjectRenderer.tsx      (existing - add layer filtering)
  │   ├─ Rectangle.tsx            (existing)
  │   ├─ Circle.tsx               (existing)
  │   ├─ LayerPanel.tsx           (NEW - main panel)
  │   ├─ LayerItem.tsx            (NEW - individual layer)
  │   └─ ObjectItem.tsx           (NEW - object in panel)
  ├─ hooks/
  │   ├─ useObjects.ts            (existing - extend with layer operations)
  │   └─ useLayerDragDrop.ts      (NEW - drag/drop state)
  ├─ lib/
  │   └─ objectsStore.ts          (existing - extend with layer metadata)
  ├─ types/
  │   └─ index.ts                 (existing - extend with layer types)
  └─ index.ts
```

**Rationale**: Layers organize objects, not canvas viewport. The `layer` property lives on `CanvasObject`, and layer visibility is just filtering in `ObjectRenderer`. Keeping this together in the objects feature reduces cross-feature dependencies and keeps related logic cohesive.

### Core Implementation

**Visibility**: Layer-level toggle (all objects in layer hidden/shown together). Filter objects by layer visibility in ObjectRenderer.

**Drag-to-Reorder**: Use `@dnd-kit` library. Sortable layers and objects. Z-index ranges per layer (Layer 1 = 0-99, Layer 2 = 100-199, etc.)

**Panel Toggle**: Ctrl+Shift+L keyboard shortcut. Store panel visibility in canvas store.

## Implementation Plan

1. **Data Model & Store** (Day 1-2):
   - Add `layer` property to CanvasObject
   - Create layersStore with layer metadata
   - Migration: Assign all existing objects to "Layer 1"

2. **Basic Panel UI** (Day 2-3):
   - Create LayerPanel component (collapsible side panel)
   - Create LayerItem component (name, eye icon, arrow)
   - Create ObjectItem component (type icon, description)
   - Group objects by layer, render in list

3. **Visibility Toggle** (Day 3-4):
   - Implement eye icon click handler
   - Update layer visible state (synced to Firestore/RTDB)
   - Filter objects by visibility in ObjectRenderer
   - Test multi-user sync

4. **Collapse/Expand** (Day 4):
   - Implement arrow click handler
   - Toggle collapsed state (local UI only)
   - Show/hide object items in layer

5. **Drag-to-Reorder** (Day 4-6):
   - Integrate drag-drop library (@dnd-kit)
   - Implement layer reordering (recalculate z-indices)
   - Implement object reordering within layer
   - Implement drag object to different layer
   - Visual feedback (drop indicators, drag ghost)

6. **Selection Integration** (Day 6):
   - Click object in panel selects on canvas
   - Selected object highlights in panel
   - Scroll to selected object in panel

7. **Polish & Optimization** (Day 6-7):
   - Keyboard navigation (up/down arrows)
   - Panel resize/collapse animations
   - Performance optimization (virtualize list if >100 objects)
   - Multi-user testing

## Design Decisions

1. **Part of Objects Feature**: Not a separate feature
   - **Why**: Layers organize objects, `layer` property on CanvasObject, reduces cross-feature dependencies
   - **Alternative**: Separate feature (more boilerplate, tight coupling anyway)

2. **Layer-Level Visibility**: Single toggle per layer
   - **Why**: Simpler UX, clearer intent
   - **Alternative**: Per-object visibility (more complex)

3. **Collapsed State Not Synced**: Local UI preference
   - **Why**: Each user may want different view
   - **Alternative**: Sync collapsed state (too opinionated)

4. **Implicit Layer Creation**: Layers created when first object assigned
   - **Why**: No manual "create layer" step needed
   - **Alternative**: Explicit layer creation (more steps)

5. **Side Panel (Right)**: Layer panel on right side
   - **Why**: Standard in design tools (Figma, Photoshop)
   - **Alternative**: Left side or floating panel

6. **No Layer Renaming (MVP)**: Fixed layer names
   - **Why**: Simplifies MVP, can add later
   - **Trade-off**: Less flexible, acceptable for MVP

7. **Z-Index Ranges Per Layer**: Layers get 100-unit z-index ranges
   - **Why**: Clear separation, supports up to 20 layers
   - **Alternative**: Dynamic ranges (more complex calculation)

## Edge Cases

1. **All Layers Hidden**: Show "All layers hidden" message
2. **Drag to Hidden Layer**: Show confirmation or auto-show layer
3. **Empty Layer**: Keep empty layer or auto-delete (TBD)
4. **Name Collision**: Auto-increment (Layer 1, Layer 2, etc.)
5. **100+ Objects**: Virtualize list with react-window

## Integration Points

### With Feature 5A (Z-Index)
- Z-index determines order within layer
- Drag-to-reorder changes z-index
- "Bring to Front" moves to top of current layer

### With Feature 1 (Context Menu)
- Add "Move to Layer" submenu in context menu
- Show current layer in context menu

### With Feature 3 (Undo/Redo)
- Layer visibility changes recorded in history
- Drag-to-reorder recorded as z-index change
- Move to layer recorded in history

### With Feature 6 (Multi-Select)
- Select multiple objects in panel (Ctrl+Click)
- Drag multiple objects to different layer
- Hide/show multiple objects

## Success Criteria

- ✅ Layer panel displays all objects organized by layer
- ✅ Eye icon toggles layer visibility (synced across users)
- ✅ Drag-to-reorder layers and objects works smoothly
- ✅ Collapse/expand layers works (local UI state)
- ✅ Click object in panel selects on canvas
- ✅ Panel is resizable and collapsible
- ✅ Performance validated with 100+ objects
- ✅ No regressions in existing features

## Non-Goals (MVP)

- Layer renaming (fixed names for MVP)
- Object locking (prevent edits)
- Layer effects (blur, shadow, etc.)
- Layer grouping (nested layers)
- Object thumbnails in panel (just type icons)
- Layer blending modes
- Per-object visibility (only layer-level)
- Layer search/filter

## Future Enhancements

- Layer renaming with double-click
- Nested layer groups (folders)
- Object thumbnails in panel
- Layer search and filter
- Smart layer suggestions (AI-powered grouping)
- Layer templates (save/load layer structures)
- Layer effects and blending modes
- Per-object visibility override
- Layer locking (prevent accidental edits)
- Layer color coding
- Batch operations (select all in layer, duplicate layer)

