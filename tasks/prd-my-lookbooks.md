# Feature PRD: My Lookbooks

**Feature ID:** 8  
**Priority:** High  
**Estimated Effort:** 4-5 days  
**Dependencies:** Feature 7 (Hierarchical Layers) ✅  
**Status:** Ready for Implementation

---

## 1. Introduction/Overview

Users currently work on a single shared canvas without the ability to save, organize, or manage multiple projects. This limits their ability to work on different design projects independently.

This feature introduces **My Lookbooks** - a project repository system where users can create, save, rename, and open multiple canvases (called "Lookbooks" in the UI). Each Lookbook is a self-contained canvas with its own objects, layers, and state.

**Key Principle:** Every canvas session is a Lookbook. No temporary/unsaved canvases exist. Auto-save with delightful random names eliminates save anxiety.

---

## 2. Goals

1. **Enable project organization** - Users can manage multiple design projects independently
2. **Eliminate save anxiety** - Auto-save with random names, users can rename anytime
3. **Intuitive repository UX** - Clean landing page showing all saved Lookbooks
4. **Seamless navigation** - Easy switching between Lookbooks via repository page
5. **Foundation for sharing** - Prepare architecture for Feature 9 (Shared Lookbooks)

---

## 3. User Stories

**US1: First-Time Login**  
As a new user, I want to land on an empty repository page with a "Create Your First Lookbook" CTA, so I understand how to get started.

**US2: Create New Lookbook**  
As a user, I want to click "New Lookbook" to create a canvas with a delightful auto-generated name (e.g., "Crimson Horizon"), so I can start designing immediately without naming friction.

**US3: View All Lookbooks**  
As a user, I want to see all my saved Lookbooks on the `/mylookbooks` page with thumbnails, names, and last modified dates, so I can find my projects quickly.

**US4: Open Lookbook**  
As a user, I want to click a Lookbook card to open it in a new browser tab at `/canvas/[lookbookId]`, so I can work on that project.

**US5: Rename Lookbook**  
As a user, I want to double-click a Lookbook name (inline editing) or rename from canvas header, so I can organize my projects meaningfully.

**US6: Delete Lookbook**  
As a user, I want to right-click a Lookbook and select "Delete" to permanently remove it, so I can clean up old projects.

**US7: Auto-Save**  
As a user, I want all canvas changes to auto-save without manual intervention, so I never lose work.

**US8: Return to Repository**  
As a user, I want to click "My Lookbooks" in the header to return to the repository page, so I can switch projects easily.

**US9: Thumbnail Previews**  
As a user, I want to see visual thumbnail previews of each Lookbook, so I can identify projects visually.

**US10: Sort by Last Modified**  
As a user, I want Lookbooks sorted by last modified date (newest first), so my active projects are easily accessible.

---

## 4. Functional Requirements

### 4.1 Lookbook Entity

1. Lookbook MUST have: `id`, `name`, `ownerId`, `createdAt`, `updatedAt`, `thumbnail` (optional)
2. Auto-generated names MUST be delightful and random (e.g., "Crimson Horizon", "Velvet Thunder")
3. Lookbook name MUST support 2-50 characters
4. System MUST create Lookbook document in Firestore at `/canvases/{canvasId}`
5. Lookbook MUST contain subcollections: `objects/`, `layers/`

### 4.2 Repository Page (`/mylookbooks`)

6. Page MUST show grid of Lookbook cards (3-4 columns responsive)
7. Each card MUST display: thumbnail (16:9 ratio), name, last modified date
8. Cards MUST be sorted by `updatedAt` (newest first)
9. Empty state MUST show: "Create Your First Lookbook" CTA with welcoming message
10. Page MUST include "+ New Lookbook" button in top-right corner
11. Page MUST be the default landing route after login

### 4.3 Lookbook Creation

12. Clicking "+ New Lookbook" MUST create new Lookbook with auto-generated name
13. System MUST generate unique, delightful random name (see naming algorithm in Section 7.3)
14. System MUST create Lookbook document + default layer (via Feature 7 patterns)
15. System MUST navigate user to `/canvas/[newLookbookId]` after creation
16. System MUST add entry to `users/{userId}/canvases/{canvasId}` with role: 'owner'

### 4.4 Lookbook Opening

17. Clicking Lookbook card MUST open in current tab (navigate to `/canvas/[canvasId]`)
18. Canvas page MUST load all objects and layers for that Lookbook
19. System MUST update `lastOpened` timestamp in user's canvas index
20. Canvas header MUST display current Lookbook name (editable)

### 4.5 Lookbook Renaming

21. Double-click Lookbook name on repository page MUST enable inline editing
22. Enter key MUST save, Escape key MUST cancel
23. Canvas header MUST show editable Lookbook name
24. Name changes MUST sync in real-time (Last-Write-Wins)
25. Empty names MUST revert to previous value

### 4.6 Lookbook Deletion

26. Right-click Lookbook card MUST show context menu with "Delete" option
27. Delete MUST show confirmation dialog: "Delete [Name]? This cannot be undone."
28. Confirmed delete MUST remove Lookbook document and all subcollections
29. System MUST remove entry from `users/{userId}/canvases/{canvasId}`
30. Deletion MUST update repository page immediately (optimistic update)

### 4.7 Thumbnail Generation

31. System SHOULD capture canvas thumbnail on update (debounced 5 seconds)
32. Thumbnail MUST be 400x225px (16:9 ratio) PNG/JPEG
33. Thumbnail generation MUST not block canvas interactions
34. Missing thumbnails MUST show placeholder with Lookbook initials

### 4.8 Auto-Save

35. All canvas operations MUST auto-save via existing persistence patterns
36. Lookbook `updatedAt` MUST update on any object/layer change
37. No manual "Save" button exists
38. Canvas MUST show subtle "Saved" indicator after sync completes

### 4.9 Navigation

39. Header MUST include "My Lookbooks" link (returns to `/mylookbooks`)
40. Login flow MUST redirect to `/mylookbooks` (not `/canvas`)
41. Direct navigation to `/canvas` without ID MUST redirect to `/mylookbooks`
42. Canvas URL MUST be shareable (foundation for Feature 9)

---

## 5. Non-Goals (Out of Scope)

- Templates or starter Lookbooks
- Public sharing or view-only links (Feature 9)
- Lookbook duplication/forking
- Search, filtering, or tagging
- Folders or nested organization
- Export/import functionality
- Trash/archive system
- Version history per Lookbook
- Collaborative editing (Feature 9)
- Onboarding sequence (future enhancement)

---

## 6. Design Considerations

### 6.1 Repository Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: [Logo] [My Lookbooks] [Profile]                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  My Lookbooks                          [+ New Lookbook] │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Thumbnail│  │ Thumbnail│  │ Thumbnail│              │
│  │          │  │          │  │          │              │
│  ├──────────┤  ├──────────┤  ├──────────┤              │
│  │ Name     │  │ Name     │  │ Name     │              │
│  │ 2h ago   │  │ 1d ago   │  │ 3d ago   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Empty State

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              🎨                                          │
│         Create Your First Lookbook                       │
│    Start designing with a fresh canvas                   │
│                                                          │
│            [+ New Lookbook]                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Canvas Header (Updated)

```
┌─────────────────────────────────────────────────────────┐
│ [← My Lookbooks]  [Lookbook Name ✏️]           [Saved] │
└─────────────────────────────────────────────────────────┘
```

### 6.4 Visual Design

- Card size: 320px width, 16:9 thumbnail + 80px info section
- Grid: 3-4 columns responsive (Tailwind grid)
- Hover: Subtle elevation + border highlight
- Thumbnail placeholder: Gradient background + initials (first 2 chars of name)
- Name typography: text-lg font-semibold
- Last modified: text-sm text-gray-500 ("2 hours ago" relative format)

---

## 7. Technical Considerations

### 7.1 Firestore Schema

```typescript
// Lookbook metadata (backend: "canvases", frontend: "Lookbooks")
canvases/{canvasId}: {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail?: string; // Optional URL or base64
}

// Subcollections (existing from Features 1-7)
canvases/{canvasId}/objects/{objectId}
canvases/{canvasId}/layers/{layerId}

// User index for quick queries
users/{userId}/canvases/{canvasId}: {
  role: 'owner'; // Feature 9 adds 'designer'
  lastOpened: Timestamp;
}
```

### 7.2 Naming Convention

Backend: "canvases" collection (consistency with existing code)  
Frontend: "Lookbooks" terminology (user-facing labels, page titles, UI text)

### 7.3 Delightful Name Generation

**Algorithm:**
- Adjective + Noun pattern
- Adjectives: ~50 options (Crimson, Velvet, Azure, Golden, Mystic, etc.)
- Nouns: ~50 options (Horizon, Thunder, Ocean, Phoenix, Canvas, etc.)
- Check for uniqueness, retry if collision
- Fallback: "Lookbook {timestamp}" if 3 retries fail

**Implementation:**
```typescript
const adjectives = ['Crimson', 'Velvet', 'Azure', ...];
const nouns = ['Horizon', 'Thunder', 'Ocean', ...];
const name = `${randomAdjective()} ${randomNoun()}`;
```

### 7.4 Architecture

**New Feature Slice:** `src/features/lookbooks/`

```
src/features/lookbooks/
├── components/
│   ├── LookbookCard.tsx
│   ├── LookbookGrid.tsx
│   ├── EmptyState.tsx
│   ├── CreateButton.tsx
│   └── LookbookContextMenu.tsx
├── hooks/
│   ├── useLookbooks.ts
│   └── useLookbookOperations.ts
├── lib/
│   ├── lookbooksStore.ts (Zustand)
│   ├── nameGenerator.ts
│   └── thumbnailGenerator.ts
├── services/
│   └── lookbooksService.ts (Firebase CRUD)
├── types/
│   └── index.ts
└── index.ts
```

**Page Structure:**
```
app/
├── mylookbooks/
│   └── page.tsx (repository page)
└── canvas/
    ├── [canvasId]/
    │   └── page.tsx (canvas editor - update existing)
    └── page.tsx (redirect to /mylookbooks)
```

### 7.5 Integration Points

**Auth Integration:**
- Update auth redirect: `/canvas` → `/mylookbooks`
- ProtectedRoute guards both `/mylookbooks` and `/canvas/[id]`

**Canvas Page Updates:**
- Load canvasId from URL params (dynamic route)
- Fetch Lookbook metadata, objects, layers
- Display Lookbook name in header (editable)
- Auto-save `updatedAt` on any change

**Existing Features:**
- Objects (Feature 4): Scope to canvasId
- Layers (Feature 7): Scope to canvasId
- History (Feature 5): Scope to canvasId
- Presence (Feature 2): Scope to canvasId

### 7.6 Real-Time Sync

**Lookbook Metadata:**
- Use Firestore onSnapshot for repository page
- Real-time updates when name/thumbnail changes
- Last-Write-Wins conflict resolution

**User Canvas Index:**
- Subscribe to `users/{userId}/canvases` collection
- Powers "My Lookbooks" query
- Local updates for role/lastOpened

### 7.7 Performance

- Repository page: Paginate after 50 Lookbooks
- Thumbnail lazy loading (intersection observer)
- Debounce thumbnail generation (5 seconds idle)
- Optimize Firestore queries with composite index on `updatedAt`

### 7.8 Migration from Current Setup

**Current State:** Single canvas at `/canvas`  
**Migration Steps:**
1. Create initial Lookbook for existing canvas data
2. Assign ownerId to current user (or first user who opens)
3. Update routing to use dynamic `[canvasId]`
4. Preserve all objects/layers in new structure

---

## 8. Success Metrics

### 8.1 Functionality Metrics
- Users can create, rename, delete Lookbooks
- Repository page loads in <1 second (50 Lookbooks)
- Switching between Lookbooks works seamlessly
- No data loss during auto-save
- Name generation produces unique, delightful names

### 8.2 Performance Metrics
- Repository page render: <500ms (20 Lookbooks)
- Lookbook creation: <200ms (navigation + setup)
- Thumbnail generation: <1 second (background)
- Real-time sync: <100ms for metadata updates

### 8.3 Integration Metrics
- No regressions in Features 1-7
- Objects/layers scoped correctly per Lookbook
- Presence system works per Lookbook
- History/undo works within each Lookbook

---

## 9. Open Questions

1. **Thumbnail strategy** - Canvas snapshot or manual upload?  
   → *Recommendation: Auto-generate from canvas (debounced), with placeholder fallback*

2. **Default canvas redirect** - What happens at `/canvas` without ID?  
   → *Recommendation: Redirect to `/mylookbooks` with toast: "Please select a Lookbook"*

3. **Lookbook limit** - Hard cap per user?  
   → *Recommendation: No limit for now, add pagination at 50*

4. **Delete confirmation** - Always required or only for non-empty Lookbooks?  
   → *Recommendation: Always confirm (safety first)*

5. **Name collision** - What if generated name exists?  
   → *Recommendation: Append number: "Crimson Horizon 2"*

---

## 10. Dependencies for Feature 9 (Shared Lookbooks)

Feature 8 provides the foundation for Feature 9:

**Ready for Feature 9:**
- ✅ Firestore schema supports `collaborators/` subcollection
- ✅ User index structure supports role field ('owner' | 'designer')
- ✅ Repository page layout can be extended with "Shared With Me" section
- ✅ Canvas URL is shareable (`/canvas/[canvasId]`)
- ✅ Lookbook entity has `ownerId` for permission checks

**No Breaking Changes Needed:**
Feature 9 extends Feature 8 without refactoring.

---

**Files:**

**NEW FILES:**
```
src/features/lookbooks/
  components/
    LookbookCard.tsx
    LookbookGrid.tsx
    EmptyState.tsx
    CreateButton.tsx
    LookbookContextMenu.tsx
  hooks/
    useLookbooks.ts
    useLookbookOperations.ts
  lib/
    lookbooksStore.ts
    nameGenerator.ts
    thumbnailGenerator.ts
  services/
    lookbooksService.ts
  types/
    index.ts
  index.ts

app/mylookbooks/page.tsx
```

**UPDATE FILES:**
```
app/canvas/[canvasId]/page.tsx (migrate from app/canvas/page.tsx)
app/canvas/page.tsx (redirect to /mylookbooks)
src/features/auth/components/AuthProvider.tsx (update redirect)
src/features/objects/services/objectsService.ts (scope to canvasId)
src/features/objects/lib/objectsStore.ts (add canvasId context)
```

**REUSE:**
- ShadCN components: Card, Button, Input, Dialog, Tooltip
- Existing Firebase service patterns
- Zustand store patterns
- Last-Write-Wins sync strategy

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Build After:** Feature 7 (Hierarchical Layers)  
**Build Before:** Feature 9 (Shared Lookbooks)

