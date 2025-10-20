# Agent Testing Guide - Chrome DevTools MCP

Autonomous testing instructions for AI agents running CollabCanvas v3 tests.

---

## Prerequisites

1. **Chrome DevTools MCP configured** - Verify `mcp_chrome-devtools_*` tools available
2. **Dev server running** - Get WSL IP: `wsl -d Ubuntu hostname -I`, use `http://[WSL_IP]:3001`
3. **Test account** - Format: `mcptest-[timestamp]@test.com`, Password: `TestPassword123!`

---

## Testing Workflow

### 1. Initialize
- Navigate to `http://[WSL_IP]:3001`
- Sign in with test account (create if needed)
- List console messages, document errors

### 2. Select Test Module

**Available:** `performance.md`, `collaboration.md`, `network-reliability.md`, `monitoring.md`

**RULE:** Test ONE module at a time. Ask user before switching modules.

### 3. Execute Tests
- Read test prompt from module markdown
- Execute using Chrome DevTools MCP tools
- Log results in `bugs-found.md` immediately
- If blocked by bug, skip and continue

### 4. Log Results

**Bug Format:**
```markdown
## Bug #X: [Title]
**Date:** YYYY-MM-DD | **Severity:** CRITICAL/HIGH/MEDIUM/LOW
**Location:** file.tsx:line | **Error:** [message]
**Impact:** [description]
```

**Performance Format:**
```markdown
### Test #X: [Name]
**Status:** ✅/❌/⚠️ | **Metrics:** [actual vs target]
**Result:** [summary]
```

### 5. Report to User

After completing ONE module:
- Module tested, tests completed/blocked
- Bugs found (count only)
- Performance summary
- **Ask before proceeding to next module**

---

## Chrome DevTools MCP Tools

| Category | Tools | Use For |
|----------|-------|---------|
| Navigation | navigate_page, take_snapshot, list_pages | Page access, structure |
| Interaction | fill_form, click, wait_for | User actions |
| Performance | performance_start_trace, performance_stop_trace | Metrics (LCP, CLS, FPS) |
| Network | list_network_requests, get_network_request, emulate_network | Timing, throttling |
| Monitoring | list_console_messages, evaluate_script | Errors, state inspection |
| Multi-user | new_page, select_page, close_page | Concurrent testing |

---

## Testing Patterns

### Performance Benchmark
```
1. Navigate → 2. Start trace (reload=true) → 3. Stop trace
4. Extract metrics → 5. Compare to targets → 6. Log
```

### Operation Timing
```
1. Navigate → 2. Monitor network → 3. Perform operation
4. Get request timing → 5. Calculate duration → 6. Log
```

### Error Detection
```
1. List console (before) → 2. Perform operations
3. List console (after) → 4. Diff for new errors → 5. Log
```

---

## Bug Severity

- **CRITICAL:** Blocks core functionality, crashes app
- **HIGH:** Major feature broken, difficult workarounds
- **MEDIUM:** Partial breakage, workarounds exist
- **LOW:** Minor issue, cosmetic, edge case

---

## Blocked Tests

If bug prevents test:
1. Document blocking bug
2. List blocked tests
3. Skip to next test
4. Report blocked count

**Never attempt to fix bugs.** Only document.

---

## Memory Bank Updates

**After testing session, update `memory-bank/progress.md`:**

```markdown
## Known Issues
- Active bugs tracked in testing system (testing agents: see `docs/testing/README.md`)
- Performance benchmarks need validation with real concurrent users
```

**Rules:**
- One-liner reference only
- No bug severity mentions (CRITICAL, HIGH, etc.)
- Point to testing README, not bugs-found.md
- Keep focus away from main development context

---

## Autonomous Operation Rules

1. **Thorough:** Run every test in selected module
2. **Document immediately:** Log results continuously
3. **Graceful errors:** Document failures, continue testing
4. **One module at a time:** Ask before switching
5. **Stay focused:** Don't deviate from test script
6. **Efficient:** Use parallel tool calls when possible
7. **Provide context:** Reference current test name

---

## Example Session

```
User: "Test performance.md"

Agent:
✅ Connected to http://192.168.237.151:3001
✅ Signed in as mcptest@test.com
📋 Test #1: Auth Page Load - LCP 413ms ✅ (logged)
📋 Test #2: Canvas Load - Blocked by Bug #1 (logged)
📋 Test #3: Lookbook CRUD - <2s ✅ (logged)

Summary: 2 passed, 1 blocked, 1 bug found
Next module? [ask user]
```

---

## File Locations

- Test modules: `docs/testing/*.md`
- Bug log: `docs/testing/bugs-found.md`
- Memory bank: `memory-bank/progress.md`

---

*Enables autonomous testing with minimal user intervention beyond module selection.*
