# Task 2.3 Implementation Plan: Product List UI with Inline CRUD Interface

## Task Analysis

**Task Title:** Product List UI with Inline CRUD Interface

**Status:** The core CRUD functionality is already implemented with modal dialogs. This task focuses on enhancing keyboard navigation, focus management, and accessibility features.

**Current State:**
- ✅ Responsive grid layout (2-6 columns)
- ✅ Add/Edit/Delete functionality via modal dialogs
- ✅ State management integration (Zustand catalog store)
- ✅ Real-time updates
- ✅ Loading states (skeleton loaders)
- ✅ Empty state handling
- ✅ Search functionality

**Missing Features to Implement:**
- ❌ Keyboard navigation (arrow keys, Enter, Escape)
- ❌ Focus management (focus trapping, restoration)
- ❌ Comprehensive ARIA labels and landmarks
- ❌ Screen reader announcements
- ❌ Focus indicators

## Implementation Steps

### Step 1: Enhance Keyboard Navigation in ProductList

**Files to Modify:** `apps/web/src/components/product-list.tsx`

**Changes Required:**

1. Add keyboard navigation state:
   - Track focused product ID
   - Track navigation mode (tab/arrow keys)

2. Implement keyboard event handlers:
   - ArrowUp/ArrowDown: Navigate through grid rows
   - ArrowLeft/ArrowRight: Navigate through grid columns
   - Enter: Trigger edit action on focused product
   - Escape: Close any open dialogs
   - Home/End: Jump to first/last product

3. Add focus styling:
   - Visual indicator for currently focused product card
   - Focus ring visible for keyboard users
   - High contrast focus state

4. Implement grid-aware navigation:
   - Calculate column count based on breakpoint
   - Map linear index to 2D grid coordinates
   - Handle edge cases (first row, last row, single column)

**Technical Details:**
```typescript
// State to track
const [focusedProductId, setFocusedProductId] = useState<string | null>(null)
const [columnCount, setColumnCount] = useState(getColumnCount())

// Function to determine column count
const getColumnCount = () => {
  const width = window.innerWidth
  if (width >= 1280) return 6      // xl
  if (width >= 1024) return 5      // lg
  if (width >= 768) return 4       // md
  if (width >= 640) return 3       // sm
  return 2                         // default
}
```

---

### Step 2: Enhance ProductCard for Keyboard Accessibility

**Files to Modify:** `apps/web/src/components/product-card.tsx`

**Changes Required:**

1. Add comprehensive ARIA attributes:
   - `role="button"` for card container
   - `tabIndex={0}` to make focusable
   - `aria-label` with product name and price
   - `aria-describedby` for edit/delete buttons

2. Implement keyboard event handlers:
   - Enter key triggers edit
   - Space key triggers edit
   - Delete key triggers delete confirmation

3. Add focus management:
   - Ref to track focus state
   - Auto-focus when receiving focus via navigation
   - Focus trap within card actions

4. Enhanced focus indicators:
   - Visual outline on focus
   - Animation when focus changes
   - Clear visual distinction for keyboard users

**Technical Details:**
```typescript
// Add to card container
<div
  ref={cardRef}
  role="button"
  tabIndex={0}
  aria-label={`${product.name}, ${formatPrice(product.price)}`}
  onKeyDown={handleKeyDown}
  onFocus={() => setFocusedProductId(product.id)}
  className={cn(
    "ring-offset-background transition-shadow",
    isFocused && "ring-2 ring-ring ring-offset-2"
  )}
>
```

---

### Step 3: Implement Focus Management in ProductForm Modal

**Files to Modify:** `apps/web/src/components/product-form.tsx`

**Changes Required:**

1. Focus trapping in modal:
   - Trap focus within modal when open
   - Move focus to first input on open
   - Handle Tab/Shift+Tab to cycle through form fields
   - Prevent focus from leaving modal

2. Focus restoration:
   - Track previously focused element before opening
   - Restore focus to calling element on close
   - Ensure proper focus order on re-open

3. Add ARIA live regions:
   - `aria-live="polite"` for error messages
   - `aria-live="assertive"` for critical errors
   - Screen reader announcements for form submission

4. Keyboard shortcuts:
   - Escape closes modal
   - Ctrl+Enter submits form
   - Focus indicators for all form controls

**Technical Details:**
```typescript
// Use useEffect for focus management
useEffect(() => {
  if (open && formRef.current) {
    const firstInput = formRef.current.querySelector('input')
    firstInput?.focus()
  }
}, [open])

// Handle escape key
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      onOpenChange(false)
    }
  }
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [open, onOpenChange])
```

---

### Step 4: Enhance ConfirmationDialog Accessibility

**Files to Modify:** `apps/web/src/components/confirmation-dialog.tsx`

**Changes Required:**

1. Focus management:
   - Auto-focus confirm button on open
   - Trap focus within dialog
   - Restore focus on close

2. ARIA attributes:
   - `role="alertdialog"` for destructive actions
   - `aria-labelledby` pointing to title
   - `aria-describedby` pointing to description
   - Proper focusable elements ordering

3. Keyboard interactions:
   - Escape closes dialog
   - Enter confirms if confirm button has focus
   - Tab/Shift+Tab cycles through buttons

**Technical Details:**
```typescript
<DialogContent
  role="alertdialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  onCloseAutoFocus={(e) => {
    // Prevent focus from going to body
    e.preventDefault()
    // Restore to trigger element
    triggerElementRef.current?.focus()
  }}
>
```

---

### Step 5: Add ARIA Landmarks to Catalog Route

**Files to Modify:** `apps/web/src/routes/settings.catalog.tsx`

**Changes Required:**

1. Add semantic landmarks:
   - `<main role="main">` wrapper for main content
   - `<nav role="navigation">` for back link
   - `<header>` for page header
   - `<h1>` for page title

2. ARIA live regions:
   - `aria-live="polite"` for product count updates
   - `aria-live="assertive"` for error toasts
   - `aria-atomic="true"` for complete announcements

3. Page announcements:
   - Announce when products are loaded
   - Announce empty state
   - Announce search results

**Technical Details:**
```typescript
<main
  role="main"
  aria-label="Product catalog management"
  className="container..."
>
  <header>
    <h1 id="page-title">Catalog Management</h1>
  </header>

  {/* Live region for announcements */}
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {products.length} products in catalog
  </div>
</main>
```

---

### Step 6: Create Custom Keyboard Navigation Hook

**Files to Create:** `apps/web/src/hooks/use-keyboard-navigation.ts`

**Purpose:** Reusable keyboard navigation logic for grid-based lists

**Features:**
- Arrow key navigation
- Home/End support
- Grid-aware movement (2D navigation)
- Focus management
- Event handling

**Implementation:**
```typescript
interface UseKeyboardNavigationProps<T> {
  items: T[]
  itemId: (item: T) => string
  onItemSelect?: (item: T) => void
  getItemElement?: (id: string) => HTMLElement | null
  columnCount: number
}

export function useKeyboardNavigation<T>(props: UseKeyboardNavigationProps<T>) {
  // Implementation for keyboard navigation
}
```

---

### Step 7: Add Focus Styles and Utilities

**Files to Create:** `apps/web/src/lib/focus-styles.ts`

**Purpose:** Centralized focus style utilities

**Features:**
- Consistent focus ring styles
- High contrast focus states
- Focus-visible polyfill support
- Custom focus animations

**Implementation:**
```typescript
export const focusStyles = cn(
  'outline-none',
  'ring-2',
  'ring-ring',
  'ring-offset-2',
  'ring-offset-background',
  'focus-visible:ring-2'
)

export const focusVisibleStyles = cn(
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background'
)
```

---

### Step 8: Create Accessibility Test Utilities

**Files to Create:** `apps/web/src/lib/accessibility-test.ts`

**Purpose:** Runtime accessibility checks for development

**Features:**
- Check focus trap functionality
- Verify ARIA attributes
- Test keyboard navigation
- Screen reader announcement testing

---

## File Changes Summary

### Files to Modify:
1. `apps/web/src/components/product-list.tsx` - Keyboard navigation
2. `apps/web/src/components/product-card.tsx` - Focus & ARIA
3. `apps/web/src/components/product-form.tsx` - Focus management
4. `apps/web/src/components/confirmation-dialog.tsx` - Focus trap
5. `apps/web/src/routes/settings.catalog.tsx` - Landmarks

### Files to Create:
1. `apps/web/src/hooks/use-keyboard-navigation.ts` - Navigation hook
2. `apps/web/src/lib/focus-styles.ts` - Focus utilities

## Testing Checklist

### Keyboard Navigation:
- [ ] Arrow keys navigate through product grid
- [ ] Enter key opens edit dialog
- [ ] Escape key closes dialogs
- [ ] Tab/Shift+Tab navigates correctly
- [ ] Home/End jump to first/last products

### Focus Management:
- [ ] Focus is trapped in modals
- [ ] Focus returns to trigger element on close
- [ ] First input auto-focuses in modals
- [ ] Focus indicators are visible
- [ ] Focus order is logical

### ARIA Labels:
- [ ] All interactive elements have labels
- [ ] Screen readers announce actions
- [ ] Live regions announce updates
- [ ] Landmarks define page structure
- [ ] Error messages are accessible

### Screen Reader Testing:
- [ ] Product cards are announced correctly
- [ ] Form fields are properly labeled
- [ ] Dialogs are announced as dialogs
- [ ] Error messages are read
- [ ] Status updates are announced

## Performance Considerations

- Use `requestAnimationFrame` for focus animations
- Debounce resize events for column calculation
- Lazy load keyboard navigation hook
- Use `aria-live` sparingly (only for necessary updates)
- Optimize focus trap calculations

## Browser Compatibility

- All features work in modern browsers (Chrome, Firefox, Safari, Edge)
- Polyfill for `:focus-visible` if needed
- Test keyboard behavior across platforms
- Verify screen reader compatibility (NVDA, JAWS, VoiceOver)

## Success Criteria

1. ✅ All CRUD operations fully keyboard accessible
2. ✅ Focus management works correctly throughout
3. ✅ Screen readers can navigate and understand all UI
4. ✅ No accessibility errors in browser DevTools
5. ✅ Keyboard navigation feels intuitive and smooth
6. ✅ Focus indicators are clearly visible
7. ✅ ARIA attributes are semantically correct
8. ✅ All states (loading, empty, error) are accessible

## Integration Notes

- Integration with existing Zustand store is seamless
- No changes to state management required
- No breaking changes to existing API
- Progressive enhancement approach (works without JS)
- Compatible with shadcn/ui component patterns

## Post-Implementation Tasks

1. Run accessibility audit (axe DevTools)
2. Test with keyboard only
3. Test with screen readers
4. Verify Lighthouse accessibility score
5. Update documentation if needed
6. Run type checking: `npm run check-types`
7. Run build: `npm run build`
