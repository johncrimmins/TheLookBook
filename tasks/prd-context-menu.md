# PRD: Right-Click Context Menu

**Feature ID**: Feature 1  
**Status**: Ready for Implementation  
**Priority**: High  
**Effort**: Medium (6-7 days)  
**Created**: 2025-10-19

---

## Overview

Add a right-click context menu to canvas objects for quick property editing and actions. Primary interface for editing object properties without a separate inspector panel.

## Goals

1. Enable quick property editing directly on canvas objects
2. Provide discoverable access to object actions (delete, duplicate, z-index)
3. Maintain real-time sync across all users (<100ms)
4. Create extensible foundation for future actions
5. Consistent with ShadCN design system

## User Stories

**As a canvas user:**
- I want to right-click any object to see/edit its properties
- I want to change color, size, and rotation without leaving the canvas
- I want to access advanced properties without cluttering the interface
- I want to delete objects from the context menu

**As a collaborator:**
- I want to see when other users change object properties in real-time

## Functional Requirements

### FR1: Menu Trigger & Display
1. Right-click on any object opens context menu
2. Menu positioned near cursor, adjusted to stay within viewport
3. Click outside or ESC closes menu
4. Click another object closes current menu, opens new one

### FR2: Visible Properties (Always Shown)
1. **Fill Color** - Color picker with hex input
2. **Width** - Numeric input (min 5px)
3. **Height** - Numeric input (min 5px)
4. **Rotation** - Numeric input (0-359 degrees)

### FR3: Advanced Properties (Collapsible)
1. Accordion/toggle labeled "Advanced Properties"
2. Collapsed by default
3. **Position X** - Numeric input (canvas coordinates)
4. **Position Y** - Numeric input (canvas coordinates)
5. **Opacity** - Slider or numeric (0-100%)

### FR4: Actions Section
1. **Delete** - Available immediately (existing functionality)
2. **Duplicate** - Placeholder (enable with Feature 2)
3. **Bring to Front/Back** - Placeholder (enable with Feature 5A)
4. Visual separator between properties and actions

### FR5: Real-Time Sync
1. All changes use existing `updateObject` mechanism
2. Optimistic local updates (instant feedback)
3. Debounced Firestore persistence (300ms)
4. RTDB broadcast to other users (<100ms)

## Non-Functional Requirements

- Menu renders within 50ms of right-click
- No lag when typing in input fields
- Keyboard accessible (Tab, Enter, ESC)
- Works with all object types (Rectangle, Circle, future shapes)

## Technical Specifications

### Architecture

**Component Structure**:
```
src/features/objects/components/
  ├─ ContextMenu.tsx           (Main menu)
  ├─ ColorPicker.tsx            (Color picker UI)
  └─ PropertyInput.tsx          (Reusable numeric input)
```

**State Management**:
```typescript
// Extend canvas store
interface CanvasState {
  contextMenu: {
    objectId: string | null;
    position: { x: number; y: number } | null;
  } | null;
  setContextMenu: (menu: CanvasState['contextMenu']) => void;
}
```

**Data Flow**:
1. Right-click detected → Canvas sets contextMenu state
2. ContextMenu renders at position with object data
3. User edits property → calls `updateObject` from useObjects hook
4. Local store updates (instant) → RTDB broadcast → Firestore persist

### ShadCN Components
- **Card** - Menu container
- **Input** - Numeric fields
- **Button** - Action buttons
- **Separator** - Section dividers
- **Collapsible/Accordion** - Advanced properties toggle
- **Popover** - Color picker (evaluate vs react-color)

## Implementation Plan

**Phase 1** (Day 1-2): Core infrastructure
- Extend canvas store with contextMenu state
- Add right-click detection to Canvas
- Create basic ContextMenu shell
- Test open/close behavior

**Phase 2** (Day 2-3): Basic properties
- Width, height, rotation inputs
- Integrate with updateObject
- Test real-time sync

**Phase 3** (Day 3-4): Color picker
- Choose/implement color picker
- Test color sync

**Phase 4** (Day 4-5): Advanced properties
- Collapsible section
- Position X/Y, opacity inputs
- Add `opacity` to CanvasObject type

**Phase 5** (Day 5-6): Actions
- Wire Delete action
- Add placeholder actions (disabled)

**Phase 6** (Day 6-7): Polish
- Keyboard accessibility
- Menu positioning edge cases
- Visual polish
- Multi-user testing

## Design Decisions

1. **Menu Positioning**: Near cursor, adjust for viewport - Standard UX pattern
2. **Update Timing**: On blur/Enter, not per keystroke - Reduces RTDB chatter
3. **Advanced Collapsed**: Hide position/opacity by default - Reduces clutter
4. **Placeholders**: Show future actions disabled - Signals upcoming features
5. **Opacity Addition**: Add to CanvasObject now (default 1.0) - Simple addition

## Open Questions

1. Color picker: ShadCN Popover + custom HSL or react-color library?
2. Delete confirmation or rely on undo/redo (Feature 3)?
3. Touch devices: Long-press for context menu? (Defer to post-MVP)

## Success Criteria

- ✅ Right-click opens menu with correct object data
- ✅ All visible properties editable and sync <100ms
- ✅ Advanced properties accessible via toggle
- ✅ Delete action works
- ✅ Menu UI matches ShadCN design system
- ✅ Keyboard accessible
- ✅ No regressions in existing features

## Non-Goals

- Mobile/touch optimization (future)
- Batch editing multiple objects (Feature 6)
- Property presets or history (post-MVP)
- Custom properties per object type (post-MVP)

