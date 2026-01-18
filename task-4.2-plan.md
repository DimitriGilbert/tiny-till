# Task 4.2 Implementation Plan: Product Card Component with Touch-Optimized Interactions

## Task Overview

Create reusable Product Card components optimized for one-handed operation with large touch targets, tap-to-increment/decrement functionality, quantity badges, visual pulse animations, and full accessibility support.

## Current State Analysis

### Existing Components
- `apps/web/src/components/product-card.tsx` - Basic product card for catalog view with edit/delete actions
- `apps/web/src/components/ProductChangeCard.tsx` - Product change card for import preview
- `apps/web/src/stores/tally-store.ts` - Tally state management with increment, decrement, and quantity update methods
- UI components available: Button, Badge, Card with proper shadcn/ui patterns

### Key Design Patterns
- Uses `React.memo` for performance optimization
- Density prop (`'normal' | 'compact'`) already implemented
- Proper ARIA labels and keyboard navigation patterns established
- Tailwind CSS with cn() utility for class management

## Implementation Requirements

### Core Features
1. **Large touch targets**: 80x80px (normal mode), 60x60px (compact mode)
2. **Tap-to-increment/decrement**: Quick quantity adjustment with visual feedback
3. **Quantity badges**: Display count for items > 0, prominently positioned
4. **Pulse animations**: Visual feedback on quantity changes
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
6. **Density support**: Normal and compact modes with responsive sizing

## Step-by-Step Implementation Plan

### Phase 1: Component Structure & Props Definition

**File**: `apps/web/src/components/tally-product-card.tsx` (new file)

1. **Define component interface**
   - Props: `product`, `quantity` (from tally), `density`, `onIncrement`, `onDecrement`, `onEditQuantity`
   - Use existing `Product` type from `@tiny-till/types`
   - Add optional `className` prop for flexibility
   - Export interface for testing and documentation

2. **Create base component structure**
   - Named export using `export function TallyProductCard()`
   - Wrap in `React.memo` for performance optimization
   - Use `forwardRef` for ref forwarding if needed for focus management

### Phase 2: Touch Target Design

3. **Implement increment/decrement touch targets**
   - Create primary tap area (entire card) for quick increment
   - Add dedicated decrement button in corner (right-bottom or left-bottom)
   - Size specifications:
     - Normal mode: Primary area = full card (min 80x80px touch target), Decrement button = 40x40px
     - Compact mode: Primary area = full card (min 60x60px touch target), Decrement button = 32x32px
   - Use CSS `min-w-[80px] min-h-[80px]` and `min-w-[60px] min-h-[60px]` for touch targets
   - Ensure touch-action CSS property for smooth interaction

4. **Position touch targets optimally**
   - Primary increment: Full card tap (one-handed operation)
   - Decrement button: Positioned in bottom-right corner (right-handed accessible) or use settings for position
   - Consider thumb reachability for mobile users

### Phase 3: Visual Feedback & Animations

5. **Implement pulse animation system**
   - Create CSS keyframes for pulse effect (scale up and fade)
   - Apply pulse on quantity change (use `quantity` prop to trigger animation)
   - Use `useEffect` with `quantity` dependency to reset animation
   - Animation timing: 200-300ms duration, spring-like feel
   - Color scheme: Primary color with opacity fade

6. **Add visual state indicators**
   - Active state: Scale down slightly on tap (`active:scale-95`)
   - Hover state: Scale up slightly (`hover:scale-105`)
   - Focus state: Ring outline for keyboard navigation (`focus-visible:ring-2`)
   - Disabled state: Reduced opacity for items with zero quantity

7. **Design quantity badge**
   - Position: Top-right or top-left corner (prominent visibility)
   - Style: Circular badge with contrasting background color
   - Size: Scales with density (e.g., 20x20px normal, 16x16px compact)
   - Visibility: Only show when quantity > 0
   - Use `Badge` component or custom div with absolute positioning
   - Add shadow for depth and contrast

### Phase 4: Accessibility Implementation

8. **Add comprehensive ARIA labels**
   - Card container: `aria-label="${product.name}, ${formatPrice(product.price)}, quantity: ${quantity}"`
   - Increment button: `aria-label="Add one ${product.name} to tally"`
   - Decrement button: `aria-label="Remove one ${product.name} from tally"`
   - Quantity badge: `aria-live="polite"` for screen reader announcements
   - Use `aria-pressed` or `aria-expanded` as appropriate

9. **Implement keyboard navigation**
   - Make card focusable: Add `tabIndex={0}` and `role="button"`
   - Handle Enter/Space for increment: `onKeyDown` handler
   - Handle Backspace/Delete for decrement
   - Add Arrow keys for navigation (optional, depends on parent container)
   - Ensure visible focus indicator: Outline styles on focus-visible

10. **Screen reader optimizations**
    - Announce quantity changes: Use live region on badge
    - Include product context in all button labels
    - Use `sr-only` class for text-only content
    - Ensure proper heading hierarchy if cards are grouped

### Phase 5: State Management Integration

11. **Connect to tally store**
   - Use `useTallyStore()` hook to access `incrementItem`, `updateQuantity`
   - Get current quantity from store or pass as prop
   - Handle quantity updates with optimistic UI updates
   - Error handling: Show visual feedback on failed operations

12. **Implement quantity change handlers**
   - `handleIncrement()`: Call `tallyStore.incrementItem(product.id)`
   - `handleDecrement()`: Decrement quantity, remove if reaches 0
   - Validate quantity >= 0 before decrement
   - Trigger pulse animation after state update

### Phase 6: Styling & Theming

13. **Apply consistent styling**
   - Use existing `Card` component from shadcn/ui as base
   - Apply density-based sizing using Tailwind classes
   - Ensure dark mode compatibility with theme variables
   - Match existing design language (colors, shadows, borders)

14. **Responsive design considerations**
   - Ensure cards work well in grid layout (2-8 columns)
   - Adjust touch targets for very small screens
   - Prevent overflow with long product names
   - Use line-clamp for name truncation

### Phase 7: Component Variants

15. **Create component variants (optional but recommended)**
   - Use `class-variance-authority` (cva) for variant management
   - Variants: `default`, `active`, `empty`, `compact`, `normal`
   - Export variant function for flexible styling

16. **Add customization options**
   - Allow custom position for decrement button
   - Support custom badge position
   - Optional show/hide controls for price, image, etc.

### Phase 8: Testing & Verification

17. **Manual testing checklist**
   - Touch target size verification (80x80px / 60x60px)
   - Tap responsiveness and immediate visual feedback
   - Quantity badge visibility and accuracy
   - Pulse animation smoothness (60fps)
   - Keyboard navigation (Tab, Enter, Space, Delete)
   - Screen reader announcements (quantity changes)
   - Dark mode contrast
   - Grid layout integration

18. **Browser compatibility testing**
   - iOS Safari (touch interaction)
   - Chrome Android (touch interaction)
   - Desktop browsers (hover states, keyboard)
   - Verify animation performance across devices

## File Changes Summary

### New Files
1. `apps/web/src/components/tally-product-card.tsx` - Main component file

### Modified Files
1. `apps/web/src/routes/tally.tsx` - Integrate TallyProductCard component (to be created in task 4.x)
2. `apps/web/src/index.css` - Add pulse animation keyframes (if not present)

### Optional: Shared Utilities
1. `apps/web/src/lib/animations.ts` - Reusable animation utilities (if needed for future)
2. `apps/web/src/lib/accessibility.ts` - Accessibility helper functions (if needed)

## CSS Keyframes for Pulse Animation

```css
@keyframes quantity-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-pulse-once {
  animation: quantity-pulse 300ms ease-out;
}
```

## Component API Preview

```typescript
interface TallyProductCardProps {
  product: Product
  quantity: number
  density?: 'normal' | 'compact'
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onEditQuantity?: (productId: string, quantity: number) => void
  className?: string
}
```

## Integration Notes

- This component will be used in the tally page grid (created in future tasks)
- Works seamlessly with existing `useTallyStore` hooks
- Follows established shadcn/ui component patterns
- Integrates with theme system for dark/light mode
- Compatible with keyboard navigation from parent containers

## Dependencies

- `@tiny-till/types` - Product type
- `@tiny-till/env/web` - Environment variables (if needed)
- `lucide-react` - Icons (Plus, Minus for increment/decrement)
- Existing UI components: Button, Badge, Card
- Tailwind CSS v4 for styling
- React 19 for component logic

## Success Criteria

1. ✅ Touch targets meet minimum size requirements (80x80px / 60x60px)
2. ✅ Tap-to-increment works instantly with visual feedback
3. ✅ Decrement button functional and positioned optimally
4. ✅ Quantity badges display prominently for items > 0
5. ✅ Pulse animations trigger on quantity changes
6. ✅ Full keyboard navigation support (Tab, Enter, Space, Delete)
7. ✅ ARIA labels present and descriptive
8. ✅ Screen reader announces quantity changes
9. ✅ Works in both normal and compact density modes
10. ✅ Dark mode contrast compliant
11. ✅ Type-safe TypeScript implementation
12. ✅ Follows project coding conventions (no comments, named exports, proper typing)

## Next Steps After This Task

- Task 4.3: Manual Input Overlay with Large Numeric Keypad (integrate onEditQuantity)
- Task 4.4: Input Validation and Error Handling System
- Task 4.5: Live Total Calculation with Currency Formatting
- Task 4.6: Sticky Footer with Cart Management
- Task 4.7: Visual Feedback Animations System (enhance pulse animations)

## Risk Mitigation

1. **Touch target overlap**: Ensure decrement button doesn't conflict with primary tap area
2. **Animation performance**: Use CSS transforms (GPU accelerated) for smooth 60fps
3. **Accessibility conflicts**: Test with screen readers to ensure no competing announcements
4. **State synchronization**: Ensure quantity prop updates don't cause animation loops
5. **Grid integration**: Verify component works well in responsive grid layout
