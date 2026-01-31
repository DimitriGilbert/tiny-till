# Task 2.5: Price Management and Validation System - Implementation Plan

## Overview
Build comprehensive price handling system with integer cents storage, validation for price ranges and format conversions, user-friendly input components, display formatting utilities, and safeguards against invalid price data and floating-point errors.

## Current State Analysis

### Existing Infrastructure
- **Currency utilities** (`packages/types/src/utils/currency.ts`):
  - `toCents()` - converts dollars to cents (with Math.round())
  - `toDollars()` - converts cents to dollars
  - `formatPrice()` - formats cents as localized currency string
  - `parsePrice()` - parses price string to cents

- **Type definitions** (`packages/types/src/entities/product.ts`):
  - `Product.price` defined as `number` (integer cents)

- **Validation** (`packages/types/src/validation/product.ts`):
  - Zod schemas validate price as integer cents (min: 1, max: 99,999,999)

- **Type guards** (`packages/types/src/guards/product.ts`):
  - `isValidPrice()` - basic integer cents validation

- **UI Components**:
  - Basic price input in `product-form.tsx` (lines 146-193)
  - Simple regex-based validation

### What's Missing
1. **Enhanced price validation** - comprehensive range and format validation
2. **Dedicated price input component** - better UX than current basic input
3. **Extended display formatting utilities** - additional format options
4. **Robust safeguards** - detailed error handling, floating-point prevention

## Implementation Plan

### Phase 1: Enhanced Price Validation Utilities

#### 1.1 Create Price Validation Utilities
**File**: `packages/types/src/utils/price-validation.ts` (new file)

Create comprehensive price validation functions:
- `isValidPriceRange(cents: number, min?: number, max?: number): boolean`
  - Validates if price is within specified range
  - Default min: 1 cent, max: 99,999,999 cents
  - Returns boolean

- `validatePriceRange(cents: number, min?: number, max?: number): ValidationResult`
  - Returns detailed validation result with error messages
  - Type: `{ isValid: boolean; errors: string[] }`

- `isValidPriceFormat(input: string): boolean`
  - Validates if string matches currency format patterns
  - Accepts: `$10.50`, `10.50`, `$1,234.56`, `10`
  - Returns boolean

- `sanitizePriceInput(input: string): string`
  - Removes invalid characters while preserving valid format
  - Handles multiple decimal points, extra symbols
  - Returns sanitized string

- `detectFloatingPointIssues(value: number): FloatingPointIssue | null`
  - Detects potential floating-point precision issues
  - Returns issue type or null if safe

#### 1.2 Create Validation Result Types
**File**: `packages/types/src/utils/price-validation.ts`

```typescript
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PriceValidationResult extends ValidationResult {
  value?: number
  originalInput?: string
}

export type FloatingPointIssue =
  | { type: 'precision_loss'; actual: number; expected: number }
  | { type: 'rounding_needed'; input: string; rounded: number }
  | { type: 'overflow'; value: number }
```

#### 1.3 Update Package Exports
**File**: `packages/types/src/utils/index.ts`

Add exports:
```typescript
export * from './price-validation'
```

---

### Phase 2: Enhanced Display Formatting Utilities

#### 2.1 Extend Currency Utilities
**File**: `packages/types/src/utils/currency.ts` (enhance existing file)

Add new formatting functions:
- `formatPriceCompact(cents: number, locale?: string): string`
  - Compact format without currency symbol
  - Example: `1050` → `'10.50'`

- `formatPriceWithSymbol(cents: number, symbol: string, locale?: string): string`
  - Custom currency symbol
  - Example: `1050, '€'` → `'€10.50'`

- `formatPriceRange(minCents: number, maxCents: number, locale?: string): string`
  - Format price range
  - Example: `1050, 2050` → `'$10.50 - $20.50'`

- `formatPriceIntegerOnly(cents: number, locale?: string): string`
  - Format without decimal places
  - Example: `1050` → `'$10'`

- `parsePriceStrict(input: string): { success: boolean; cents?: number; error?: string }`
  - Strict parsing with detailed error reporting
  - Better error messages than existing `parsePrice()`

#### 2.2 Add Price Range Utilities
**File**: `packages/types/src/utils/price-validation.ts`

```typescript
- `inPriceRange(cents: number, minCents: number, maxCents: number): boolean`
  - Check if price is within range

- `clampPrice(cents: number, minCents: number, maxCents: number): number`
  - Clamp price to range boundaries
  - Returns clamped value

- `getPriceRangePercent(priceCents: number, minCents: number, maxCents: number): number`
  - Get price as percentage of range
  - Returns 0-100

- `interpolatePrice(percent: number, minCents: number, maxCents: number): number`
  - Get price from percentage
  - Reverse of above
```

---

### Phase 3: Dedicated Price Input Component

#### 3.1 Create Price Input Component
**File**: `apps/web/src/components/price-input.tsx` (new file)

Create reusable `PriceInput` component:
- Props interface with TypeScript types
- Handles currency formatting during input
- Real-time validation with error display
- Converts to cents on blur/submit
- Supports custom min/max values
- Accessible (ARIA labels, keyboard navigation)
- Dark mode support

**Key Features:**
1. **Input Formatting**:
   - Auto-add currency symbol on focus
   - Format as user types (e.g., "10" → "$10.00")
   - Handle thousands separators
   - Support multiple input styles (compact, full)

2. **Validation**:
   - Real-time format validation
   - Range checking
   - Detailed error messages
   - Visual feedback (error states, success states)

3. **Output**:
   - Returns integer cents
   - Optional formatted string
   - Change callback with validated value

4. **Accessibility**:
   - Proper ARIA attributes
   - Keyboard support (numbers, decimals, backspace)
   - Screen reader announcements
   - Focus management

**Component Structure:**
```typescript
interface PriceInputProps {
  value?: number // cents
  onChange?: (cents: number) => void
  onValueChange?: (formatted: string) => void
  minCents?: number
  maxCents?: number
  currencySymbol?: string
  locale?: string
  variant?: 'default' | 'compact' | 'inline'
  disabled?: boolean
  error?: string
  placeholder?: string
  id?: string
  className?: string
}
```

#### 3.2 Create Price Input Hook
**File**: `apps/web/src/hooks/use-price-input.ts` (new file)

Custom hook for price input logic:
```typescript
interface UsePriceInputProps {
  initialValue?: number
  minCents?: number
  maxCents?: number
  onChange?: (cents: number) => void
}

interface UsePriceInputReturn {
  value: string // formatted display value
  cents: number // internal cents value
  error: string | null
  isValid: boolean
  handleChange: (input: string) => void
  handleBlur: () => void
  handleFocus: () => void
  reset: () => void
}
```

**Hook Responsibilities:**
- Manage formatted display value vs. internal cents value
- Handle input sanitization and validation
- Provide formatted output for display
- Handle focus/blur events
- Expose validation state

#### 3.3 Integrate Price Input with Product Form
**File**: `apps/web/src/components/product-form.tsx` (update existing file)

Replace current price input with new `PriceInput` component:
- Update price field to use `PriceInput` component
- Remove inline validation logic (now in component)
- Simplify validation code
- Ensure proper data flow to store

**Changes:**
1. Import `PriceInput` component
2. Replace lines 146-193 with `PriceInput` component
3. Update validation to use component's validation
4. Test integration with existing form submission

---

### Phase 4: Robust Safeguards

#### 4.1 Create Price Sanitization Utilities
**File**: `packages/types/src/utils/price-validation.ts`

```typescript
- `sanitizeCents(value: unknown): number | null`
  - Convert any value to safe cents
  - Returns null if cannot be sanitized
  - Handles: numbers, strings, edge cases

- `sanitizePriceInputString(input: string): string`
  - Remove invalid characters
  - Fix multiple decimal points
  - Handle extra spaces

- `guardPriceValue(value: unknown, options: GuardOptions): GuardResult`
  - Runtime type guard with options
  - Detailed result with sanitized value

interface GuardOptions {
  allowNegative?: boolean
  allowZero?: boolean
  minCents?: number
  maxCents?: number
  defaultValue?: number
}

interface GuardResult {
  isValid: boolean
  value: number | null
  error?: string
}
```

#### 4.2 Floating-Point Error Prevention
**File**: `packages/types/src/utils/price-validation.ts`

```typescript
- `safeToCents(dollars: number): number`
  - Convert dollars to cents safely
  - Uses integer arithmetic internally
  - Throws detailed error if unsafe

- `safeMultiply(cents: number, quantity: number): number`
  - Multiply price by quantity safely
  - Uses integer arithmetic
  - Prevents floating-point errors

- `safeAddPrices(prices: number[]): number`
  - Add multiple prices safely
  - Integer arithmetic throughout

- `detectPrecisionError(dollars: number): boolean`
  - Check if dollar value has precision issues
  - Returns true if rounding will occur
```

#### 4.3 Create Price Error Types
**File**: `packages/types/src/utils/price-validation.ts`

```typescript
export class PriceError extends Error {
  constructor(
    message: string,
    public code: PriceErrorCode,
    public originalValue?: unknown
  ) {
    super(message)
    this.name = 'PriceError'
  }
}

export type PriceErrorCode =
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'INVALID_TYPE'
  | 'PRECISION_LOSS'
  | 'NEGATIVE_VALUE'
  | 'ZERO_VALUE'
  | 'PARSE_ERROR'

export function createPriceError(
  code: PriceErrorCode,
  value: unknown,
  context?: string
): PriceError
```

---

### Phase 5: Integration and Testing

#### 5.1 Update Product Validation
**File**: `packages/types/src/validation/product.ts` (enhance existing)

Enhance existing schemas with better price validation:
- Add custom refinements for additional checks
- Integrate with new validation utilities
- Provide better error messages
- Add range validation options

#### 5.2 Update Catalog Store
**File**: `apps/web/src/stores/catalog-store.ts` (review for updates)

Ensure store properly handles:
- Price validation on add/update
- Error messages from new validation
- Safe arithmetic in price calculations
- Proper type guards for price values

**Review:**
- Line 344: `getProductsByPriceRange` - ensure it uses validation
- Check if any other price-related operations need updates

#### 5.3 Type Safety Updates
**File**: `packages/types/src/utils/price-validation.ts`

Ensure all utilities:
- Use proper TypeScript types
- Never use `any`
- Provide type guards where appropriate
- Export types for consumers

---

## File Changes Summary

### New Files
1. `packages/types/src/utils/price-validation.ts` - All validation utilities
2. `apps/web/src/components/price-input.tsx` - Price input component
3. `apps/web/src/hooks/use-price-input.ts` - Price input hook

### Modified Files
1. `packages/types/src/utils/currency.ts` - Add formatting utilities
2. `packages/types/src/utils/index.ts` - Export new utilities
3. `apps/web/src/components/product-form.tsx` - Use PriceInput component
4. `packages/types/src/validation/product.ts` - Enhance validation
5. `apps/web/src/stores/catalog-store.ts` - Review for price handling

---

## Implementation Order

1. **Phase 1**: Create price validation utilities and types
2. **Phase 2**: Extend currency formatting utilities
3. **Phase 3**: Create PriceInput component and hook
4. **Phase 4**: Create safeguard utilities and error handling
5. **Phase 5**: Integrate with existing code and test

---

## Validation Checklist

After implementation, verify:

- [ ] All prices stored as integer cents (no floating-point)
- [ ] Price input accepts user-friendly formats ($10.50, 10.50, etc.)
- [ ] Conversion to/from cents works correctly
- [ ] Validation prevents invalid price data
- [ ] Error messages are clear and actionable
- [ ] Floating-point errors are prevented
- [ ] Component integrates with product form
- [ ] Accessibility features work (keyboard, screen readers)
- [ ] Dark mode styling is correct
- [ ] All TypeScript types are strict (no `any`)
- [ ] Type checking passes (`npm run check-types`)
- [ ] Build succeeds (`npm run build`)

---

## Notes

- Maintain consistency with existing code style (2 space indent, no semicolons)
- Use shadcn/ui components as base where applicable
- Follow existing patterns in the codebase
- Ensure all new utilities are exported from index files
- Test with various price formats and edge cases
- Consider international price formats (decimal separators, etc.)
