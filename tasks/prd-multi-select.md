# Feature PRD: Multi-Select

**Feature ID:** 6  
**Priority:** High  
**Estimated Effort:** 3-4 days  
**Dependencies:** Feature 5B-1 ✅, Feature 5B-2 (Layers Panel recommended)  
**Status:** Ready for Implementation

---

## 1. Introduction/Overview

Users currently can only select and manipulate one object at a time. This creates inefficiency when working with multiple related objects that need to be moved, deleted, or styled together.

This feature adds multi-select capability via a **marquee selection** system (click+drag on empty canvas), allowing users to efficiently work with multiple objects simultaneously through the existing context menu and properties panel.

**Key Principle:** Maximize reuse of existing components (ContextMenu, PropertiesPanel, useShapeInteractions) rather than introducing new UI paradigms.

---

## 2. Goals

1. **Enable efficient bulk operations** - Move, delete, duplicate, and style multiple objects at once
2. **Maintain simplicity** - Use existing UI patterns (context menu, properties panel) rather than adding complexity
3. **Preserve performance** - Support up to 100 selected objects without lag
4. **Integrate seamlessly** - Work with existing features (layers panel, history, context menu)
5. **Follow existing patterns** - Extend objectsStore, reuse components, maintain Last-Write-Wins sync

---

## 3. User Stories

**US1: Marquee Selection**  
As a user, I want to click and drag on empty canvas to draw a selection box, so that all objects intersecting the box are selected when I release.

**US2: Single Click Selection**  
As a user, I want to click an object to select only that object (clearing other selections), so that I can focus on one item.

**US3: Bulk Move**  
As a user, I want to drag any selected object to move all selected objects together (maintaining relative positions), so that I can reposition groups efficiently.

**US4: Bulk Delete**  
As a user, I want to right-click any selected object and choose "Delete All" from the context menu, so that I can remove multiple objects at once.

**US5: Bulk Duplicate**  
As a user, I want to right-click selected objects and choose "Duplicate All" to create copies with an offset, so that I can quickly replicate groups.

**US6: Bulk Copy/Paste**  
As a user, I want to right-click selected objects and copy them, then paste to create duplicates, so that I can use familiar copy/paste patterns.

**US7: Bulk Property Changes**  
As a user, I want to see a multi-select properties panel that lets me change fill/stroke for all selected objects, so that I can style groups consistently.

**US8: Visual Feedback**  
As a user, I want to see clear visual indication of which objects are selected (selection count, highlighted borders), so that I understand the current state.

**US9: Deselect via Canvas Click**  
As a user, I want to click empty canvas to clear all selections, so that I can easily start fresh.

**US10: Integration with Layers**  
As a user, I want clicking a layer in the layers panel to update canvas selection, so that I can select objects via either interface.

---

## 4. Functional Requirements

### 4.1 Selection State
1. System MUST maintain a `selectedIds: string[]` array in objectsStore
2. Selection state MUST be local only (not synced across users)
3. System MUST support up to 100 selected objects without performance degradation
4. System MUST filter out hidden and locked objects from marquee selection

### 4.2 Marquee Selection
5. User MUST be able to click+drag on empty canvas to create selection box
6. Selection box MUST use intersecting mode (objects touching box are selected)
7. Marquee MUST be throttled to 60 FPS for smooth rendering
8. System MUST select all visible, unlocked objects intersecting marquee on release
9. Clicking empty canvas MUST clear all selections

### 4.3 Click Selection
10. Clicking an object MUST select only that object (clear others)
11. System MUST respect locked state (locked objects can be selected but not modified)
12. System MUST respect visibility (hidden objects cannot be selected)

### 4.4 Bulk Operations
13. Dragging one selected object MUST move all selected objects maintaining relative positions
14. Context menu MUST show "Delete All" when multiple objects selected
15. Context menu MUST show "Duplicate All" when multiple objects selected  
16. Context menu MUST show "Copy" when multiple objects selected
17. System MUST support paste operation creating all copied objects with offset
18. All bulk operations MUST use existing Last-Write-Wins conflict resolution

### 4.5 Properties Panel Integration
19. Properties panel MUST show "{count} objects selected" when multiple selected
20. Properties panel MUST show shared property controls (fill, stroke, etc.)
21. Changing a property MUST apply to all selected objects
22. System MUST only show properties that are applicable to all selected object types

### 4.6 Visual Feedback
23. Selected objects MUST show selection indicators (transformer handles)
24. Selection count MUST be visible in properties panel
25. Marquee box MUST render during drag with semi-transparent fill and border

### 4.7 History Integration
26. Bulk operations MUST create single undo/redo entry
27. Undo MUST restore previous selection state
28. System MUST group bulk changes by timestamp window (<100ms)

---

## 5. Non-Goals (Out of Scope)

1. **Keyboard shortcuts** - No Shift+click, Ctrl+click, Ctrl+A, Esc, Delete keys
2. **Additive selection** - No modifier keys to add/remove from selection  
3. **Select-all functionality** - Use marquee to select multiple objects
4. **Keyboard-driven deselect** - Use canvas click to deselect
5. **Group/ungroup** - Logical grouping is a separate feature (Feature 7)
6. **Alignment tools** - Align/distribute is future enhancement
7. **Shared selection state** - Selection is local per user, not synced
8. **Smart selection** - No pattern matching or "select similar" functionality

---

## 6. Design Considerations

### 6.1 Component Reuse
- **ContextMenu**: Extend to detect `selectedIds.length > 1` and show bulk actions
- **PropertiesPanel**: Update to handle multiple selections with shared controls
- **useShapeInteractions**: Already handles click selection, just wire to new store state
- **objectsStore**: Extend with `selectedIds` array and bulk operation methods

### 6.2 New Components (Minimal)
- **SelectionBox**: Simple visual marquee (blue border, semi-transparent fill)
- **selectionUtils.ts**: Bounds checking utilities for marquee intersection

### 6.3 Visual Design
- Marquee: `border-2 border-blue-500 bg-blue-100 bg-opacity-20`
- Multi-select indicator: Show count in properties panel header
- Selected objects: Use existing transformer/selection visual (no changes)

### 6.4 UX Flow
1. User drags on empty canvas → marquee appears
2. User releases → objects intersecting marquee are selected
3. User drags selected object → all selected objects move together
4. User right-clicks → context menu shows bulk actions
5. User clicks empty canvas → selection clears

---

## 7. Technical Considerations

### 7.1 Architecture
- Follow existing vertical slicing pattern
- Add selection state to objectsStore (local, not persisted)
- Extend existing components rather than create new UI
- Use existing sync infrastructure for object updates

### 7.2 Performance
- Throttle marquee updates to 16ms (60 FPS)
- Use existing debounce for bulk move persistence (300ms)
- Optimize bounds checking with bounding box intersection
- Limit selection to 100 objects maximum

### 7.3 Conflict Resolution
- Follow existing Last-Write-Wins (LWW) strategy
- Each bulk operation updates timestamps per object
- No special multi-select sync needed (uses existing updateObject flow)

### 7.4 Integration Points
- **Canvas**: Add marquee interaction handlers (mousedown, mousemove, mouseup)
- **objectsStore**: Add selectedIds array, selection methods, bulk operations
- **ContextMenu**: Detect multi-select, show bulk actions
- **PropertiesPanel**: Detect multi-select, show bulk controls
- **Layers Panel**: Wire click to selectObject method

### 7.5 Dependencies
- Feature 5B-1: RightSidebar, PropertiesPanel structure ✅
- Feature 5B-2: Layers Panel integration (recommended, not blocking)
- Existing: ContextMenu, useShapeInteractions, objectsStore

---

## 8. Success Metrics

### 8.1 Performance Metrics
- Marquee selection responds at 60 FPS (no visible lag)
- Bulk move of 50 objects syncs in <100ms
- Selection of 100 objects completes in <50ms

### 8.2 Functionality Metrics
- All bulk operations work with undo/redo
- No regressions in single-object interactions
- Context menu correctly detects multi-select state

### 8.3 Integration Metrics
- Layers panel selection syncs bidirectionally
- Properties panel correctly shows shared controls
- Last-Write-Wins conflict resolution works with bulk operations

---

## 9. Open Questions

1. **Marquee visual style** - Should we match Figma's marquee (blue) or use brand colors?
   - *Recommendation: Blue (#3B82F6) is industry standard*

2. **Maximum selection count** - Hard limit at 100 or soft limit with warning?
   - *Recommendation: Soft limit, show warning but allow selection*

3. **Bulk property changes** - Show all properties or only shared ones?
   - *Recommendation: Only shared properties to avoid confusion*

4. **Copy/paste offset** - How much offset for pasted objects?
   - *Recommendation: 20px x/y offset (consistent with duplicate)*

5. **Selection persistence** - Should selection clear on tool change (e.g., switch to rectangle tool)?
   - *Recommendation: Yes, clear selection when creating new objects*

---

**File Updates Required:**

**NEW FILES:**
- `src/features/objects/components/SelectionBox.tsx`
- `src/features/objects/lib/selectionUtils.ts`

**UPDATE FILES:**
- `src/features/objects/lib/objectsStore.ts` - Add selection state and methods
- `src/features/objects/types/index.ts` - Add selection types
- `src/features/canvas/components/Canvas.tsx` - Add marquee handlers
- `src/features/objects/components/ContextMenu.tsx` - Add bulk actions
- `src/features/objects/components/PropertiesPanel.tsx` - Add multi-select UI
- `src/features/objects/components/ObjectRenderer.tsx` - Wire selection state
- `src/features/objects/hooks/useObjects.ts` - Add bulk operation hooks

**INTEGRATION (Optional but recommended):**
- `src/features/objects/components/LayerPanel.tsx` - Wire click to selection (requires 5B-2)

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Next Feature:** Group/Ungroup (Feature 7)

