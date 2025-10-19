# Performance Testing

## Requirements
- **Real-Time Sync:** Sub-100ms object sync, Sub-50ms cursor sync
- **Performance:** Consistent performance with 500+ objects, 60 FPS
- **Scalability:** Supports 5+ concurrent users

---

## Test Scenarios

### 1. Object Sync Latency (<100ms Target)

**Prompt:**
```
Start a performance trace, then create 10 rectangles on the canvas at /canvas/[canvasId]. 
Stop the trace and analyze object creation performance. Check if any operations exceed 100ms.
```

**What to Look For:**
- Network requests to Firestore: <100ms
- RTDB broadcasts: <50ms
- Total end-to-end object creation: <100ms
- No blocking operations

**Success Criteria:** All object creation operations complete in <100ms

---

### 2. Canvas Performance with 500+ Objects

**Prompt:**
```
Navigate to /canvas/[canvasId], start a performance trace, then create 500 rectangles. 
Analyze FPS and check for frame drops. Look for any layout thrashing or expensive renders.
```

**What to Look For:**
- Steady 60 FPS during object creation
- No long tasks >50ms
- Smooth rendering without jank
- Konva layer optimizations active

**Success Criteria:** Maintains 60 FPS with 500+ objects

---

### 3. Pan/Zoom Performance

**Prompt:**
```
Start a performance trace, then simulate panning and zooming on the canvas for 10 seconds. 
Check FPS during interactions and identify any performance bottlenecks.
```

**What to Look For:**
- Consistent 60 FPS during pan/zoom
- Konva layer rendering optimizations working
- No excessive re-renders
- Smooth viewport transformations

**Success Criteria:** Steady 60 FPS during all pan/zoom operations

---

### 4. Multi-Select Bulk Operations (Feature 6)

**Prompt:**
```
Create 50 objects, then start a performance trace. Perform marquee selection to select all objects,
then duplicate them. Analyze bulk operation performance.
```

**What to Look For:**
- Bulk operations complete in <2 seconds
- No UI freezing during multi-select
- History system doesn't degrade performance
- Smooth marquee animation (60 FPS)

**Success Criteria:** Bulk operations on 50+ objects in <2s, 60 FPS marquee

---

### 5. Object Drag Performance

**Prompt:**
```
Create 10 objects on the canvas. Start a performance trace. Drag each object continuously
for 5 seconds. Check FPS and identify any rendering bottlenecks.
```

**What to Look For:**
- 60 FPS during drag operations
- Optimistic updates working (no lag)
- RTDB throttling to 60 FPS (16ms)
- Firestore debouncing (300ms after drag end)

**Success Criteria:** Smooth 60 FPS drag with proper throttling/debouncing

---

### 6. Undo/Redo Performance

**Prompt:**
```
Create 50 objects, then delete all. Start a performance trace. 
Perform undo 50 times, then redo 50 times. Check operation speed and FPS.
```

**What to Look For:**
- Each undo/redo operation <100ms
- No UI freezing
- Smooth state transitions
- History store efficient

**Success Criteria:** Undo/redo operations <100ms each

---

### 7. Initial Load Time with Objects

**Prompt:**
```
Create a canvas with 500 objects. Clear browser cache. 
Start a performance trace and navigate to /canvas/[canvasId]. 
Measure time until canvas is fully interactive.
```

**What to Look For:**
- First Contentful Paint <1s
- Time to Interactive <3s
- Objects render progressively
- No blocking resources >500ms

**Success Criteria:** Canvas interactive <3s even with 500 objects

---

### 8. Layer Expansion Performance (Feature 7)

**Prompt:**
```
Create 10 layers with 20 objects each. Start a performance trace and expand/collapse
all layers rapidly. Check for rendering performance issues.
```

**What to Look For:**
- Smooth expansion/collapse animations
- Thumbnail rendering <500ms per layer
- No layout thrashing
- 60 FPS during interactions

**Success Criteria:** Layer operations maintain 60 FPS, thumbnails load <500ms

---

## Performance Benchmarks

| Operation | Target | Critical Threshold |
|-----------|--------|--------------------|
| Object sync | <100ms | 150ms |
| Cursor sync | <50ms | 75ms |
| FPS (all operations) | 60 FPS | 55 FPS |
| Initial load | <3s | 5s |
| Undo/redo | <100ms | 200ms |
| Bulk operations | <2s (50 objects) | 3s |

---

## Common Performance Issues

### Issue 1: Frame Drops During Object Creation
**Symptom:** FPS drops below 55 during rapid object creation  
**Test:** Create 100 objects in 5 seconds, monitor FPS  
**Expected Fix:** Batch rendering, optimize Konva layers

### Issue 2: Slow Initial Load
**Symptom:** Canvas takes >3s to become interactive  
**Test:** Cold load with 500 objects  
**Expected Fix:** Lazy loading, object virtualization

### Issue 3: Memory Growth
**Symptom:** Memory continuously increases during operations  
**Test:** Create 100 objects, delete all, repeat 5x, check memory  
**Expected Fix:** Proper cleanup in Zustand stores, Konva object disposal

---

*Related: [benchmarks.md](./benchmarks.md), [collaboration.md](./collaboration.md)*

