# Task 2.6: Comprehensive Validation Framework and Error Handling - Implementation Plan

## Task Overview

Build unified validation framework covering field-level, image, price, and business logic validation. Implement centralized error state management with user-friendly messaging. Add toast notifications for operation feedback. Create validation helpers for all CRUD operations. Ensure data integrity checks throughout the application with detailed error recovery flows.

## Current State Analysis

### Existing Validation Infrastructure
- **Zod schemas** in `packages/types/src/validation/`:
  - `product.ts`: Basic product validation (name, price, image data)
  - `consistency.ts`: Integrity checks, timestamp validation, anomaly detection
  - `tally.ts` & `settings.ts`: Schema files exist but need verification
- **Toast notifications**: Sonner is already integrated via `@/components/ui/sonner.tsx`
- **Catalog store**: Has basic validation and toast integration
- **Product form**: Uses TanStack Form with field-level validators

### Gaps to Address
1. No centralized error state management across all stores
2. Validation helpers are scattered and not reusable
3. Tally store lacks comprehensive validation
4. Settings store needs validation enhancement
5. No unified error recovery flow system
6. Field-level validation logic is duplicated
7. Limited toast notification utilities for different operation types
8. Missing error boundary for React tree errors

## Implementation Plan

### Phase 1: Centralized Error State Management

#### Step 1.1: Create Error Store
**File**: `apps/web/src/stores/error-store.ts`

**Purpose**: Global error state management for application-wide error tracking

**State Interface**:
```typescript
interface ErrorState {
  errors: Map<string, ErrorEntry>
  lastError: ErrorEntry | null
  hasUnacknowledgedErrors: boolean
}

interface ErrorEntry {
  id: string
  type: 'validation' | 'storage' | 'network' | 'business' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: Record<string, unknown>
  timestamp: number
  acknowledged: boolean
  recoverable: boolean
  recoveryActions?: RecoveryAction[]
}
```

**Actions**:
- `addError(error: ErrorInput): void` - Add error to store
- `acknowledgeError(id: string): void` - Mark error as acknowledged
- `clearError(id: string): void` - Remove error from store
- `clearAllErrors(): void` - Clear all errors
- `getErrorsByType(type: ErrorType): ErrorEntry[]` - Filter errors
- `getErrorsBySeverity(severity: Severity): ErrorEntry[]` - Filter by severity
- `executeRecovery(errorId: string, actionId: string): Promise<void>` - Execute recovery action

**Persistence**: In-memory only (no persistence needed for errors)

---

### Phase 2: Enhanced Validation Schemas

#### Step 2.1: Enhance Product Validation
**File**: `packages/types/src/validation/product.ts` (modify)

**Additions**:
- Business logic validators (e.g., price合理性, name uniqueness)
- Image dimension and aspect ratio validation
- Cross-field validation (e.g., price cannot be zero for premium products)

**New schemas**:
```typescript
export const productBusinessLogicSchema = z.object({
  // Business rules specific to product domain
})

export const imageValidationSchema = z.object({
  // Detailed image validation (dimensions, format, aspect ratio)
})

export const priceValidationSchema = z.object({
  // Price-specific business rules
})
```

#### Step 2.2: Enhance Tally Validation
**File**: `packages/types/src/validation/tally.ts` (verify and enhance)

**Additions**:
- Quantity validation (positive integers, max limits)
- Tally total validation (prevent overflow)
- Item consistency validation (referenced products must exist)

**New schemas**:
```typescript
export const tallyItemSchema: z.ZodType<TallyItem>
export const tallyStateSchema: z.ZodType<Map<string, TallyItem>>
export const tallySummarySchema: z.ZodType<TallySummary>
```

#### Step 2.3: Enhance Settings Validation
**File**: `packages/types/src/validation/settings.ts` (verify and enhance)

**Additions**:
- Theme validation (must be one of allowed values)
- Grid density validation
- Column count override validation (reasonable bounds)
- Cross-setting validation (e.g., column count must be positive)

---

### Phase 3: Validation Helpers and Hooks

#### Step 3.1: Create Field-Level Validation Utilities
**File**: `apps/web/src/lib/validators.ts` (new)

**Functions**:
```typescript
// Field validators
export function validateProductName(value: string): ValidationResult
export function validatePrice(value: string | number): ValidationResult
export function validateQuantity(value: number): ValidationResult
export function validateImageFile(file: File): Promise<ValidationResult>
export function validateImageDataURL(dataUrl: string): ValidationResult
export function validateUUID(uuid: string): ValidationResult
export function validateTimestamp(ts: number): ValidationResult
```

**Result Type**:
```typescript
interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}
```

#### Step 3.2: Create CRUD Validation Helpers
**File**: `apps/web/src/lib/validation-helpers.ts` (new)

**Functions**:
```typescript
// Catalog validation helpers
export async function validateProductAdd(input: ProductInput): Promise<ValidationResult>
export async function validateProductUpdate(id: string, updates: ProductUpdate): Promise<ValidationResult>
export async function validateProductDelete(id: string): Promise<ValidationResult>

// Tally validation helpers
export async function validateTallyAddItem(productId: string, price: number, qty: number): Promise<ValidationResult>
export async function validateTallyUpdateQuantity(productId: string, qty: number): Promise<ValidationResult>
export async function validateTallyRemoveItem(productId: string): Promise<ValidationResult>
export async function validateTallyClear(): Promise<ValidationResult>

// Settings validation helpers
export async function validateSettingsUpdate(updates: Partial<AppSettings>): Promise<ValidationResult>
export async function validateThemeChange(theme: Theme): Promise<ValidationResult>
export async function validateGridDensityChange(density: GridDensity): Promise<ValidationResult>
```

#### Step 3.3: Create React Validation Hooks
**File**: `apps/web/src/hooks/use-validation.ts` (new)

**Hooks**:
```typescript
export function useFieldValidator<T>(validator: (value: T) => ValidationResult)
export function useProductValidation()
export function useTallyValidation()
export function useSettingsValidation()
export function useFormValidation<T>(schema: z.ZodSchema<T>)
```

---

### Phase 4: Toast Notification System

#### Step 4.1: Create Toast Helpers
**File**: `apps/web/src/lib/toast-helpers.ts` (new)

**Functions**:
```typescript
// Success notifications
export function showSuccessToast(message: string, description?: string): void
export function showOperationSuccess(operation: string, count?: number): void

// Error notifications
export function showErrorToast(message: string, description?: string): void
export function showValidationError(errors: string[]): void
export function showStorageError(action: string, error: Error): void
export function showBusinessError(message: string): void

// Warning notifications
export function showWarningToast(message: string, description?: string): void
export function showDataIntegrityWarning(count: number): void
export function showQuotaWarning(percentage: number): void

// Info notifications
export function showInfoToast(message: string, description?: string): void

// Loading states
export function showLoadingToast(message: string, promise: Promise<unknown>): Promise<void>
```

#### Step 4.2: Update Store Actions with Toast Integration
**Files**: `apps/web/src/stores/*.ts`

**Changes**:
- Replace direct `toast` calls with `toast-helpers` functions
- Add consistent error messaging patterns
- Include operation context in toast messages
- Use toast for loading states on async operations

---

### Phase 5: Error Recovery Flows

#### Step 5.1: Create Error Recovery Manager
**File**: `apps/web/src/lib/error-recovery.ts` (new)

**Functions**:
```typescript
export async function recoverFromStorageError(error: Error): Promise<boolean>
export async function recoverFromValidationError(error: ZodError): Promise<boolean>
export async function recoverFromBusinessError(error: Error): Promise<boolean>
export async function suggestRecoveryAction(error: ErrorEntry): RecoveryAction | null
export async function attemptDataRepair(corruptedData: unknown): Promise<boolean>
```

**Recovery Actions**:
```typescript
interface RecoveryAction {
  id: string
  label: string
  description: string
  severity: 'suggested' | 'required'
  execute: () => Promise<boolean>
}
```

#### Step 5.2: Create Error Recovery UI Component
**File**: `apps/web/src/components/error-recovery-dialog.tsx` (new)

**Features**:
- Display error details to user
- Show available recovery actions
- Execute recovery with confirmation
- Show recovery progress
- Handle recovery success/failure

---

### Phase 6: Data Integrity Checks

#### Step 6.1: Create Data Integrity Manager
**File**: `apps/web/src/lib/data-integrity.ts` (new)

**Functions**:
```typescript
export async function checkCatalogIntegrity(): Promise<IntegrityReport>
export async function checkTallyIntegrity(): Promise<IntegrityReport>
export async function checkSettingsIntegrity(): Promise<IntegrityReport>
export async function checkAllDataIntegrity(): Promise<IntegrityReport[]>
export async function repairDataIntegrity(issues: IntegrityIssue[]): Promise<RepairResult>

interface IntegrityReport {
  store: string
  isValid: boolean
  issues: IntegrityIssue[]
  warnings: string[]
}

interface IntegrityIssue {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  entityId?: string
  repairable: boolean
  repairAction?: () => Promise<void>
}
```

#### Step 6.2: Add Integrity Checks to Store Hydration
**Files**: `apps/web/src/stores/catalog-store.ts`, `tally-store.ts`, `settings-store.ts`

**Changes**:
- Run integrity checks after hydration
- Log warnings to console
- Show toast notification for integrity issues
- Provide repair option if available

---

### Phase 7: Enhanced Error Boundaries

#### Step 7.1: Create Error Boundary Components
**File**: `apps/web/src/components/error-boundary.tsx` (new)

**Components**:
```typescript
export function ErrorBoundary({ children }: ErrorBoundaryProps)
export function StorageErrorBoundary({ children }: StorageErrorBoundaryProps)
export function ValidationErrorBoundary({ children }: ValidationErrorBoundaryProps)
```

**Features**:
- Catch React tree errors
- Display user-friendly error message
- Log error to error store
- Provide recovery options (retry, report, reset)
- Differentiate between error types

#### Step 7.2: Wrap Application Routes
**File**: `apps/web/src/routes/__root.tsx` (modify)

**Changes**:
- Wrap routes in error boundaries
- Handle route-specific errors appropriately
- Provide fallback UI for error states

---

### Phase 8: Validation Integration

#### Step 8.1: Update Catalog Store
**File**: `apps/web/src/stores/catalog-store.ts` (modify)

**Enhancements**:
- Use validation helpers before CRUD operations
- Add comprehensive error handling
- Integrate with error store
- Use toast helpers for notifications
- Add recovery actions for common failures

#### Step 8.2: Update Tally Store
**File**: `apps/web/src/stores/tally-store.ts` (modify)

**Enhancements**:
- Add validation to all actions (addItem, updateQuantity, etc.)
- Validate product references exist in catalog
- Add overflow protection for totals
- Integrate with error store and toast helpers
- Add recovery for corrupted tally state

#### Step 8.3: Update Settings Store
**File**: `apps/web/src/stores/settings-store.ts` (modify)

**Enhancements**:
- Validate all settings updates
- Check for conflicts between settings
- Add migration support for settings format changes
- Integrate with error store and toast helpers

---

### Phase 9: Documentation and Testing

#### Step 9.1: Create Validation Documentation
**File**: `packages/types/src/validation/README.md` (new)

**Contents**:
- Overview of validation architecture
- Available validation schemas
- Custom validation rules
- Error message patterns
- Usage examples

#### Step 9.2: Create Error Handling Documentation
**File**: `apps/web/src/lib/error-handling.md` (new)

**Contents**:
- Error state management
- Error recovery flows
- Toast notification patterns
- Best practices for error handling
- Integration guide for new features

#### Step 9.3: Manual Testing Procedures
**File**: `VALIDATION_TESTING.md` (new at project root)

**Test Scenarios**:
- Field-level validation (name, price, quantity)
- Image upload validation
- CRUD operation validation
- Error recovery flows
- Toast notifications
- Data integrity checks
- Error boundary handling

---

## File Changes Summary

### New Files to Create
1. `apps/web/src/stores/error-store.ts` - Centralized error management
2. `apps/web/src/lib/validators.ts` - Field-level validation utilities
3. `apps/web/src/lib/validation-helpers.ts` - CRUD validation helpers
4. `apps/web/src/hooks/use-validation.ts` - React validation hooks
5. `apps/web/src/lib/toast-helpers.ts` - Toast notification helpers
6. `apps/web/src/lib/error-recovery.ts` - Error recovery manager
7. `apps/web/src/components/error-recovery-dialog.tsx` - Recovery UI
8. `apps/web/src/lib/data-integrity.ts` - Data integrity manager
9. `apps/web/src/components/error-boundary.tsx` - Error boundary components
10. `packages/types/src/validation/README.md` - Validation documentation
11. `apps/web/src/lib/error-handling.md` - Error handling documentation
12. `VALIDATION_TESTING.md` - Testing procedures

### Files to Modify
1. `packages/types/src/validation/product.ts` - Add business logic validators
2. `packages/types/src/validation/tally.ts` - Enhance tally validation
3. `packages/types/src/validation/settings.ts` - Enhance settings validation
4. `apps/web/src/stores/catalog-store.ts` - Integrate validation helpers
5. `apps/web/src/stores/tally-store.ts` - Add validation and error handling
6. `apps/web/src/stores/settings-store.ts` - Add validation
7. `apps/web/src/routes/__root.tsx` - Add error boundaries
8. `apps/web/src/components/product-form.tsx` - Use validation hooks

### Files to Verify
1. `apps/web/src/components/ui/sonner.tsx` - Ensure toast configuration is adequate
2. `apps/web/src/lib/storage.ts` - Verify error handling is sufficient
3. `packages/types/src/validation/consistency.ts` - Check for integration points

---

## Implementation Order

### High Priority (Core Infrastructure)
1. Phase 1: Error Store - Foundation for all error handling
2. Phase 4.1: Toast Helpers - Standardize error/success messaging
3. Phase 3.1: Field Validators - Reusable validation logic

### Medium Priority (Validation Framework)
4. Phase 2: Enhanced Schemas - Comprehensive validation rules
5. Phase 3.2: CRUD Validation Helpers - Operation-level validation
6. Phase 3.3: Validation Hooks - React integration

### Medium Priority (Error Recovery)
7. Phase 5: Error Recovery Flows - Handle and recover from errors
8. Phase 6: Data Integrity Checks - Detect and repair data issues
9. Phase 7: Error Boundaries - React tree error handling

### Low Priority (Integration & Polish)
10. Phase 8: Store Integration - Apply validation to all stores
11. Phase 9: Documentation - Documentation and testing guides

---

## Success Criteria

### Functional Requirements
- ✅ All CRUD operations use validation before execution
- ✅ Error state is centrally managed and accessible
- ✅ Toast notifications provide clear, user-friendly feedback
- ✅ Error recovery flows handle common error scenarios
- ✅ Data integrity checks run on app load and detect issues
- ✅ Field-level validation provides immediate feedback
- ✅ Error boundaries catch and handle React errors gracefully

### Technical Requirements
- ✅ Type-safe throughout (no `any` types)
- ✅ Follows project code style guidelines
- ✅ Integrates with existing stores without breaking changes
- ✅ Uses existing Zod schemas where possible
- ✅ Compatible with TanStack Form for form validation
- ✅ Works with Sonner for toast notifications

### Code Quality Requirements
- ✅ TypeScript compiles without errors (`npm run check-types`)
- ✅ Production builds successfully (`npm run build`)
- ✅ All new code follows project conventions
- ✅ Error messages are clear and actionable
- ✅ Recovery actions are tested and reliable
- ✅ Documentation is comprehensive and accurate

---

## Risk Mitigation

### Potential Issues
1. **Breaking existing store functionality** - Mitigation: Add validation as wrappers, preserve existing behavior
2. **Performance impact from validation** - Mitigation: Use efficient validation, debounce where appropriate
3. **Complex error state management** - Mitigation: Keep error store simple, use clear error categorization
4. **Inconsistent error messaging** - Mitigation: Centralize message templates in toast helpers
5. **Over-engineering** - Mitigation: Focus on actual use cases, avoid generic solutions

### Rollback Plan
- Each phase can be implemented independently
- Store changes are additive (validation as pre-checks)
- Error store is optional (stores can work without it)
- Toast helpers replace direct calls, not break them

---

## Next Steps After This Task

This task provides the foundation for:
- Task 2.7: Analytics and Reporting (data integrity checks will support analytics)
- Task 3.x: Advanced features (validation framework will support complex operations)
- Task 4.x: Export/Import (validation will ensure data quality during transfer)
- Task 6.x: Multi-language support (error messages can be localized)

---

## Notes for Implementation

- **Don't over-validate**: Keep validation focused on business rules and data integrity
- **User experience matters**: Provide clear, actionable error messages
- **Performance**: Validation should be fast, especially for UI interactions
- **Test edge cases**: Invalid inputs, boundary conditions, corrupted data
- **Keep it simple**: Start with essential validations, add complexity as needed
- **Log everything**: Store all errors with context for debugging
- **Recovery first**: Always consider how users can recover from errors
- **Toast wisely**: Don't spam users with notifications, group related errors
