# Tasks: Feature 9 - Shared Lookbooks

**Feature ID:** 9  
**PRD Source:** `prd-shared-lookbooks.md`  
**Status:** Ready for Implementation  
**Dependencies:** Feature 8 (My Lookbooks) ✅

---

## Relevant Files

### NEW Files
- `src/features/lookbooks/components/ShareModal.tsx` - Main modal for sharing Lookbooks, adding designers, and managing collaborators
- `src/features/lookbooks/components/CollaboratorList.tsx` - List component displaying current collaborators with roles and remove actions
- `src/features/lookbooks/components/UserSearch.tsx` - Search input component with debounced user lookup by email/username
- `src/features/lookbooks/components/PresenceBadges.tsx` - Google Docs-style overlapping avatar badges for active users in canvas header
- `src/features/lookbooks/components/TransferOwnershipDialog.tsx` - Confirmation dialog for ownership transfer with role swap
- `src/features/lookbooks/components/LeaveConfirmation.tsx` - Confirmation dialog for designers leaving shared Lookbooks
- `src/features/lookbooks/hooks/useCollaborators.ts` - Hook for real-time collaborator subscription and state management
- `src/features/lookbooks/hooks/useUserSearch.ts` - Hook for debounced user search with filtering (exclude self + existing collaborators)
- `src/features/lookbooks/hooks/useIsOwner.ts` - Hook for permission checking based on user role
- `src/features/lookbooks/services/collaboratorService.ts` - Firestore service for collaborator CRUD operations and user search

### UPDATED Files
- `src/features/lookbooks/components/LookbookCard.tsx` - Add owner badge for shared Lookbooks ("by {owner name}")
- `src/features/lookbooks/lib/lookbooksStore.ts` - Extend state with collaborators array and current user role
- `src/features/lookbooks/services/lookbooksService.ts` - Add permission checks and role-based filtering
- `src/features/lookbooks/types/index.ts` - Add Collaborator interface and role types
- `app/mylookbooks/page.tsx` - Implement two-column split layout ("My Lookbooks" vs "Shared With Me")
- `app/canvas/[canvasId]/page.tsx` - Add presence badges, share button, and leave/delete logic
- `src/features/canvas/components/CanvasToolbar.tsx` - Integrate share button (owner only) and presence badges
- `firestore.rules` - Add collaborator subcollection rules with role-based permissions
- `database.rules.json` - Update if presence scoping requires RTDB rule changes

### Notes
- Reuse Feature 2 presence patterns (scoped to canvasId)
- Reuse Feature 8 components (LookbookCard, Grid, etc.)
- Use ShadCN components: Dialog, Avatar, Badge, Input, ScrollArea, Command
- Follow Last-Write-Wins conflict resolution for all sync operations
- User directory (`users/{userId}`) may need creation if not existing

---

## Tasks

- [ ] 1.0 Create Collaborator Infrastructure & Schema
  - [ ] 1.1 Update `types/index.ts`: Add Collaborator interface with userId, email, role ('owner' | 'designer'), addedAt fields
  - [ ] 1.2 Add Role type alias: `type Role = 'owner' | 'designer'`
  - [ ] 1.3 Extend Lookbook interface with optional collaborators array and currentUserRole field
  - [ ] 1.4 Create `services/collaboratorService.ts` with Firebase imports and Firestore references
  - [ ] 1.5 Implement getCollaborators(canvasId): Query `canvases/{canvasId}/collaborators/` subcollection
  - [ ] 1.6 Implement addCollaborator(canvasId, userId, email): Create collaborator doc with role='designer', addedAt=Timestamp
  - [ ] 1.7 Create user index entry: `users/{userId}/canvases/{canvasId}` with role='designer', lastOpened=Timestamp
  - [ ] 1.8 Implement removeCollaborator(canvasId, userId): Batch delete from collaborators + user index
  - [ ] 1.9 Update `lib/lookbooksStore.ts`: Add collaborators array and currentUserRole to state
  - [ ] 1.10 Add store actions: setCollaborators, addCollaboratorToState, removeCollaboratorFromState, setCurrentUserRole
  
- [ ] 2.0 Implement User Search & Share Modal UI
  - [ ] 2.1 Create users directory in Firestore if not exists: Check if `users/{userId}` collection needed
  - [ ] 2.2 Implement user document creation on signup/login: Store email, displayName, photoURL in AuthProvider
  - [ ] 2.3 Create `hooks/useUserSearch.ts`: Debounced search hook with 300ms delay
  - [ ] 2.4 Implement Firestore query: Search users by email (>=, <=) and displayName with case-insensitive partial match
  - [ ] 2.5 Add filtering logic: Exclude current user and existing collaborators from search results
  - [ ] 2.6 Limit search results to 10 users maximum
  - [ ] 2.7 Create `components/UserSearch.tsx`: Search input with loading state and result list
  - [ ] 2.8 Display user results: Show avatar, displayName, email in clickable list items
  - [ ] 2.9 Create `components/CollaboratorList.tsx`: Display current collaborators with avatar, name, email, role badge
  - [ ] 2.10 Add remove button (X) for each collaborator (visible to owner only)
  - [ ] 2.11 Create `components/ShareModal.tsx`: Dialog with search section + collaborator list
  - [ ] 2.12 Add modal header with Lookbook name and close button
  - [ ] 2.13 Implement add designer action: Click user result → call addCollaborator service
  - [ ] 2.14 Add duplicate prevention: Check if user already collaborator before adding
  - [ ] 2.15 Add self-add prevention: Cannot add current user as designer
  - [ ] 2.16 Implement real-time collaborator sync: Subscribe to collaborators subcollection changes
  - [ ] 2.17 Add "Transfer Ownership" button in modal footer (owner only)
  - [ ] 2.18 Display "Share" button in canvas header/toolbar (conditionally for owners)
  
- [ ] 3.0 Implement Permission System & Role Management
  - [ ] 3.1 Create `hooks/useIsOwner.ts`: Check if current user has role='owner' for given canvasId
  - [ ] 3.2 Create `hooks/useCollaborators.ts`: Real-time hook with onSnapshot listener for collaborators
  - [ ] 3.3 Implement useCollaborators: Return collaborators array, loading state, and error handling
  - [ ] 3.4 Update useIsOwner to use useCollaborators data for role check
  - [ ] 3.5 Create permission helper functions in collaboratorService: canEditObjects, canManageCollaborators, canDeleteLookbook
  - [ ] 3.6 Implement UI conditional rendering: Hide "Share" button for designers
  - [ ] 3.7 Show "Leave" button instead of "Delete Lookbook" for designers
  - [ ] 3.8 Create `components/TransferOwnershipDialog.tsx`: Confirmation dialog with designer selection dropdown
  - [ ] 3.9 Implement transferOwnership(canvasId, currentOwnerId, newOwnerId) in service
  - [ ] 3.10 Use Firestore batch transaction: Update both collaborator docs (role swap: owner ↔ designer)
  - [ ] 3.11 Update user index entries: Batch update roles in `users/{userId}/canvases/{canvasId}` for both users
  - [ ] 3.12 Add validation: Prevent owner from removing self if they're the only owner
  - [ ] 3.13 Add validation: Prevent non-owners from accessing transfer/remove actions
  - [ ] 3.14 Update lookbooksService queries: Filter by role when fetching owned vs shared Lookbooks
  
- [ ] 4.0 Implement Google Docs-Style Presence UI
  - [ ] 4.1 Create `components/PresenceBadges.tsx`: Component accepting collaborators and presenceData props
  - [ ] 4.2 Implement overlapping avatar layout: 32px circles with 8px negative margin, 2px white border
  - [ ] 4.3 Sort avatars: Owner first, then alphabetical by displayName
  - [ ] 4.4 Implement "+N more" badge if collaborators exceed 5 visible avatars
  - [ ] 4.5 Add avatar styling: Circular with ShadCN Avatar component, proper z-index stacking
  - [ ] 4.6 Integrate ShadCN Tooltip: Show on hover with name, role, and online status
  - [ ] 4.7 Combine collaborator data with Feature 2 presence data: Match userId to show online status
  - [ ] 4.8 Add online indicator: Small green dot badge on bottom-right of avatar for active users
  - [ ] 4.9 Update `app/canvas/[canvasId]/page.tsx`: Fetch collaborators and pass to Canvas component
  - [ ] 4.10 Update `CanvasToolbar.tsx`: Add PresenceBadges component to header (right side, before Save indicator)
  - [ ] 4.11 Ensure presence system scopes to canvasId: Verify Feature 2 presence uses canvasId in RTDB paths
  - [ ] 4.12 Test presence updates: Verify <1s latency for join/leave events
  
- [ ] 5.0 Implement Repository Split View ("My Lookbooks" vs "Shared With Me")
  - [ ] 5.1 Update `app/mylookbooks/page.tsx`: Change layout from single grid to two-column layout
  - [ ] 5.2 Create two separate sections: "My Lookbooks" (left) and "Shared With Me" (right)
  - [ ] 5.3 Implement role-based queries: Query user index with role='owner' for owned Lookbooks
  - [ ] 5.4 Query user index with role='designer' for shared Lookbooks
  - [ ] 5.5 Execute queries in parallel for performance: Use Promise.all for both queries
  - [ ] 5.6 Update LookbookGrid component: Accept section prop to differentiate owned vs shared
  - [ ] 5.7 Update `LookbookCard.tsx`: Add owner badge display for shared Lookbooks
  - [ ] 5.8 Fetch owner data: Join collaborators to get owner's displayName for "by {owner name}" badge
  - [ ] 5.9 Implement owner badge UI: Small Badge component with "by" prefix and owner name
  - [ ] 5.10 Create empty state for "Shared With Me" section: Friendly message when no shared Lookbooks
  - [ ] 5.11 Add responsive layout: Two columns on desktop, stacked on mobile (<768px)
  - [ ] 5.12 Update header: Keep "My Lookbooks" title but clarify it refers to both sections
  - [ ] 5.13 Ensure "+ New Lookbook" button only appears in "My Lookbooks" section
  - [ ] 5.14 Test sorting: Both sections sort by updatedAt descending
  
- [ ] 6.0 Implement Leave & Delete Operations
  - [ ] 6.1 Create `components/LeaveConfirmation.tsx`: Dialog with warning message and confirm/cancel buttons
  - [ ] 6.2 Add "Leave" button to canvas toolbar for designers (replaces delete)
  - [ ] 6.3 Implement leave action: removeCollaborator(canvasId, currentUserId) for self-removal
  - [ ] 6.4 Delete from collaborators subcollection and user index entry
  - [ ] 6.5 Add redirect after leave: Navigate to `/mylookbooks` after successful removal
  - [ ] 6.6 Add validation: Prevent owner from leaving (must transfer ownership or delete instead)
  - [ ] 6.7 Update delete Lookbook logic: Check if user is owner before allowing delete
  - [ ] 6.8 Implement hard delete for all users: Delete canvas doc, all subcollections (objects, layers, collaborators)
  - [ ] 6.9 Clean up user index entries: Batch delete all `users/{userId}/canvases/{canvasId}` for every collaborator
  - [ ] 6.10 Implement real-time delete notification: Listen for canvas document deletion
  - [ ] 6.11 Create notification modal: "Lookbook deleted by owner" message for active designers
  - [ ] 6.12 Auto-redirect designers to `/mylookbooks` when Lookbook deleted
  - [ ] 6.13 Handle edge case: User leaves while viewing → immediate redirect with success message
  - [ ] 6.14 Test delete propagation: Verify all collaborators lose access immediately
  
- [ ] 7.0 Integration, Security Rules & Testing
  - [ ] 7.1 Update `firestore.rules`: Add isCollaborator() helper function
  - [ ] 7.2 Implement isOwner() helper: Check role='owner' in collaborators subcollection
  - [ ] 7.3 Update canvas read rule: `allow read: if isCollaborator()`
  - [ ] 7.4 Update canvas write rule for objects/layers: `allow write: if isCollaborator()`
  - [ ] 7.5 Update canvas delete rule: `allow delete: if isOwner()`
  - [ ] 7.6 Add collaborators subcollection rules: `allow read: if isCollaborator()`
  - [ ] 7.7 Add collaborators write rule: `allow write: if isOwner()` (only owners manage collaborators)
  - [ ] 7.8 Update users index rules: Users can only write their own index entries
  - [ ] 7.9 Add users directory read rule: Allow search by authenticated users
  - [ ] 7.10 Test security: Verify designers cannot add/remove collaborators or delete Lookbooks
  - [ ] 7.11 Update Feature 8 createLookbook: Auto-create owner collaborator entry with role='owner'
  - [ ] 7.12 Ensure creator added to `canvases/{canvasId}/collaborators/{userId}` on creation
  - [ ] 7.13 Test: Add designer via share modal, verify they see Lookbook in "Shared With Me"
  - [ ] 7.14 Test: Designer edits objects/layers, verify owner sees real-time updates
  - [ ] 7.15 Test: Designer attempts to click "Share", verify button hidden
  - [ ] 7.16 Test: Remove designer as owner, verify they lose access immediately
  - [ ] 7.17 Test: Transfer ownership, verify role swap and permission updates
  - [ ] 7.18 Test: Designer leaves Lookbook, verify removal and redirect
  - [ ] 7.19 Test: Owner deletes Lookbook, verify all designers notified and redirected
  - [ ] 7.20 Test: User search with email/username, verify case-insensitive partial matching
  - [ ] 7.21 Test: Presence badges display correctly with 2+ active users
  - [ ] 7.22 Test: Multiple designers editing simultaneously (Last-Write-Wins validation)
  - [ ] 7.23 Test: Repository split view renders correctly with mixed owned/shared Lookbooks
  - [ ] 7.24 Test: Owner badge displays correct owner name on shared Lookbook cards
  - [ ] 7.25 Test: Performance with 50+ collaborators (per PRD open question)
  - [ ] 7.26 Test: User search performance <300ms, collaborator load <200ms, repository <500ms
  - [ ] 7.27 Verify no regressions in Features 1-8 (auth, presence, canvas, objects, history, multi-select, layers, lookbooks)
  - [ ] 7.28 Update activeContext.md and progress.md: Document Feature 9 completion

---

**Status:** Phase 2 - Detailed sub-tasks generated ✅  
**Total:** 7 parent tasks, 104 sub-tasks  
**Ready for Implementation:** Follow tasks sequentially for Feature 9 completion

