# Feature PRD: My Lookbooks

**Feature ID:** 8  
**Priority:** High  
**Estimated Effort:** 4-5 days  
**Dependencies:** Feature 7 (Hierarchical Layers) ✅  
**Status:** Ready for Implementation

---

## 1. Overview

Users currently work on a single shared canvas without the ability to save, organize, or manage multiple projects. This feature introduces **My Lookbooks** - a project repository where users can create, save, rename, and open multiple canvases (called "Lookbooks" in UI, "canvases" in backend).

**Key Principle:** Every canvas session is a Lookbook. Auto-save with delightful random names eliminates save anxiety.

---

## 2. Goals

1. Enable multi-project organization with independent canvases
2. Auto-save with random names (users can rename anytime)
3. Clean repository landing page as default after login
4. Foundation for Feature 9 (collaboration)

---

## 3. User Stories

**US1:** New user lands on empty repository with "Create Your First Lookbook" CTA  
**US2:** Click "New Lookbook" creates canvas with auto-generated name (e.g., "Crimson Horizon")  
**US3:** Repository shows all Lookbooks with thumbnails, names, last modified dates  
**US4:** Click Lookbook opens it at `/canvas/[lookbookId]`  
**US5:** Double-click name for inline editing (Enter saves, Escape cancels)  
**US6:** Right-click → Delete with confirmation  
**US7:** All changes auto-save continuously  
**US8:** Click "My Lookbooks" in header returns to repository

---

## 4. Functional Requirements

### 4.1 Lookbook Entity
1. Properties: `id`, `name`, `ownerId`, `createdAt`, `updatedAt`, `thumbnail` (optional)
2. Auto-generated names: Adjective + Noun (e.g., "Velvet Thunder") with uniqueness check
3. Name length: 2-50 characters
4. Firestore path: `canvases/{canvasId}` with subcollections: `objects/`, `layers/`

### 4.2 Repository Page (`/mylookbooks`)
5. Grid layout: 3-4 columns responsive, sorted by `updatedAt` (newest first)
6. Card displays: 16:9 thumbnail, name, relative time ("2h ago")
7. Empty state: Welcoming message + "Create Your First Lookbook" button
8. Top-right: "+ New Lookbook" button
9. Default landing route after login

### 4.3 Creation & Navigation
10. Create: Generates unique name → creates document + default layer → navigates to `/canvas/[id]`
11. User index: `users/{userId}/canvases/{canvasId}` with `{role: 'owner', lastOpened: Timestamp}`
12. Canvas header shows editable Lookbook name
13. Direct `/canvas` (no ID) redirects to `/mylookbooks`

### 4.4 Rename & Delete
14. Inline editing on repository cards (double-click)
15. Canvas header allows name editing
16. Real-time sync with Last-Write-Wins
17. Delete: Confirmation required → removes document tree + user index entry

### 4.5 Thumbnails & Auto-Save
18. Auto-generate thumbnail: 400x225px, debounced 5s after changes
19. Missing thumbnail: Placeholder with initials
20. All canvas operations auto-save via existing patterns
21. Update `updatedAt` on any object/layer change

---

## 5. Non-Goals (Out of Scope)

Templates, public sharing, duplication, search/filtering, folders, export/import, trash, version history, collaborative editing (Feature 9), onboarding sequence (future)

---

## 6. Design

### Repository Layout
```
My Lookbooks                          [+ New Lookbook]

┌──────────┐  ┌──────────┐  ┌──────────┐
│ Thumbnail│  │ Thumbnail│  │ Thumbnail│
├──────────┤  ├──────────┤  ├──────────┤
│ Name     │  │ Name     │  │ Name     │
│ 2h ago   │  │ 1d ago   │  │ 3d ago   │
└──────────┘  └──────────┘  └──────────┘
```

### Canvas Header
```
[← My Lookbooks]  [Lookbook Name ✏️]           [Saved]
```

### Visual Specs
- Cards: 320px width, hover elevation
- Thumbnail: 16:9 ratio, placeholder with gradient + initials
- Typography: text-lg font-semibold (name), text-sm text-gray-500 (time)

---

## 7. Technical Implementation

### 7.1 Firestore Schema
```typescript
// Lookbook metadata (backend: "canvases", frontend: "Lookbooks")
canvases/{canvasId}: {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail?: string;
}

// Subcollections (existing Features 1-7)
canvases/{canvasId}/objects/{objectId}
canvases/{canvasId}/layers/{layerId}

// User index for queries
users/{userId}/canvases/{canvasId}: {
  role: 'owner'; // Feature 9 adds 'designer'
  lastOpened: Timestamp;
}
```

### 7.2 Name Generation
```typescript
// nameGenerator.ts
const adjectives = ['Crimson', 'Velvet', 'Azure', 'Golden', 'Mystic', ...]; // 50+
const nouns = ['Horizon', 'Thunder', 'Ocean', 'Phoenix', 'Canvas', ...]; // 50+
const name = `${randomItem(adjectives)} ${randomItem(nouns)}`;
// Check uniqueness, retry 3x, fallback: "Lookbook {timestamp}"
```

### 7.3 Architecture

**New Feature Slice:**
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
│   └── lookbooksService.ts
├── types/
│   └── index.ts
└── index.ts
```

**Pages:**
```
app/mylookbooks/page.tsx (repository)
app/canvas/[canvasId]/page.tsx (migrate from app/canvas/page.tsx)
app/canvas/page.tsx (redirect to /mylookbooks)
```

### 7.4 Integration Points

**Auth:** Redirect `/canvas` → `/mylookbooks` after login  
**Canvas Page:** Load dynamic `canvasId`, fetch metadata/objects/layers, show editable name  
**Existing Features:** Scope objects/layers/history/presence to `canvasId`  
**Real-Time Sync:** Firestore listeners for metadata changes (Last-Write-Wins)

### 7.5 Migration
Current single canvas → Create initial Lookbook with auto-name → Preserve all data in new structure

---

## 8. Success Metrics

**Functionality:** Create, rename, delete work; repository loads <1s (50 Lookbooks); seamless switching; no data loss  
**Performance:** Repository render <500ms (20 Lookbooks); creation <200ms; thumbnail gen <1s background; sync <100ms  
**Integration:** No regressions in Features 1-7; proper scoping per Lookbook

---

## 9. Open Questions

1. **Thumbnail strategy?** → Auto-generate (debounced), placeholder fallback  
2. **Name collision?** → Append number: "Crimson Horizon 2"  
3. **Lookbook limit?** → No limit, paginate at 50  
4. **Delete confirmation?** → Always required

---

## 10. Files

**NEW:**
```
src/features/lookbooks/ (all files listed in 7.3)
app/mylookbooks/page.tsx
```

**UPDATE:**
```
app/canvas/[canvasId]/page.tsx (migrate from app/canvas/page.tsx)
app/canvas/page.tsx (redirect)
src/features/auth/components/AuthProvider.tsx (update redirect)
src/features/objects/services/objectsService.ts (scope to canvasId)
src/features/objects/lib/objectsStore.ts (add canvasId context)
```

**REUSE:** ShadCN components, Firebase patterns, Zustand patterns, Last-Write-Wins

---

**Dependencies for Feature 9:**
✅ Schema supports `collaborators/` subcollection  
✅ User index supports role field  
✅ Canvas URL shareable  
✅ Repository layout extensible  
No breaking changes needed.

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Build After:** Feature 7 (Hierarchical Layers)  
**Build Before:** Feature 9 (Shared Lookbooks)
