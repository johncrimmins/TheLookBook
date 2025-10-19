# PRD: Duplicate Object

**Feature ID**: Feature 2  
**Status**: Ready for Implementation  
**Priority**: High  
**Effort**: Small (1-2 days)  
**Created**: 2025-10-19

---

## Overview

Enable users to quickly duplicate selected objects with a keyboard shortcut (Ctrl+D). Duplicated object appears offset from original and is automatically selected.

## Goals

1. Quick object duplication with standard keyboard shortcut
2. Maintain all object properties (color, size, rotation)
3. Real-time sync across all users (<100ms)
4. Clear visual feedback
5. Foundation for multi-select duplication (Feature 6)

## User Stories

**As a canvas user:**
- I want to quickly duplicate an object with Ctrl+D
- I want the duplicate to appear near the original so I can see both
- I want the duplicate automatically selected for immediate manipulation

**As a collaborator:**
- I want to see when another user duplicates an object in real-time

## Functional Requirements

### FR1: Keyboard Shortcut
1. **Ctrl+D** (Windows/Linux), **Cmd+D** (Mac)
2. Only active when object selected
3. No-op when no selection
4. Prevent default browser behavior (bookmark dialog)

### FR2: Duplication Behavior
1. Duplicate offset by **+20px X, +20px Y**
2. All properties copied: type, width, height, rotation, fill, opacity
3. New unique ID (UUID)
4. `createdBy` = current user
5. New timestamps (`createdAt`, `updatedAt`)

### FR3: Selection
1. Duplicated object becomes selected
2. Original deselected
3. Transformer attached to duplicate
4. User can immediately drag/transform

### FR4: Real-Time Sync
1. Use existing `createObject` service (no new sync logic)
2. Optimistic local update (instant)
3. Persist to Firestore
4. Broadcast to RTDB
5. Other users see within 100ms

### FR5: Visual Feedback
1. Optional: Brief animation on duplicate (pulse/scale)
2. Cursor stays in same position
3. No viewport change

## Non-Functional Requirements

- Duplication completes within 100ms
- No perceived lag
- Works with all object types
- Consistent with industry standards (Figma, Sketch)

## Technical Specifications

### Integration Points
- **Canvas Component**: Detect Ctrl+D keyboard event
- **useObjects Hook**: Use existing `createObject` method
- **Objects Store**: Update `selectedObjectId` to new duplicate (selection state lives in objects store)

### Data Flow
```
User presses Ctrl+D
  → Canvas detects keydown
  → Get selected object from store
  → Create duplicate data (new ID, offset position)
  → Call createObject(duplicateData)
  → useObjects: local update → Firestore → RTDB
  → Update selectedObjectId to duplicate
  → Transformer attaches
```

### Code Implementation

**Keyboard Event Handler** (Canvas component):
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      handleDuplicateObject();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleDuplicateObject]);
```

**Duplicate Logic**:
```typescript
const handleDuplicateObject = useCallback(() => {
  if (!selectedObjectId || !objectsMap[selectedObjectId]) return;
  
  const original = objectsMap[selectedObjectId];
  const duplicateParams = {
    type: original.type,
    x: original.position.x + 20,
    y: original.position.y + 20,
    width: original.width,
    height: original.height,
    fill: original.fill,
  };
  
  createObject(duplicateParams).then((newObject) => {
    setSelectedObjectId(newObject.id);
  });
}, [selectedObjectId, objectsMap, createObject, setSelectedObjectId]);
```

## Implementation Plan

**Phase 1** (Day 1, ~2 hours): Keyboard event detection
- Add keyboard listener
- Detect Ctrl+D / Cmd+D
- Prevent default behavior
- Test detection

**Phase 2** (Day 1, ~3 hours): Core logic
- Implement handleDuplicateObject
- Get selected object
- Calculate offset position
- Call createObject
- Update selection

**Phase 3** (Day 2, ~2 hours): Testing
- Test with Rectangle and Circle
- Test rapid duplication
- Test near boundaries
- Test with no selection
- Test multi-user sync

**Phase 4** (Day 2, ~1 hour): Visual polish
- Optional animation
- Verify transformer attaches immediately

**Phase 5** (Day 2, ~1 hour): Context menu integration
- Enable "Duplicate" action in context menu (Feature 1)
- Wire to same handleDuplicateObject
- Show keyboard shortcut hint

## Design Decisions

1. **Offset Direction**: +20px X, +20px Y (down/right) - Standard pattern
2. **Offset Amount**: 20px - Large enough to see both, close enough
3. **Auto-Select**: Select duplicate - Users typically want to manipulate it next
4. **Prevent Default**: Always prevent Ctrl+D - App owns this shortcut
5. **No Throttle**: Initially no throttle - Can add if needed

## Edge Cases

1. **Near Boundary**: Allow duplicate at calculated position (no bounds check MVP)
2. **Rapid Duplication**: Each keydown creates duplicate (optional throttle 200ms)
3. **No Selection**: No-op, silent failure
4. **Multi-Select** (Future Feature 6): Duplicate all, maintain relative positions

## Integration with Feature 1

**Context Menu Addition**:
```
Actions:
├─ 🗑️ Delete
├─ 📋 Duplicate (Ctrl+D)    ← Enable this
├─ ⬆️ Bring to Front         (disabled)
└─ ⬇️ Send to Back           (disabled)
```

## Success Criteria

- ✅ Ctrl+D duplicates selected object
- ✅ Duplicate at +20px X, +20px Y offset
- ✅ All properties copied accurately
- ✅ Duplicate automatically selected
- ✅ Real-time sync <100ms
- ✅ Context menu action enabled (if Feature 1 complete)
- ✅ No regressions

## Non-Goals

- Multi-select duplication (Feature 6)
- Smart offset (detect collisions)
- Duplicate-while-dragging (Alt+drag)
- User-configurable offset

