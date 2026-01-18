# Task 2.1: Product Data Model and State Management Infrastructure

## Overview

This task focuses on establishing the core data model and state management infrastructure for the catalog management system. Based on the existing codebase from Task 1 completion, most foundational infrastructure is already in place. This plan will verify, enhance, and document the complete data integrity framework for products.

**Note:** Most of the core infrastructure from Task 1.3, 1.4, and 1.5 has already been implemented and should be verified and refined as needed.

## Current State Analysis

### Already Implemented (from Task 1)

#### 1. Product Data Model
**Location:** `packages/types/src/entities/product.ts`

✅ Product interface with:
- UUID identification (`id: string`)
- Integer price storage in cents (`price: number`)
- Base64 image fields (`imageData?: string`)
- Timestamp tracking via `TimestampedEntity`

#### 2. UUID Generation
**Location:** `packages/types/src/utils/uuid.ts`

✅ Implemented:
- `generateUUID()` - Uses `crypto.randomUUID()`
- `isValidUUID()` - Type guard with regex validation

#### 3. Currency Formatting
**Location:** `packages/types/src/utils/currency.ts`

✅ Implemented:
- `toCents(dollars)` - Converts to integer cents
- `toDollars(cents)` - Converts from cents to decimal
- `formatPrice(cents, locale)` - Formats with `Intl.NumberFormat`
- `parsePrice(priceString)` - Parses currency string to cents

#### 4. State Management
**Location:** `apps/web/src/stores/catalog-store.ts`

✅ Implemented:
- Zustand store with full state interface
- Actions: `addProduct`, `updateProduct`, `deleteProduct`, `getProduct`
- Error handling and loading states
- Hydration tracking

#### 5. Persistence Layer
**Location:** `apps/web/src/lib/storage.ts` and `persist-middleware.ts`

✅ Implemented:
- IndexedDB storage using `idb-keyval`
- Safe storage operations with error handling
- Quota monitoring and limit detection
- Zustand persist middleware integration

#### 6. Data Integrity Validation
**Locations:**
- `packages/types/src/validation/product.ts` - Zod schemas
- `packages/types/src/guards/product.ts` - Type guards

✅ Implemented:
- `productSchema` - Full Zod validation
- `productInputSchema` - Input validation
- `isProduct()` - Runtime type guard
- `isValidPrice()`, `isValidProductName()`, `isValidImageData()` - Field validation

## Implementation Plan

### Phase 1: Verification and Enhancement (Priority: HIGH)

#### Step 1.1: Verify Product Interface Completeness
**File:** `packages/types/src/entities/product.ts`

**Actions:**
- [ ] Verify all required fields are present
- [ ] Confirm price type is `number` for cents (integer)
- [ ] Validate `imageData` type supports base64 strings
- [ ] Ensure TypeScript strict mode compliance

**Validation Criteria:**
```typescript
interface Product extends TimestampedEntity {
  id: string           // UUID v4
  name: string         // Product name, max 50 chars
  price: number        // Integer cents
  imageData?: string   // Base64 encoded image or blob URL
}
```

#### Step 1.2: Enhance UUID Generation Documentation
**File:** `packages/types/src/utils/uuid.ts`

**Actions:**
- [ ] Add JSDoc comments explaining UUID v4 format
- [ ] Document when `crypto.randomUUID()` is unavailable
- [ ] Add fallback mechanism comment for older browsers

**Expected Documentation:**
```typescript
/**
 * Generates a UUID v4 using crypto.randomUUID()
 * Falls back to browser crypto API if available
 * @returns UUID v4 string
 */
export function generateUUID(): string
```

#### Step 1.3: Verify Currency Formatting Accuracy
**File:** `packages/types/src/utils/currency.ts`

**Actions:**
- [ ] Test `toCents()` with edge cases (0.99, 10.50, 100.00)
- [ ] Verify `formatPrice()` locale support (en-US, default)
- [ ] Test `parsePrice()` with formats: "$10.50", "10.50", "10"
- [ ] Add error handling for negative values

**Edge Cases to Cover:**
- Rounding: `toCents(0.995)` should round to 100
- Precision: `formatPrice(1050)` → "$10.50"
- Parsing: `parsePrice("$1,234.56")` → 123456

#### Step 1.4: Validate State Management Integration
**File:** `apps/web/src/stores/catalog-store.ts`

**Actions:**
- [ ] Verify Zustand devtools middleware is active in development
- [ ] Confirm persist middleware properly hydrates from IndexedDB
- [ ] Test all CRUD operations maintain data integrity
- [ ] Verify error states are properly set and cleared

**Integration Points:**
- UUID generation in `addProduct`
- Timestamp updates in `updateProduct`
- Persistence to IndexedDB via middleware
- Hydration from storage on app load

### Phase 2: Data Integrity Enhancement (Priority: HIGH)

#### Step 2.1: Strengthen Zod Validation Schemas
**File:** `packages/types/src/validation/product.ts`

**Actions:**
- [ ] Add price range validation (min: 1 cent, max: reasonable limit)
- [ ] Enhance image data validation with size limits
- [ ] Add regex for valid image data URIs
- [ ] Validate timestamp fields are reasonable

**Enhanced Schema Example:**
```typescript
export const productSchema: z.ZodType<Product> = z.object({
  id: z.string().refine(isValidUUID, { message: 'Invalid UUID v4 format' }),
  name: z.string().min(1).max(50),
  price: z.number().int().min(1).max(99999999), // Max $999,999.99
  imageData: z.string().refine(isValidImageData).optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
})
```

#### Step 2.2: Add Runtime Validation Helpers
**File:** `packages/types/src/guards/product.ts` (new or enhance)

**Actions:**
- [ ] Add `isValidProduct()` combining all validation checks
- [ ] Create `validateProduct()` returning errors array
- [ ] Add `sanitizeProductInput()` for data cleaning
- [ ] Implement `isValidTimestamp()` helper

**New Helper Functions:**
```typescript
export function validateProduct(product: unknown): {
  isValid: boolean
  errors: string[]
}
```

#### Step 2.3: Implement Data Consistency Checks
**File:** New: `packages/types/src/validation/consistency.ts`

**Actions:**
- [ ] Add `checkTimestampConsistency()` - updatedAt >= createdAt
- [ ] Add `checkProductIntegrity()` - All fields valid together
- [ ] Create `validateProductList()` - Bulk validation
- [ ] Implement data integrity checksums if needed

### Phase 3: Persistence Layer Verification (Priority: MEDIUM)

#### Step 3.1: Test IndexedDB Storage Operations
**File:** `apps/web/src/lib/storage.ts`

**Actions:**
- [ ] Verify `safeGet()` returns typed values correctly
- [ ] Test `safeSet()` with quota exceeded handling
- [ ] Confirm `safeDelete()` removes products properly
- [ ] Validate storage quota monitoring works

**Test Scenarios:**
- Store product with large base64 image
- Retrieve product list and verify integrity
- Clear storage and verify empty state
- Simulate quota exceeded error

#### Step 3.2: Verify Persist Middleware Configuration
**File:** `apps/web/src/lib/persist-middleware.ts`

**Actions:**
- [ ] Confirm JSON serialization/deserialization preserves types
- [ ] Test `onRehydrateStorage` callback execution
- [ ] Verify `hasHydrated` flag is set correctly
- [ ] Test partial state persistence if needed

**Hydration Flow:**
1. App loads
2. Persist middleware reads from IndexedDB
3. State is deserialized and validated
4. `hasHydrated` set to true
5. Store becomes fully operational

#### Step 3.3: Add Storage Error Recovery
**File:** `apps/web/src/lib/storage.ts`

**Actions:**
- [ ] Implement retry logic for transient failures
- [ ] Add fallback to localStorage if IndexedDB fails
- [ ] Create data migration utilities if schema changes
- [ ] Add storage versioning support

### Phase 4: Integration Testing (Priority: HIGH)

#### Step 4.1: Create Test Suite for Product Model
**File:** New: `packages/types/src/__tests__/product.test.ts`

**Actions:**
- [ ] Write unit tests for all type guards
- [ ] Test Zod schema validation edge cases
- [ ] Verify UUID generation produces valid v4
- [ ] Test currency formatting with various locales

**Test Coverage:**
```typescript
describe('Product Model', () => {
  it('validates correct product structure')
  it('rejects invalid UUID format')
  it('rejects negative price')
  it('accepts valid base64 image')
  it('rejects invalid image data')
})
```

#### Step 4.2: Create Store Integration Tests
**File:** New: `apps/web/src/stores/__tests__/catalog-store.test.ts`

**Actions:**
- [ ] Test `addProduct` generates UUID and timestamps
- [ ] Test `updateProduct` updates updatedAt
- [ ] Test `deleteProduct` removes from store
- [ ] Test persistence survives store recreation
- [ ] Verify error states propagate correctly

#### Step 4.3: Create Storage Layer Tests
**File:** New: `apps/web/src/lib/__tests__/storage.test.ts`

**Actions:**
- [ ] Test `safeGet()` returns undefined for missing keys
- [ ] Test `safeSet()` throws on quota exceeded
- [ ] Test `safeDelete()` handles non-existent keys
- [ ] Verify `getStorageInfo()` returns accurate quota data

### Phase 5: Documentation and Type Safety (Priority: MEDIUM)

#### Step 5.1: Add Comprehensive JSDoc Comments
**Files:** All type definition files

**Actions:**
- [ ] Document all interfaces with examples
- [ ] Add parameter descriptions for all functions
- [ ] Include return type explanations
- [ ] Add usage examples in complex utilities

**Example Documentation:**
```typescript
/**
 * Represents a product in the catalog.
 *
 * @interface Product
 * @extends TimestampedEntity
 *
 * @property {string} id - UUID v4 identifier
 * @property {string} name - Product display name (1-50 chars)
 * @property {number} price - Price in integer cents (e.g., 1050 = $10.50)
 * @property {string} [imageData] - Base64 encoded image or blob URL
 * @property {number} createdAt - Unix timestamp in milliseconds
 * @property {number} updatedAt - Unix timestamp in milliseconds
 *
 * @example
 * const product: Product = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Coffee',
 *   price: 450, // $4.50
 *   imageData: 'data:image/jpeg;base64,...',
 *   createdAt: 1640995200000,
 *   updatedAt: 1640995200000
 * }
 */
export interface Product extends TimestampedEntity {
  id: string
  name: string
  price: number
  imageData?: string
}
```

#### Step 5.2: Verify TypeScript Strict Mode Compliance
**All TypeScript Files**

**Actions:**
- [ ] Run `npm run check-types` and fix all errors
- [ ] Ensure no `any` types are used
- [ ] Verify all return types are explicit
- [ ] Check for unused variables and parameters

**Strict Mode Flags to Verify:**
- `strict: true` enabled in tsconfig
- `noUncheckedIndexedAccess` used
- `noUnusedLocals` enforced
- `noUnusedParameters` enforced

#### Step 5.3: Create Type Usage Examples
**File:** New: `packages/types/USAGE.md`

**Actions:**
- [ ] Document common usage patterns
- [ ] Provide examples for all utilities
- [ ] Show validation workflow
- [ ] Include persistence integration examples

## File Changes Summary

### Files to Verify and Potentially Modify

1. **`packages/types/src/entities/product.ts`**
   - Verify interface completeness
   - Add JSDoc comments

2. **`packages/types/src/utils/uuid.ts`**
   - Add documentation
   - Document fallback behavior

3. **`packages/types/src/utils/currency.ts`**
   - Test edge cases
   - Add documentation

4. **`apps/web/src/stores/catalog-store.ts`**
   - Verify integration
   - Test error handling

5. **`packages/types/src/validation/product.ts`**
   - Enhance validation rules
   - Add range constraints

6. **`packages/types/src/guards/product.ts`**
   - Add validation helpers
   - Enhance error messages

### Files to Create

1. **`packages/types/src/validation/consistency.ts`** (NEW)
   - Data consistency validators

2. **`packages/types/src/__tests__/product.test.ts`** (NEW)
   - Product model unit tests

3. **`apps/web/src/stores/__tests__/catalog-store.test.ts`** (NEW)
   - Store integration tests

4. **`apps/web/src/lib/__tests__/storage.test.ts`** (NEW)
   - Storage layer tests

5. **`packages/types/USAGE.md`** (NEW)
   - Usage documentation

## Validation and Acceptance Criteria

### Must-Have Criteria (Task Completion)

- [ ] Product interface properly defined with UUID, price (cents), base64 image
- [ ] State management using Zustand (TanStack Store) with full CRUD
- [ ] Persistence layer working with IndexedDB
- [ ] UUID generation using `crypto.randomUUID()`
- [ ] Currency formatting utilities: `toCents`, `toDollars`, `formatPrice`, `parsePrice`
- [ ] Data integrity validation via Zod schemas and type guards
- [ ] All TypeScript type checks pass (`npm run check-types`)
- [ ] Build succeeds without errors (`npm run build`)

### Quality Criteria

- [ ] All validation functions properly reject invalid data
- [ ] Storage operations handle quota exceeded errors gracefully
- [ ] UUIDs are valid v4 format
- [ ] Currency conversions are mathematically accurate
- [ ] Timestamps are properly maintained (updatedAt >= createdAt)
- [ ] State hydration from IndexedDB works correctly
- [ ] Error states are properly propagated and cleared
- [ ] No TypeScript `any` types used
- [ ] Comprehensive test coverage for critical paths

## Success Metrics

1. **Type Safety:** 100% strict mode compliance, no `any` types
2. **Validation:** All invalid inputs properly rejected with clear errors
3. **Persistence:** Data survives page reloads and browser restarts
4. **Accuracy:** Currency calculations accurate to 1 cent
5. **Reliability:** Storage operations handle quota errors gracefully
6. **Testing:** Unit tests cover all validation and utility functions

## Dependencies and Prerequisites

### Required Packages (Already Installed)
- `zustand` - State management
- `zod` - Schema validation
- `idb-keyval` - IndexedDB wrapper

### No Additional Dependencies Required

All required infrastructure is already in place from Task 1.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser lacks `crypto.randomUUID()` | High | Already handled by modern browser requirement |
| IndexedDB quota exceeded | Medium | Already has quota monitoring and error handling |
| Floating-point precision errors | Low | Using integer cents avoids this issue |
| Type guard false positives | Medium | Comprehensive test coverage |
| Storage version conflicts | Low | Schema versioning if needed |

## Next Steps After Task 2.1

Upon completion of Task 2.1, the foundation will be ready for:
- Task 2.2: Core CRUD Operations and API Integration
- Task 2.3: Product List UI with Inline CRUD Interface
- Task 2.4: Image Upload System with Client-Side Validation
- Task 2.5: Price Management and Validation System

All subsequent tasks will build upon this data model and state management infrastructure.

## Notes

1. **Most infrastructure exists** from Task 1.3, 1.4, and 1.5
2. **Focus on verification and enhancement** rather than new implementation
3. **Type safety is critical** - no shortcuts with `any` types
4. **Test thoroughly** - data integrity is foundational
5. **Document clearly** - future tasks depend on this foundation
