# Active Context: CollabCanvas v3

## Current Focus
**Phase:** Phase 1 - Canvas Improvements (Object Manipulation & UX)
**Date:** 2025-10-19

### Immediate Tasks
✅ **Feature 1: Context Menu - COMPLETE**
- Traditional right-click context menu with actions (Format Shape, Delete, placeholders)
- Properties panel slides in from right with all property editors
- Real-time sync for all property changes
- Clean UX pattern matching standard applications

✅ **Feature 2: Duplicate Object - COMPLETE**
- Keyboard shortcut (Ctrl+D / Cmd+D) to duplicate selected objects
- Duplicate offset by +20px X, +20px Y from original
- All properties copied (type, width, height, rotation, fill, opacity)
- Auto-select duplicate for immediate manipulation
- Context menu "Duplicate" action enabled with keyboard hint

✅ **Feature 3: Undo/Redo - COMPLETE**
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y) with toolbar buttons
- Per-user history stacks (50-action depth, session-based)
- All operations supported with proper drag position tracking
- Critical safety net now in place

✅ **Feature 4: Copy/Paste - COMPLETE (Enhanced)**
- Keyboard shortcuts (Ctrl+C / Cmd+C to copy, Ctrl+V / Cmd+V to paste)
- App-specific clipboard using localStorage for persistence
- **Interactive paste with preview** - shows draggable preview like shape creation
- Click to place pasted object at desired location
- ESC to cancel paste mode
- **Multiple pastes** - paste same object repeatedly (Ctrl+V multiple times)
- Context menu "Copy" action enabled with keyboard hint
- Auto-select pasted object for immediate manipulation
- Reuses existing ShapePreview component (elegant, consistent)

🔄 **Next:** Feature 5A (Z-Index)
- Core platform complete and deployed (5 features + ShadCN UI)
- 4 of 7 Phase 1 features complete (57%)
- Feature roadmap documented in `new-features-roadmap.md`

## Recent Changes
- **Feature 4: Copy/Paste Enhanced (2025-10-19)**
  - Keyboard shortcuts: Ctrl+C (copy), Ctrl+V (paste), Cmd+C/V on Mac
  - Created shared clipboard utilities in `src/shared/lib/clipboard.ts`
  - App-specific clipboard using localStorage (key: `collabcanvas_clipboard`)
  - Clipboard persists across page refreshes and canvas sessions
  - 24-hour data expiry with version validation
  - **Interactive paste mode**: Ctrl+V enters preview mode with cursor-following preview
  - **Multiple pastes**: Users can press Ctrl+V multiple times to paste repeatedly
  - Click canvas to place pasted object at desired location (centered on cursor)
  - ESC key cancels paste mode
  - Crosshair cursor in paste mode for precision
  - Reuses existing ShapePreview component (elegant, DRY)
  - Context menu integration: "Copy" action enabled with keyboard hint
  - Real-time sync via existing createObject infrastructure
  - Build successful, zero linter errors
- **Feature 2: Duplicate Object Complete (2025-10-19)**
  - Keyboard shortcut implementation: Ctrl+D (Cmd+D on Mac)
  - Duplicates selected object with +20px X/Y offset
  - All properties copied: type, dimensions, rotation, fill, opacity
  - Auto-selection of duplicate for immediate manipulation
  - Context menu integration: "Duplicate" action enabled with keyboard hint
  - Real-time sync via existing createObject infrastructure
  - Build successful, zero linter errors
- **Feature 3: Undo/Redo Complete (2025-10-19)**
  - Full undo/redo implementation with keyboard shortcuts and toolbar buttons
  - Per-user history stacks (50-action depth, session-based by design)
  - All operations supported: create, delete, move, resize, rotate, property changes
  - Fixed critical bug: Drag position tracking (captures position before drag starts)
  - New history feature: `src/features/history/` with types, store, hooks
  - Integration: `startObjectDrag()` and `finishObjectDrag()` for correct history recording
  - Build successful, fully tested and working
- **Feature 1: Context Menu Complete (2025-10-19)**
  - Refactored to traditional UX pattern (right-click → action menu → properties panel)
  - Context menu with Format Shape, Delete, and placeholder actions
  - Properties panel slides in from right with all editors
  - Color picker (Popover component), numeric inputs for all properties
  - Advanced properties: Position X/Y, Opacity (0-100%)
  - Real-time sync with existing updateObject infrastructure
  - Added opacity field to CanvasObject type
- **All Phase 1 PRDs Complete (2025-10-19)**
  - Created all 7 feature PRDs in `/tasks/` folder (1,754 lines total)
  - Architectural simplifications: Clipboard as utilities, selection in objects store, layers in objects feature
  - Roadmap documented in `new-features-roadmap.md`
  - Implementation order: Context Menu → Undo/Redo → Duplicate → Copy/Paste → Z-Index → Layer Panel → Multi-Select
- **ShadCN UI Integration Complete (2025-10-19)**
  - Integrated ShadCN component library with Radix UI primitives
  - Added Popover component for color picker
  - 8 ShadCN components now installed (Button, Input, Label, Card, Avatar, Badge, Separator, Popover)


## Next Steps: Phase 1 Canvas Improvements

### All 7 Phase 1 PRDs Complete ✅
1. **Context Menu** - `tasks/prd-context-menu.md` (174 lines)
2. **Duplicate Object** - `tasks/prd-duplicate-object.md` (202 lines)
3. **Undo/Redo** - `tasks/prd-undo-redo.md` (278 lines)
4. **Copy/Paste** - `tasks/prd-copy-paste.md` (224 lines)
5. **Z-Index** - `tasks/prd-z-index.md` (287 lines)
6. **Layer Panel** - `tasks/prd-layer-panel.md` (289 lines)
7. **Multi-Select** - `tasks/prd-multi-select.md` (300 lines)

### Architectural Decisions Made
- **Clipboard**: Shared utilities (`shared/lib/clipboard.ts`), not separate feature
- **Selection State**: Lives in `objectsStore`, not canvas store
- **Layers**: Part of objects feature, not separate feature
- Total: 1,754 lines across 7 PRDs

### Implementation Status
- ✅ Feature 1 (Context Menu) - Complete
- ✅ Feature 2 (Duplicate Object) - Complete
- ✅ Feature 3 (Undo/Redo) - Complete
- ✅ Feature 4 (Copy/Paste) - Complete
- 🔄 Feature 5A (Z-Index) - Next priority
- All PRDs follow vertical slice architecture
- All integration points documented

## Active Decisions

### Resolved Decisions
See systemPatterns.md for all technical decisions and rationale.

### Open Questions for Implementation
- **Context Menu**: Use ShadCN Popover for color picker or react-color library?
- **Context Menu**: Delete action confirmation or rely on undo/redo? (Recommend no confirmation)
- **Undo/Redo**: Store full snapshots or deltas? (Recommend full snapshots - simpler)
- **Layer Panel**: Empty layer handling - keep or auto-delete?
- **Multi-Select**: Marquee fully contained vs intersecting? (Recommend intersecting - faster UX)

### Considerations
- **Performance:** Needs validation with real concurrent users
- **Architecture Clean:** Ready for AI agent integration via useShapeInteractions
- **Extensibility:** New shapes can be added in ~30 lines of code
- **Security:** Database rules deployed and secured
- **Documentation:** Memory bank optimized and maintainable

## Blockers
None - Core platform stable, ready for Phase 1 feature implementation

## Notes
- **Core Platform Complete:** All 5 core features deployed to production
- **UI System:** ShadCN components integrated across all features
- **Firebase Project:** Configured with security rules deployed
- **Roadmap:** `new-features-roadmap.md` - 7 features, 2 phases
- **PRDs Complete:** All 7 Phase 1 PRDs in `/tasks/` folder
- **Architecture:** Clipboard as utilities, selection in objects store, layers in objects feature
- **Memory Bank:** Optimized with cursor rule for maintenance
- **Component Library:** 7 ShadCN components installed (Button, Input, Label, Card, Avatar, Badge, Separator)
- **AI Agent:** Deferred to post-Phase 2 (user preference)

---
*Last Updated: 2025-10-19 - Feature 4 (Copy/Paste) enhanced with interactive preview*

