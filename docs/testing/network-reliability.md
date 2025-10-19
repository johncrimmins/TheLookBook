# Network & Reliability Testing

## Requirements (from requirements.md Section 1)
- **Auto-reconnects** after 30s+ network drop
- **Operations queue** and sync on reconnect
- **Clear UI indicator** for connection status
- **4 Persistence Test Scenarios:**
  1. Mid-Operation Refresh
  2. Total Disconnect
  3. Network Simulation (30s offline)
  4. Rapid Disconnect

---

## Test Scenarios

### 1. Mid-Operation Refresh (Persistence Test #1)

**Prompt:**
```
Navigate to /canvas/[canvasId]. Create 5 objects, then start dragging one object.
Immediately refresh the browser mid-drag. Check if the object position is preserved
after reload.
```

**What to Look For:**
- Object position persists to last saved state
- No data loss during refresh
- Canvas reloads to correct state
- No ghost objects

**Success Criteria:** Object position preserved, no data loss

---

### 2. Total Disconnect (Persistence Test #2)

**Prompt:**
```
Open /canvas/[canvasId], create 10 objects with various properties (colors, sizes).
Close all browser tabs, wait 2 minutes, reopen canvas. 
Verify all objects and properties persist exactly.
```

**What to Look For:**
- All 10 objects present after reopening
- Object properties intact (color, size, position)
- Canvas state fully restored
- No corruption or data loss

**Success Criteria:** Full canvas state intact after total disconnect

---

### 3. Network Simulation - 30s Offline (Persistence Test #3)

**Prompt:**
```
Navigate to /canvas/[canvasId]. Use emulate_network to set "Offline" mode.
Create 5 objects during offline period. Wait 30 seconds. 
Restore network and check if objects sync to Firestore.
Monitor console for reconnection logic.
```

**What to Look For:**
- Objects queue locally during disconnect
- Auto-reconnect triggers within 5 seconds of restoration
- All queued operations sync to Firestore
- No data loss
- Connection status indicator visible

**Success Criteria:** All queued operations sync, auto-reconnect <5s

---

### 4. Rapid Disconnect (Persistence Test #4)

**Prompt:**
```
Open /canvas/[canvasId]. Make 5 rapid edits (create objects, move them).
Immediately close the tab within 2 seconds of last edit.
Open /canvas/[canvasId] in a new tab. Check if all edits persisted.
```

**What to Look For:**
- All 5 edits persisted for other users
- Firestore debouncing handled correctly
- No lost operations
- Other users see all changes

**Success Criteria:** Edits persist even with immediate tab close

---

### 5. Slow 3G Performance

**Prompt:**
```
Emulate Slow 3G network. Navigate to /canvas/[canvasId] with 100 objects.
Test canvas operations: create object, move object, multi-select, delete.
Check for UI freezing and responsiveness.
```

**What to Look For:**
- UI remains responsive (optimistic updates)
- Loading states visible where appropriate
- Operations eventually sync (within 2 seconds)
- No frozen UI or blocking
- User can continue working

**Success Criteria:** UI remains responsive, operations sync within 2s

---

### 6. Fast 4G Performance

**Prompt:**
```
Emulate Fast 4G network. Navigate to /canvas/[canvasId].
Perform 20 rapid operations (create, move, delete objects).
Monitor network requests and operation timing.
```

**What to Look For:**
- All operations complete quickly
- Network requests efficient
- No throttling or delays
- Smooth user experience

**Success Criteria:** All operations complete <500ms on Fast 4G

---

### 7. Firestore Connection Errors

**Prompt:**
```
Navigate to /canvas/[canvasId]. Monitor console messages.
Emulate "Offline" mode, try to create objects, then restore network.
Check for proper error handling and retry logic.
```

**What to Look For:**
- Console shows connection error (expected)
- App handles error gracefully
- Auto-retry on reconnection
- User sees connection status indicator
- No app crash or corruption

**Success Criteria:** Graceful error handling, auto-retry works

---

### 8. RTDB Connection Errors

**Prompt:**
```
Navigate to /canvas/[canvasId] with 2 tabs open. 
Emulate "Offline" in tab 1. Move objects in tab 2.
Restore network in tab 1. Check if cursor and presence sync correctly.
```

**What to Look For:**
- Tab 1 reconnects to RTDB within 5 seconds
- Presence updates correctly
- Cursors resync
- No stale presence data

**Success Criteria:** RTDB reconnects <5s, presence/cursors sync correctly

---

### 9. Multi-User Disconnect Scenario

**Prompt:**
```
Open 3 browser tabs. Emulate "Offline" in tab 1 for 30 seconds.
Tabs 2 and 3 continue editing (create 10 objects each).
Restore network in tab 1. Check if tab 1 receives all updates from tabs 2 and 3.
```

**What to Look For:**
- Tab 1 receives all 20 objects after reconnection
- No conflicts or data loss
- State converges correctly
- Operations from all users preserved

**Success Criteria:** Full state sync after reconnection, no data loss

---

### 10. Lookbook CRUD During Network Issues (Feature 8)

**Prompt:**
```
Navigate to /mylookbooks. Emulate Slow 3G.
Create 3 Lookbooks, rename 1, delete 1.
Check operation timing and success rates.
```

**What to Look For:**
- Operations eventually succeed
- Loading states visible
- No timeout errors
- Firestore handles slow network gracefully
- User can continue working

**Success Criteria:** All operations succeed within 5s on Slow 3G

---

## Persistence Checklist

Based on requirements.md Section 1:

- [ ] **Mid-Operation Refresh:** Object position preserved during drag-refresh
- [ ] **Total Disconnect:** Full state intact after 2+ minutes offline
- [ ] **Network Simulation:** 30s offline → auto-reconnect → full sync
- [ ] **Rapid Disconnect:** Edits persist with immediate tab close

---

## Network Emulation Settings

| Profile | Download | Upload | Latency | Use Case |
|---------|----------|--------|---------|----------|
| Slow 3G | 400 Kbps | 400 Kbps | 2000ms | Mobile (poor) |
| Fast 3G | 1.6 Mbps | 750 Kbps | 562ms | Mobile (average) |
| Fast 4G | 4 Mbps | 3 Mbps | 170ms | Mobile (good) |
| Offline | 0 | 0 | - | Disconnect testing |

---

*Related: [collaboration.md](./collaboration.md), [monitoring.md](./monitoring.md)*

