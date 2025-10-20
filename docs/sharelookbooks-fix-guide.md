# ShareLookbooks Fix Implementation Guide

**Date:** 2025-10-20  
**Status:** ✅ ALL FIXES COMPLETE (Fixes #1-4)  
**Priority:** P0 - RESOLVED

---

## Overview

ShareLookbooks feature has data flow issues causing potential infinite loops and state pollution. This guide covers the remaining 3 fixes after Fix #1 (duplicate subscription) was completed.

### Root Causes Identified

1. ✅ **Fixed:** Duplicate Firestore subscriptions (ShareModal + CanvasToolbar)
2. ✅ **Fixed:** Global state pollution - now uses canvas-keyed `collaboratorsByCanvas`
3. ✅ **Fixed:** Async in onSnapshot - extracted `fetchLookbooksMetadata()` helper
4. ✅ **Fixed:** Closure stale state - replaced with React `loadingState` useState

---

## Fix #2: Make Collaborators Canvas-Specific (Priority: P0)

### Problem
`lookbooksStore` has global `collaborators: Collaborator[]` array. When user opens multiple canvases:
- Canvas A sets `collaborators = [user1, user2]`
- Canvas B sets `collaborators = [user3, user4]`
- Canvas A still mounted → reads wrong collaborators!

### Solution: Canvas-Keyed Storage

**Files to Update:**

**1. `src/features/lookbooks/lib/lookbooksStore.ts` (lines 4-84)**

```typescript
// BEFORE (lines 11-12)
collaborators: Collaborator[];

// AFTER
collaboratorsByCanvas: Record<string, Collaborator[]>;

// BEFORE (line 71)
setCollaborators: (collaborators) => set({ collaborators }),

// AFTER
setCollaborators: (canvasId: string, collaborators: Collaborator[]) =>
  set((state) => ({
    collaboratorsByCanvas: {
      ...state.collaboratorsByCanvas,
      [canvasId]: collaborators,
    },
  })),

// Update initial state (line 37)
collaboratorsByCanvas: {},
```

**2. `src/features/lookbooks/hooks/useCollaborators.ts` (lines 8-41)**

```typescript
// BEFORE (line 11)
const { collaborators, setCollaborators } = useLookbooksStore();

// AFTER
const { collaboratorsByCanvas, setCollaborators } = useLookbooksStore();
const collaborators = canvasId ? (collaboratorsByCanvas[canvasId] ?? []) : [];

// Update subscription callback (line 24-25)
// BEFORE
setCollaborators(newCollaborators);

// AFTER
setCollaborators(canvasId, newCollaborators);

// Update cleanup (line 32)
// BEFORE
setCollaborators([]);

// AFTER
if (canvasId) {
  setCollaborators(canvasId, []);
}
```

**3. `src/features/canvas/components/CanvasToolbar.tsx` (line 34)**

No changes needed - already uses `useCollaborators(canvasId)` which will use new structure.

### Validation
1. Open Canvas A → note collaborators
2. Open Canvas B in new tab → note different collaborators
3. Switch back to Canvas A → verify still shows Canvas A's collaborators
4. Check console: no "wrong collaborators" or state mixing

---

## Fix #3: Move Async Fetch Outside onSnapshot (Priority: P1)

### Problem
`subscribeToUserLookbooksByRole` in `lookbooksService.ts` (lines 185-236) has:
```typescript
return onSnapshot(roleQuery, async (snapshot) => {
  const lookbooks = await Promise.all(...); // ⚠️ Async in callback
  callback(lookbooks);
});
```

If `getLookbook()` is slow → blocks subscription handler → component re-renders → dependencies change → re-subscribe → **infinite loop!**

### Solution: Synchronous Callback + Async Side Effect

**File: `src/features/lookbooks/services/lookbooksService.ts` (lines 174-237)**

```typescript
// ADD NEW HELPER FUNCTION (before subscribeToUserLookbooksByRole)
async function fetchLookbooksMetadata(canvasIds: string[]): Promise<Lookbook[]> {
  if (canvasIds.length === 0) return [];
  
  const lookbooksPromises = canvasIds.map((canvasId) => getLookbook(canvasId));
  const lookbooks = await Promise.all(lookbooksPromises);
  
  return lookbooks
    .filter((lb): lb is Lookbook => lb !== null)
    .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
}

// REFACTOR subscribeToUserLookbooksByRole (lines 174-237)
export function subscribeToUserLookbooksByRole(
  userId: string,
  role: 'owner' | 'designer',
  callback: (lookbooks: Lookbook[]) => void,
  onError?: (error: Error) => void
): () => void {
  console.log('[Lookbooks] Subscribing to lookbooks by role:', { userId, role });
  const db = getDb();
  const userCanvasesRef = collection(db, `users/${userId}/canvases`);
  const roleQuery = query(userCanvasesRef, where('role', '==', role));

  return onSnapshot(
    roleQuery,
    (snapshot) => {
      // SYNCHRONOUS: Extract canvas IDs
      const canvasIds = snapshot.docs.map((doc) => doc.id);
      
      console.log('[Lookbooks] Subscription snapshot received:', {
        role,
        count: canvasIds.length,
        canvasIds
      });
      
      // ASYNC SIDE EFFECT: Fetch metadata (not blocking subscription)
      fetchLookbooksMetadata(canvasIds)
        .then(callback)
        .catch((error) => {
          console.error('[Lookbooks] Error loading lookbooks by role:', error);
          if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        });
    },
    (error) => {
      console.error('[Lookbooks] Subscription error:', { role, error });
      if (onError) onError(error);
    }
  );
}
```

### Validation
1. Open `/mylookbooks` page
2. Check console: "Subscription snapshot received" logs should be instant
3. No delays between snapshot and callback
4. Switch between tabs rapidly → no duplicate subscriptions

---

## Fix #4: Stabilize Loading State Logic (Priority: P1)

### Problem
`useLookbooksByRole` (lines 76-84) uses closure variables:
```typescript
let ownedReceived = false;
let sharedReceived = false;
```
If component re-renders, new variables created → old subscription callbacks reference stale closures → loading never completes!

### Solution: React State Instead of Closures

**File: `src/features/lookbooks/hooks/useLookbooks.ts` (lines 57-163)**

```typescript
export function useLookbooksByRole() {
  const { user } = useAuth();
  const [ownedLookbooks, setOwnedLookbooks] = useState<Lookbook[]>([]);
  const [sharedLookbooks, setSharedLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ADD: React state for tracking responses
  const [loadingState, setLoadingState] = useState({
    ownedReceived: false,
    sharedReceived: false,
  });

  useEffect(() => {
    if (!user) {
      setOwnedLookbooks([]);
      setSharedLookbooks([]);
      setLoading(false);
      return;
    }

    console.log('[useLookbooksByRole] Setting up subscriptions for user:', user.id);
    setLoading(true);
    setError(null);
    setLoadingState({ ownedReceived: false, sharedReceived: false }); // RESET

    try {
      const unsubscribeOwned = subscribeToUserLookbooksByRole(
        user.id,
        'owner',
        (lookbooks) => {
          setOwnedLookbooks(lookbooks);
          setLoadingState((prev) => ({ ...prev, ownedReceived: true })); // STATE UPDATE
        },
        (err) => {
          console.error('[useLookbooksByRole] Failed to load owned lookbooks:', err);
          setOwnedLookbooks([]);
          setLoadingState((prev) => ({ ...prev, ownedReceived: true }));
          if (!err.message.includes('permission')) {
            setError(err.message);
          }
        }
      );

      const unsubscribeShared = subscribeToUserLookbooksByRole(
        user.id,
        'designer',
        (lookbooks) => {
          setSharedLookbooks(lookbooks);
          setLoadingState((prev) => ({ ...prev, sharedReceived: true })); // STATE UPDATE
        },
        (err) => {
          console.error('[useLookbooksByRole] Failed to load shared lookbooks:', err);
          setSharedLookbooks([]);
          setLoadingState((prev) => ({ ...prev, sharedReceived: true }));
          if (!err.message.includes('permission')) {
            setError(err.message);
          }
        }
      );

      return () => {
        unsubscribeOwned();
        unsubscribeShared();
      };
    } catch (err) {
      console.error('Failed to subscribe to Lookbooks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Lookbooks');
      setLoading(false);
    }
  }, [user]);

  // ADD: Separate effect to check loading complete
  useEffect(() => {
    if (loadingState.ownedReceived && loadingState.sharedReceived) {
      setLoading(false);
    }
  }, [loadingState]);

  return { ownedLookbooks, sharedLookbooks, loading, error };
}
```

### Validation
1. Open `/mylookbooks`
2. Check loading spinner appears then disappears
3. Rapidly switch tabs → loading state resolves correctly
4. No stuck loading spinners

---

## Architecture Alignment

These fixes align with CollabCanvas architectural patterns:

1. **Vertical Slicing:** All fixes contained within `lookbooks` feature
2. **Zustand Best Practices:** Canvas-specific state keys prevent global pollution
3. **Service Layer Pattern:** Async logic stays in service layer, not subscription callbacks
4. **React Patterns:** Use React state instead of closures for component lifecycle

---

## Testing Checklist

**Implementation Complete - Ready for User Validation:**
- [x] Fix #2: Canvas-keyed state prevents global pollution
- [x] Fix #3: Synchronous onSnapshot prevents infinite loops
- [x] Fix #4: React state prevents stale closures
- [x] All files pass TypeScript strict checks & linting
- [x] Zero breaking changes - all consumers compatible
- [ ] **User Testing Required:**
  - [ ] No console errors in production
  - [ ] No "maximum update depth" warnings
  - [ ] Firestore subscriptions count correct (DevTools Network tab)
  - [ ] Data displays correctly across multiple canvases
  - [ ] Opening/closing ShareModal works smoothly
  - [ ] Multiple canvas tabs work independently (no state mixing)

---

*End of Guide*

