# PRD: Undo/Redo

**Feature ID**: Feature 3  
**Status**: Ready for Implementation  
**Priority**: High  
**Effort**: Large (5-7 days)  
**Created**: 2025-10-19

---

## Overview

Per-user undo/redo functionality for all canvas operations. Each user maintains their own action history stack (50 actions deep) and can undo/redo their own changes without affecting other users.

## Goals

1. Enable users to undo their own mistakes without disrupting collaborators
2. Support all object operations (create, delete, move, resize, rotate, property changes)
3. Keyboard shortcuts (Ctrl+Z, Ctrl+Y) for quick access
4. 50-action stack depth per user
5. Foundation for AI agent command undo (future)

## User Stories

**As a canvas user:**
- I want to undo my last action with Ctrl+Z
- I want to redo an undone action with Ctrl+Y
- I want to undo multiple times to revert several changes
- I want only MY actions to be undoable (not other users' actions)

**As a collaborator:**
- I want my undo/redo to not affect other users' work
- I want to see the results of other users' undo/redo operations

## Functional Requirements

### FR1: Keyboard Shortcuts
1. **Ctrl+Z** (Windows/Linux), **Cmd+Z** (Mac) - Undo
2. **Ctrl+Y** or **Ctrl+Shift+Z** - Redo
3. Only active when history available
4. Prevent default browser behavior

### FR2: Action Stack
1. Per-user stack (keyed by userId)
2. Maximum depth: **50 actions**
3. Session-based (clears on page refresh)
4. Oldest action dropped when exceeding 50

### FR3: Undoable Operations
1. **Create object** - Remove object
2. **Delete object** - Restore object
3. **Move object** - Restore previous position
4. **Resize object** - Restore previous dimensions
5. **Rotate object** - Restore previous rotation
6. **Property changes** - Restore previous values (color, opacity)
7. **Duplicate object** - Remove duplicate
8. **Copy/Paste** - Remove pasted object

### FR4: Action Recording
1. Record action BEFORE executing
2. Store before/after state snapshots
3. Include action type, object ID, userId, timestamp
4. Redo stack cleared when new action performed

### FR5: Sync Behavior
1. Undo/redo actions trigger normal object updates
2. Other users see results via existing sync (RTDB/Firestore)
3. No special "undo" broadcast (just normal object updates)
4. Other users DO NOT undo themselves

### FR6: UI Indicators (Optional)
1. Toolbar buttons (undo/redo icons with disabled states)
2. Visual feedback: "Undid: Create Rectangle" (brief toast)
3. Keyboard shortcut hints in tooltips

## Non-Functional Requirements

- Undo/redo executes within 100ms
- Minimal memory footprint (50 actions ~= 50KB max)
- No performance impact on normal operations
- Works with all object types

## Technical Specifications

### Architecture

**New Feature Structure**:
```
src/features/history/
  ├─ components/
  │   └─ UndoRedoButtons.tsx    (Optional toolbar buttons)
  ├─ hooks/
  │   └─ useHistory.ts           (Main hook)
  ├─ lib/
  │   └─ historyStore.ts         (Zustand store)
  ├─ types/
  │   └─ index.ts                (Action types)
  └─ index.ts
```

### Data Model

```typescript
// Action type
interface HistoryAction {
  id: string;                    // Unique action ID
  userId: string;                // Who performed the action
  timestamp: number;
  type: 'create' | 'delete' | 'update' | 'duplicate';
  objectId: string;              // Affected object
  beforeState: Partial<CanvasObject> | null;  // State before
  afterState: Partial<CanvasObject> | null;   // State after
}

// History store
interface HistoryState {
  undoStacks: Record<string, HistoryAction[]>;  // Per-user undo stacks
  redoStacks: Record<string, HistoryAction[]>;  // Per-user redo stacks
  recordAction: (action: HistoryAction) => void;
  undo: (userId: string) => HistoryAction | null;
  redo: (userId: string) => HistoryAction | null;
  canUndo: (userId: string) => boolean;
  canRedo: (userId: string) => boolean;
}
```

### Integration with Existing Operations

**Wrap Object Operations**:
```typescript
// Before: Direct call
await createObject(params);

// After: Record then call
recordAction({
  type: 'create',
  userId: user.id,
  objectId: newId,
  beforeState: null,
  afterState: newObject,
  timestamp: Date.now(),
});
await createObject(params);
```

### Undo/Redo Logic

**Undo Flow**:
```
User presses Ctrl+Z
  → Get last action from user's undo stack
  → Pop action from undo stack
  → Apply beforeState to object (or delete if create action)
  → Push action to redo stack
  → Sync via normal object update mechanism
```

**Redo Flow**:
```
User presses Ctrl+Y
  → Get last action from user's redo stack
  → Pop action from redo stack
  → Apply afterState to object (or create if delete action)
  → Push action back to undo stack
  → Sync via normal object update mechanism
```

## Implementation Plan

**Phase 1** (Day 1-2): History feature structure
- Create feature folder structure
- Implement historyStore (Zustand)
- Define action types
- Basic recordAction, undo, redo methods

**Phase 2** (Day 2-3): Keyboard shortcuts
- Add keyboard listeners (Ctrl+Z, Ctrl+Y)
- Wire to history methods
- Test undo/redo single action

**Phase 3** (Day 3-4): Integrate with object operations
- Wrap createObject to record actions
- Wrap updateObject to record actions
- Wrap deleteObject to record actions
- Test undo/redo each operation type

**Phase 4** (Day 4-5): Complex operations
- Handle duplicate (Feature 2) undo
- Handle property changes undo
- Handle multi-property updates (position + size)
- Test edge cases

**Phase 5** (Day 5-6): Stack management
- Implement 50-action limit
- Clear redo stack on new action
- Test stack depth limits

**Phase 6** (Day 6-7): UI & polish
- Optional: Toolbar buttons with disabled states
- Optional: Toast feedback ("Undid: Create Rectangle")
- Multi-user testing
- Performance validation

## Design Decisions

1. **Per-User Stacks**: Each user has own undo/redo - No confusion in collaboration
2. **Session-Based**: Clear on refresh - Simpler than persistence, acceptable UX
3. **Full Snapshots**: Store complete before/after states - Simpler than deltas
4. **50 Action Limit**: Reasonable depth - Prevents memory bloat
5. **Normal Sync**: Use existing object update mechanism - No special undo broadcast

## Edge Cases

1. **Object Deleted by Another User**: Undo attempts to restore deleted object
   - **Solution**: Check if object exists before undo, skip if gone
   
2. **Undo Create After Object Modified by Another User**:
   - **Solution**: Deletion still works, other user sees object disappear
   
3. **Rapid Undo/Redo**:
   - **Solution**: Queue operations if needed, or throttle to 200ms
   
4. **Undo After Page Refresh**:
   - **Solution**: Stack cleared, no undo available (session-based)

## Integration Points

### With Feature 2 (Duplicate)
- Duplicate action recorded in history
- Undo removes duplicated object

### With Feature 4 (Copy/Paste)
- Paste action recorded in history
- Undo removes pasted object

### With Feature 1 (Context Menu)
- Property changes from context menu recorded
- Each property change is one action (or group if simultaneous)

### Future: AI Agent Commands
- Each AI command recorded as one action (multi-step = single undo unit)
- Complex operations (e.g., "create login form") undo entirely

## Success Criteria

- ✅ Ctrl+Z undoes user's last action
- ✅ Ctrl+Y redoes last undone action
- ✅ All operation types undoable
- ✅ Stack depth limited to 50 actions
- ✅ Per-user stacks (no cross-user undo)
- ✅ Undo/redo syncs to other users via normal mechanism
- ✅ Redo stack clears on new action
- ✅ No performance regressions
- ✅ Works with all object types

## Open Questions

1. Store full snapshots or deltas? **Recommendation: Full snapshots (simpler)**
2. Group rapid property changes into single action? **Recommendation: Yes, debounce 500ms**
3. Persist stacks to localStorage? **Recommendation: No for MVP, session-based**
4. Toolbar buttons or keyboard-only? **Recommendation: Optional toolbar, keyboard primary**

## Non-Goals

- Cross-session undo (persisting history to database)
- Undo other users' actions (shared undo stack)
- Granular property-level undo (single property per action)
- Visual history timeline (future enhancement)
- Branching undo (tree structure)

## Future Enhancements

- Persist stacks to localStorage (survives refresh)
- Visual undo history panel ("History" sidebar)
- Named actions ("Moved 3 objects")
- Undo branches (explore alternate paths)
- AI agent multi-step commands as single undo unit

