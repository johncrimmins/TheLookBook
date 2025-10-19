# Chrome DevTools MCP Testing Guide

## Overview

This document maps Chrome DevTools MCP capabilities to CollabCanvas v3's requirements and features. Use this as a reference for testing production-ready features and validating performance targets.

**Prerequisites:** Chrome DevTools MCP configured in Cursor (see setup in main conversation)

---

## Quick Reference: What DevTools Can Test

| Capability | CollabCanvas Use Case |
|------------|----------------------|
| **Performance Tracing** | Validate 60 FPS, <100ms sync, canvas performance with 500+ objects |
| **Network Analysis** | Check Firebase RTDB/Firestore latency, measure sync times |
| **Console Monitoring** | Catch runtime errors during collaboration |
| **User Simulation** | Automate multi-user interaction testing |
| **Screenshot/Snapshot** | Document UI states, capture bugs visually |
| **Real-time Debugging** | Inspect live canvas state during operations |

---

## Section 1: Performance Testing

### Requirements from requirements.md
- **Real-Time Sync:** Sub-100ms object sync, Sub-50ms cursor sync
- **Performance & Scalability:** Consistent performance with 500+ objects, 60 FPS
- **Canvas Functionality:** Smooth pan/zoom, 5+ concurrent users

### Test Scenarios

#### 1.1 Object Sync Latency (<100ms Target)
**Prompt:**
```
Start a performance trace, then create 10 rectangles on the canvas at /canvas/[canvasId]. 
Stop the trace and analyze object creation performance. Check if any operations exceed 100ms.
```

**What to Look For:**
- Network requests to Firestore should complete <100ms
- RTDB broadcasts should be <50ms
- Total end-to-end object creation <100ms

#### 1.2 Canvas Performance with 500+ Objects
**Prompt:**
```
Navigate to /canvas/[canvasId], start a performance trace, then create 500 rectangles. 
Analyze FPS and check for frame drops. Look for any layout thrashing or expensive renders.
```

**What to Look For:**
- Steady 60 FPS during object creation
- No long tasks >50ms
- Smooth rendering without jank

#### 1.3 Pan/Zoom Performance
**Prompt:**
```
Start a performance trace, then simulate panning and zooming on the canvas for 10 seconds. 
Check FPS during interactions and identify any performance bottlenecks.
```

**What to Look For:**
- Consistent 60 FPS during pan/zoom
- Konva layer rendering optimizations working
- No excessive re-renders

#### 1.4 Multi-Select & Bulk Operations (Feature 6)
**Prompt:**
```
Create 50 objects, then start a performance trace. Perform marquee selection to select all objects,
then duplicate them. Analyze bulk operation performance.
```

**What to Look For:**
- Bulk operations complete in <2 seconds
- No UI freezing during multi-select
- History system doesn't degrade performance

---

## Section 2: Collaboration Testing

### Requirements from requirements.md
- **Real-Time Synchronization:** Zero visible lag during rapid multi-user edits
- **Presence & Cursors:** Sub-50ms cursor sync
- **Supports 5+ concurrent users**

### Test Scenarios

#### 2.1 Cursor Sync Latency (<50ms Target)
**Prompt:**
```
Open two browser tabs to the same canvas. Start network monitoring and console logging.
Move the cursor rapidly in one tab. Measure the time between cursor movement and
RTDB update in the network tab.
```

**What to Look For:**
- RTDB cursor updates <50ms roundtrip
- No cursor stuttering or lag
- Throttling working correctly (60fps max)

#### 2.2 Simultaneous Object Edits (Conflict Resolution)
**Prompt:**
```
Open two browser tabs. Create an object in one tab, then move it simultaneously in both tabs.
Monitor console for conflicts and check final object state consistency.
```

**What to Look For:**
- Last-write-wins resolution working
- No "ghost" objects or duplicates
- Console shows no errors
- Final state consistent across tabs

#### 2.3 Presence System (Feature 2)
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

---

## Section 3: Feature Testing

### Feature 6: Multi-Select

#### 3.1 Marquee Selection Performance
**Prompt:**
```
Create 100 objects, then start a performance trace. Perform marquee selection to select
50 objects. Check FPS and interaction responsiveness during selection.
```

**Requirements:** Smooth 60 FPS marquee, visual feedback

#### 3.2 Bulk Operations Console Errors
**Prompt:**
```
Select 10 objects and perform: delete all, undo, duplicate all, move all, paste.
Monitor console for any errors during bulk operations.
```

**Requirements:** Zero console errors, all operations reversible

### Feature 7: Hierarchical Layers

#### 7.1 Layer Visibility & Lock Inheritance
**Prompt:**
```
Navigate to /canvas/[canvasId]. Create 3 layers with 5 objects each. Toggle layer visibility
and check if objects respect layer state. Take screenshots before and after.
```

**Requirements:** AND logic (object + layer must both be visible)

#### 7.2 Layer Operations Performance
**Prompt:**
```
Create 10 layers with 20 objects each. Start a performance trace and expand/collapse
all layers. Check for any rendering performance issues.
```

**Requirements:** Smooth expansion/collapse, thumbnail rendering <500ms

### Feature 8: My Lookbooks

#### 8.1 CRUD Operations Latency
**Prompt:**
```
Navigate to /mylookbooks. Start network monitoring. Create 5 new Lookbooks, rename 2,
delete 1. Measure Firestore operation times.
```

**Requirements:** 
- Create: <500ms
- Rename: <300ms  
- Delete: <500ms (including subcollection cleanup)

#### 8.2 Real-Time Subscription
**Prompt:**
```
Open /mylookbooks in two tabs. Create a Lookbook in tab 1. Check how quickly it appears
in tab 2. Monitor RTDB/Firestore subscriptions.
```

**Requirements:** Updates appear <1 second in other tabs

---

## Section 4: Network & Reliability Testing

### Requirements from requirements.md
- **Persistence & Reconnection:** Auto-reconnects after 30s+ network drop
- **Operations queue and sync on reconnect**
- **Clear UI indicator for connection status**

### Test Scenarios

#### 4.1 Network Disconnect Simulation
**Prompt:**
```
Navigate to /canvas/[canvasId]. Use emulate_network to set "Offline" mode for 30 seconds.
Create 5 objects during offline period. Restore network and check if objects sync.
Monitor console for reconnection logic.
```

**What to Look For:**
- Objects queue locally during disconnect
- Auto-reconnect triggers within 5 seconds of restoration
- All queued operations sync to Firestore
- No data loss

#### 4.2 Slow 3G Performance
**Prompt:**
```
Emulate Slow 3G network. Navigate to /canvas/[canvasId] with 100 objects.
Test canvas operations: create object, move object, multi-select. Check for UI freezing.
```

**What to Look For:**
- UI remains responsive (optimistic updates)
- Loading states visible
- Operations eventually sync (within 2 seconds)

#### 4.3 Mid-Operation Refresh (Persistence Test)
**Prompt:**
```
Create 5 objects, start dragging one object, then immediately refresh the browser
mid-drag. Check if object position is preserved.
```

**Requirements:** Object position persists (per requirements.md Section 1)

#### 4.4 Total Disconnect Test
**Prompt:**
```
Open /canvas/[canvasId], create 10 objects, close all browser tabs, wait 2 minutes,
reopen canvas. Verify all objects persist.
```

**Requirements:** Full canvas state intact after total disconnect

---

## Section 5: Console & Error Monitoring

### Test Scenarios

#### 5.1 Runtime Error Detection
**Prompt:**
```
Navigate to /canvas/[canvasId]. Monitor console messages. Perform these actions:
- Create objects
- Multi-select and duplicate
- Toggle layer visibility
- Rapid pan/zoom
- Delete and undo

List any console errors or warnings.
```

**Requirements:** Zero errors, warnings acceptable for dev builds

#### 5.2 Firebase Connection Errors
**Prompt:**
```
Navigate to /canvas/[canvasId]. List console messages filtered by "firebase" or "error".
Check for authentication issues, permission errors, or connection problems.
```

**What to Look For:**
- No permission denied errors
- No failed authentication
- Firestore rules working correctly

#### 5.3 Memory Leak Detection
**Prompt:**
```
Start a performance trace with memory profiling. Create 100 objects, delete all,
repeat 5 times. Analyze memory usage for leaks.
```

**What to Look For:**
- Memory releases after object deletion
- No continuous memory growth
- Zustand stores cleaning up properly

---

## Section 6: UI/UX Visual Testing

### Test Scenarios

#### 6.1 Lookbooks Grid Layout (Feature 8)
**Prompt:**
```
Navigate to /mylookbooks. Take screenshots at these viewport sizes:
- 1920x1080 (desktop)
- 1280x720 (laptop)  
- 768x1024 (tablet)
- 375x667 (mobile)

Check responsive grid layout (1-4 columns).
```

#### 6.2 Canvas Toolbar States
**Prompt:**
```
Navigate to /canvas/[canvasId]. Take screenshots of toolbar in these states:
- Select tool active
- Rectangle tool active
- Pan tool active
- With sidebar pinned
- With sidebar unpinned
```

#### 6.3 Layer Panel Expanded/Collapsed
**Prompt:**
```
Navigate to /canvas/[canvasId]. Take screenshots of:
- All layers collapsed
- All layers expanded with 10+ objects each
- Layer context menu open
- LayerModal open (bulk assignment)
```

---

## Section 7: Load Time & Initial Performance

### Requirements from requirements.md
- **Fast load times (<3s initial)**
- **Stable deployment**

### Test Scenarios

#### 7.1 Initial Page Load
**Prompt:**
```
Start a performance trace. Navigate to /mylookbooks from a cold start.
Stop the trace when page is fully interactive. Analyze load time and blocking resources.
```

**Requirements:** 
- First Contentful Paint <1s
- Time to Interactive <3s
- No blocking resources >500ms

#### 7.2 Canvas Load with Objects
**Prompt:**
```
Create a canvas with 500 objects. Clear cache. Start performance trace and navigate
to /canvas/[canvasId]. Measure time until canvas is interactive.
```

**Requirements:** Canvas interactive <3s even with 500 objects

#### 7.3 Core Web Vitals (CWV)
**Prompt:**
```
Start a performance trace with page reload on /mylookbooks. Analyze Core Web Vitals:
LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift).
```

**Targets:**
- LCP: <2.5s (Good)
- FID: <100ms (Good)
- CLS: <0.1 (Good)

---

## Section 8: Advanced Automation Scenarios

### Multi-User Simulation

#### 8.1 5-User Concurrent Editing
**Prompt:**
```
Open 5 browser tabs to the same canvas. In parallel:
- Tab 1: Create 10 rectangles
- Tab 2: Create 10 circles  
- Tab 3: Move objects continuously
- Tab 4: Multi-select and duplicate
- Tab 5: Toggle layer visibility

Monitor network, performance, and console across all tabs. Check for conflicts or errors.
```

**Requirements:** All 5 users see consistent state, <100ms sync, no errors

#### 8.2 Rapid Concurrent Edits (Stress Test)
**Prompt:**
```
Open 3 tabs. In each tab, create 50 objects rapidly (one every 100ms).
Monitor Firestore write rate, check for throttling or rate limit errors.
```

**What to Look For:**
- No 429 rate limit errors
- All objects eventually sync
- Optimistic updates working

---

## Section 9: Testing Checklist by Feature

### ✅ Feature 1: Context Menu
- [ ] Right-click on object opens context menu
- [ ] Context menu shows correct options (delete, duplicate, bring to front, etc.)
- [ ] Keyboard shortcuts displayed correctly
- [ ] No console errors on menu interactions

### ✅ Feature 2: Presence System
- [ ] User cursor appears for other users
- [ ] Cursor color consistent per user
- [ ] Cursor updates <50ms
- [ ] OnlineUsers list shows all active users

### ✅ Feature 3: Canvas Operations
- [ ] Pan works smoothly (60 FPS)
- [ ] Zoom maintains 60 FPS
- [ ] Viewport state persists on refresh

### ✅ Feature 4: Objects (Shapes)
- [ ] Rectangle creation <100ms
- [ ] Circle creation <100ms
- [ ] Object drag smooth (60 FPS)
- [ ] Object sync <100ms across users

### ✅ Feature 5: History (Undo/Redo)
- [ ] Undo works for all operations
- [ ] Redo works after undo
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) work
- [ ] History persists across refresh (last 50 actions)

### ✅ Feature 6: Multi-Select
- [ ] Marquee selection smooth (60 FPS)
- [ ] Bulk delete works
- [ ] Bulk duplicate works
- [ ] Bulk move works
- [ ] Properties panel shows shared properties

### ✅ Feature 7: Hierarchical Layers
- [ ] Layer creation <300ms
- [ ] Layer rename persists
- [ ] Visibility inheritance works (AND logic)
- [ ] Lock inheritance works
- [ ] Move to Layer works
- [ ] LayerModal loads with 20+ objects

### ✅ Feature 8: My Lookbooks
- [ ] Create Lookbook <500ms
- [ ] Rename Lookbook <300ms
- [ ] Delete Lookbook <500ms (with cleanup)
- [ ] Grid layout responsive (1-4 columns)
- [ ] Real-time updates <1s across tabs
- [ ] Empty state displays for new users

---

## Section 10: Performance Benchmarks

### Current Targets (from requirements.md)

| Metric | Target | Test Command |
|--------|--------|-------------|
| Cursor sync | <50ms | Network monitoring during cursor movement |
| Object sync | <100ms | Network monitoring during object creation |
| FPS (pan/zoom) | 60 FPS | Performance trace during interactions |
| 500+ objects | Consistent | Performance trace with 500 objects |
| Concurrent users | 5+ | Multi-tab simulation |
| Initial load | <3s | Performance trace with cold start |
| Undo/redo | <100ms | Performance trace during history operations |

### Example Prompts for Benchmarking

**Cursor Sync Benchmark:**
```
Open /canvas/[canvasId] in two tabs. Start network monitoring in tab 2.
Move cursor rapidly in tab 1 for 30 seconds. List all RTDB cursor update requests
and calculate average latency. Target: <50ms.
```

**Object Sync Benchmark:**
```
Open /canvas/[canvasId] in two tabs. Start network monitoring in both tabs.
Create 20 objects in tab 1 at 1-second intervals. Measure time between creation
and appearance in tab 2. Target: <100ms.
```

**Canvas FPS Benchmark:**
```
Navigate to /canvas/[canvasId] with 500 objects. Start performance trace.
Pan and zoom continuously for 60 seconds. Analyze FPS. Target: steady 60 FPS.
```

---

## Section 11: Known Issues & Edge Cases

### Feature 7: Hierarchical Layers (Minor Bugs)
**Status:** Complete but needs testing/fixes (per activeContext.md)

**Test These Scenarios:**
```
1. Create layer, add 50 objects, delete layer → verify objects move to Default Layer
2. Lock layer, try to select objects → verify objects cannot be selected
3. Hide layer, perform multi-select → verify hidden objects not selected
4. Expand layer with 100 objects → check thumbnail rendering performance
5. Rename layer to empty string → verify validation prevents it
```

### Firebase Initialization (Fixed)
**Previous Issue:** Client-side initialization pattern incorrect  
**Fix:** Now using `getDb()` helper  
**Test:** Navigate to /mylookbooks → verify no Firebase errors in console

---

## Section 12: AI Agent Testing (Future - Phase 2)

### When AI Agent is Implemented

**Requirements (from requirements.md Section 3):**
- 8+ distinct command types
- Sub-2 second response time
- Complex commands execute multi-step plans
- 90%+ accuracy

**Test Prompts (Placeholder for Future):**
```
1. Performance: "Create a login form" → measure execution time (target <2s)
2. Network: Monitor OpenAI/LangChain API calls during AI commands
3. Console: Check for AI parsing errors or tool call failures
4. Multi-user: Verify AI actions sync across all users in real-time
5. Complex Commands: "Create 5 evenly spaced circles" → verify layout accuracy
```

---

## Tips for Effective Testing

### 1. Use Snapshots Before Screenshots
- Snapshots are faster and give you element UIDs for interaction
- Use screenshots for visual documentation

### 2. Network Emulation for Real-World Testing
- Test on Slow 3G and Fast 3G to simulate mobile users
- Use Offline mode to test reconnection logic

### 3. Performance Traces for FPS Validation
- Always check FPS during canvas operations
- Look for "Long Tasks" >50ms that block the main thread

### 4. Multi-Tab Testing for Collaboration
- Open 2-5 tabs to simulate concurrent users
- Use `select_page` to switch between tabs

### 5. Console Monitoring is Critical
- Always monitor console during feature testing
- Firebase errors often appear only in console

---

## Reminder: Next Steps

After testing with Chrome DevTools MCP, remind the user to create `.cursor/rules/testing-with-devtools.mdc` for ongoing testing patterns.

---

*Last Updated: 2025-10-19*
*Covers Features 1-8 (Production-Ready)*
*AI Agent testing placeholders for Phase 2*

