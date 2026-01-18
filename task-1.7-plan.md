# Task 1.7: Navigation Guards and Route Protection - Implementation Plan

## Task Overview
Implement navigation guard hooks to prevent accidental route changes during active tally sessions. Create confirmation modals for navigation away from active counting, set up global navigation utilities that respect the active tally state, integrate with TanStack Router navigation events, ensure proper cleanup on route changes, and redirect to root if needed when guards are triggered.

## Current State Analysis
- **Tally Store**: Has `isActive` and `hasActiveItems()` methods to track active tally state (apps/web/src/stores/tally-store.ts:8, 166)
- **Existing Route Guard**: Basic `useTallyNavigationGuard` hook exists but uses simple `confirm()` dialog (apps/web/src/lib/route-guards.ts:4-22)
- **Root Route**: Already implements redirect logic to root on reload (apps/web/src/routes/__root.tsx:38-47)
- **UI Components**: Button component available (apps/web/src/components/ui/button.tsx), but no Dialog component exists
- **Router**: TanStack Router is configured and functioning

## Implementation Requirements

### 1. Create Dialog Component (shadcn/ui)
**File**: `apps/web/src/components/ui/dialog.tsx`

**Requirements**:
- Create shadcn/ui Dialog component using @base-ui/react primitives
- Implement Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose components
- Follow existing component patterns (Button, Card components as reference)
- Use class-variance-authority (cva) for variants if needed
- Ensure proper TypeScript types and props interfaces
- Include ARIA attributes for accessibility

### 2. Create Navigation Confirmation Dialog Component
**File**: `apps/web/src/components/navigation-confirmation-dialog.tsx`

**Requirements**:
- Create reusable navigation confirmation modal component
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `onConfirm: () => void`, `onCancel: () => void`, `message?: string`
- Use the new Dialog component
- Display warning message about unsaved tally items
- Include "Cancel" and "Clear & Continue" buttons
- Support custom messages for different navigation scenarios
- Integrate with theme system for dark/light mode support

### 3. Enhanced Navigation Guard Hook
**File**: Update `apps/web/src/lib/route-guards.ts`

**Requirements**:
- Enhance existing `useTallyNavigationGuard` hook to use modal instead of `confirm()`
- Add state management for modal open/close
- Implement navigation pending state to hold navigation until confirmed
- Create `pendingNavigation` state to store destination route
- Add `handleConfirm` and `handleCancel` functions
- Support programmatic navigation with `navigateWithCheck(to: string)`
- Add cleanup on unmount to remove pending navigation state
- Integrate with TanStack Router's `useNavigate` and `useLocation` hooks
- Export types: `NavigationGuardReturn` interface

### 4. Global Navigation Utility
**File**: `apps/web/src/lib/navigation-utils.ts`

**Requirements**:
- Create `navigateWithTallyCheck` utility function
- Accept parameters: `destination: string`, `options?: NavigationOptions`
- Check tally store state using `useTallyStore` hook
- Return promise that resolves with navigation result or rejects on cancel
- Support force navigation bypass if needed
- Add type definitions for navigation options
- Export utility for use across components

### 5. Integrate Navigation Guard into Root Route
**File**: Update `apps/web/src/routes/__root.tsx`

**Requirements**:
- Import and use enhanced `useTallyNavigationGuard` hook
- Wrap navigation logic with guard on route changes
- Monitor route changes using TanStack Router's router events
- Listen to `onBeforeNavigate` or `onNavigate` events
- Prevent navigation if active tally exists and user cancels
- Add cleanup listeners on unmount
- Ensure proper cleanup of navigation state when tally is cleared
- Maintain existing root redirect logic

### 6. Update Header Component with Guard
**File**: Update `apps/web/src/components/header.tsx`

**Requirements**:
- Import `useTallyNavigationGuard` hook
- Replace standard Link components with guarded navigation
- Use `navigateWithCheck` for navigation in header links
- Ensure all navigation through header respects active tally state
- Maintain existing link styling and behavior

### 7. Add Navigation Guard Context (Optional Enhancement)
**File**: `apps/web/src/contexts/navigation-guard-context.tsx` (if needed)

**Requirements**:
- Create React context for navigation guard state
- Provide `NavigationGuardProvider` component
- Expose `useNavigationGuard` hook for accessing guard state
- Share pending navigation state across components
- Support scenarios where components need to check navigation guard state

### 8. Implement Browser beforeunload Handler
**File**: Update `apps/web/src/routes/__root.tsx`

**Requirements**:
- Add `useEffect` hook to register `beforeunload` event listener
- Check for active tally using `useTallyStore`
- Return warning message string if tally has active items
- Clean up event listener on unmount
- Ensure message is browser-compatible (modern browsers show default message)

### 9. Route-Specific Guards (for Settings and Catalog routes)
**File**: Update `apps/web/src/routes/settings.tsx` and create route guard middleware if needed

**Requirements**:
- Implement route-specific guards if different behavior needed
- Check active tally before allowing access to settings/catalog
- Apply confirmation modal before route transition
- Redirect to tally page if navigation is blocked

### 10. Update Index Route (Tally Page)
**File**: Update `apps/web/src/routes/index.tsx`

**Requirements**:
- Ensure navigation away from tally page triggers guard
- Integrate with navigation guard system
- Display confirmation if user tries to navigate with active items
- Handle navigation to other routes properly

## Implementation Steps

### Step 1: Create Dialog Component
1. Create `apps/web/src/components/ui/dialog.tsx`
2. Implement Dialog primitives using @base-ui/react
3. Add Dialog sub-components (Content, Header, Title, Description, Footer, Close)
4. Test component rendering and basic functionality
5. Verify TypeScript types are correct

### Step 2: Create Navigation Confirmation Dialog
1. Create `apps/web/src/components/navigation-confirmation-dialog.tsx`
2. Implement component with required props
3. Integrate Dialog component
4. Add custom message support
5. Style with theme support
6. Test dialog open/close behavior

### Step 3: Enhance Navigation Guard Hook
1. Update `apps/web/src/lib/route-guards.ts`
2. Add state management for modal and pending navigation
3. Implement `handleConfirm` and `handleCancel` functions
4. Replace `confirm()` with modal logic
5. Add cleanup on unmount
6. Export updated types
7. Test hook behavior with various scenarios

### Step 4: Create Global Navigation Utility
1. Create `apps/web/src/lib/navigation-utils.ts`
2. Implement `navigateWithTallyCheck` function
3. Add proper TypeScript types
4. Test utility with different navigation scenarios
5. Verify force navigation bypass works

### Step 5: Integrate Guard into Root Route
1. Update `apps/web/src/routes/__root.tsx`
2. Import and use `useTallyNavigationGuard` hook
3. Add router event listeners for navigation
4. Implement navigation interception logic
5. Add cleanup on unmount
6. Test route transitions with active tally

### Step 6: Update Header Component
1. Update `apps/web/src/components/header.tsx`
2. Import navigation guard hook
3. Replace Link components with guarded navigation
4. Test all header links
5. Verify visual feedback on navigation attempts

### Step 7: Add beforeunload Handler
1. Update `apps/web/src/routes/__root.tsx`
2. Add `useEffect` hook for beforeunload event
3. Implement active tally check
4. Test browser tab close/refresh behavior
5. Verify cleanup on unmount

### Step 8: Test and Verify
1. Test navigation from tally to settings with active items
2. Test navigation from tally to catalog with active items
3. Test navigation with no active items
4. Test confirmation modal behavior (confirm/cancel)
5. Test browser refresh/close with active tally
6. Test force navigation bypass (if implemented)
7. Verify proper state cleanup after navigation
8. Test multiple rapid navigation attempts
9. Verify TypeScript compilation succeeds
10. Run `npm run check-types` and `npm run build`

## File Changes Summary

### New Files to Create:
1. `apps/web/src/components/ui/dialog.tsx` - Dialog component
2. `apps/web/src/components/navigation-confirmation-dialog.tsx` - Navigation confirmation modal
3. `apps/web/src/lib/navigation-utils.ts` - Global navigation utilities

### Files to Update:
1. `apps/web/src/lib/route-guards.ts` - Enhance existing navigation guard hook
2. `apps/web/src/routes/__root.tsx` - Integrate guard and add beforeunload handler
3. `apps/web/src/components/header.tsx` - Update links to use guarded navigation
4. `apps/web/src/routes/index.tsx` - Ensure navigation guard integration

## Testing Checklist

### Functional Requirements:
- [ ] Navigation away from tally with active items shows confirmation dialog
- [ ] Canceling navigation keeps user on tally page
- [ ] Confirming navigation clears tally and proceeds
- [ ] Navigation without active items proceeds normally
- [ ] Browser refresh/close shows warning with active tally
- [ ] Browser refresh/close proceeds normally without active tally
- [ ] Multiple navigation attempts are handled correctly
- [ ] State cleanup happens after navigation completes

### UI/UX Requirements:
- [ ] Confirmation modal is visually clear and accessible
- [ ] Modal matches app theme (dark/light mode)
- [ ] Buttons are properly labeled and positioned
- [ ] Warning message is clear and actionable
- [ ] Modal closes correctly on confirm/cancel
- [ ] No console errors or warnings

### Technical Requirements:
- [ ] TypeScript types are strict and correct
- [ ] No `any` types used
- [ ] All imports are properly typed
- [ ] Event listeners are cleaned up on unmount
- [ ] No memory leaks in navigation logic
- [ ] Code follows existing patterns and conventions

### Edge Cases:
- [ ] Rapid navigation attempts don't cause issues
- [ ] Navigation with very large tally works correctly
- [ ] Navigation during async operations is handled
- [ ] Browser back button behavior is correct
- [ ] Direct URL access is handled appropriately

## Success Criteria
1. Navigation guard prevents accidental route changes during active tally sessions
2. Confirmation modal displays when navigating away from active tally
3. User can choose to cancel navigation and stay on tally page
4. User can choose to clear tally and proceed with navigation
5. Browser beforeunload warning shows when attempting to close/refresh with active tally
6. All navigation respects active tally state
7. Proper cleanup happens on route changes
8. No TypeScript errors or linting issues
9. All existing functionality remains intact
10. Code follows project conventions and patterns

## Notes
- The existing `useTallyNavigationGuard` hook provides a good foundation but needs enhancement
- Dialog component will be reusable for other confirmation scenarios
- Navigation guards should be non-intrusive when no active tally exists
- Consider adding a "save as draft" feature in future enhancements (not part of this task)
- Ensure guard doesn't interfere with programmatic navigation needed for routing logic
- Test across different browsers to ensure consistent behavior
