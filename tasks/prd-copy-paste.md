# PRD: Copy/Paste

**Feature ID**: Feature 4  
**Status**: Ready for Implementation  
**Priority**: High  
**Effort**: Medium (3-4 days)  
**Created**: 2025-10-19

---

## Overview

Enable users to copy selected objects to clipboard and paste them onto the same or different canvas using standard keyboard shortcuts. Uses app-specific clipboard (localStorage) to work across canvas sessions within the same browser.

## Goals

1. Standard copy/paste workflow (Ctrl+C, Ctrl+V)
2. Works across different canvas sessions in same browser
3. Persists clipboard across page refreshes
4. Real-time sync of pasted objects (<100ms)
5. Foundation for multi-select copy/paste (Feature 6)

## User Stories

**As a canvas user:**
- I want to copy an object with Ctrl+C
- I want to paste it with Ctrl+V on the same or different canvas
- I want the pasted object to appear near where I'm looking
- I want my clipboard to persist even after page refresh

**As a collaborator:**
- I want to see when another user pastes an object in real-time

## Functional Requirements

### FR1: Keyboard Shortcuts
1. **Ctrl+C** (Windows/Linux), **Cmd+C** (Mac) - Copy
2. **Ctrl+V** (Windows/Linux), **Cmd+V** (Mac) - Paste
3. Copy only active when object selected
4. Paste only active when clipboard has valid data
5. Prevent default browser behavior

### FR2: Copy Behavior
1. Copy selected object data to app clipboard (localStorage)
2. Store complete object data (type, dimensions, color, rotation, etc.)
3. Visual feedback: Brief toast "Copied 1 object"
4. Serialized as JSON in localStorage
5. Key: `collabcanvas_clipboard`

### FR3: Paste Behavior
1. Create new object from clipboard data
2. Paste location: **+20px X, +20px Y** from original position
3. New unique ID (UUID) generated
4. `createdBy` = current user
5. New timestamps (`createdAt`, `updatedAt`)
6. Pasted object automatically selected

### FR4: Clipboard Persistence
1. Store in localStorage (key: `collabcanvas_clipboard`)
2. Survives page refreshes
3. Works across different canvas sessions in same browser
4. Expires after 24 hours (optional cleanup)

### FR5: Data Validation
1. Validate clipboard data on paste
2. Check for required properties (type, position, dimensions)
3. Handle corrupted/invalid data gracefully (silent failure or error toast)
4. Ignore clipboard if not valid CollabCanvas object

### FR6: Real-Time Sync
1. Use existing `createObject` service (same as duplicate)
2. Optimistic local update (instant)
3. Persist to Firestore
4. Broadcast to RTDB
5. Other users see pasted object within 100ms

## Non-Functional Requirements

- Copy/paste completes within 100ms
- Works with all object types (Rectangle, Circle, future shapes)
- No interference with browser clipboard (for text, images, etc.)
- Graceful handling when localStorage unavailable

## Technical Specifications

### Architecture

**Shared Utilities** (not a separate feature):
```
src/shared/lib/
  └─ clipboard.ts                (localStorage read/write utilities)

src/features/canvas/
  └─ components/Canvas.tsx       (keyboard shortcuts Ctrl+C/V)

src/features/objects/
  └─ hooks/useObjects.ts         (extend with copy/paste methods)
```

**Rationale**: Clipboard is just serialization + localStorage (no state management needed). Copy uses existing `objectsMap`, paste uses existing `createObject`. No store or separate feature warranted - just pure utility functions.

### Data Model

```typescript
// Clipboard data structure
interface ClipboardData {
  version: string;                    // Format version (e.g., "1.0")
  timestamp: number;                  // When copied
  canvasId?: string;                  // Source canvas (optional)
  object: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

```

### Core Implementation

**Utilities** (`shared/lib/clipboard.ts`):
- `copyToClipboard()`: Serialize object to JSON, store in localStorage
- `pasteFromClipboard()`: Deserialize, validate, return ClipboardData or null
- `hasClipboardData()`: Check if valid data exists
- Key: `collabcanvas_clipboard`

**Integration** (`objects/hooks/useObjects.ts`):
- `copyObject()`: Call clipboard util with selected object
- `pasteObject()`: Get data from clipboard, call existing `createObject` with +20px offset

**Keyboard** (`canvas/components/Canvas.tsx`):
- Ctrl+C: Call `useObjects.copyObject()`
- Ctrl+V: Call `useObjects.pasteObject()`

## Implementation Plan

1. **Clipboard Utilities** (Day 1): Create `shared/lib/clipboard.ts` with pure functions
2. **Extend useObjects** (Day 1): Add `copyObject()` and `pasteObject()` methods
3. **Keyboard Shortcuts** (Day 1-2): Add Ctrl+C/V listeners in Canvas component
4. **Cross-Canvas** (Day 2): Test across sessions, handle edge cases
5. **Context Menu** (Day 2-3): Add Copy action (if Feature 1 complete)
6. **Polish** (Day 3): Visual feedback, error handling

## Design Decisions

1. **Shared Utilities, Not Feature**: Clipboard is just localStorage operations
   - **Why**: No state management needed, just pure functions
   - **Alternative**: Separate feature (unnecessary boilerplate)

2. **App-Specific Clipboard**: Use localStorage, not OS clipboard
   - **Why**: Richer data (full objects), no permissions needed
   - **Trade-off**: Doesn't work across browsers/devices (acceptable for MVP)

3. **Offset Same as Duplicate**: +20px X, +20px Y
   - **Why**: Consistent behavior, predictable
   - **Alternative**: Paste at cursor position (more complex)

3. **24-Hour Expiry**: Clear old clipboard data
   - **Why**: Prevents stale data, modest cleanup
   - **Trade-off**: User loses clipboard after 24 hours (acceptable)

4. **Auto-Select Pasted**: Select pasted object after paste
   - **Why**: Users typically want to manipulate it next
   - **Alternative**: Keep current selection (less intuitive)

5. **Silent Validation Failure**: No error on invalid clipboard
   - **Why**: Doesn't interrupt workflow
   - **Alternative**: Show error toast (more verbose)

## Edge Cases

1. **localStorage Unavailable**: Try/catch, fallback to in-memory
2. **Corrupted Data**: Validate JSON, check required fields
3. **Different Canvas**: Allow paste (user can move if off-screen)
4. **Quota Exceeded**: Clear old data, show error if needed
5. **No Canvas Active**: No-op, preserve clipboard

## Integration Points

### With Feature 1 (Context Menu)
- Add "Copy" action to menu
- Show keyboard shortcut hint ("Ctrl+C")
- Only enabled when object selected

### With Feature 2 (Duplicate)
- Both use same offset (+20px X/Y)
- Both use same createObject flow
- Duplicate = copy + immediate paste

### With Feature 3 (Undo/Redo)
- Paste action recorded in history
- Undo removes pasted object

### Future: Feature 6 (Multi-Select)
- Copy multiple objects as array
- Paste maintains relative positions
- "Copied 3 objects" feedback

## Success Criteria

- ✅ Ctrl+C copies selected object to localStorage
- ✅ Ctrl+V pastes from clipboard at +20px offset
- ✅ Clipboard persists across page refreshes
- ✅ Works across different canvas sessions (same browser)
- ✅ Pasted object automatically selected
- ✅ Real-time sync to other users <100ms
- ✅ Context menu "Copy" action works (if Feature 1 complete)
- ✅ Graceful handling of invalid/corrupted data
- ✅ No regressions in existing features

## Non-Goals

- OS clipboard integration (JSON string fallback)
- Cross-browser clipboard sharing
- Cross-device clipboard sync
- Visual clipboard history/preview
- Smart paste positioning (at cursor, center viewport)
- Clipboard analytics/tracking

## Future Enhancements

- Paste at cursor position (user preference)
- Clipboard history panel (last 10 copies)
- Cross-canvas paste with smart positioning
- "Paste in place" modifier (no offset)
- Clipboard preview tooltip
- Copy style only (apply to another object)

