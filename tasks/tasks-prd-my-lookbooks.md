npm# Tasks: Feature 8 - My Lookbooks

**Feature ID:** 8  
**PRD Source:** `prd-my-lookbooks.md`  
**Status:** Ready for Implementation  
**Dependencies:** Feature 7 (Hierarchical Layers) ✅

---

## Relevant Files

### NEW Files
- `src/features/lookbooks/components/LookbookCard.tsx` - Card component for displaying individual Lookbook in repository grid
- `src/features/lookbooks/components/LookbookGrid.tsx` - Grid layout component for repository page
- `src/features/lookbooks/components/EmptyState.tsx` - Welcome screen for users with no Lookbooks
- `src/features/lookbooks/components/CreateButton.tsx` - "New Lookbook" button component
- `src/features/lookbooks/components/LookbookContextMenu.tsx` - Right-click menu for delete operation
- `src/features/lookbooks/hooks/useLookbooks.ts` - Hook for fetching and subscribing to user's Lookbooks
- `src/features/lookbooks/hooks/useLookbookOperations.ts` - Hook for create/rename/delete operations
- `src/features/lookbooks/lib/lookbooksStore.ts` - Zustand store for Lookbook state management
- `src/features/lookbooks/lib/nameGenerator.ts` - Random name generation (Adjective + Noun)
- `src/features/lookbooks/lib/thumbnailGenerator.ts` - Canvas thumbnail generation utility
- `src/features/lookbooks/services/lookbooksService.ts` - Firestore service for CRUD operations
- `src/features/lookbooks/types/index.ts` - TypeScript types for Lookbook entities
- `src/features/lookbooks/index.ts` - Barrel export file
- `app/mylookbooks/page.tsx` - Repository landing page
- `app/canvas/[canvasId]/page.tsx` - Dynamic canvas page (migrated from current)
- `app/canvas/page.tsx` - Redirect handler

### UPDATED Files
- `src/features/auth/components/AuthProvider.tsx` - Update redirect after login to `/mylookbooks`
- `src/features/objects/services/objectsService.ts` - Add canvasId scoping to all operations
- `src/features/objects/lib/objectsStore.ts` - Add canvasId context and current Lookbook metadata
- `src/features/canvas/components/Canvas.tsx` - Update to receive canvasId prop and display editable name
- `src/features/canvas/components/CanvasToolbar.tsx` - Add "My Lookbooks" back button and editable name
- `src/features/objects/components/LayerPanel.tsx` - Update to scope layers to current canvasId
- `src/features/presence/services/presenceService.ts` - Add canvasId scoping for presence
- `src/features/history/lib/historyStore.ts` - Add canvasId scoping for history

### Notes
- All new files follow existing feature slice architecture pattern
- Reuse ShadCN components: Button, Input, Card, Badge, ScrollArea
- Reuse Firebase patterns from existing features
- Follow Last-Write-Wins conflict resolution pattern

---

## Tasks

- [ ] 1.0 Create Lookbooks Feature Infrastructure
  - [ ] 1.1 Create feature directory structure: `src/features/lookbooks/` with subfolders (components, hooks, lib, services, types)
  - [ ] 1.2 Create `types/index.ts` with Lookbook interface (id, name, ownerId, createdAt, updatedAt, thumbnail)
  - [ ] 1.3 Create barrel export file `index.ts` for clean imports
  - [ ] 1.4 Create `lib/lookbooksStore.ts` Zustand store with state (lookbooks array, currentLookbook, loading, error)
  - [ ] 1.5 Add store actions: setLookbooks, setCurrentLookbook, addLookbook, updateLookbook, removeLookbook
  - [ ] 1.6 Create `services/lookbooksService.ts` with Firebase imports and canvasId constant
  
- [ ] 2.0 Implement Repository Page UI
  - [ ] 2.1 Create `components/EmptyState.tsx` with welcoming message and "Create Your First Lookbook" CTA button
  - [ ] 2.2 Create `components/CreateButton.tsx` for "+ New Lookbook" with onClick handler prop
  - [ ] 2.3 Create `components/LookbookCard.tsx` with thumbnail (16:9 ratio), name, relative time display
  - [ ] 2.4 Add hover effects and double-click inline editing to LookbookCard (Enter saves, Escape cancels)
  - [ ] 2.5 Create `components/LookbookContextMenu.tsx` with delete option and confirmation dialog
  - [ ] 2.6 Create `components/LookbookGrid.tsx` with responsive 3-4 column grid, sorted by updatedAt
  - [ ] 2.7 Create `app/mylookbooks/page.tsx` with protected route, grid/empty state conditional rendering
  - [ ] 2.8 Add page header with "My Lookbooks" title and CreateButton in top-right
  
- [ ] 3.0 Implement Lookbook Creation & Name Generation
  - [ ] 3.1 Create `lib/nameGenerator.ts` with 50+ adjectives array (Crimson, Velvet, Azure, Golden, Mystic, etc.)
  - [ ] 3.2 Add 50+ nouns array to nameGenerator (Horizon, Thunder, Ocean, Phoenix, Canvas, etc.)
  - [ ] 3.3 Implement `generateUniqueName()` function with random selection and uniqueness check (3 retries)
  - [ ] 3.4 Add fallback name pattern: "Lookbook {timestamp}" if uniqueness fails
  - [ ] 3.5 Create `hooks/useLookbookOperations.ts` with createLookbook, renameLookbook, deleteLookbook functions
  - [ ] 3.6 Implement `createLookbook()` in service: generate name, create Firestore doc with metadata
  - [ ] 3.7 Create user index entry: `users/{userId}/canvases/{canvasId}` with role='owner', lastOpened=Timestamp
  - [ ] 3.8 Auto-create default layer in new Lookbook: call layer creation service
  - [ ] 3.9 Add navigation to `/canvas/[canvasId]` after successful creation
  
- [ ] 4.0 Implement Canvas Migration & Dynamic Routing
  - [ ] 4.1 Create `app/canvas/[canvasId]/page.tsx` with dynamic route parameter extraction
  - [ ] 4.2 Add canvasId prop to Canvas component and pass from dynamic page
  - [ ] 4.3 Update `app/canvas/page.tsx` to redirect to `/mylookbooks` (empty route handler)
  - [ ] 4.4 Add `currentCanvasId` and `currentLookbookMetadata` to objectsStore state
  - [ ] 4.5 Create `setCurrentCanvas(canvasId, metadata)` action in objectsStore
  - [ ] 4.6 Update `objectsService.ts`: add canvasId parameter to all Firestore paths (objects, layers)
  - [ ] 4.7 Update Firestore listeners to scope by canvasId: `canvases/{canvasId}/objects/`
  - [ ] 4.8 Fetch Lookbook metadata in dynamic page and pass to Canvas
  - [ ] 4.9 Update `CanvasToolbar.tsx`: add "← My Lookbooks" back button (left side)
  - [ ] 4.10 Add editable Lookbook name display in CanvasToolbar (center, with edit icon)
  
- [ ] 5.0 Implement Rename & Delete Operations
  - [ ] 5.1 Implement inline rename in LookbookCard: double-click activates edit mode with input field
  - [ ] 5.2 Add validation: 2-50 characters, trim whitespace, prevent empty names
  - [ ] 5.3 Implement rename handlers: Enter saves, Escape cancels, blur saves
  - [ ] 5.4 Create `renameLookbook(canvasId, newName)` in service with Firestore update
  - [ ] 5.5 Add real-time Firestore listener for metadata changes (Last-Write-Wins)
  - [ ] 5.6 Implement editable name in CanvasToolbar with same validation and handlers
  - [ ] 5.7 Create `deleteLookbook(canvasId)` in service with confirmation required
  - [ ] 5.8 Implement Firestore batch delete: main doc + subcollections (objects, layers)
  - [ ] 5.9 Remove user index entry: `users/{userId}/canvases/{canvasId}`
  - [ ] 5.10 Add optimistic updates to store for all operations
  
- [ ] 6.0 Implement Thumbnail Generation & Auto-Save
  - [ ] 6.1 Create `lib/thumbnailGenerator.ts` with `generateThumbnail(canvasId)` function
  - [ ] 6.2 Implement canvas-to-image conversion: capture at 400x225px (16:9 ratio)
  - [ ] 6.3 Add debouncing logic: trigger 5 seconds after last canvas change
  - [ ] 6.4 Upload thumbnail to Firestore or generate data URL for storage
  - [ ] 6.5 Implement placeholder thumbnail: gradient + initials extraction from name
  - [ ] 6.6 Create `hooks/useLookbooks.ts` with real-time subscription to user's Lookbooks
  - [ ] 6.7 Query user index: `users/{userId}/canvases/` with role filter
  - [ ] 6.8 Join with canvas metadata and sort by updatedAt descending
  - [ ] 6.9 Update `updatedAt` timestamp on any object/layer change in objectsService
  - [ ] 6.10 Add auto-save indicator to CanvasToolbar ("Saved" status display)
  
- [ ] 7.0 Integration & Testing
  - [ ] 7.1 Update `AuthProvider.tsx`: change redirect after login from `/canvas` to `/mylookbooks`
  - [ ] 7.2 Update `presenceService.ts`: add canvasId scoping to presence paths in RTDB
  - [ ] 7.3 Update `historyStore.ts`: add canvasId context for scoped undo/redo operations
  - [ ] 7.4 Update LayerPanel/LayerList components: ensure layers scoped to current canvasId
  - [ ] 7.5 Test: Create new Lookbook with auto-generated name, verify navigation
  - [ ] 7.6 Test: Create multiple Lookbooks, verify repository grid sorting by updatedAt
  - [ ] 7.7 Test: Rename Lookbook from repository card and canvas header, verify real-time sync
  - [ ] 7.8 Test: Delete Lookbook, verify confirmation dialog and complete cleanup
  - [ ] 7.9 Test: Switch between Lookbooks, verify proper data isolation (objects, layers, history)
  - [ ] 7.10 Test: Multi-user scenario - verify presence and sync scoped to same canvasId
  - [ ] 7.11 Test: Repository performance with 20+ Lookbooks (target <500ms render)
  - [ ] 7.12 Test: Empty state displays correctly for new users
  - [ ] 7.13 Verify no regressions in Features 1-7 (auth, presence, canvas, objects, history, multi-select, layers)

---

**Status:** Detailed sub-tasks generated ✅  
**Total:** 7 parent tasks, 65 sub-tasks  
**Ready for Implementation:** Follow tasks sequentially for Feature 8 completion

