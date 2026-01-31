# Task 4.4: Input Validation and Error Handling System - Implementation Plan

## Task Overview

Implement comprehensive validation for all quantity inputs including manual keypad and tap interactions. Enforce non-negative integer rules only, reject decimals with immediate feedback, and automatically remove items when quantity reaches 0. Build clear error messaging system with visual indicators (red borders, error messages, shake animations). Validate on-the-fly and prevent invalid entries from being submitted.

## Current State Analysis

### Existing Components & Systems

**Components:**
- `TallyProductCard` (`apps/web/src/components/tally-product-card.tsx`) - Handles tap interactions
- `NumericKeypad` (`apps/web/src/components/ui/numeric-keypad.tsx`) - Manual input keypad
- `QuantityInputDialog` (`apps/web/src/components/quantity-input-dialog.tsx`) - Modal for quantity editing

**State Management:**
- `TallyStore` (`apps/web/src/stores/tally-store.ts`) - Stores tally items
- `validateQuantity` function exists in `apps/web/src/lib/validators.ts`

**Validation:**
- `validateQuantity` validates: integer, non-negative, max 9,999
- `quantitySchema` in packages/types enforces non-negative integers

### Current Gaps

1. **No real-time validation** - NumericKeypad accepts any digits without validation
2. **No visual error states** - No red borders, error messages, or animations
3. **No decimal rejection** - Decimals can be entered in input dialogs
4. **No shake animations** - No visual feedback for invalid inputs
5. **Limited error messaging** - Generic errors without specific guidance
6. **No on-the-fly validation** - Validation only happens on submission
7. **No string input validation** - Keypad produces strings, not validated before parsing

## Implementation Plan

### Step 1: Create Animation Utilities

**File:** `apps/web/src/lib/animations.ts` (NEW)

Create utility functions for visual feedback animations:

- `shakeAnimation` keyframes for CSS
- `animateShake` class for React components
- `animatePulseOnce` for quantity changes
- Export reusable animation utilities

**Implementation Details:**
- Use CSS keyframes for shake animation (translate X axis)
- Add `animate-shake` class to global styles or inline styles
- Support animation duration: 300-400ms
- Ensure animations don't interfere with accessibility (prefers-reduced-motion)

### Step 2: Create Quantity Validation Hook

**File:** `apps/web/src/hooks/use-quantity-validation.ts` (NEW)

Create a custom hook for quantity input validation:

**Hook Interface:**
```typescript
interface UseQuantityValidationReturn {
  validate: (value: string) => ValidationResult
  validateAndParse: (value: string) => { isValid: boolean; quantity?: number; error?: string }
  getErrorMessage: (error: ValidationError) => string
  hasError: boolean
  errorState: ValidationError | null
}
```

**Validation Rules:**
- Must be non-negative integer only (0, 1, 2, 3...)
- Reject decimal points immediately
- Max 6 digits for display (enforced in keypad)
- Max 9,999 for quantity validation
- Empty string treated as 0 (allow removal)

**Error Messages:**
- "Please enter a valid number"
- "Quantity must be a whole number (no decimals)"
- "Quantity cannot be negative"
- "Quantity cannot exceed 9,999"
- "Invalid input. Use numbers only"

### Step 3: Create Reusable Validation Error Display Component

**File:** `apps/web/src/components/ui/validation-error-message.tsx` (NEW)

Reusable component for displaying validation errors with animations:

**Features:**
- Red text color for errors
- Icon indicator (X or AlertCircle)
- Shake animation on mount/visibility change
- Accessible ARIA attributes (aria-live="polite", aria-atomic="true")
- Support for different error types (info, warning, error)
- Auto-dismiss option
- Responsive spacing

**Props:**
```typescript
interface ValidationErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  visible: boolean
  className?: string
  onDismiss?: () => void
}
```

### Step 4: Create Validated Quantity Input Component

**File:** `apps/web/src/components/ui/validated-quantity-input.tsx` (NEW)

Enhanced display component for quantity with validation state:

**Features:**
- Large text display (matches NumericKeypad style)
- Red border and shake animation on error
- Green border on success state
- Transition animations for state changes
- Support for placeholder display (0 or empty)
- Focus management for accessibility

**Props:**
```typescript
interface ValidatedQuantityInputProps {
  value: string
  error: string | null
  isValid: boolean
  hasError: boolean
  className?: string
}
```

### Step 5: Enhance NumericKeypad Component

**File:** `apps/web/src/components/ui/numeric-keypad.tsx` (MODIFY)

**Changes:**

1. **Add validation state:**
   - `onError` callback prop
   - `onValidChange` callback prop
   - `validateOnChange` prop (default: true)

2. **Add visual error states:**
   - Red border when input is invalid
   - Shake animation class on validation error
   - Transition effects for border color changes

3. **Implement real-time validation:**
   - Call validation on every digit input
   - Prevent adding digits that would create invalid input
   - Update parent component with validation state

4. **Keyboard handling:**
   - Add Enter key to confirm (if provided)
   - Escape to cancel
   - Prevent invalid keystrokes

**New Props:**
```typescript
interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
  validateOnChange?: boolean
  onError?: (error: string | null) => void
  onValidChange?: (isValid: boolean) => void
  className?: string
}
```

### Step 6: Enhance QuantityInputDialog Component

**File:** `apps/web/src/components/quantity-input-dialog.tsx` (MODIFY)

**Changes:**

1. **Integrate validation hook:**
   - Use `useQuantityValidation` hook
   - Validate input on every change
   - Track validation state

2. **Update display:**
   - Replace plain display with `ValidatedQuantityInput`
   - Show error messages below display
   - Add shake animation on error

3. **Enhance Confirm button:**
   - Disable when input is invalid
   - Visual feedback (opacity/reduced contrast)
   - Update label based on state

4. **Add validation feedback:**
   - Show error message below keypad
   - Use `ValidationErrorMessage` component
   - Animate messages in/out

5. **Handle edge cases:**
   - Empty string → 0 (confirm removes item)
   - "0" → 0 (confirm removes item)
   - Invalid decimal → show error, block confirm

**Implementation Logic:**
```typescript
const handleConfirm = () => {
  const result = validateAndParse(inputValue)
  if (!result.isValid) {
    setShowError(true)
    triggerShake()
    return
  }
  onConfirm(result.quantity || 0)
  onOpenChange(false)
}
```

### Step 7: Update Tally Store Validation

**File:** `apps/web/src/stores/tally-store.ts` (MODIFY)

**Changes:**

1. **Enhance `updateQuantity` method:**
   - Add input type checking (string vs number)
   - Parse string inputs with validation
   - Throw descriptive errors for invalid inputs

2. **Add `validateQuantityInput` helper:**
   - Validate before state updates
   - Return validation result
   - Used by components before calling store

3. **Improve error messages:**
   - "Quantity must be a whole number"
   - "Quantity cannot be negative"
   - "Invalid quantity format"

**New Helper Method:**
```typescript
private validateQuantityInput(value: string | number): ValidationResult {
  if (typeof value === 'string') {
    const num = parseInt(value, 10)
    if (isNaN(num)) return { isValid: false, error: 'Invalid quantity' }
    return validateQuantity(num)
  }
  return validateQuantity(value)
}
```

### Step 8: Update TallyProductCard Component

**File:** `apps/web/src/components/tally-product-card.tsx` (MODIFY)

**Changes:**

1. **Add error state handling:**
   - Display error toast on validation failures
   - Visual feedback for rejected operations
   - Shake animation card on error

2. **Enhance keyboard input:**
   - Validate number keys
   - Reject invalid characters
   - Provide feedback for rejected inputs

3. **Tap interaction validation:**
   - Ensure increment/decrement never goes below 0
   - Remove item when quantity reaches 0 via decrement
   - Prevent duplicate rapid taps that could cause issues

**Error Handling:**
```typescript
const handleIncrementWithErrorHandling = () => {
  try {
    onIncrement(productId)
  } catch (error) {
    if (error instanceof Error) {
      toast.error('Error adding item', {
        description: error.message
      })
      triggerCardShake()
    }
  }
}
```

### Step 9: Create Validation Test Utilities

**File:** `apps/web/src/lib/validation-test-utils.ts` (NEW)

Utility functions for testing validation:

- `mockValidationError` - Create mock validation errors
- `assertValidationResult` - Assert validation outcome
- `simulateInvalidInput` - Simulate invalid user input
- `waitForValidationComplete` - Wait for async validation

### Step 10: Add Global Error Message Constants

**File:** `apps/web/src/lib/validation-messages.ts` (NEW)

Centralized error message constants:

```typescript
export const QUANTITY_ERROR_MESSAGES = {
  INVALID_NUMBER: 'Please enter a valid number',
  DECIMAL_REJECTED: 'Quantity must be a whole number (no decimals)',
  NEGATIVE: 'Quantity cannot be negative',
  EXCEEDS_MAX: 'Quantity cannot exceed 9,999',
  EMPTY: 'Please enter a quantity',
  INVALID_INPUT: 'Invalid input. Use numbers only',
  ZERO_REMOVES_ITEM: 'Setting quantity to 0 will remove this item',
} as const
```

## File Changes Summary

### New Files (7)

1. `apps/web/src/lib/animations.ts` - Animation utilities
2. `apps/web/src/hooks/use-quantity-validation.ts` - Validation hook
3. `apps/web/src/components/ui/validation-error-message.tsx` - Error display component
4. `apps/web/src/components/ui/validated-quantity-input.tsx` - Validated input display
5. `apps/web/src/lib/validation-test-utils.ts` - Test utilities
6. `apps/web/src/lib/validation-messages.ts` - Error message constants

### Modified Files (5)

1. `apps/web/src/components/ui/numeric-keypad.tsx` - Add validation state and visual feedback
2. `apps/web/src/components/quantity-input-dialog.tsx` - Integrate validation
3. `apps/web/src/stores/tally-store.ts` - Enhance quantity update validation
4. `apps/web/src/components/tally-product-card.tsx` - Add error handling
5. `apps/web/src/lib/validators.ts` - Add quantity string validation helper

## Implementation Dependencies

- Step 1 must complete before Steps 3, 4, 5 (animations needed for visual feedback)
- Step 2 must complete before Steps 5, 6 (validation hook needed by components)
- Step 3 must complete before Step 6 (error message component needed by dialog)
- Step 4 must complete before Step 6 (validated input needed by dialog)
- Step 10 can be done in parallel with Steps 1-4
- Steps 7, 8 depend on validation infrastructure (Steps 1-6)

## Validation Flow

### Tap Interaction Flow

1. User taps product card
2. `handleIncrement` called
3. `incrementItem` in store validates internally
4. State updated if valid
5. Visual pulse animation triggered
6. Quantity badge updated
7. If validation fails: shake card + error toast

### Keypad Input Flow

1. User opens quantity dialog (long-press/double-tap)
2. `NumericKeypad` accepts digit input
3. On each digit change:
   - Validate in real-time
   - Update display with border color (red/green)
   - Show/hide error message
4. User taps Confirm:
   - Final validation check
   - If invalid: shake + error message, block submission
   - If valid: call `updateQuantity`
5. Store updates state (removes item if 0)
6. Dialog closes

## Edge Cases to Handle

1. **Empty input** → Treat as 0, show confirmation
2. **Leading zeros** → Parse correctly ("007" = 7)
3. **Multiple zeros** → "000" = 0
4. **Decimal point entry** → Reject immediately, show error
5. **Negative numbers** → Reject, show error
6. **Very large numbers** → Cap at 9,999, show error if exceeded
7. **Non-numeric characters** → Reject, ignore or show error
8. **Copy-paste invalid text** → Validate, reject if invalid
9. **Rapid digit entry** → Debounce validation slightly for performance
10. **Zero quantity** → Remove item automatically, show visual feedback

## Accessibility Considerations

1. **Screen Reader Support:**
   - `aria-invalid` on invalid inputs
   - `aria-describedby` linking to error messages
   - Live regions for error announcements
   - ARIA labels for all actions

2. **Keyboard Navigation:**
   - Tab order through keypad
   - Enter/Space to confirm
   - Escape to cancel
   - Arrow keys for navigation (if supported)

3. **Reduced Motion:**
   - Respect `prefers-reduced-motion`
   - Disable shake animations for users who prefer
   - Use color changes instead of motion

4. **Color Contrast:**
   - Ensure error states meet WCAG AA
   - Don't rely on color alone for error indication
   - Use icons + color + text

## Testing Strategy

### Unit Tests

1. **Validation Hook:**
   - Test valid integer inputs
   - Test decimal rejection
   - Test negative number rejection
   - Test edge cases (0, 9999, 10000)
   - Test empty string handling

2. **Validation Component:**
   - Test error message display
   - Test shake animation trigger
   - Test accessibility attributes
   - Test auto-dismiss functionality

3. **NumericKeypad:**
   - Test digit input
   - Test validation callback triggers
   - Test max length enforcement
   - Test error state visual updates

### Integration Tests

1. **QuantityInputDialog:**
   - Test complete flow: open → type → validate → confirm/ reject
   - Test error recovery (invalid → fix → valid → confirm)
   - Test zero quantity removes item
   - Test decimal input rejection

2. **TallyProductCard:**
   - Test tap interactions with validation
   - Test error toast display
   - Test quantity removal at 0
   - Test keyboard shortcuts

3. **End-to-End Flow:**
   - Add product via tap
   - Edit quantity via keypad
   - Try invalid input (decimal)
   - Correct input
   - Remove item by setting to 0

## Success Criteria

- [ ] All quantity inputs reject decimals immediately
- [ ] Error states show red borders and shake animations
- [ ] Error messages provide specific guidance
- [ ] Invalid entries are blocked from submission
- [ ] Quantity 0 automatically removes items
- [ ] Real-time validation works on keypad input
- [ ] Tap interactions validate on every action
- [ ] Visual feedback is clear and immediate
- [ ] Accessibility requirements are met (ARIA, keyboard, reduced motion)
- [ ] All edge cases are handled gracefully
- [ ] Error messages are user-friendly and actionable
- [ ] Animations are smooth (60fps) and respectful of preferences

## Performance Considerations

1. **Debounce validation:** Debounce rapid keystrokes by 100-150ms
2. **Memoization:** Memoize validation results to avoid redundant checks
3. **Animation performance:** Use CSS transforms instead of layout properties
4. **Avoid re-renders:** Only re-render when validation state actually changes
5. **Bundle size:** Keep validation utilities minimal and tree-shakeable

## Future Considerations (Out of Scope for This Task)

- Multi-language support for error messages
- Customizable validation rules (user-defined limits)
- Input suggestions/autocomplete
- Voice input for quantities
- Bulk quantity operations
