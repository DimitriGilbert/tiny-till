# Task 4.6 Implementation Plan: Sticky Footer with Cart Management and Confirmation Dialog

## Task Overview
Build a sticky footer component that displays the grand total and total item count, always visible during scrolling. Implement clear cart functionality with a confirmation dialog before clearing all items.

## Current State Analysis
- **Existing Components**:
  - `TallyTotalsDisplay`: Currently displays inline totals (not sticky)
  - `ConfirmationDialog`: Reusable dialog component with confirm/cancel actions
  - `TallyStore`: State management with `getSummary()`, `clearTally()`, `hasActiveItems()`
  - `Button`, `Dialog` from ui/shadcn components
  - `useCurrencyFormat` hook for price formatting
- **Current Layout**: Root uses `grid-rows-[auto_1fr]` with header and outlet
- **Tally Page**: Inline `TallyTotalsDisplay` shown only when items > 0

## Implementation Steps

### Step 1: Create StickyTallyFooter Component
**File**: `apps/web/src/components/sticky-tally-footer.tsx`

**Requirements**:
- Fixed position footer at bottom of viewport
- Displays grand total (formatted currency) and item count
- Clear Cart button (destructive variant)
- Always visible regardless of scroll position
- Responsive layout: single column on mobile, two columns on larger screens
- Smooth transitions for updates

**Implementation Details**:
```typescript
interface StickyTallyFooterProps {
  totalCents: number
  itemCount: number
  onClearCart: () => void
  isCartEmpty: boolean
}

// Positioning: fixed bottom-0 left-0 right-0
// Z-index: higher than main content but below modals
// Background: app background with border-top
// Padding: comfortable touch targets (min 44px height)
// Animation: slide-up on appearance, smooth value transitions
```

**Styling**:
- `fixed bottom-0 left-0 right-0 z-40`
- Border top for separation
- Shadow for depth
- Background color from theme
- Responsive: vertical stack on mobile, horizontal on tablet+

### Step 2: Create ClearCartConfirmationDialog
**File**: `apps/web/src/components/clear-cart-dialog.tsx`

**Requirements**:
- Reuse existing `ConfirmationDialog` component
- Title: "Clear Cart"
- Description: "Are you sure you want to remove all items from your cart? This action cannot be undone."
- Confirm label: "Clear Cart" (destructive)
- Cancel label: "Cancel"
- Display item count and total being cleared
- Accessibility: `role="alertdialog"` for destructive action

**Implementation Details**:
```typescript
interface ClearCartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  itemCount: number
  totalCents: number
}

// Use ConfirmationDialog with:
// - isDestructive: true
// - confirmLabel: "Clear Cart"
// - Children: Display summary of items being cleared
```

### Step 3: Update Tally Page Layout
**File**: `apps/web/src/routes/index.tsx`

**Changes Required**:
1. Remove inline `TallyTotalsDisplay` (lines 77-84)
2. Add state for clear cart dialog:
   ```typescript
   const [clearDialogOpen, setClearDialogOpen] = useState(false)
   ```
3. Add `StickyTallyFooter` component after the product grid
4. Add `ClearCartDialog` component at bottom (before closing div)
5. Add `handleClearCart` function:
   ```typescript
   const handleClearCart = () => {
     clearTally()
     setClearDialogOpen(false)
   }
   ```

**Layout Adjustments**:
- Add `pb-24` or `pb-32` to main container to prevent footer overlap with content
- Ensure footer is always rendered (not conditional) but button disabled when empty

### Step 4: Add Bottom Padding for Content
**File**: `apps/web/src/routes/index.tsx`

**Implementation**:
- Add padding to the main container: `className="container ... pb-24 sm:pb-28"`
- This ensures the last row of products is fully visible above the sticky footer
- Responsive padding: larger on desktop due to larger footer

### Step 5: Implement Edge Case Handling

**Empty Cart State**:
- Display "0 items" and "$0.00" when cart is empty
- Disable "Clear Cart" button with `disabled={isCartEmpty}`
- Visually indicate disabled state (opacity, grayscale)

**Loading State**:
- Show loading skeleton or placeholder while data hydrates
- Prevent interaction during loading

**Accessibility**:
- `aria-label` on footer: "Cart summary with total and item count"
- `aria-live` regions for total updates
- Keyboard navigation to footer elements
- `role="contentinfo"` or `role="toolbar"` as appropriate
- Focus management for dialog open/close

### Step 6: Add Smooth Transitions and Animations

**Footer Animations**:
- Slide-up animation when footer appears/disappears
- Smooth transition on total/count updates (use `animate-pulse-once` class)
- Hover effects on Clear Cart button

**Value Updates**:
- Add visual feedback when totals change:
  - Brief highlight/scale effect on updated values
  - Use existing `quantity-pulse` animation from index.css

**Dialog Animations**:
- Use existing fade/zoom animations from dialog component
- Smooth backdrop transition

### Step 7: Responsive Design

**Mobile (< 640px)**:
- Stacked layout: total above, clear button below
- Full-width Clear Cart button
- Minimum 44px touch targets

**Tablet (640px - 1024px)**:
- Two-column layout: total on left, clear button on right
- Medium-sized Clear Cart button

**Desktop (1024px+)**:
- Two-column layout with max-width container
- Optimized spacing and typography

### Step 8: Type Safety

**Interfaces**:
```typescript
interface StickyTallyFooterProps {
  totalCents: number
  itemCount: number
  onClearCart: () => void
  isCartEmpty: boolean
}

interface ClearCartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  itemCount: number
  totalCents: number
}
```

**TypeScript Checks**:
- All props properly typed
- No `any` types used
- Props destructured with TypeScript patterns
- Component exports typed correctly

## File Changes Summary

### New Files to Create
1. `apps/web/src/components/sticky-tally-footer.tsx` - Sticky footer component
2. `apps/web/src/components/clear-cart-dialog.tsx` - Clear cart confirmation dialog

### Files to Modify
1. `apps/web/src/routes/index.tsx` - Update layout, add footer and dialog
2. `apps/web/src/components/tally-totals-display.tsx` - May need export adjustment or keep for reuse

### Files to Review (No changes expected)
- `apps/web/src/components/confirmation-dialog.tsx` - Reused as-is
- `apps/web/src/stores/tally-store.ts` - Already has required methods
- `apps/web/src/hooks/useCurrencyFormat.ts` - Reused as-is
- `apps/web/src/components/ui/button.tsx` - Reused as-is
- `apps/web/src/components/ui/dialog.tsx` - Reused as-is

## Component Structure

### StickyTallyFooter Component Hierarchy
```
StickyTallyFooter
├── Container (fixed bottom, border, shadow)
│   ├── Total Section
│   │   ├── Label: "Total"
│   │   └── Value (formatted currency)
│   ├── Item Count Section
│   │   ├── Label: "Items"
│   │   └── Value (number)
│   └── Clear Cart Button (disabled when empty)
```

### ClearCartDialog Component Hierarchy
```
ClearCartDialog
└── ConfirmationDialog
    ├── DialogHeader
    │   ├── DialogTitle: "Clear Cart"
    │   └── DialogDescription: Warning message
    ├── Summary (optional children)
    │   ├── Item count
    │   └── Total amount
    └── DialogFooter
        ├── Cancel Button
        └── Clear Cart Button (destructive)
```

## Testing Checklist

### Visual Tests
- [ ] Footer appears at bottom of viewport
- [ ] Footer stays visible during scrolling
- [ ] Footer doesn't overlap with product grid
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Empty cart state displays correctly
- [ ] Clear Cart button is disabled when cart is empty
- [ ] Dark/light mode styling matches app theme

### Functionality Tests
- [ ] Clear Cart button opens confirmation dialog
- [ ] Dialog shows correct item count and total
- [ ] Confirming clears the cart (items Map empty, isActive false)
- [ ] Cancelling closes dialog without clearing
- [ ] Backdrop click closes dialog
- [ ] Escape key closes dialog
- [ ] Total updates immediately when items added/removed
- [ ] Transitions are smooth and not jarring

### Accessibility Tests
- [ ] Footer has proper ARIA labels
- [ ] Focus management works correctly
- [ ] Keyboard can navigate to footer elements
- [ ] Dialog is announced to screen readers
- [ ] Touch targets meet minimum 44x44px requirements
- [ ] Color contrast meets WCAG standards

### Edge Case Tests
- [ ] Empty cart: displays "$0.00" and "0 items"
- [ ] Single item: displays correctly
- [ ] Large quantities: totals still format correctly
- [ ] Large item counts: numbers don't overflow container
- [ ] Very large totals (接近货币上限): formatting handles gracefully
- [ ] Rapid add/remove: footer updates smoothly
- [ ] Loading state: prevents interaction

## Implementation Order

1. **Create StickyTallyFooter component** - Core structure and styling
2. **Create ClearCartDialog component** - Wrapper around ConfirmationDialog
3. **Update Tally Page** - Integrate footer, add dialog state
4. **Add bottom padding** - Prevent content overlap
5. **Test and refine** - Iterate on styling and behavior
6. **Add animations** - Polish transitions
7. **Accessibility audit** - Ensure WCAG compliance
8. **Final testing** - Cross-browser, responsive, edge cases

## Dependencies

### Existing Dependencies (Already in Project)
- React
- Zustand (tally-store)
- shadcn/ui components (Button, Dialog)
- Tailwind CSS
- Base UI components
- class-variance-authority

### No New Dependencies Required
All required components and utilities already exist in the project.

## Success Criteria

1. ✅ Sticky footer remains fixed at bottom during scroll
2. ✅ Grand total and item count display correctly
3. ✅ Clear Cart button triggers confirmation dialog
4. ✅ Dialog shows proper messaging with item/total summary
5. ✅ Confirm action clears cart completely
6. ✅ Cancel action closes dialog without changes
7. ✅ Empty cart state handled (disabled button, zero values)
8. ✅ Footer doesn't overlap content
9. ✅ Responsive design works across all breakpoints
10. ✅ Smooth transitions and animations
11. ✅ Accessible to keyboard and screen readers
12. ✅ Type-safe with no `any` types
13. ✅ Matches app theme (light/dark mode)
14. ✅ `npm run check-types` passes
15. ✅ `npm run build` passes

## Notes

### Potential Issues and Solutions
- **Z-index conflicts**: Footer z-index should be 40, below modals (typically 50)
- **Mobile viewport address bar**: Use `h-svh` or `dvh` to account for browser chrome
- **Scroll snap**: Consider if footer should interact with scroll snap (not required)
- **Keyboard traps**: Ensure dialog focus trap works properly
- **Dialog positioning**: Ensure dialog is above footer in z-index stack

### Future Enhancements (Out of Scope)
- Undo functionality after clearing cart
- Cart export/save before clearing
- Multi-select item removal
- Receipt generation option
- Cart editing in modal

### Integration with Task 4.7
This task provides the footer component that will benefit from the animation system in Task 4.7. Animations added here will be compatible with the comprehensive animation system coming next.
