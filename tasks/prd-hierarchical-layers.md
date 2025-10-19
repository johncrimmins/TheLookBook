# Feature PRD: Hierarchical Layers System

**Feature ID:** 7  
**Priority:** High  
**Estimated Effort:** 3-4 days  
**Dependencies:** Feature 5B-1 ✅, Feature 6 (Multi-Select) ✅  
**Status:** Ready for Implementation

---

## 1. Introduction/Overview

Users currently see a flat list where every object appears as its own row. This becomes cluttered with many objects and lacks organizational structure.

This feature introduces a **hierarchical layer system** where layers are organizational groups containing multiple objects. Users can create layers, assign objects to layers, and control visibility/lock state at the layer level—similar to Photoshop.

**Key Principle:** Layers are optional. Users can work without layers (everything in Default Layer) or use them for organization. Layers don't affect z-index/stacking.

---

## 2. Goals

1. **Enable organization** - Group related objects into named layers
2. **Layer-level controls** - Hide/lock entire groups at once
3. **Maintain flexibility** - Layers are optional organizational tools
4. **Integrate with multi-select** - Layer visibility/lock affects selection
5. **Photoshop-inspired UX** - Familiar patterns from design tools

---

## 3. User Stories

**US1:** Default Layer automatically contains all new objects  
**US2:** Create layers via "+ New Layer" button or right-click menu  
**US3:** Double-click layer name to rename inline (Enter saves, Escape cancels)  
**US4:** Click layer to expand/collapse object list  
**US5:** Click layer menu icon (⋯) to open modal for managing objects (checkboxes)  
**US6:** Right-click object → "Move to Layer" → select from submenu  
**US7:** Toggle eye icon to hide layer (all objects disappear, non-selectable)  
**US8:** Toggle lock icon to lock layer (objects selectable but not editable)  
**US9:** Delete non-Default layers (objects move to Default Layer)  
**US10:** See 32x32 thumbnails for objects within expanded layers

---

## 4. Functional Requirements

### 4.1 Layer Entity
1. System MUST create "Default Layer" automatically (cannot be deleted/renamed)
2. Layer properties: `id`, `name`, `visible`, `locked`, `expanded` (local UI state)
3. Inline editing: double-click, Enter/Escape, 50 char max
4. Auto-generated names: "Layer 2", "Layer 3", etc.

### 4.2 Object Assignment
5. All new objects MUST be assigned to Default Layer
6. Objects MUST have `layerId` property
7. Two assignment methods: right-click menu + modal with checkboxes
8. Support moving multiple selected objects to layer simultaneously

### 4.3 Layer Management
9. Create layers via "+ New Layer" button at panel bottom
10. Delete non-Default layers via menu (⋯) → "Delete Layer"
11. Deleting layer MUST move objects to Default Layer (not delete objects)
12. Prevent deletion of Default Layer

### 4.4 Visibility & Lock Inheritance
13. Hidden layer → all objects hidden (not rendered, not selectable)
14. Locked layer → all objects locked (selectable but not editable)
15. AND logic: `object.visible !== false AND layer.visible !== false`
16. AND logic: `object.locked !== true AND layer.locked !== true`
17. Multi-select marquee MUST skip objects in hidden/locked layers

### 4.5 Visual Structure
18. Hierarchical list: layers containing objects
19. Expandable/collapsible (click layer name or arrow icon)
20. Expanded: show nested object rows with thumbnails
21. Object rows: thumbnail + name + visibility + lock icons
22. Collapsed: show count: "Layer 1 (5 objects)"
23. Use ScrollArea for overflow

### 4.6 Integration with Multi-Select (Feature 6)
24. Layer visibility/lock affects multi-select logic
25. Clicking object in panel selects it on canvas
26. Multi-select operations respect layer membership
27. Bulk "Move to Layer" works for multiple selected objects

### 4.7 Sync & Persistence
28. Layer entities sync to Firestore (real-time collaboration)
29. Object `layerId` syncs via existing `updateObject` flow
30. Layer `expanded` state local only (localStorage)
31. Use Last-Write-Wins conflict resolution

---

## 5. Non-Goals (Out of Scope)

- Layer reordering (layers don't affect z-index)
- Nested layers (only 2 levels: Layer → Objects)
- Layer colors/icons/blending modes/effects
- Keyboard shortcuts for layer operations
- Layer linking or smart layers

---

## 6. Design Considerations

### Component Reuse (from Feature 5B-2)
- LayerThumbnail.tsx (32x32 previews)
- Inline rename logic patterns
- ShadCN components (Tooltip, ScrollArea, Button, Input)
- SidebarPanel.tsx wrapper

### New Components
- Layer.tsx - Single layer row (expandable, controls)
- LayerList.tsx - Hierarchical display
- LayerModal.tsx - Object assignment modal
- CreateLayerButton.tsx - "+ New Layer" button

### Visual Design (Photoshop-inspired)
- Layer row: Indent 0, bold, arrow (▶/▼)
- Object row: Indent 16px, thumbnail + name + icons
- Default Layer: Top position, background #f9fafb
- Collapsed: Show count badge
- Icons: Eye/EyeOff, Lock/Unlock, ⋯

---

## 7. Technical Considerations

### Data Model
```typescript
interface Layer {
  id: string;
  name: string;
  visible: boolean;      // default: true
  locked: boolean;       // default: false
  expanded: boolean;     // local only
  createdAt: number;
  updatedAt: number;
}

interface CanvasObject {
  // ... existing
  layerId: string;       // NEW
}
```

### Architecture
- **Recommendation:** Extend objectsStore (not new feature slice)
- Simpler imports, tightly coupled with objects

### Firestore Schema
```
canvases/{canvasId}/layers/{layerId}
canvases/{canvasId}/objects/{objectId}
  - layerId: string (NEW)
```

### Computed Properties
```typescript
const isVisible = object.visible !== false && layer.visible !== false;
const isEditable = object.locked !== true && layer.locked !== true;
const isSelectable = isVisible && !layer.locked;
```

### Integration Points
- objectsStore: Add layer state, CRUD methods, layer-aware filtering
- ObjectRenderer: Filter by layer visibility
- useShapeInteractions: Check layer lock state
- ContextMenu: Add "Move to Layer" submenu
- Multi-select: Filter marquee by layer state

### Migration Strategy
1. Create Default Layer on canvas load
2. Assign existing objects to Default Layer
3. Backwards compatible: no `layerId` → auto-assign to Default

---

## 8. Success Metrics

**Functionality:**
- Default Layer exists, contains new objects
- Create, rename, delete layers works
- Object assignment works (both methods)
- Layer visibility/lock affects child objects
- Multi-select respects layer state

**Performance:**
- Expand/collapse: <16ms
- Modal opens: <100ms (100+ objects)
- Visibility toggle: <50ms canvas update
- No degradation with 20+ layers

**Integration:**
- Real-time sync for layer CRUD
- Undo/redo works
- Multi-select bulk operations work
- No regressions in object operations

---

## 9. Open Questions

1. **Default Layer naming** - "Default Layer" or "Layer 1"? → *"Default Layer"*
2. **Empty layer deletion** - Auto-delete or manual? → *Manual*
3. **Layer menu** - Always visible or hover? → *Always visible*
4. **Assignment priority** - Right-click or modal? → *Right-click for single, modal for bulk*
5. **Object count** - Show always or collapsed only? → *Collapsed only*

---

**Files:**

**NEW:** Layer.tsx, LayerList.tsx, LayerModal.tsx, CreateLayerButton.tsx, types/layer.ts

**UPDATE:** objectsStore.ts, types/index.ts, RightSidebar.tsx, ObjectRenderer.tsx, ContextMenu.tsx, useShapeInteractions.ts, objectsService.ts

**REUSE:** LayerThumbnail.tsx, rename logic, ShadCN components

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Build After:** Feature 6 (Multi-Select)
