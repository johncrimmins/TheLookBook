# Shared Component Library Implementation Guide

**Priority:** #2 (High Impact)  
**Estimated Time:** 4-6 hours  
**Difficulty:** Medium  
**Risk Level:** Low (mostly additive changes)

---

## Executive Summary

### What We're Doing
Consolidating duplicate UI patterns into reusable shared components to eliminate 300-400 lines of duplicate code, reduce bundle size by 5-8KB, and establish a component library foundation.

### Impact
- **Code Reduction**: ~350 lines eliminated
- **Bundle Size**: -5-8KB (replace inline SVGs with lucide-react)
- **Files Affected**: 20+ files updated, 4 new components created
- **Reusability**: All future features can use these components immediately

### Components Created
1. **UserAvatar** - Avatar with photo/fallback initials (replaces 4 duplicate implementations)
2. **ConfirmationDialog** - Reusable confirmation modal (replaces 2+ patterns)
3. **LoadingButton** - Button with loading state (replaces 6+ instances)
4. **Replace inline SVGs** - Use lucide-react icons (16 SVGs → imports)

---

## Prerequisites

### Before Starting
- [x] Firebase consolidation complete
- [ ] Run `npm install` to ensure lucide-react is available
- [ ] Create git branch: `git checkout -b refactor/shared-components`
- [ ] Tag current state: `git tag pre-shared-components`

### Verify Lucide React
Check package.json - should have: `"lucide-react": "^0.263.1"`

If missing:
```bash
npm install lucide-react
```

---

## Phase 1: Create UserAvatar Component

### Step 1.1: Create UserAvatar Component

**File**: `src/shared/components/UserAvatar.tsx` (NEW)

```typescript
'use client';

import { Avatar } from './ui/avatar';
import { cn } from '@/shared/lib/utils';

export interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable user avatar component with automatic fallback to initials
 * Handles photo URLs and generates initials from displayName or email
 */
export function UserAvatar({
  photoURL,
  displayName,
  email,
  size = 'md',
  className,
}: UserAvatarProps) {
  // Generate initials from displayName or email
  const initials = (displayName || email)
    .charAt(0)
    .toUpperCase();

  // Size variants
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {photoURL ? (
        <img
          src={photoURL}
          alt={displayName || email}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-medium">
          {initials}
        </div>
      )}
    </Avatar>
  );
}
```

**Why**: Eliminates 4 duplicate avatar rendering patterns across TransferOwnershipDialog, CollaboratorList, PresenceBadges, and UserProfile.

---

### Step 1.2: Update CollaboratorList to Use UserAvatar

**File**: `src/features/lookbooks/components/CollaboratorList.tsx`

**Find** (around lines 50-65):
```typescript
<Avatar className="h-8 w-8">
  {collaborator.photoURL ? (
    <img src={collaborator.photoURL} alt={collaborator.displayName || collaborator.email} />
  ) : (
    <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary text-xs font-medium">
      {(collaborator.displayName || collaborator.email).charAt(0).toUpperCase()}
    </div>
  )}
</Avatar>
```

**Replace with**:
```typescript
<UserAvatar
  photoURL={collaborator.photoURL}
  displayName={collaborator.displayName}
  email={collaborator.email}
  size="md"
/>
```

**Add import** (top of file):
```typescript
import { UserAvatar } from '@/shared/components/UserAvatar';
```

**Remove import** (no longer needed):
```typescript
import { Avatar } from '@/shared/components/ui/avatar';  // DELETE THIS LINE
```

---

### Step 1.3: Update TransferOwnershipDialog to Use UserAvatar

**File**: `src/features/lookbooks/components/TransferOwnershipDialog.tsx`

**Find** (around lines 86-95):
```typescript
<Avatar className="h-8 w-8">
  {designer.photoURL ? (
    <img src={designer.photoURL} alt={designer.displayName || designer.email} />
  ) : (
    <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary text-xs font-medium">
      {(designer.displayName || designer.email).charAt(0).toUpperCase()}
    </div>
  )}
</Avatar>
```

**Replace with**:
```typescript
<UserAvatar
  photoURL={designer.photoURL}
  displayName={designer.displayName}
  email={designer.email}
  size="md"
/>
```

**Update imports**:
```typescript
// Remove: import { Avatar } from '@/shared/components/ui/avatar';
// Add:
import { UserAvatar } from '@/shared/components/UserAvatar';
```

---

### Step 1.4: Update PresenceBadges (if exists with avatar pattern)

Search for similar avatar patterns and replace with UserAvatar.

---

## Phase 2: Create ConfirmationDialog Component

### Step 2.1: Create ConfirmationDialog Component

**File**: `src/shared/components/ConfirmationDialog.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui';
import { Button } from './ui/button';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  variant?: 'default' | 'destructive';
}

/**
 * Reusable confirmation dialog for destructive or important actions
 * Handles loading state and async confirmation automatically
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Why**: Consolidates LeaveConfirmation and delete patterns into single reusable component.

---

### Step 2.2: Replace LeaveConfirmation with ConfirmationDialog

**File**: `src/features/lookbooks/components/LeaveConfirmation.tsx`

**OPTION A: Refactor to use ConfirmationDialog (Recommended)**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog';
import { removeCollaborator } from '../services/collaboratorService';

interface LeaveConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string;
  canvasName: string;
  userId: string;
}

/**
 * Confirmation dialog for leaving a shared Lookbook
 */
export function LeaveConfirmation({
  open,
  onOpenChange,
  canvasId,
  canvasName,
  userId,
}: LeaveConfirmationProps) {
  const router = useRouter();

  const handleLeave = async () => {
    await removeCollaborator(canvasId, userId);
    router.push('/mylookbooks');
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Leave Lookbook?"
      description={`Are you sure you want to leave "${canvasName}"? You will no longer have access to this Lookbook.`}
      confirmText="Leave Lookbook"
      cancelText="Cancel"
      onConfirm={handleLeave}
      variant="destructive"
    />
  );
}
```

**Lines Saved**: ~30 lines (from 71 → 41 lines)

---

## Phase 3: Create LoadingButton Component

### Step 3.1: Create LoadingButton Component

**File**: `src/shared/components/LoadingButton.tsx` (NEW)

```typescript
'use client';

import { Button, ButtonProps } from './ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Button component with built-in loading state
 * Shows spinner and optional loading text when loading=true
 */
export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      className={cn(loading && 'cursor-not-allowed', className)}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
```

**Why**: Replaces 6+ instances of manual loading state in buttons across the app.

---

### Step 3.2: Update CreateButton to Use LoadingButton

**File**: `src/features/lookbooks/components/CreateButton.tsx`

**Find**:
```typescript
<Button onClick={handleCreate} disabled={isCreating}>
  {isCreating ? 'Creating...' : 'Create Lookbook'}
</Button>
```

**Replace with**:
```typescript
<LoadingButton
  onClick={handleCreate}
  loading={isCreating}
  loadingText="Creating..."
>
  Create Lookbook
</LoadingButton>
```

**Update imports**:
```typescript
import { LoadingButton } from '@/shared/components/LoadingButton';
// Remove: import { Button } from '@/shared/components/ui/button';
```

---

## Phase 4: Replace Inline SVGs with Lucide Icons

### Step 4.1: Icon Mapping Reference

**Inline SVGs to Replace** (16 total across 8 files):

| File | Current SVG | Lucide Icon |
|------|-------------|-------------|
| PropertiesPanel.tsx | Close X | `<X />` |
| CreateButton.tsx | Plus | `<Plus />` |
| ContextMenu.tsx | Multiple | `<Trash2 />, <Copy />, <Layers />, etc.` |
| EmptyState.tsx | Icons | Context-specific |

---

### Step 4.2: Update PropertiesPanel - Replace Close Icon

**File**: `src/features/objects/components/PropertiesPanel.tsx`

**Find** (around lines 62-75):
```typescript
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</svg>
```

**Replace with**:
```typescript
<X className="h-4 w-4" />
```

**Add import** (top of file):
```typescript
import { X } from 'lucide-react';
```

**Lines saved**: 11 → 1 line

---

### Step 4.3: Update CreateButton - Replace Plus Icon

**File**: `src/features/lookbooks/components/CreateButton.tsx`

**Find inline SVG** (the plus icon)

**Replace with**:
```typescript
<Plus className="h-5 w-5" />
```

**Add import**:
```typescript
import { Plus } from 'lucide-react';
```

---

### Step 4.4: Update ContextMenu - Replace All Icons

**File**: `src/features/objects/components/ContextMenu.tsx`

This file has **7 inline SVGs**. Here's the mapping:

**Add imports** (top of file):
```typescript
import {
  Trash2,
  Copy,
  Layers,
  ArrowUpToLine,
  ArrowDownToLine,
  Eye,
  Lock,
} from 'lucide-react';
```

**Replace each SVG**:
1. Delete icon → `<Trash2 className="h-4 w-4" />`
2. Duplicate icon → `<Copy className="h-4 w-4" />`
3. Move to Layer → `<Layers className="h-4 w-4" />`
4. Bring to Front → `<ArrowUpToLine className="h-4 w-4" />`
5. Send to Back → `<ArrowDownToLine className="h-4 w-4" />`
6. Hide/Show → `<Eye className="h-4 w-4" />`
7. Lock/Unlock → `<Lock className="h-4 w-4" />`

**Lines saved**: ~70 lines → ~7 lines

---

### Step 4.5: Update Remaining Files

Apply same pattern to:
- `LookbookContextMenu.tsx` (1 SVG)
- `EmptyState.tsx` (2 SVGs)
- `AuthForm.tsx` (1 SVG)
- `UserCursor.tsx` (1 SVG)
- `CanvasToolbar.tsx` (2 SVGs)

**Common lucide-react icons**:
- `Plus`, `X`, `Trash2`, `Copy`, `Edit`, `Settings`
- `Eye`, `EyeOff`, `Lock`, `Unlock`
- `ChevronDown`, `ChevronUp`, `MoreVertical`
- `User`, `Users`, `Share2`, `LogOut`

---

## Phase 5: Export Shared Components

### Step 5.1: Update Shared Components Barrel Export

**File**: `src/shared/components/index.ts`

**Add exports**:
```typescript
// Shared components
export { UserAvatar } from './UserAvatar';
export { ConfirmationDialog } from './ConfirmationDialog';
export { LoadingButton } from './LoadingButton';

// Re-export UI components for convenience
export * from './ui';
```

---

## Testing Checklist

### Build & Type Checks
```bash
npm run build      # Must succeed
npm run lint       # Must pass
npx tsc --noEmit   # Zero errors
```

### Manual Testing

**Test UserAvatar**:
- [ ] Avatars render with photos
- [ ] Fallback initials display correctly
- [ ] Different sizes work (sm, md, lg)
- [ ] Used in: CollaboratorList, TransferOwnershipDialog, PresenceBadges

**Test ConfirmationDialog**:
- [ ] Leave Lookbook confirmation works
- [ ] Loading state shows during async operation
- [ ] Cancel button closes dialog
- [ ] Confirm button executes action

**Test LoadingButton**:
- [ ] Loading spinner shows when loading=true
- [ ] Button disabled during loading
- [ ] Loading text displays (if provided)
- [ ] Normal state works

**Test Lucide Icons**:
- [ ] All icons render correctly
- [ ] Icons are properly sized
- [ ] No console errors about missing icons
- [ ] Bundle size reduced (check dev tools network tab)

### Visual Regression Testing
- [ ] Open each page/modal that uses updated components
- [ ] Verify UI looks identical to before (no visual changes)
- [ ] Check responsive behavior
- [ ] Test dark mode (if applicable)

---

## Rollback Plan

If anything breaks:

```bash
# Immediate rollback
git reset --hard pre-shared-components

# Or revert specific commit
git revert HEAD
```

---

## File Checklist

### New Files (4):
- [ ] `src/shared/components/UserAvatar.tsx`
- [ ] `src/shared/components/ConfirmationDialog.tsx`
- [ ] `src/shared/components/LoadingButton.tsx`
- [ ] Updated `src/shared/components/index.ts`

### Updated Files (~20):
- [ ] `lookbooks/components/CollaboratorList.tsx`
- [ ] `lookbooks/components/TransferOwnershipDialog.tsx`
- [ ] `lookbooks/components/LeaveConfirmation.tsx`
- [ ] `lookbooks/components/CreateButton.tsx`
- [ ] `lookbooks/components/LookbookContextMenu.tsx`
- [ ] `lookbooks/components/EmptyState.tsx`
- [ ] `objects/components/PropertiesPanel.tsx`
- [ ] `objects/components/ContextMenu.tsx`
- [ ] `auth/components/AuthForm.tsx`
- [ ] `presence/components/UserCursor.tsx`
- [ ] `canvas/components/CanvasToolbar.tsx`
- [ ] (Plus any other files with inline SVGs or duplicate patterns)

---

## Success Metrics

### Code Quality
- ✅ Zero linting errors
- ✅ Zero type errors
- ✅ Build succeeds
- ✅ All tests pass (if any)

### Functionality
- ✅ All avatars display correctly
- ✅ All dialogs/modals work
- ✅ All buttons with loading states work
- ✅ All icons display and are clickable

### Performance
- ✅ Bundle size reduced by 5-8KB
- ✅ No new console errors/warnings
- ✅ Page load times unchanged or improved

### Code Metrics
- ✅ ~350 lines of duplicate code eliminated
- ✅ 4 new reusable components created
- ✅ 20+ files simplified
- ✅ Future features can reuse immediately

---

## Implementation Timeline

**Phase 1** (UserAvatar): 1 hour
- Create component (15 min)
- Update 4 files (45 min)

**Phase 2** (ConfirmationDialog): 1 hour
- Create component (20 min)
- Refactor LeaveConfirmation (40 min)

**Phase 3** (LoadingButton): 45 minutes
- Create component (15 min)
- Update 6+ files (30 min)

**Phase 4** (Lucide Icons): 2 hours
- Update 8 files with 16 SVGs (2 hours)

**Phase 5** (Testing): 1-2 hours
- Build, lint, manual testing

**Total**: 5-6 hours

---

## Post-Implementation

### Commit Message
```bash
git add .
git commit -m "refactor: create shared component library

- Create UserAvatar component (replaces 4 duplicate implementations)
- Create ConfirmationDialog component (reusable modal pattern)
- Create LoadingButton component (replaces 6+ loading patterns)
- Replace 16 inline SVGs with lucide-react icons
- Update 20+ files to use shared components
- Reduce bundle size by ~5-8KB
- Eliminate ~350 lines of duplicate code
- Zero functionality lost - all features tested"
```

### Documentation Updates

Add to `memory-bank/systemPatterns.md`:

```markdown
### Pattern 11: Shared Component Library

**Location**: `src/shared/components/`

**Purpose**: Reusable UI components used across multiple features

**Components**:
- `UserAvatar`: Avatar with photo/initials fallback
- `ConfirmationDialog`: Reusable confirmation modal
- `LoadingButton`: Button with loading state
- `lucide-react icons`: Replace inline SVGs

**Usage**:
```typescript
import { UserAvatar, ConfirmationDialog, LoadingButton } from '@/shared/components';

<UserAvatar email="user@example.com" displayName="John Doe" />
<LoadingButton loading={isLoading}>Save</LoadingButton>
```

**Benefits**:
- Eliminates duplicate code
- Consistent UI patterns
- Smaller bundle size
- Easy to maintain
```

---

## Critical Reminders

### PRESERVE ALL FUNCTIONALITY
- ✅ Every component must work EXACTLY as before
- ✅ No visual changes (except maybe better icons)
- ✅ No behavioral changes
- ✅ All interactions preserved
- ✅ All props/callbacks still work

### DO NOT BREAK
- ❌ Authentication flow
- ❌ Lookbook CRUD operations
- ❌ Collaboration features
- ❌ Modal open/close behavior
- ❌ Button click handlers
- ❌ Avatar rendering

**If you're unsure about a change, DON'T make it. Ask first.**

---

**END OF GUIDE** (487 lines)

