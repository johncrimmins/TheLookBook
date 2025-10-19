# Chrome DevTools MCP Testing Guide

## Overview

Modular testing documentation for CollabCanvas v3 using Chrome DevTools MCP. Each file focuses on a specific testing area with ready-to-use prompts.

**Prerequisites:** Chrome DevTools MCP configured in Cursor settings

---

## Quick Reference

### What Chrome DevTools MCP Can Test

| Capability | Use Case |
|------------|----------|
| **Performance Tracing** | 60 FPS validation, <100ms sync, 500+ objects |
| **Network Analysis** | Firebase latency, sync times |
| **Console Monitoring** | Runtime errors, Firebase issues |
| **User Simulation** | Multi-user testing automation |
| **Screenshot/Snapshot** | UI documentation, visual bugs |
| **Real-time Debugging** | Live canvas state inspection |

---

## Testing Modules

### Core Testing Areas

1. **[performance.md](./performance.md)**
   - Object sync latency (<100ms)
   - Canvas with 500+ objects (60 FPS)
   - Pan/zoom performance
   - Multi-select bulk operations

2. **[collaboration.md](./collaboration.md)**
   - Cursor sync (<50ms)
   - Simultaneous edits (conflict resolution)
   - Presence system validation
   - Multi-user scenarios (5+ users)

3. **[network-reliability.md](./network-reliability.md)**
   - Network disconnect simulation
   - Slow 3G performance
   - Persistence tests (4 scenarios from requirements.md)
   - Reconnection logic

4. **[monitoring.md](./monitoring.md)**
   - Console error detection
   - Firebase connection errors
   - Memory leak detection
   - Runtime debugging

### Feature-Specific Testing

5. **[feature-6-multiselect.md](./feature-6-multiselect.md)**
   - Marquee selection (60 FPS)
   - Bulk operations (delete, duplicate, move)
   - Properties panel integration

6. **[feature-7-layers.md](./feature-7-layers.md)**
   - Visibility/lock inheritance (AND logic)
   - Layer operations performance
   - Hierarchical structure validation

7. **[feature-8-lookbooks.md](./feature-8-lookbooks.md)**
   - CRUD operations latency
   - Real-time subscription
   - Responsive grid layout

### Additional Resources

8. **[ui-visual.md](./ui-visual.md)**
   - Responsive layout testing
   - Screenshot automation
   - Visual state documentation

9. **[benchmarks.md](./benchmarks.md)**
   - Performance targets table
   - Benchmark commands
   - Success criteria checklist

---

## Quick Start

### 1. Choose Your Test Area
Pick a module based on what you want to test (e.g., `performance.md` for FPS validation)

### 2. Copy a Test Prompt
Each module has ready-to-use prompts like:
```
"Start a performance trace, then create 10 rectangles. 
Check if any operations exceed 100ms."
```

### 3. Run in Cursor
Paste the prompt and Chrome DevTools MCP will execute the test automatically

### 4. Review Results
Analyze the output for errors, performance issues, or validation failures

---

## Testing Strategy

### Development Testing
- Run **performance.md** tests after canvas changes
- Run **feature-X.md** tests after feature implementations
- Run **monitoring.md** tests for quick error checks

### Pre-Deployment Testing
- Run **collaboration.md** for multi-user validation
- Run **network-reliability.md** for disconnect scenarios
- Run **benchmarks.md** to validate all targets

### Production Monitoring
- Use **monitoring.md** for error detection
- Use **ui-visual.md** for visual regression testing
- Use **benchmarks.md** for performance regression

---

## Known Issues

### Feature 7: Hierarchical Layers
**Status:** Complete but has minor bugs (per activeContext.md)

**Action:** Run tests in `feature-7-layers.md` to identify and document issues

---

## Tips for Effective Testing

1. **Use Snapshots First** - Faster than screenshots, gives element UIDs
2. **Network Emulation** - Test on Slow 3G for mobile simulation
3. **Performance Traces** - Always check FPS during canvas operations
4. **Multi-Tab Testing** - Open 2-5 tabs for concurrent user simulation
5. **Console Monitoring** - Firebase errors often only appear in console

---

## Next Steps

- **Now:** Use test modules to validate features
- **Later:** Create `.cursor/rules/testing-with-devtools.mdc` for testing patterns

---

*Last Updated: 2025-10-19*
*Covers Features 1-8 (Production-Ready)*

