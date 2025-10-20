# Active Context: CollabCanvas v3

## Current Focus
**Phase:** Ready for AI Agent Implementation
**Date:** 2025-10-20

### Immediate Tasks

✅ **Complete:** All ShareLookbooks Bug Fixes (Fixes #1-4)
  - Fix #1: Eliminated duplicate Firestore subscription ✅
  - Fix #2: Canvas-keyed collaborators state (no global pollution) ✅
  - Fix #3: Async fetch outside onSnapshot (no infinite loops) ✅
  - Fix #4: React state for loading (no stale closures) ✅
  - See `docs/sharelookbooks-fix-guide.md` for details
📋 **Next:** Implement PRD 1 - AI Agent Basic Foundation
  - Install LangChain + OpenAI dependencies
  - Build API route with Firebase auth
  - Create chat UI (AIChatPanel component)
  - Implement manipulateCanvas tool (create operation only)
  - Test simple commands: create rectangle, circle, text
  - Verify LangSmith tracing

### Important Note
Feature 7 (Hierarchical Layers System) has replaced Feature 5B-2's incorrect flat structure. Layers now properly group multiple objects (Photoshop-style), with visibility/lock inheritance and full Firestore sync.

## Recent Changes
- **ShareLookbooks Bug Fixes Complete (2025-10-20)** ✅
  - ✅ Fix #1: Eliminated duplicate Firestore subscription in ShareModal
    - ShareModal now receives `collaborators` as prop from CanvasToolbar
    - Removed local `useCollaborators()` hook call that created duplicate subscription
    - Files: `ShareModal.tsx`, `CanvasToolbar.tsx`
  - ✅ Fix #2: Canvas-specific collaborators state
    - Changed `collaborators[]` → `collaboratorsByCanvas: Record<string, Collaborator[]>`
    - Each canvas has isolated state, prevents global pollution
    - Files: `lookbooksStore.ts`, `useCollaborators.ts`
  - ✅ Fix #3: Async fetch outside onSnapshot
    - Extracted `fetchLookbooksMetadata()` helper function
    - onSnapshot callback now synchronous, async work in `.then()` chain
    - Prevents subscription handler blocking and infinite loops
    - File: `lookbooksService.ts`
  - ✅ Fix #4: React state for loading tracking
    - Replaced closure variables with `loadingState` useState
    - Added separate useEffect to monitor loading completion
    - Prevents stale closure state on re-renders
    - File: `useLookbooks.ts`
  - **Validation:** Zero breaking changes, all consumers compatible, all linting passed
  - **Guide:** `docs/sharelookbooks-fix-guide.md` (updated with completion status)
- **AI Agent PRDs Created (2025-10-19)**
  - ✅ PRD 1: Basic Foundation (~260 lines)
    - Unified `manipulateCanvas` tool from day 1 (only "create" operation)
    - Simple object memory Map for label tracking
    - Session-based chat persistence (sessionStorage)
    - 12 files to create (simplified from 17)
    - No validation/testing (manual testing only)
    - Foundation for PRD 2 semantic references
  - ✅ PRD 2: Complex Commands (~285 lines)
    - Extends `manipulateCanvas` with 7 operations total
    - Adds semantic reference resolution
    - Multi-step command planning
    - Batch operations and smart layouts
    - Zero refactoring of PRD 1 required
  - **Architecture:**
    - Client: `src/features/ai-agent/` (7 files)
    - Server: `app/api/ai/` (4 files)
    - Combined files: AIChatPanel (UI), aiService (operations), useAIChat (state)
    - Object memory: In-memory Map at API route level
  - **Dependencies Resolved:**
    - Tool name consistent between PRDs
    - Object tracking structure extensible
    - Clean iterative build strategy
  - **Files:** `tasks/prd-ai-agent-basic.md`, `tasks/prd-ai-agent-complex.md`
- **Feature 9: Shared Lookbooks Complete (2025-10-19)**
  - ✅ Real-time collaboration with owner/designer roles
  - ✅ Google Docs-style presence UI (overlapping avatars, online indicators)
  - ✅ User search by email/username with 300ms debounce
  - ✅ Share modal with collaborator management
  - ✅ Transfer ownership between collaborators
  - ✅ Split repository view: "My Lookbooks" vs "Shared With Me"
  - ✅ Leave/delete operations with proper cleanup
  - ✅ Real-time deletion notification and redirect
  - ✅ Security rules enforce owner/designer permissions
  - **Architecture:**
    - Extended `lookbooksStore` with collaborators state
    - New service: `collaboratorService.ts` (CRUD, search, permissions)
    - 6 new components: ShareModal, CollaboratorList, UserSearch, PresenceBadges, TransferOwnershipDialog, LeaveConfirmation
    - 3 new hooks: `useCollaborators`, `useIsOwner`, `useUserSearch`
  - **Firestore Schema Extensions:**
    - `canvases/{canvasId}/collaborators/{userId}` - Collaborator subcollection with roles
    - `users/{userId}` - User directory for search (auto-synced on login)
    - Updated user index with role field
  - **UI Components Added:**
    - ShadCN: Dialog (+ @radix-ui/react-icons installed)
    - Custom: All collaboration components
  - **Files Created:** 11 new files (service, hooks, components)
  - **Files Updated:** 12 files (types, store, services, hooks, toolbar, page, rules, auth)




## Next Steps: Phase 1 Canvas Improvements

### Implementation Status
- ✅ Features 1-5: Context Menu, Duplicate, Undo/Redo, Copy/Paste, Z-Index
- ✅ Feature 5B-1: Toolbar Refactor (COMPLETE)
- ✅ Feature 6: Multi-Select (COMPLETE)
- ✅ Feature 7: Hierarchical Layers System (COMPLETE - replaces 5B-2)
- 📋 **Next:** Bug fixes, testing, Phase 2 planning

### Architectural Decisions
See systemPatterns.md for all technical decisions. Key choices:
- Clipboard: Shared utilities, not separate feature
- **Selection state:** Separate selectionStore (LOCAL ONLY, never persisted)
- **3-Store Pattern:** objectsStore (domain), selectionStore (interaction), uiPreferencesStore (UI)
- Layers: Hierarchical groups containing objects (Feature 7, not flat)
- PRDs: ~220-250 lines each (under cursor rules limit)

## Active Decisions

### Resolved Questions
- **Multi-Select**: Intersecting mode (objects touching box are selected) ✅
- **Layers**: Hierarchical (layers contain objects), not flat ✅
- **Build Order**: Feature 6 (Multi-Select) → Feature 7 (Hierarchical Layers) ✅
- **Layer Inheritance**: Visibility/lock state inherited from layer to objects (AND logic) ✅

### Key Considerations
- Feature 7 complete but needs testing for minor bugs
- Performance needs validation with real concurrent users
- Layer expanded state persisted to localStorage
- New shapes: ~30 lines each (via useShapeInteractions)

## Blockers
None - All ShareLookbooks bugs fixed ✅ Ready for AI Agent implementation

## Notes
- Core platform deployed: 5 features + ShadCN UI
- PRD strategy: Modular ~220-285 line docs (simplified, no testing/validation sections)
- UI architecture: Left toolbar (60px) + right sidebar (320px, pinnable)
- **Phase 1:** Complete (Canvas improvements, toolbar, layers, multi-select)
- **Phase 2:** AI Agent - PRD 1 ready for implementation ⏳
- **Phase 3:** Complete (My Lookbooks + Shared Lookbooks)

## Upcoming Features
**Next: AI Agent PRD 1** (3-4 days estimated)
- Basic foundation with simple shape creation
- LangChain + OpenAI + LangSmith integration
- Unified `manipulateCanvas` tool architecture
- Foundation for PRD 2 complex commands

---
*Last Updated: 2025-10-20 - ShareLookbooks Fix #1 complete, implementation guide created*

