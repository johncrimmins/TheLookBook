# Performance Benchmarks & Success Criteria

Quick reference for performance targets and test commands.

---

## Performance Targets

| Metric | Target | Critical | Source |
|--------|--------|----------|--------|
| Cursor sync | <50ms | 75ms | requirements.md |
| Object sync | <100ms | 150ms | requirements.md |
| FPS | 60 | 55 | requirements.md |
| Initial load | <3s | 5s | requirements.md |
| Undo/redo | <100ms | 200ms | Performance |
| Bulk ops (50) | <2s | 3s | Performance |
| Lookbook CRUD | <500ms | 1s | Feature |

---

## Core Web Vitals

| Metric | Good | Poor |
|--------|------|------|
| LCP (Largest Contentful Paint) | <2.5s | >4s |
| FID (First Input Delay) | <100ms | >300ms |
| CLS (Cumulative Layout Shift) | <0.1 | >0.25 |

---

## Test Commands

### Cursor Sync (<50ms)
```
Open canvas in 2 tabs. Monitor network in tab 2.
Move cursor rapidly in tab 1 for 30s.
Calculate RTDB average latency from timing data.
```

### Object Sync (<100ms)
```
Open canvas in 2 tabs. Monitor both.
Create 20 objects in tab 1 at 1s intervals.
Measure Firestore write → object appearance in tab 2.
```

### Canvas FPS (60 FPS)
```
Navigate to canvas with 500 objects.
Start performance trace. Pan/zoom for 60s.
Analyze FPS throughout.
```

### Initial Load (<3s)
```
Clear cache. Start trace. Navigate to /mylookbooks.
Stop when interactive. Check Time to Interactive.
```

### Undo/Redo (<100ms)
```
Create 50 objects. Start trace.
Undo 50x, redo 50x. Measure avg operation time.
```

### Bulk Operations (<2s for 50)
```
Create 50 objects. Start trace.
Marquee select all, duplicate. Measure total time.
```

### Lookbook CRUD
- **Create (<500ms):** Click "New Lookbook" → appears in list
- **Rename (<300ms):** Double-click → Enter → name updates
- **Delete (<500ms):** Right-click → Delete → confirm → removes

---

## Multi-User Benchmarks

### 2-User Sync
- Test: 10 objects each simultaneously
- Target: All 20 visible in <100ms

### 5-User Concurrent
- Test: 5 tabs, 10 objects each rapidly
- Target: All 50 sync, no conflicts, <100ms avg

---

## Network Conditions

| Profile | Download | Upload | Latency | Target |
|---------|----------|--------|---------|--------|
| Slow 3G | 400 Kbps | 400 Kbps | 2000ms | UI responsive, 2s sync |
| Fast 4G | 4 Mbps | 3 Mbps | 170ms | <500ms all ops |

---

## Validation Checklist

Run after performance changes:

- [ ] Auth: LCP <2.5s, CLS <0.1
- [ ] Lookbooks: Load <3s with 10+
- [ ] Canvas: <3s with 500 objects
- [ ] Object creation: <100ms sync
- [ ] Cursor: <50ms sync
- [ ] Pan/zoom: 60 FPS
- [ ] Undo/redo: <100ms/op
- [ ] Multi-select: <2s for 50
- [ ] Layers: <500ms expand/collapse
- [ ] Network: Offline queue works
- [ ] Console: Zero errors
- [ ] Memory: Stable after 5 cycles

---

## Result Format

```markdown
### Test: [Name]
**Date:** YYYY-MM-DD
**Metric:** [measured]
**Result:** [actual] (Target: [target])
**Status:** ✅/❌/⚠️
**Details:** [observations]
```

---

*Related: [performance.md](./performance.md), [collaboration.md](./collaboration.md)*
