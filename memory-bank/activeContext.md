# Active Context: CollabCanvas v3

## Current Focus
**Phase:** Phase 2 (AI Agent) - PRD 1 Implementation Starting
**Date:** 2025-10-19

### Immediate Tasks

✅ **Complete:** All Phase 1 & Phase 3 features (Lookbooks + Canvas improvements)
✅ **Complete:** AI Agent PRDs created (PRD 1: Basic Foundation, PRD 2: Complex Commands)
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
- **Feature 8: My Lookbooks Complete (2025-10-19)**
  - ✅ Multi-canvas repository at `/mylookbooks`
  - ✅ Create, rename, delete Lookbooks with auto-generated names
  - ✅ Inline editing (double-click, Enter saves, Escape cancels)
  - ✅ Context menu with delete confirmation (AlertDialog)
  - ✅ Responsive grid layout with thumbnail placeholders
  - ✅ Empty state for new users
  - ✅ Dynamic routing: `/canvas/[canvasId]` with back navigation
  - ✅ Editable Lookbook name in canvas toolbar
  - ✅ Real-time Firestore sync for all CRUD operations
  - ✅ Google Sign-In integration alongside email/password
  - ✅ Automatic redirect to `/mylookbooks` after auth
  - **Architecture:**
    - New feature: `src/features/lookbooks/`
    - Zustand store: `lookbooksStore.ts`
    - Service: `lookbooksService.ts` (handles all Firestore operations)
    - 6 components: EmptyState, CreateButton, LookbookCard, LookbookContextMenu, LookbookGrid, page
    - 2 hooks: `useLookbooks`, `useLookbookOperations`
    - Utility: `nameGenerator.ts` (Adjective + Noun pattern)
  - **Firestore Schema:**
    - `canvases/{canvasId}` - Lookbook metadata (name, owner, timestamps)
    - `users/{userId}/canvases/{canvasId}` - User's canvas index
  - **Bug Fixes:**
    - Fixed Firebase initialization pattern (client-side `getDb()`)
    - Fixed user ID access (`user.id` vs `user.uid`)
    - Fixed Firestore rules for authenticated user access
  - **UI Components Added:**
    - ShadCN: ContextMenu, AlertDialog (+ deps installed)
- **Feature 7: Hierarchical Layers System Complete (2025-10-19)**
  - ✅ Default Layer (auto-created, cannot be deleted/renamed)
  - ✅ Create, rename, delete layers with auto-generated names
  - ✅ Expand/collapse layers showing nested objects with 32x32 thumbnails
  - ✅ Visibility & lock inheritance (AND logic: object + layer)
  - ✅ "Move to Layer" via context menu submenu
  - ✅ LayerModal for bulk object assignment with search
  - ✅ Real-time Firestore sync for all layer operations
  - ✅ Integration with multi-select (marquee respects layer state)
  - ✅ Migration: objects without layerId auto-assigned to Default Layer
  - ⚠️ **Known Issues:** Minor bugs need testing/fixes
  - **Files Created:** 5 new (Layer, LayerList, LayerModal, CreateLayerButton, layer.ts)
  - **Files Updated:** 9 files (stores, services, components)
- **Feature 6: Multi-Select Complete (2025-10-19)**
  - ✅ Marquee selection (click+drag on empty canvas)
  - ✅ Bulk operations: move, delete, duplicate, copy/paste
  - ✅ Multi-select drag (all objects move together)
  - ✅ Context menu integration (shows bulk action counts)
  - ✅ Properties panel integration (shared properties for multiple objects)
  - ✅ Full history/undo support for all bulk operations
  - **Major Refactor:** Split objectsStore into 3 clean stores
    - `selectionStore` - Selection state (LOCAL ONLY, never persisted)
    - `uiPreferencesStore` - UI preferences (localStorage)
    - `objectsStore` - Domain data only (objects, layer management)
  - **Bug Fixes:** Pan tool, paste format, delete key, right-click selection



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
None - Core platform stable, ready for Phase 1 feature implementation

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
*Last Updated: 2025-10-19 - AI Agent PRDs created, PRD 1 ready for implementation*

