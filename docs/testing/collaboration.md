# Collaboration Testing

## Requirements
- **Real-Time Synchronization:** Zero visible lag during rapid multi-user edits
- **Cursor Sync:** Sub-50ms cursor sync
- **Conflict Resolution:** Last-write-wins, no ghost objects
- **Concurrent Users:** Supports 5+ concurrent users

---

## Test Scenarios

### 1. Cursor Sync Latency (<50ms Target)

**Prompt:**
```
Open two browser tabs to the same canvas. Start network monitoring and console logging.
Move the cursor rapidly in one tab. Measure the time between cursor movement and
RTDB update in the network tab.
```

**What to Look For:**
- RTDB cursor updates <50ms roundtrip
- No cursor stuttering or lag
- Throttling working correctly (60fps max, 16ms intervals)
- Cursor color consistent per user

**Success Criteria:** Cursor sync consistently <50ms, smooth 60 FPS

---

### 2. Simultaneous Object Edits (Conflict Resolution)

**Prompt:**
```
Open two browser tabs. Create an object in one tab, then move it simultaneously in both tabs.
Monitor console for conflicts and check final object state consistency.
```

**What to Look For:**
- Last-write-wins resolution working
- No "ghost" objects or duplicates
- Console shows no errors
- Final state consistent across both tabs
- Both users see same final position

**Success Criteria:** Consistent final state, zero errors, no duplicates

---

### 3. Presence System Validation

**Prompt:**
```
Navigate to /canvas/[canvasId] and take a snapshot. Check if OnlineUsers component
shows current user. List network requests to confirm RTDB presence updates.
```

**What to Look For:**
- Presence written to RTDB on join
- User appears in OnlineUsers list
- Cursor color generated consistently
- Heartbeat mechanism active
- User removed from list on disconnect

**Success Criteria:** Immediate presence updates, accurate online user list

---

### 4. Multi-User Object Creation (5+ Users)

**Prompt:**
```
Open 5 browser tabs to the same canvas. In each tab simultaneously:
- Tab 1: Create 5 rectangles
- Tab 2: Create 5 circles
- Tab 3: Create 5 rectangles
- Tab 4: Create 5 circles
- Tab 5: Create 5 rectangles

Monitor network and console. Check if all 25 objects appear in all tabs.
```

**What to Look For:**
- All 25 objects sync to all tabs
- Objects appear in <100ms
- No conflicts or lost objects
- No console errors
- Consistent object IDs across tabs

**Success Criteria:** All objects sync to all users in <100ms, zero conflicts

---

### 5. Rapid Concurrent Edits (Stress Test)

**Prompt:**
```
Open 3 browser tabs. In each tab, create 50 objects rapidly (one every 100ms).
Monitor Firestore write rate, check for throttling or rate limit errors.
Monitor console for conflicts.
```

**What to Look For:**
- No 429 rate limit errors
- All 150 objects eventually sync
- Optimistic updates working
- No data loss
- Firestore batching efficient

**Success Criteria:** All objects sync without errors, no rate limiting

---

### 6. Simultaneous Multi-Select Operations

**Prompt:**
```
Create 20 objects. Open 2 tabs. In tab 1, select objects 1-10 and delete them.
Simultaneously in tab 2, select objects 5-15 and duplicate them.
Check final state consistency.
```

**What to Look For:**
- Operations resolve correctly (last-write-wins)
- No ghost objects remaining
- Consistent final state across tabs
- History syncs correctly
- No console errors

**Success Criteria:** Consistent final state, operations resolve correctly

---

### 7. Cursor Performance with 5+ Users

**Prompt:**
```
Open 6 browser tabs to the same canvas. Move cursors rapidly in all tabs simultaneously.
Start a performance trace in one tab. Check FPS and cursor rendering performance.
```

**What to Look For:**
- 60 FPS maintained with 6 cursors
- All cursors visible and smooth
- No cursor stuttering
- RTDB handling load efficiently
- Cursor throttling working (60 FPS per user)

**Success Criteria:** Steady 60 FPS with 5+ cursors active

---

### 8. Layer Visibility Sync (Feature 7)

**Prompt:**
```
Create 5 layers with 10 objects each. Open 2 tabs. In tab 1, toggle layer visibility
for layers 1, 3, and 5. Check if tab 2 reflects changes in real-time.
```

**What to Look For:**
- Layer visibility syncs <500ms
- Objects hidden/shown correctly in both tabs
- Firestore updates efficient
- No flickering or visual bugs

**Success Criteria:** Layer state syncs in <500ms, consistent across users

---

### 9. Lookbook Real-Time Updates (Feature 8)

**Prompt:**
```
Open /mylookbooks in two tabs. Create a Lookbook in tab 1. 
Measure how quickly it appears in tab 2. Rename it in tab 2, check tab 1.
```

**What to Look For:**
- New Lookbook appears in <1 second
- Rename syncs in <500ms
- Real-time subscription working
- No duplicate Lookbooks
- Consistent state across tabs

**Success Criteria:** Updates appear <1s, renames sync <500ms

---

### 10. Disconnect and Reconnect (Multi-User)

**Prompt:**
```
Open 3 tabs. In tab 1, emulate network "Offline" for 30 seconds while creating 5 objects.
In tabs 2 and 3, continue editing normally. Restore network in tab 1.
Check if all tabs converge to consistent state.
```

**What to Look For:**
- Tab 1 queues operations during offline
- Tabs 2 and 3 continue working
- Tab 1 auto-reconnects within 5 seconds
- All queued operations sync
- Final state consistent across all tabs

**Success Criteria:** Full state convergence after reconnection, no data loss

---

## Multi-User Test Matrix

| Scenario | Users | Duration | Success Criteria |
|----------|-------|----------|------------------|
| Cursor sync | 2 | 30s | <50ms latency |
| Object creation | 5 | 1 min | All objects sync <100ms |
| Simultaneous edits | 2 | 2 min | Consistent final state |
| Stress test | 3 | 5 min | Zero errors, all sync |
| Layer operations | 2 | 1 min | State syncs <500ms |

---

*Related: [performance.md](./performance.md), [network-reliability.md](./network-reliability.md)*

