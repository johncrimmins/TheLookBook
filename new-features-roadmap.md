# Canvas Improvements Roadmap

**Goal**: Enhance object manipulation with industry-standard canvas features.

---

## **Phase 1: Core Object Operations**

### **1. Right-Click Context Menu**
**Effort**: Medium | **Dependencies**: None

**What**: Context menu on right-click for quick property editing and actions.

**Properties**:
- **Visible**: Fill color, width, height, rotation
- **Collapsed (accordion)**: Position X/Y, opacity, stroke (if added)

**Actions**:
- Delete (already implemented)
- Duplicate (add with Feature 2)
- Bring to Front/Back (add with Feature 5)

**Decisions**:
- Use ShadCN UI components
- Changes apply immediately (optimistic)
- All changes sync via existing RTDB mechanism

---

### **2. Duplicate Object**
**Effort**: Small | **Dependencies**: None

**What**: Duplicate selected object with keyboard shortcut.

**Behavior**:
- Shortcut: **Ctrl+D** (Cmd+D on Mac)
- Offset: **+20px X, +20px Y** from original
- Single object only (multi-select in Phase 2)

**Decisions**:
- Add to context menu (Feature 1)
- New object auto-selected after duplication

---

### **3. Undo/Redo**
**Effort**: Large | **Dependencies**: None (implement before Feature 4)

**What**: Per-user undo/redo stack for all operations.

**Behavior**:
- Shortcuts: **Ctrl+Z** (undo), **Ctrl+Y** (redo)
- Stack depth: **50 actions per user**
- Session-based (clears on refresh)

**Undoable Operations**:
- Create, delete, move, resize, rotate, property changes
- Duplicate, copy/paste
- **Future**: AI agent commands

**Decisions**:
- **Per-user only** (not shared across users)
- Create new `history` feature with Zustand store
- Store before/after snapshots keyed by userId

---

### **4. Copy/Paste**
**Effort**: Medium | **Dependencies**: None (but benefits from Feature 3)

**What**: Copy/paste objects with keyboard shortcuts.

**Behavior**:
- Shortcuts: **Ctrl+C** (copy), **Ctrl+V** (paste)
- Offset: **+20px X, +20px Y** from original
- Single object only (multi-select in Phase 2)

**Decisions**:
- **App-specific clipboard only** (localStorage)
- Works across canvas sessions in same browser
- Persists across page refreshes
- Add to context menu (Feature 1)

---

## **Phase 2: Advanced Selection & Organization**

### **5. Layer Management & Z-Index**
**Effort**: Large | **Dependencies**: Phase 1 complete

Split into two sub-features:

#### **5A. Z-Index / Stacking Order**
**What**: Control object stacking (which appears on top).

**Behavior**:
- Add `zIndex` property to objects
- Actions: Bring to Front, Send to Back, Bring Forward, Send Backward
- Shortcuts: Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[

**Decisions**:
- Add to context menu (Feature 1)
- Syncs across all users

#### **5B. Layer Management Panel**
**What**: Photoshop-style panel with named layers containing objects.

**Behavior**:
- Side panel showing layers and objects
- Drag to reorder z-index and move between layers
- Eye icon toggles layer visibility (synced across users)
- Collapsible layers

**Decisions**:
- Add `layer` property to objects (string, default "Layer 1")
- **No layer renaming** (MVP)
- **No object locking** (future)
- Visibility syncs across all users

---

### **6. Multi-Object Selection**
**Effort**: Large | **Dependencies**: Phase 1 complete, extends Features 2-4

**What**: Select and manipulate multiple objects as a group.

**Selection Methods**:
- **Ctrl+Click**: Add/remove from selection
- **Drag-to-Select**: Marquee rectangle selection

**Behavior**:
- Unified bounding box for group transforms
- Maintains relative positions during resize/rotate
- Move entire group together

**Decisions**:
- Selection state **per-user**, visible to others (colored outline)
- Extend `selectedObjectId` → `selectedObjectIds` (array)
- Konva transformer already supports multiple nodes
- Extends duplicate, copy/paste, delete, context menu to work on groups

---

## **Implementation Order**

```
1. Right-Click Context Menu (foundation)
2. Undo/Redo (safety net before complex features)
3. Duplicate (simple, high value)
4. Copy/Paste (builds on duplicate)
5. Z-Index (simpler than layer panel)
6. Layer Panel (complex UI)
7. Multi-Select (extends all previous features)
```

---

## **Architecture Impact**

**New Features**:
- `history` - Undo/redo stack store
- `clipboard` - localStorage-based clipboard
- `layers` - Layer management (optional, may extend `objects`)

**Extended Data**:
- CanvasObject: `zIndex`, `layer`, `opacity`
- Canvas Store: `selectedObjectIds` (array)

**No Breaking Changes**: All features integrate with existing architecture.

---

## **Future AI Agent Integration**

- Undo/redo must capture AI commands (multi-step = single undo unit)
- AI can manipulate layers and multi-select
- Context menu accessible via AI commands

---

**Last Updated**: 2025-10-19  
**Status**: Ready for Feature 1 PRD

