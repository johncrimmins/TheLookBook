# Console & Error Monitoring

## Overview
Monitor runtime errors, Firebase issues, and memory leaks during development and production.

---

## Test Scenarios

### 1. Runtime Error Detection

**Prompt:**
```
Navigate to /canvas/[canvasId]. Monitor console messages. Perform these actions:
- Create 10 objects (rectangles and circles)
- Multi-select and duplicate all
- Toggle layer visibility (3 layers)
- Rapid pan and zoom
- Delete all objects and undo

List any console errors or warnings.
```

**What to Look For:**
- Zero console errors
- Warnings acceptable for dev builds
- No React render errors
- No Zustand store errors
- No Konva rendering errors

**Success Criteria:** Zero errors, warnings only in dev mode

---

### 2. Firebase Connection Errors

**Prompt:**
```
Navigate to /canvas/[canvasId]. List console messages filtered by "firebase" or "error".
Check for authentication issues, permission errors, or connection problems.
```

**What to Look For:**
- No "permission denied" errors
- No failed authentication attempts
- Firestore rules working correctly
- RTDB rules working correctly
- No CORS or configuration errors

**Success Criteria:** Zero Firebase permission or connection errors

---

### 3. Memory Leak Detection

**Prompt:**
```
Start a performance trace with memory profiling enabled. 
Create 100 objects, delete all, repeat this cycle 5 times. 
Analyze memory usage for continuous growth (memory leaks).
```

**What to Look For:**
- Memory releases after object deletion
- No continuous memory growth
- Zustand stores cleaning up properly
- Konva objects disposed correctly
- No retained detached DOM nodes

**Success Criteria:** Stable memory after 5 cycles, no continuous growth

---

### 4. Network Request Errors

**Prompt:**
```
Navigate to /canvas/[canvasId]. List all network requests.
Filter by status code 4xx or 5xx. Check for failed requests.
```

**What to Look For:**
- No 400 Bad Request errors
- No 401 Unauthorized errors
- No 403 Forbidden errors
- No 404 Not Found errors
- No 500 Server errors
- No 429 Rate Limit errors

**Success Criteria:** All network requests return 2xx status codes

---

### 5. React Render Errors

**Prompt:**
```
Navigate to /mylookbooks, then /canvas/[canvasId]. 
Monitor console for React errors during navigation.
Create objects, toggle panels, switch tools.
```

**What to Look For:**
- No "Cannot read property of undefined" errors
- No React key warnings
- No unmounted component warnings
- No hydration mismatches
- Proper error boundaries

**Success Criteria:** Zero React errors or warnings

---

### 6. Firestore Query Errors

**Prompt:**
```
Navigate to /mylookbooks. Monitor console.
Create 5 Lookbooks, rename 2, delete 1.
List any Firestore query or permission errors.
```

**What to Look For:**
- No "Missing or insufficient permissions"
- No query errors
- Compound indexes not required
- Efficient query patterns
- No unexpected slow queries

**Success Criteria:** All Firestore queries succeed, no permission errors

---

### 7. RTDB Presence Errors

**Prompt:**
```
Navigate to /canvas/[canvasId]. Open 3 tabs.
Close tabs 1 and 2 abruptly. Monitor console in tab 3.
Check for presence cleanup errors.
```

**What to Look For:**
- Presence entries removed correctly
- No orphaned presence records
- OnDisconnect handlers working
- No RTDB permission errors

**Success Criteria:** Clean presence removal, no errors

---

### 8. History System Errors (Feature 5)

**Prompt:**
```
Create 10 objects. Perform 20 operations (move, delete, create).
Undo 20 times, redo 20 times. Monitor console for history errors.
```

**What to Look For:**
- No "Invalid history state" errors
- Undo/redo doesn't corrupt state
- History store limits working (50 actions)
- No memory leaks from history

**Success Criteria:** Zero history system errors

---

### 9. Multi-Select Console Errors (Feature 6)

**Prompt:**
```
Create 50 objects. Perform marquee selection to select all.
Execute bulk operations: delete all, undo, duplicate all, move all.
Monitor console for selection-related errors.
```

**What to Look For:**
- No selection store errors
- Bulk operations don't throw errors
- Properties panel handles multi-select correctly
- No undefined object errors

**Success Criteria:** Zero selection errors during bulk operations

---

### 10. Layer System Errors (Feature 7)

**Prompt:**
```
Create 5 layers with 10 objects each. Perform operations:
- Rename layers
- Toggle visibility and lock
- Move objects between layers
- Delete a layer with objects

Monitor console for layer-related errors.
```

**What to Look For:**
- No "layerId undefined" errors
- Objects migrate to Default Layer correctly
- Visibility/lock inheritance no errors
- Firestore sync successful

**Success Criteria:** Zero layer system errors

**Known Issues:** Feature 7 has minor bugs (per activeContext.md) - document errors found

---

## Error Monitoring Checklist

### Critical Errors (Must Fix)
- [ ] No Firebase permission errors
- [ ] No React render errors
- [ ] No network 4xx/5xx errors
- [ ] No memory leaks
- [ ] No state corruption errors

### Warnings (Acceptable in Dev)
- [ ] PropTypes warnings (dev only)
- [ ] Console.log statements (remove for production)
- [ ] Development-mode warnings

---

## Common Error Patterns

### 1. "Cannot read property 'X' of undefined"
**Cause:** Missing null checks, improper optional chaining  
**Test:** Navigate rapidly between pages, create/delete objects quickly  
**Fix:** Add proper null checks and optional chaining

### 2. "Missing or insufficient permissions"
**Cause:** Firestore/RTDB rules incorrect  
**Test:** Try operations while logged out or with different users  
**Fix:** Update firestore.rules and database.rules.json

### 3. Memory Leak from Event Listeners
**Cause:** Listeners not cleaned up on unmount  
**Test:** Create objects, navigate away, return - repeat 10x  
**Fix:** Add cleanup in useEffect return functions

---

*Related: [network-reliability.md](./network-reliability.md), [performance.md](./performance.md)*

