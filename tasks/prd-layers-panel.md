# Feature PRD: Layers Panel

**Feature ID:** 5B-2  
**Priority:** High  
**Estimated Effort:** 2-3 days  
**Dependencies:** Feature 5B-1 ✅  
**Status:** Ready for Implementation

---

## Overview

**Problem:** No visual representation of object stacking. Users can't see or manage layers.

**Solution:** Layer panel in right sidebar (bottom 39%) with:
- Layer list (front to back order)
- Drag-to-reorder
- Rename layers
- Toggle visibility
- Lock layers

**Success Criteria:**
- All objects in correct z-order
- Drag updates in <100ms
- Two-way selection sync (panel ↔ canvas)
- Real-time sync across users

---

## User Stories

**US1:** View all objects in z-order with thumbnails, names, and icons

**US2:** Drag layers to reorder (updates z-index)

**US3:** Click layer to select object (two-way sync)

**US4:** Double-click name to rename (inline edit, Enter/ESC, 50 char max)

**US5:** Eye icon toggles visibility (hidden = not rendered/selectable)

**US6:** Lock icon prevents all editing/interactions

---

## Technical Design

### Dependencies from 5B-1

**Required (must be complete):**
- ✅ RightSidebar (39% bottom section)
- ✅ SidebarPanel (reusable wrapper)
- ✅ objectsStore layer state
- ✅ ShadCN Tooltip, ScrollArea, Button, Input

### New Components

```
src/features/objects/
  ├── components/
  │   ├── RightSidebar.tsx          ← UPDATE (one line)
  │   ├── LayerPanel.tsx            ← NEW
  │   ├── LayerItem.tsx             ← NEW
  │   └── LayerThumbnail.tsx        ← NEW
  ├── lib/objectsStore.ts           ← UPDATE
  └── types/index.ts                ← UPDATE

src/features/objects/components/
  ├── ObjectRenderer.tsx            ← UPDATE (filter hidden)
  ├── Rectangle.tsx                 ← UPDATE (locked state)
  └── Circle.tsx                    ← UPDATE (locked state)
```

### Data Model

**CanvasObject Extension:**
```typescript
interface CanvasObject {
  // ... existing
  order: number;           // existing
  
  // NEW (all optional, backwards compatible)
  name?: string;           // default: auto-generated
  visible?: boolean;       // default: true
  locked?: boolean;        // default: false
}
```

**objectsStore Methods:**
```typescript
reorderLayer: (draggedId: string, targetId: string) => void;
toggleLayerVisibility: (id: string) => void;
toggleLayerLock: (id: string) => void;
```

---

## Implementation Patterns

### LayerPanel
- Sort objects by order desc (front to back)
- Map to LayerItem components
- Track drag state (draggedId, dropTargetId)
- Empty state when no objects
- Uses SidebarPanel wrapper from 5B-1

### LayerItem
- Uses ShadCN Button (icons), Tooltip (hints), Input (rename)
- Draggable with HTML5 drag-drop
- Auto-generated name: `${capitalize(type)} ${id.slice(0,4)}`
- Click → select, Double-click → edit name
- Eye/Lock buttons with tooltips

### LayerThumbnail
- 32x32 canvas preview
- useEffect to draw scaled shape
- Supports rectangle and circle

### ObjectRenderer Update
```typescript
const visibleObjects = useMemo(() =>
  [...objects]
    .filter(obj => obj.visible !== false)
    .sort((a, b) => a.order - b.order),
  [objects]
);
```

### Shape Components Update
- Add `isLocked` prop
- Disable all handlers if locked
- Show lock emoji when locked + selected

---

## Integration with RightSidebar

**One line change:**
```typescript
// BEFORE: import { LayersPlaceholder } from './LayersPlaceholder';
// AFTER:  import { LayerPanel } from './LayerPanel';

// Then replace <LayersPlaceholder /> with <LayerPanel />
```

---

## Migration Strategy

**Day 1 AM:** Update CanvasObject type, add store methods  
**Day 1 PM - Day 2:** Create LayerThumbnail, LayerItem, LayerPanel  
**Day 2 PM:** Update RightSidebar, ObjectRenderer, shape components  
**Day 3:** Testing, edge cases, docs

---

## Sync Strategy

All operations use existing `updateObject()` infrastructure:
- Rename → `updateObject({name})`
- Visibility → `updateObject({visible})`
- Lock → `updateObject({locked})`
- Reorder → `updateObject({order})`

Real-time sync and history automatic via existing patterns.

---

## Testing Checklist

**Display:**
- [ ] Objects in correct z-order
- [ ] Thumbnails render correctly
- [ ] Selected layer highlighted
- [ ] Empty state when no objects

**Interactions:**
- [ ] Drag-to-reorder works
- [ ] Click layer selects on canvas
- [ ] Double-click enables rename
- [ ] Enter saves, ESC cancels
- [ ] Eye toggles visibility
- [ ] Lock toggles locked state

**Sync:**
- [ ] All changes sync to other users
- [ ] Canvas selection updates panel
- [ ] Hidden objects not rendered
- [ ] Locked objects not editable

**History:**
- [ ] Undo/redo for all operations

---

## Edge Cases

1. No objects → Show empty state
2. All hidden → Panel shows all with eye-off icons
3. Select hidden via panel → Disallow (or auto-show)
4. Edit locked → Disable properties/context menu
5. Long names → Truncate with ellipsis

---

## Reusable Components

**From 5B-1:** SidebarPanel, Tooltip, ScrollArea, Button, Input  
**New:** LayerPanel, LayerItem, LayerThumbnail

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Requires:** Feature 5B-1 complete first
