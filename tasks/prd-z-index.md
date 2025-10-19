# PRD: Z-Index / Stacking Order

**Feature ID**: Feature 5A  
**Status**: Ready for Implementation  
**Priority**: Medium  
**Effort**: Small (2-3 days)  
**Created**: 2025-10-19

---

## Overview

Enable users to control which objects appear on top of others through z-index manipulation. Provides actions to bring objects forward/backward and to front/back of the stacking order.

## Goals

1. Control object stacking order (which appears on top)
2. Standard keyboard shortcuts for z-index operations
3. Real-time sync of stacking order across all users
4. Foundation for Layer Management Panel (Feature 5B)
5. Integrate with context menu (Feature 1)

## User Stories

**As a canvas user:**
- I want to bring an object to the front so it appears above others
- I want to send an object to the back so it appears below others
- I want to incrementally adjust stacking with keyboard shortcuts
- I want to see clear visual feedback when stacking changes

**As a collaborator:**
- I want to see when another user changes object stacking in real-time
- I want stacking order to be consistent across all users

## Functional Requirements

### FR1: Z-Index Property
1. Add `zIndex` property to CanvasObject (number)
2. Default value: `0` for new objects
3. Range: `-1000` to `1000` (reasonable limits)
4. Higher values appear on top

### FR2: Z-Index Actions
1. **Bring to Front** - Set to highest zIndex + 1
2. **Send to Back** - Set to lowest zIndex - 1
3. **Bring Forward** - Increment zIndex by 1
4. **Send Backward** - Decrement zIndex by 1

### FR3: Keyboard Shortcuts
1. **Ctrl+]** (Cmd+]) - Bring Forward
2. **Ctrl+[** (Cmd+[) - Send Backward
3. **Ctrl+Shift+]** (Cmd+Shift+]) - Bring to Front
4. **Ctrl+Shift+[** (Cmd+Shift+[) - Send to Back
5. Only active when object selected

### FR4: Rendering Order
1. Konva renders objects sorted by zIndex (low to high)
2. Objects with same zIndex maintain creation order
3. Re-sort and re-render when zIndex changes

### FR5: Real-Time Sync
1. Use existing `updateObject` mechanism
2. Optimistic local update (instant visual feedback)
3. Broadcast to RTDB for other users
4. Persist to Firestore
5. Other users see stacking change within 100ms

### FR6: Visual Feedback
1. Optional: Brief highlight/animation on z-index change
2. Context menu shows current relative position ("On top", "In middle", etc.)
3. No numeric z-index display (too technical for users)

## Non-Functional Requirements

- Z-index changes apply within 50ms locally
- Sync to other users within 100ms
- Works with all object types
- No performance impact with 500+ objects
- Consistent with industry standards (Figma, Illustrator)

## Technical Specifications

### Data Model Changes

**Extend CanvasObject**:
```typescript
interface CanvasObject {
  // ... existing properties
  zIndex: number;  // Default: 0, range: -1000 to 1000
}
```

### Z-Index Calculation

**Bring to Front**:
```typescript
const maxZIndex = Math.max(...objects.map(obj => obj.zIndex));
updateObject(objectId, { zIndex: maxZIndex + 1 });
```

**Send to Back**:
```typescript
const minZIndex = Math.min(...objects.map(obj => obj.zIndex));
updateObject(objectId, { zIndex: minZIndex - 1 });
```

**Bring Forward / Send Backward**:
```typescript
// Forward
updateObject(objectId, { zIndex: currentZIndex + 1 });

// Backward
updateObject(objectId, { zIndex: currentZIndex - 1 });
```

### Rendering Integration

**Sort Objects by Z-Index** (ObjectRenderer component):
```typescript
const sortedObjects = useMemo(() => {
  return [...objects].sort((a, b) => {
    if (a.zIndex !== b.zIndex) {
      return a.zIndex - b.zIndex;  // Sort by zIndex
    }
    return a.createdAt - b.createdAt;  // Fallback to creation order
  });
}, [objects]);

// Render in sorted order
return sortedObjects.map(obj => <ShapeComponent key={obj.id} {...obj} />);
```

### Keyboard Event Handling

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedObjectId) return;
    
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    
    if (ctrl && e.key === ']') {
      e.preventDefault();
      if (shift) {
        handleBringToFront();
      } else {
        handleBringForward();
      }
    }
    
    if (ctrl && e.key === '[') {
      e.preventDefault();
      if (shift) {
        handleSendToBack();
      } else {
        handleSendBackward();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedObjectId, handleBringToFront, handleSendToBack]);
```

## Implementation Plan

1. **Data Model** (Day 1, ~2 hours):
   - Add `zIndex` property to CanvasObject type
   - Add default value (0) to createObject
   - Migration: Existing objects default to zIndex = 0

2. **Z-Index Logic** (Day 1, ~3 hours):
   - Implement bring to front/back calculations
   - Implement bring forward/backward logic
   - Add helper functions in useObjects or new useZIndex hook

3. **Rendering** (Day 1-2, ~3 hours):
   - Sort objects by zIndex in ObjectRenderer
   - Test rendering order with multiple objects
   - Verify performance with many objects

4. **Keyboard Shortcuts** (Day 2, ~2 hours):
   - Add keyboard event listeners
   - Wire to z-index functions
   - Test all 4 shortcuts

5. **Context Menu Integration** (Day 2, ~2 hours):
   - Enable "Bring to Front" / "Send to Back" actions (Feature 1)
   - Show keyboard shortcuts in menu
   - Optional: Show relative position indicator

6. **Testing & Polish** (Day 3, ~3 hours):
   - Multi-user testing
   - Performance validation
   - Visual feedback (optional animation)
   - Edge case handling

## Design Decisions

1. **Z-Index Range**: -1000 to 1000
   - **Why**: Reasonable limits, prevents integer overflow
   - **Alternative**: Unlimited range (could cause issues)

2. **Default Z-Index**: 0 for all new objects
   - **Why**: Simple, predictable
   - **Alternative**: Auto-increment (more complex)

3. **Standard Shortcuts**: Ctrl+[ and Ctrl+]
   - **Why**: Industry standard (Figma, Illustrator, Sketch)
   - **Alternative**: Custom shortcuts (less familiar)

4. **Relative vs Absolute**: Use relative bring forward/backward
   - **Why**: Predictable, easy to understand
   - **Alternative**: Absolute numeric input (too technical)

5. **Sort on Render**: Re-sort every render cycle
   - **Why**: Simple, correct, Konva handles efficiently
   - **Alternative**: Manual layer management (more complex)

## Edge Cases

1. **Z-Index Overflow**: Object reaches -1000 or 1000 limit
   - **Solution**: Clamp to limits, or "normalize" all z-indices (optional)

2. **Multiple Objects Same Z-Index**: Which appears on top?
   - **Solution**: Fallback to creation timestamp (older = bottom)

3. **Bring Forward at Max**: Already at top, user presses Ctrl+]
   - **Solution**: No-op, no change (silent)

4. **Z-Index During Selection**: Transformer on selected object
   - **Solution**: Transformer always on top (Konva default behavior)

5. **Deleted Object Had Max Z-Index**: Next "Bring to Front" calculation
   - **Solution**: Recalculate max from existing objects (automatic)

## Integration Points

### With Feature 1 (Context Menu)
- Enable "Bring to Front" action in menu
- Enable "Send to Back" action in menu
- Show keyboard shortcut hints
- Optional: Show relative position ("2nd from top")

### With Feature 3 (Undo/Redo)
- Z-index changes recorded in history
- Undo restores previous z-index value

### With Feature 5B (Layer Panel)
- Z-index determines order within layer
- Drag-to-reorder in panel changes z-index
- Layer panel provides visual z-index management

### With Feature 6 (Multi-Select)
- Bring to Front/Back applies to all selected objects
- Maintains relative z-index offsets between selected objects

## Success Criteria

- ✅ `zIndex` property added to CanvasObject
- ✅ Objects render in correct stacking order
- ✅ All 4 keyboard shortcuts work correctly
- ✅ Context menu actions enabled (if Feature 1 complete)
- ✅ Z-index changes sync to other users <100ms
- ✅ Performance validated with 500+ objects
- ✅ No regressions in existing features
- ✅ Works with all object types

## Non-Goals

- Numeric z-index input (too technical)
- Z-index display in UI (keep simple)
- Auto-arrangement by size/color (complex)
- Z-index constraints per layer (Feature 5B)
- Z-index analytics/tracking

## Future Enhancements

- "Smart arrange" (auto-distribute z-indices evenly)
- Z-index normalization (compress range when hitting limits)
- Visual z-index indicator (small badge showing depth)
- Layer-specific z-index ranges (Feature 5B integration)
- "Bring to Front of Selection" (within multi-select group)
- Right-click drag to change z-index (advanced interaction)

