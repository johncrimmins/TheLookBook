# Feature PRD: Shared Lookbooks

**Feature ID:** 9  
**Priority:** High  
**Estimated Effort:** 4-5 days  
**Dependencies:** Feature 8 (My Lookbooks) ✅  
**Status:** Ready for Implementation

---

## 1. Overview

Users can currently create and manage their own Lookbooks but cannot collaborate with others. This feature adds **collaboration** by allowing owners to add designers (collaborators) via email/username search. Designers can edit canvas but cannot manage collaborators. All users see real-time updates using existing sync infrastructure.

**Key Principle:** Google Docs-inspired collaboration with simple two-role permission model (Owner, Designer).

---

## 2. Goals

1. Enable real-time multi-user collaboration on Lookbooks
2. Clear ownership model (Owner controls access, Designer edits only)
3. Google Docs-style presence UI with overlapping avatars
4. Split repository view: "My Lookbooks" (owned) + "Shared With Me" (designer)

---

## 3. User Stories

**US1:** Owner clicks "Share" → searches users by email/username → adds as designer  
**US2:** Owner removes designers via "Manage Access" modal  
**US3:** Designer sees shared Lookbooks in "Shared With Me" section  
**US4:** Designer edits objects/layers like owner (no collaborator management)  
**US5:** All users see overlapping avatar badges in header (Google Docs style)  
**US6:** Designer cannot see "Share" or "Delete Lookbook" options  
**US7:** Designer clicks "Leave" to remove self from shared Lookbook  
**US8:** Owner deletes Lookbook → removed for all collaborators with notification  
**US9:** Owner transfers ownership to designer

---

## 4. Functional Requirements

### 4.1 Collaborator Entity
1. Properties: `userId`, `email`, `role` ('owner' | 'designer'), `addedAt`
2. Path: `canvases/{canvasId}/collaborators/{userId}`
3. User index: `users/{userId}/canvases/{canvasId}` with role field
4. Auto-assign 'owner' role to creator

### 4.2 Adding Designers
5. "Share" button in canvas header (owner only)
6. Modal: User search input (email/username, case-insensitive, partial match)
7. Results show: avatar, name, email (max 10)
8. Click user → add as designer, prevent duplicates/self-add
9. Modal shows current collaborators with roles + remove buttons

### 4.3 Managing Access
10. "Manage Access" modal lists all collaborators (avatar, name, email, role)
11. Owner can remove designers (prevent removing self if only owner)
12. Owner can transfer ownership (role swap: owner ↔ designer)
13. Removal deletes from `collaborators/` + user index
14. Real-time sync for all collaborator changes

### 4.4 Permissions
15. Designer CAN: Edit objects/layers/history/multi-select
16. Designer CANNOT: Add/remove collaborators, delete Lookbook, transfer ownership
17. Hide "Share" button for designers
18. Show "Leave" instead of "Delete" for designers

### 4.5 Presence Display
19. Canvas header: Overlapping avatar badges (Google Docs style)
20. Order: Owner first, then alphabetical
21. Avatars: 32px circle, 8px overlap, 2px white border
22. "+N more" badge if >5 users
23. Tooltip on hover: name, role, online status
24. Use existing Feature 2 presence system

### 4.6 Repository Split View
25. Two-column layout: "My Lookbooks" (left) + "Shared With Me" (right)
26. Query owned (role: 'owner') vs designer (role: 'designer')
27. Shared cards show owner badge: "by {owner name}"
28. Empty state for "Shared With Me"

### 4.7 Leave & Delete
29. Designer "Leave" → confirmation → remove from collaborators + user index → redirect
30. Owner cannot leave (must transfer or delete)
31. Owner delete → hard delete for all users
32. Active designers see modal: "Lookbook deleted by owner" → redirect to `/mylookbooks`

### 4.8 Real-Time Sync
33. Object/layer changes via existing sync (Last-Write-Wins)
34. Collaborator list changes via Firestore listeners
35. Presence via Feature 2 patterns (scoped to canvasId)

---

## 5. Non-Goals (Out of Scope)

Role beyond Owner/Designer (Viewer, Editor, Admin), public sharing, view-only links, share links, commenting, activity log, email notifications, approval workflow, guest access, folder sharing, batch invite

---

## 6. Design

### Canvas Header with Presence
```
[← My Lookbooks]  [Lookbook Name ✏️]  [👤👤👤 +2]  [Share] [Saved]
```

### Share Modal
```
Share "Crimson Horizon"                    [×]

Add designers
[Search by email or username...]

Current Access
┌────────────────────────────────────┐
│ 👤 John Doe (You)       Owner      │
│ 👤 Jane Smith          Designer [×]│
│ 👤 Bob Johnson         Designer [×]│
└────────────────────────────────────┘

[Transfer Ownership] [Close]
```

### Repository Split View
```
My Lookbooks                    Shared With Me
[+ New Lookbook]

┌──────────┐  ┌──────────┐    ┌──────────┐  ┌──────────┐
│ Thumb    │  │ Thumb    │    │ Thumb    │  │ Thumb    │
├──────────┤  ├──────────┤    ├──────────┤  ├──────────┤
│ Name     │  │ Name     │    │ Name     │  │ Name     │
│ 2h ago   │  │ 1d ago   │    │ by John  │  │ by Jane  │
│          │  │          │    │ 3d ago   │  │ 5d ago   │
└──────────┘  └──────────┘    └──────────┘  └──────────┘
```

---

## 7. Technical Implementation

### 7.1 Firestore Schema Extensions
```typescript
// Add collaborators subcollection
canvases/{canvasId}/collaborators/{userId}: {
  userId: string;
  email: string;
  role: 'owner' | 'designer';
  addedAt: Timestamp;
}

// Update user index with role
users/{userId}/canvases/{canvasId}: {
  role: 'owner' | 'designer'; // Feature 9 addition
  lastOpened: Timestamp;
}

// User directory for search (may need creation)
users/{userId}: {
  email: string;
  displayName: string;
  photoURL?: string;
}
```

### 7.2 Security Rules
```javascript
match /canvases/{canvasId} {
  function isCollaborator() {
    return exists(/databases/$(database)/documents/canvases/$(canvasId)/collaborators/$(request.auth.uid));
  }
  
  function isOwner() {
    let role = get(/databases/$(database)/documents/canvases/$(canvasId)/collaborators/$(request.auth.uid)).data.role;
    return role == 'owner';
  }
  
  allow read: if isCollaborator();
  allow write: if isCollaborator(); // objects/layers
  allow delete: if isOwner();
  
  match /collaborators/{userId} {
    allow read: if isCollaborator();
    allow write: if isOwner();
  }
}
```

### 7.3 Architecture Extensions

**Update Feature Slice:**
```
src/features/lookbooks/
├── components/
│   ├── ShareModal.tsx // NEW
│   ├── CollaboratorList.tsx // NEW
│   ├── UserSearch.tsx // NEW
│   ├── PresenceBadges.tsx // NEW
│   ├── TransferOwnershipDialog.tsx // NEW
│   ├── LeaveConfirmation.tsx // NEW
│   ├── LookbookCard.tsx (update: owner badge)
│   └── ... (existing)
├── hooks/
│   ├── useCollaborators.ts // NEW
│   ├── useUserSearch.ts // NEW
│   ├── useIsOwner.ts // NEW
│   └── ... (existing)
├── lib/
│   └── lookbooksStore.ts (extend: collaborator state)
├── services/
│   ├── collaboratorService.ts // NEW
│   └── lookbooksService.ts (extend)
└── ...
```

### 7.4 Key Hooks

**Permission Check:**
```typescript
export function useIsOwner(canvasId: string) {
  const { user } = useAuth();
  const { collaborators } = useCollaborators(canvasId);
  return collaborators.find(c => c.userId === user.uid)?.role === 'owner';
}
```

**User Search:**
```typescript
// Query Firestore users collection
usersRef
  .where('email', '>=', searchTerm)
  .where('email', '<=', searchTerm + '\uf8ff')
  .limit(10);
// Debounce input 300ms, exclude current user + existing collaborators
```

**Collaborator Sync:**
```typescript
onSnapshot(collection(db, `canvases/${canvasId}/collaborators`), (snap) => {
  const collaborators = snap.docs.map(doc => doc.data());
  lookbooksStore.setState({ collaborators });
});
```

### 7.5 Ownership Transfer
Transaction updates:
```typescript
batch.update(collaboratorRef(currentOwnerId), { role: 'designer' });
batch.update(collaboratorRef(newOwnerId), { role: 'owner' });
batch.update(userIndexRef(currentOwnerId), { role: 'designer' });
batch.update(userIndexRef(newOwnerId), { role: 'owner' });
```

### 7.6 Performance
- Cache collaborators in Zustand
- Debounce search (300ms)
- Throttle presence updates (1s)
- Parallel queries for repository split view

---

## 8. Success Metrics

**Functionality:** Add/remove designers, ownership transfer, permission checks enforce correctly, deletion removes all access  
**Performance:** User search <300ms, collaborator load <200ms, repository <500ms (20 Lookbooks), sync <100ms  
**UX:** Presence updates <1s, clear owner/designer distinction, no permission confusion  
**Integration:** No regressions, existing sync handles multi-user, Last-Write-Wins conflict resolution

---

## 9. Open Questions

1. **Email notifications?** → Out of scope (add later)  
2. **Invitation approval?** → No, instant access (like Google Docs)  
3. **Multiple owners?** → No, single owner for clarity  
4. **Designer limits?** → No hard limit (test at 50+ users)  
5. **Username search?** → Search displayName + email (no unique username requirement)

---

## 10. Files

**NEW:**
```
src/features/lookbooks/components/
  ShareModal.tsx, CollaboratorList.tsx, UserSearch.tsx
  PresenceBadges.tsx, TransferOwnershipDialog.tsx, LeaveConfirmation.tsx
src/features/lookbooks/hooks/
  useCollaborators.ts, useUserSearch.ts, useIsOwner.ts
src/features/lookbooks/services/
  collaboratorService.ts
```

**UPDATE:**
```
src/features/lookbooks/components/LookbookCard.tsx (owner badge)
src/features/lookbooks/lib/lookbooksStore.ts (collaborator state)
src/features/lookbooks/services/lookbooksService.ts (permissions)
app/mylookbooks/page.tsx (split layout)
app/canvas/[canvasId]/page.tsx (presence, share button)
firestore.rules (collaborator permissions)
```

**REUSE:** Feature 2 presence, Feature 8 components, ShadCN (Dialog, Avatar, Badge, Input), Firebase patterns, Last-Write-Wins

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Build After:** Feature 8 (My Lookbooks)
