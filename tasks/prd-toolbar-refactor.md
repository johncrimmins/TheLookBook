# Feature PRD: Toolbar Architecture Refactor

**Feature ID:** 5B-1  
**Priority:** High  
**Estimated Effort:** 5-6 days  
**Status:** Ready for Implementation

---

## Overview

**Problem:** Toolbar in header creates cramped layout. No dedicated space for properties/layers.

**Solution:** 
- Left fixed toolbar (60px) - creation/manipulation tools (always visible)
- Right pinnable sidebar (320px) - Properties (61%) + Layers (39%)
- Clean header - app name, online users, profile only

**Success Criteria:**
- Zero regressions
- Smooth animations (<300ms)
- State persists (localStorage)
- SidebarPanel component ready for 5B-2

---

## User Stories

**US1:** Left toolbar with Select/Rectangle/Circle/Pan. Keyboard shortcuts V/R/C/H. Tooltips on hover.

**US2:** Right sidebar (320px) with Properties (top 61%) and Layers (bottom 39%). Both collapse independently. Pin/collapse entire sidebar.

**US3:** Properties shows placeholder when no object selected.

**US4:** Header shows "CollabCanvas" (→/lookbooks), OnlineUsers, UserProfile only.

---

## Technical Design

### ShadCN Components Needed

**Install first:**
```bash
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add scroll-area
```

### New Components

```
src/features/canvas/
  ├── components/LeftToolbar.tsx        ← NEW
  └── hooks/useLeftToolbar.ts           ← NEW

src/features/objects/
  └── components/
      ├── RightSidebar.tsx              ← NEW
      ├── SidebarPanel.tsx              ← NEW (reusable for 5B-2)
      └── LayersPlaceholder.tsx         ← NEW (temp)

app/canvas/page.tsx                     ← UPDATE
app/layout.tsx                          ← UPDATE
```

### Data Model

**useLeftToolbar Hook:**
```typescript
type ToolType = 'select' | 'rectangle' | 'circle' | 'pan';
interface LeftToolbarState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}
```

**objectsStore Extensions:**
```typescript
interface ObjectsState {
  // ... existing
  
  // NEW sidebar state
  isRightSidebarOpen: boolean;          // default: true
  isRightSidebarPinned: boolean;        // default: true
  isPropertiesPanelExpanded: boolean;   // default: true
  isLayersPanelExpanded: boolean;       // default: true
  
  toggleRightSidebar: () => void;
  toggleRightSidebarPin: () => void;
  togglePropertiesPanel: () => void;
  toggleLayersPanel: () => void;
  setRightSidebarOpen: (open: boolean) => void;
}
```

**LocalStorage Keys:**
- `collabcanvas_sidebar_pinned`
- `collabcanvas_properties_expanded`
- `collabcanvas_layers_expanded`

Load from localStorage on store init.

---

## Implementation Patterns

### LeftToolbar
- ShadCN Tooltip wrapper for each tool button
- ShadCN Button with variant (active: 'default', inactive: 'ghost')
- Keyboard listener for V/R/C/H (skip if input focused)
- Fixed: left-0 top-16, 60px wide
- Tools array: `[{id, icon, label, shortcut}]`

### RightSidebar
- Fixed: right-0 top-16, 320px when open, 40px when collapsed
- Header with Pin/PinOff and ChevronLeft icons (ShadCN Button)
- Two sections: Properties (flex-[61]) and Layers (flex-[39])
- Auto-hide on outside click if unpinned
- Persist all state changes to localStorage

### SidebarPanel (CRITICAL for 5B-2)
**Must be generic and reusable:**
```typescript
interface SidebarPanelProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}
```
- Header: clickable with title + chevron
- Content: ShadCN ScrollArea when expanded
- Used by both Properties and Layers

### LayersPlaceholder
Simple placeholder:
```typescript
<div className="p-8 text-center text-gray-500">
  <p className="text-sm mb-2">Layers Panel</p>
  <p className="text-xs text-gray-400">Coming in Feature 5B-2</p>
</div>
```

### Canvas Page Layout
```typescript
<div className="relative h-screen overflow-hidden">
  <LeftToolbar />
  <div className="ml-[60px] h-[calc(100vh-64px)] mt-16">
    <Canvas />
  </div>
  <RightSidebar />
  <ContextMenu />
</div>
```

### Header Update
```typescript
<header className="fixed top-0 left-0 right-0 h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 z-40">
  <Link href="/lookbooks">CollabCanvas</Link>
  <div className="flex-1 flex justify-center">
    <OnlineUsers />
  </div>
  <UserProfile />
</header>
```

---

## Migration Strategy

**Day 1:** Install ShadCN components, create hooks/stores, create LeftToolbar
**Day 2:** Create RightSidebar, SidebarPanel, LayersPlaceholder
**Day 3:** Update Canvas page layout, update header
**Days 4-5:** Wire up interactions, keyboard shortcuts, localStorage persistence
**Day 6:** Testing, bug fixes, docs

---

## Dependencies for Feature 5B-2

**What 5B-2 needs from this feature:**
1. ✅ SidebarPanel component (generic wrapper with ScrollArea)
2. ✅ RightSidebar structure (39% bottom section)
3. ✅ objectsStore layer state (isLayersPanelExpanded, toggleLayersPanel)
4. ✅ ShadCN Tooltip + ScrollArea installed

**5B-2 will simply:**
- Create LayerPanel/LayerItem/LayerThumbnail
- Replace `LayersPlaceholder` with `LayerPanel` in RightSidebar (one line)

---

## Testing Checklist

**Components:**
- [ ] Tooltip + ScrollArea installed and working
- [ ] Left toolbar 60px, always visible
- [ ] Tool selection (click + V/R/C/H keys)
- [ ] Right sidebar 320px open, 40px collapsed
- [ ] Pin/unpin works
- [ ] Panels collapse independently
- [ ] Properties placeholder when no selection

**State:**
- [ ] localStorage persistence works
- [ ] State restored on refresh
- [ ] Outside click closes unpinned sidebar

**Regression:**
- [ ] Object creation/selection works
- [ ] Properties editing works
- [ ] Context menu works
- [ ] OnlineUsers/UserProfile work

**5B-2 Ready:**
- [ ] SidebarPanel accepts any children
- [ ] Bottom section (39%) ready for layers
- [ ] Layer panel state exists in store

---

## Edge Cases

1. No object selected → Properties shows placeholder
2. Both panels collapsed → Only headers visible
3. Sidebar unpinned + outside click → Smoothly collapses
4. localStorage unavailable → Use defaults

---

## Reusable Components

**From ShadCN:** Button, Tooltip, ScrollArea  
**From Existing:** PropertiesPanel, OnlineUsers, UserProfile, ContextMenu  
**New (minimal):** LeftToolbar, RightSidebar, SidebarPanel, LayersPlaceholder

---

**Last Updated:** 2025-10-19  
**Status:** Ready ✅  
**Install First:** `npx shadcn-ui@latest add tooltip scroll-area`
