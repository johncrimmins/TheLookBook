# PRD: Multi-Object Selection

**Feature ID**: Feature 6  
**Status**: Ready for Implementation  
**Priority**: High  
**Effort**: Large (5-7 days)  
**Created**: 2025-10-19

---

## Overview

Enable users to select and manipulate multiple objects simultaneously. Supports Ctrl+Click to add/remove from selection and drag-to-select (marquee) for area selection. Selected objects transform as a unified group with visible selection indicators per user.

## Goals

1. Multi-select with Ctrl+Click (add/remove individual objects)
2. Drag-to-select with marquee rectangle (area selection)
3. Group transform behavior (unified bounding box)
4. Per-user selection state (synced across users with visual indicators)
5. Extend existing features (duplicate, copy/paste, delete) to work on groups
6. Foundation for advanced group operations (grouping, alignment, distribution)

## User Stories

**As a canvas user:**
- I want to Ctrl+Click objects to select multiple at once
- I want to drag a selection rectangle to select all objects in an area
- I want to transform multiple objects together as a group
- I want to duplicate/copy/paste/delete multiple objects at once
- I want to see which objects other users have selected

**As a collaborator:**
- I want to see other users' selections with their unique colors
- I want my multi-select to not interfere with others' work

## Functional Requirements

### FR1: Selection Methods
1. **Ctrl+Click**: Add/remove individual object from selection
2. **Click empty canvas**: Deselect all
3. **Drag-to-select** (marquee): Select all intersecting objects
4. **Shift+Click** (optional): Range selection in layer panel

### FR2: Selection State
1. Replace `selectedObjectId` (string) with `selectedObjectIds` (array) in **objectsStore**
2. Per-user selection tracked in objects store + RTDB
3. Empty selection = `[]`
4. Selection persists until cleared or new selection made

### FR3: Visual Indicators
1. **Current user**: Standard selection highlight (existing)
2. **Other users**: Colored outline per user (use presence color)
3. **Marquee**: Dashed rectangle while dragging
4. **Transform handles**: Unified bounding box for group

### FR4: Group Transform
1. Konva Transformer accepts array of nodes (already supported)
2. Single bounding box encompasses all selected objects
3. Resize: Scale all objects proportionally from group center
4. Rotate: Rotate all objects around group center
5. Drag: Move all objects together (maintain relative positions)

### FR5: Extended Operations
1. **Duplicate** (Ctrl+D): Duplicate all selected, maintain relative positions
2. **Copy/Paste**: Copy all selected, paste as group
3. **Delete**: Delete all selected objects
4. **Context Menu**: Apply property changes to all selected
5. **Z-Index**: Bring to front/back applies to all selected (maintain relative z-indices)

### FR6: Selection Sync
1. Broadcast selection state to RTDB (per-user path: `selections/{canvasId}/{userId}`)
2. Other users subscribe to all selections
3. Render colored outlines for other users' selections
4. Selection is lightweight (just object IDs), not heavy sync

## Non-Functional Requirements

- Selection updates within 50ms locally
- Selection sync to other users within 100ms
- Smooth marquee rendering (60fps)
- Works with 100+ objects without lag
- Keyboard accessible (Tab to cycle, Space to toggle)

## Technical Specifications

### Data Model Changes

**Extend Objects Store** (not canvas store):
```typescript
interface ObjectsState {
  // ... existing object properties
  
  // Replace single ID with array
  selectedObjectIds: string[];  // Current user's selection
  
  // Other users' selections
  otherUsersSelections: Record<string, {
    userId: string;
    userName: string;
    objectIds: string[];
    color: string;  // From presence color
  }>;
  
  setSelectedObjectIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}
```

**Rationale**: Selection is about **objects**, not viewport. Objects feature owns object data and operations, so it should own selection state too.

**RTDB Selection Sync**:
```typescript
// Path: selections/{canvasId}/{userId}
interface SelectionData {
  userId: string;
  objectIds: string[];
  timestamp: number;
}
```

### Architecture

**Extend Objects Feature**:
```typescript
// src/features/objects/hooks/useObjectSelection.ts (NEW)
export function useObjectSelection(canvasId: string) {
  // Handle Ctrl+Click selection
  // Handle marquee drag-to-select
  // Sync to RTDB
  // Subscribe to other users' selections
}
```

**Canvas Integration**:
```typescript
// src/features/canvas/components/SelectionMarquee.tsx (NEW)
// Renders marquee rectangle during drag-to-select
// Calls objectsStore.setSelectedObjectIds() on drag end
```

### Core Implementation

**Ctrl+Click**: Check Ctrl key on click, add/remove from selection array. Replace selection if Ctrl not held.

**Marquee**: Track drag start/end, calculate intersecting objects, set as selection on drag end.

**Group Transform**: Konva Transformer already supports array of nodes. Pass `selectedObjectIds.map()` to transformer.

**Selection Sync**: Broadcast to RTDB path `selections/{canvasId}/{userId}`. Subscribe to all users' selections, render colored outlines.

## Implementation Plan

1. **Data Model** (Day 1-2):
   - Replace `selectedObjectId` with `selectedObjectIds` (array) in **objectsStore**
   - Update all references throughout codebase
   - Add selection methods to objects store (add/remove/toggle/clear)

2. **Ctrl+Click Selection** (Day 2):
   - Update click handlers to check Ctrl key
   - Implement add/remove/toggle logic
   - Test with multiple objects

3. **Visual Indicators** (Day 2-3):
   - Render multiple transformers or single group transformer
   - Test group transform (move, resize, rotate)
   - Verify relative positions maintained

4. **Marquee Selection** (Day 3-4):
   - Create SelectionMarquee component
   - Track mouse drag on canvas
   - Calculate intersecting objects
   - Render dashed rectangle

5. **Selection Sync** (Day 4-5):
   - Broadcast selection to RTDB
   - Subscribe to other users' selections
   - Render colored outlines for other users
   - Test multi-user scenarios

6. **Extend Operations** (Day 5-6):
   - Update duplicate to handle multiple objects
   - Update copy/paste to handle groups
   - Update delete to handle multiple objects
   - Update context menu to batch-apply changes

7. **Polish & Testing** (Day 6-7):
   - Keyboard navigation improvements
   - Performance optimization
   - Edge case handling
   - Multi-user testing

## Design Decisions

1. **Per-User Selection**: Each user has own selection, not shared
   - **Why**: Allows independent work, no conflicts
   - **Visual**: Other users' selections visible but distinct

2. **Ctrl+Click Standard**: Use Ctrl (not Shift) for multi-select
   - **Why**: Standard in most design tools
   - **Alternative**: Shift+Click (less common)

3. **Group Transform**: Unified bounding box
   - **Why**: Intuitive, maintains relationships
   - **Alternative**: Transform each individually (confusing)

4. **Marquee Intersecting**: Select any object touching marquee
   - **Why**: Faster selection, forgiving
   - **Alternative**: Fully contained only (too strict)

5. **Selection State in Objects Store**: Not canvas store
   - **Why**: Selection is about objects, not viewport. Objects feature owns object operations.
   - **Integration**: SelectionMarquee (canvas) calls objectsStore methods

6. **Relative Positions Maintained**: Group transforms preserve spacing
   - **Why**: Maintains design relationships
   - **Alternative**: Independent transforms (breaks layouts)

## Edge Cases

1. **Empty Selection Transform**: No objects selected, user tries to transform
   - **Solution**: No-op, transformer not visible

2. **Mixed Layer Selection**: Objects from different layers selected
   - **Solution**: Allow, treat as flat group

3. **Selection Across Hidden Layers**: Some selected objects' layers hidden
   - **Solution**: Hidden objects still in selection, but invisible

4. **Delete Selected Objects Another User is Transforming**:
   - **Solution**: Deletion wins (existing behavior), other user's transform fails gracefully

5. **Marquee Over Empty Canvas**: No objects intersect
   - **Solution**: Clear selection (empty array)

## Integration Points

### With Feature 2 (Duplicate)
- Duplicate all selected objects
- Maintain relative positions and z-indices
- All duplicates offset by +20px X/Y as a group

### With Feature 3 (Undo/Redo)
- Multi-object operations recorded as single action
- Undo delete restores entire group
- Undo transform restores all objects' previous states

### With Feature 4 (Copy/Paste)
- Copy all selected objects to clipboard
- Paste maintains relative positions
- Clipboard stores array of objects

### With Feature 1 (Context Menu)
- Property changes apply to all selected objects
- Show indicator: "3 objects selected"
- Batch update for efficiency

### With Feature 5A (Z-Index)
- Bring to front/back applies to all selected
- Maintains relative z-index offsets within group

### With Feature 5B (Layer Panel)
- Multi-select in panel with Ctrl+Click
- Drag multiple objects to different layer
- Visual selection highlight in panel

## Success Criteria

- ✅ Ctrl+Click adds/removes objects from selection
- ✅ Drag-to-select marquee works smoothly
- ✅ Multiple objects transform as unified group
- ✅ Selection state syncs to other users with colored outlines
- ✅ Duplicate, copy/paste, delete work on groups
- ✅ Context menu applies changes to all selected
- ✅ Performance validated with 100+ objects
- ✅ No regressions in single-object selection

## Non-Goals (MVP)

- Shift+Click range selection
- Select all keyboard shortcut (Ctrl+A)
- Invert selection
- Select by criteria (all rectangles, all red objects)
- Selection groups/saved selections
- Alignment tools (align left, distribute evenly)
- Smart guides during group transform

## Future Enhancements

- Permanent grouping (create group entity)
- Alignment and distribution tools
- Select all (Ctrl+A) / Select none (Ctrl+Shift+A)
- Select similar (same color, same size, same type)
- Smart snapping during group transform
- Selection history (previous/next selection)
- Named selections (save selection as "Header Elements")

