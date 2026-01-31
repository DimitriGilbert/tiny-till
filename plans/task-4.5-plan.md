# Task 4.5: Live Total Calculation with Currency Formatting - Implementation Plan

## Overview
Implement real-time total calculation system using integer arithmetic (cents-based math to avoid floating point errors). Calculate grand total by summing all item quantities multiplied by their unit prices, maintaining all calculations in integer cents. Integrate Intl.NumberFormat for proper currency formatting with locale support (USD, EUR, etc.). Ensure calculation updates instantly on any quantity change. Display subtotal and grand total with proper formatting. Write unit tests for rounding and calculation accuracy.

## Current State Analysis

### Existing Components
- **Currency Utilities** (`packages/types/src/utils/currency.ts`):
  - `toCents()` - Converts dollars to integer cents
  - `toDollars()` - Converts cents back to dollar decimal
  - `formatPrice()` - Formats cents as localized currency string using Intl.NumberFormat
  - Already provides proper locale support and currency formatting

- **Tally Store** (`apps/web/src/stores/tally-store.ts`):
  - `getSummary()` - Currently calculates `total`, `itemCount`, and `productCount`
  - Need to verify price storage format (cents vs dollars)
  - Need to ensure all calculations use integer arithmetic

- **Settings Store** (`apps/web/src/stores/settings-store.ts`):
  - Currently has theme, gridDensity, columnCountOverride, backupReminder
  - Missing currency/locale configuration

### Key Implementation Requirements
1. Ensure all prices are stored and calculated in integer cents
2. Add currency locale settings to support multiple currencies (USD, EUR, etc.)
3. Enhance total calculation to be reactive and instant
4. Create proper display components for formatted totals
5. Write comprehensive unit tests

## Implementation Steps

### Step 1: Add Currency Locale Configuration to Settings
**File:** `packages/types/src/entities/settings.ts`

Add currency locale to the Settings interface:
```typescript
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'
export type Locale = string

export interface Settings {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride?: ColumnCount
  backupReminder?: number
  currency?: Currency
  locale?: Locale
}
```

**Rationale:** This provides the foundation for multi-currency support with proper locale-based formatting.

### Step 2: Update Settings Store with Currency Configuration
**File:** `apps/web/src/stores/settings-store.ts`

- Add `currency` and `locale` to SettingsState interface
- Add `setCurrency()` and `setLocale()` actions
- Update initialState with defaults: `currency: 'USD'`, `locale: 'en-US'`
- Add validation for currency and locale changes

**Rationale:** Centralizes currency/locale state management with proper validation and persistence.

### Step 3: Verify and Ensure Cents-Based Storage
**Files:** 
- `packages/types/src/entities/product.ts`
- `packages/types/src/entities/tally-item.ts`
- `apps/web/src/stores/tally-store.ts`

Verify that:
1. Product price field is documented as storing integer cents
2. TallyItem.price is stored as integer cents
3. All price calculations use integer arithmetic only

If needed, add explicit documentation/comments to clarify that prices are stored in cents.

**Rationale:** Prevents floating-point errors by ensuring all prices are stored as integers (cents).

### Step 4: Enhance Tally Summary Calculation
**File:** `apps/web/src/stores/tally-store.ts`

Update the `getSummary()` method to:
1. Calculate grand total using integer arithmetic: `Σ (priceInCents × quantity)`
2. Add support for subtotal (could be used for discounts/taxes in future)
3. Return totals in integer cents for display formatting
4. Ensure calculation is memoized or computed efficiently for performance

Consider adding a selector-based approach for better performance:
```typescript
// Add a computed selector for totals
const getTotalCents = (state: TallyStoreState): number => {
  let total = 0
  state.items.forEach((item) => {
    total += item.price * item.quantity
  })
  return total
}
```

**Rationale:** Ensures accurate, performant total calculations using only integer arithmetic.

### Step 5: Create Currency Formatting Hook
**File:** `apps/web/src/hooks/useCurrencyFormat.ts` (new file)

Create a custom hook that:
1. Reads currency and locale from settings store
2. Returns a memoized formatter function
3. Provides formatted price strings for cents values
4. Automatically updates when settings change

Implementation:
```typescript
import { useMemo } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { formatPrice } from '@tiny-till/types'

export function useCurrencyFormat() {
  const { currency, locale } = useSettingsStore()
  
  const formatter = useMemo(() => {
    return (cents: number) => formatPrice(cents, locale)
  }, [currency, locale])
  
  return formatter
}
```

**Rationale:** Provides a centralized, reactive way to format currency values throughout the app.

### Step 6: Create Tally Totals Display Component
**File:** `apps/web/src/components/tally-totals-display.tsx` (new file)

Create a display component for:
1. Showing item count
2. Showing subtotal (sum of all item prices × quantities)
3. Showing grand total (same as subtotal for now, extensible for taxes/discounts)
4. Using proper currency formatting from Intl.NumberFormat
5. Responsive layout (mobile-first)
6. Accessible with proper ARIA labels

Component signature:
```typescript
interface TallyTotalsDisplayProps {
  totalCents: number
  itemCount: number
  className?: string
}
```

**Rationale:** Provides a reusable component for displaying formatted totals with proper accessibility.

### Step 7: Update Tally Page to Display Totals
**File:** `apps/web/src/routes/index.tsx`

Update the TallyPage component to:
1. Use `getSummary()` to get current totals
2. Add the `TallyTotalsDisplay` component
3. Ensure updates are reactive and instant on quantity changes
4. Position the totals display (preparing for sticky footer in task 4.6)

**Rationale:** Integrates the total calculation and display into the main tally page.

### Step 8: Write Unit Tests for Calculation Accuracy
**File:** `apps/web/src/lib/__tests__/currency-calculation.test.ts` (new file)

Create comprehensive tests covering:
1. Basic addition calculations
2. Large number calculations (test for overflow)
3. Edge cases (empty tally, single item, maximum values)
4. Rounding behavior (should be exact with integer arithmetic)
5. Currency formatting with different locales
6. Reactivity tests (totals update on quantity changes)

Test examples:
```typescript
describe('calculateTotalCents', () => {
  it('calculates total correctly for multiple items', () => {
    const items = [
      { price: 1050, quantity: 2 }, // $10.50 × 2 = $21.00 = 2100 cents
      { price: 99, quantity: 3 },   // $0.99 × 3 = $2.97 = 297 cents
    ]
    expect(calculateTotalCents(items)).toBe(2397)
  })
  
  it('handles empty tally', () => {
    expect(calculateTotalCents([])).toBe(0)
  })
  
  it('formats correctly for different locales', () => {
    expect(formatPrice(1050, 'en-US')).toBe('$10.50')
    expect(formatPrice(1050, 'de-DE')).toContain('10,50')
  })
})
```

**Rationale:** Ensures calculation accuracy and prevents regression bugs.

### Step 9: Write Unit Tests for Currency Formatting
**File:** `packages/types/src/utils/__tests__/currency.test.ts` (new file)

Add tests for existing currency utilities:
1. `toCents()` conversion accuracy
2. `toDollars()` conversion accuracy
3. `formatPrice()` with various locales
4. `parsePrice()` parsing behavior
5. Edge cases (negative values, zero, large numbers)

**Rationale:** Validates the existing currency utility functions.

### Step 10: Integration Testing
**File:** `apps/web/src/components/__tests__/tally-totals-display.test.tsx` (new file)

Create React component tests for:
1. Component renders correctly with different totals
2. Formatting updates when settings change
3. Accessibility attributes are correct
4. Responsive behavior

**Rationale:** Ensures the display component works correctly in isolation and integration.

### Step 11: Type Validation
**Files:** Multiple

Run type checking:
```bash
npm run check-types
```

Ensure:
1. All new interfaces are properly typed
2. No `any` types used
3. Currency/locale settings have proper types
4. Component props are correctly typed

**Rationale:** Maintains strict type safety across the codebase.

### Step 12: Build Verification
Run build:
```bash
npm run build
```

Ensure the application builds successfully without errors.

**Rationale:** Validates that all changes integrate correctly with the build system.

## File Changes Summary

### New Files
1. `apps/web/src/hooks/useCurrencyFormat.ts` - Currency formatting hook
2. `apps/web/src/components/tally-totals-display.tsx` - Totals display component
3. `apps/web/src/lib/__tests__/currency-calculation.test.ts` - Calculation tests
4. `packages/types/src/utils/__tests__/currency.test.ts` - Currency utility tests
5. `apps/web/src/components/__tests__/tally-totals-display.test.tsx` - Component tests

### Modified Files
1. `packages/types/src/entities/settings.ts` - Add Currency and Locale types
2. `packages/types/src/entities/product.ts` - Verify/clarify price storage format
3. `packages/types/src/entities/tally-item.ts` - Verify/clarify price storage format
4. `apps/web/src/stores/settings-store.ts` - Add currency/locale state and actions
5. `apps/web/src/stores/tally-store.ts` - Enhance getSummary() with proper cents-based calculation
6. `apps/web/src/routes/index.tsx` - Integrate totals display

## Testing Strategy

### Unit Tests
- Currency calculation logic (integer arithmetic accuracy)
- Currency formatting with multiple locales
- Edge cases (empty tally, large numbers, zero values)
- Reactivity of total updates

### Integration Tests
- Tally page displays totals correctly
- Settings changes update currency formatting
- Quantity changes trigger instant total updates
- Component renders with proper accessibility attributes

### Manual Testing
1. Create a tally with multiple products
2. Change quantities and verify totals update instantly
3. Switch between different currency locales in settings
4. Verify formatting changes accordingly
5. Check with various price points and quantities

## Success Criteria

1. ✓ All prices stored and calculated in integer cents
2. ✓ No floating-point arithmetic in total calculations
3. ✓ Grand total calculated accurately: `Σ (priceInCents × quantity)`
4. ✓ Intl.NumberFormat used for all currency display
5. ✓ Multiple currency locales supported (USD, EUR, etc.)
6. ✓ Totals update instantly on any quantity change
7. ✓ Proper formatting: `$10.50` (USD), `10,50 €` (EUR), etc.
8. ✓ All unit tests pass with 100% coverage of calculation logic
9. ✓ Type checking passes with no errors
10. ✓ Build succeeds with no errors
11. ✓ Component displays correctly with subtotal and grand total
12. ✓ Accessibility requirements met (ARIA labels, semantic markup)

## Dependencies
- Task 4.4 (Input Validation) - Must be completed first for quantity validation
- Existing currency utilities in `packages/types/src/utils/currency.ts`
- Existing tally store structure

## Notes for Future Tasks
- Task 4.6 (Sticky Footer) will use the `TallyTotalsDisplay` component
- Future tax/discount support can extend the subtotal/grand total distinction
- Multi-currency support foundation is being laid here for future enhancement
