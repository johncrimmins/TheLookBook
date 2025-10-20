# UI & Visual Testing

Test responsive layouts, visual states, and UI component rendering.

---

## Viewport Sizes

| Device | Width x Height | Use Case |
|--------|----------------|----------|
| Desktop | 1920x1080 | Primary development target |
| Laptop | 1280x720 | Common laptop size |
| Tablet | 768x1024 | iPad portrait |
| Mobile | 375x667 | iPhone SE, common mobile |

---

## Test Scenarios

### 1. Lookbooks Grid Responsive Layout

**Prompt:**
```
Navigate to /mylookbooks. Test at these viewport sizes:
- 1920x1080: Take screenshot
- 1280x720: Take screenshot  
- 768x1024: Take screenshot
- 375x667: Take screenshot

Check grid column count at each breakpoint.
```

**Expected Behavior:**
- Desktop (1920px): 4 columns
- Laptop (1280px): 3 columns
- Tablet (768px): 2 columns
- Mobile (375px): 1 column

**Success Criteria:** Grid adjusts correctly, no overflow, cards sized properly

---

### 2. Canvas Toolbar Responsive

**Prompt:**
```
Navigate to /canvas/[canvasId]. Resize to:
- 1920x1080: Verify full toolbar visible
- 768x1024: Check toolbar adapts
- 375x667: Verify mobile layout

Take screenshots of each.
```

**Expected Behavior:**
- All tools accessible at all sizes
- No horizontal scroll
- Touch targets >44px on mobile

---

### 3. Right Sidebar States

**Prompt:**
```
On canvas page, capture screenshots of:
1. Sidebar open + pinned
2. Sidebar open + unpinned
3. Sidebar collapsed
4. Properties panel expanded
5. Layers panel expanded
```

**Expected:**
- Pinned: Stays open, canvas adjusts width
- Unpinned: Overlays canvas
- Collapsed: 40px width
- Clean animations <300ms

---

### 4. Auth Page Layout

**Prompt:**
```
Navigate to /auth. Take screenshots at:
- Desktop (1920x1080)
- Mobile (375x667)

Check form layout and button sizes.
```

**Expected:**
- Centered layout
- Form max-width ~400px
- Buttons easy to tap on mobile
- Google button prominent

---

### 5. Empty States

**Prompt:**
```
Take screenshots of empty states:
1. /mylookbooks with no Lookbooks (new user)
2. Canvas with no objects
3. Layers panel with only Default Layer
4. "Shared With Me" with no shares
```

**Expected:**
- Clear messaging
- Call-to-action buttons
- Helpful guidance text

---

### 6. User Profile Badge

**Prompt:**
```
Navigate to /mylookbooks. Take screenshot of header.
Check user profile badge shows:
- User initials
- Display name on hover/click
- Email address
- Sign Out button
```

**Expected:**
- Badge visible in all viewports
- Initials generated correctly
- Popover opens on click

---

### 7. Lookbook Card States

**Prompt:**
```
Take screenshots of Lookbook cards:
1. Default state
2. Hover state
3. Context menu open (right-click)
4. Being renamed (double-click)
```

**Expected:**
- Hover shows interaction affordance
- Context menu positioned correctly
- Rename field focused with selection

---

### 8. Canvas Object Selection

**Prompt:**
```
On canvas with 5 objects, capture:
1. No selection
2. Single object selected
3. Multiple objects selected (marquee)
4. Properties panel with selection
```

**Expected:**
- Selection boxes visible
- Multi-select shows count
- Properties panel updates

---

### 9. Layer Panel Hierarchy

**Prompt:**
```
Create 3 layers with 5 objects each. Screenshot:
1. All layers collapsed
2. One layer expanded
3. All layers expanded
4. Object thumbnails visible
```

**Expected:**
- Clear hierarchy
- 32x32 thumbnails render
- Expand/collapse smooth

---

### 10. Loading States

**Prompt:**
```
Capture screenshots of loading states:
1. Sign In button while loading
2. "Creating..." Lookbook button
3. Canvas loading objects
4. Network request pending indicators
```

**Expected:**
- Clear loading indicators
- Buttons disabled during load
- No layout shift

---

## Visual Regression Checklist

After UI changes, verify:

- [ ] Lookbooks grid responsive (4/3/2/1 columns)
- [ ] Canvas toolbar accessible at all sizes
- [ ] Sidebar pin/unpin/collapse works
- [ ] Auth page mobile-friendly
- [ ] Empty states show helpful messages
- [ ] User profile badge renders correctly
- [ ] Lookbook cards show all states
- [ ] Object selection visible and clear
- [ ] Layer panel hierarchy readable
- [ ] Loading states prevent double-clicks

---

## Screenshot Commands

### Take Full Page Screenshot
```
Take screenshot with fullPage=true to capture entire scrollable area
```

### Take Viewport Screenshot
```
Take screenshot with fullPage=false for current visible area only
```

### Resize Page
```
Use resize_page tool with width and height in pixels
```

---

## Common Visual Bugs

### Issue 1: Layout Shift (CLS)
**Symptom:** Content jumps during page load
**Test:** Performance trace, check CLS metric
**Target:** CLS <0.1

### Issue 2: Overflow Scroll
**Symptom:** Horizontal scrollbar appears
**Test:** Resize to mobile, check for overflow
**Fix Expected:** Container max-width or flex-wrap

### Issue 3: Touch Target Too Small
**Symptom:** Buttons hard to tap on mobile
**Test:** Measure button size at 375px width
**Target:** Min 44x44px touch targets

### Issue 4: Text Truncation
**Symptom:** Text cuts off without ellipsis
**Test:** Long Lookbook names in grid
**Expected:** Text-overflow: ellipsis

---

## Accessibility Quick Checks

While testing visuals, also verify:

- **Color Contrast:** Text readable against background
- **Focus Indicators:** Tab navigation shows clear focus
- **Alt Text:** Images have descriptive alt attributes
- **ARIA Labels:** Interactive elements labeled correctly
- **Keyboard Navigation:** All actions keyboard accessible

---

*Related: [README.md](./README.md), [performance.md](./performance.md)*

