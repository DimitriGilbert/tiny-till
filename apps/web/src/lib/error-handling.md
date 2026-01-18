# Error Handling Documentation

## Overview

Tiny-Till implements a comprehensive error handling system with centralized error state management, recovery flows, and user-friendly notifications.

## Error State Management

### Error Store

**File:** `apps/web/src/stores/error-store.ts`

The error store provides application-wide error tracking and management.

#### State Interface

```typescript
interface ErrorState {
  errors: Map<string, ErrorEntry>
  lastError: ErrorEntry | null
  hasUnacknowledgedErrors: boolean
}

interface ErrorEntry {
  id: string                    // Unique error identifier
  type: ErrorType              // Error category
  severity: Severity             // Error impact level
  message: string               // User-facing message
  details?: Record<string, unknown>  // Additional error context
  timestamp: number             // When error occurred
  acknowledged: boolean          // Whether user has seen error
  recoverable: boolean          // Whether error can be recovered from
  recoveryActions?: RecoveryAction[]  // Available recovery actions
}
```

#### Error Types

- **`validation`**: Input or data validation failures
- **`storage`**: IndexedDB or localStorage errors
- **`network`**: (Future) Network request failures
- **`business`**: Domain-specific logic errors
- **`unknown`**: Uncategorized errors

#### Severity Levels

- **`low`**: Minor issues, user experience not affected
- **`medium`**: Non-critical issues, partial functionality affected
- **`high`**: Significant issues, major functionality affected
- **`critical`**: App-breaking issues requiring immediate attention

#### Actions

```typescript
// Add new error
addError(error: ErrorInput): void

// Mark error as seen
acknowledgeError(id: string): void

// Remove error from store
clearError(id: string): void

// Clear all errors
clearAllErrors(): void

// Filter errors by type
getErrorsByType(type: ErrorType): ErrorEntry[]

// Filter errors by severity
getErrorsBySeverity(severity: Severity): ErrorEntry[]

// Execute a recovery action
executeRecovery(errorId: string, actionId: string): Promise<boolean>
```

## Toast Notifications

### Toast Helpers

**File:** `apps/web/src/lib/toast-helpers.ts`

Centralized toast notification utilities for consistent user feedback.

#### Success Notifications

```typescript
// Simple success message
showSuccessToast(message: string, description?: string): void

// Operation success with count
showOperationSuccess(operation: string, count?: number): void

// Examples
showSuccessToast('Product added successfully')
showOperationSuccess('Deleted', 5)  // "Deleted 5 items"
```

#### Error Notifications

```typescript
// General error
showErrorToast(message: string, description?: string): void

// Validation errors (array)
showValidationError(errors: string[]): void

// Storage errors with action context
showStorageError(action: string, error: Error): void

// Business logic errors
showBusinessError(message: string): void

// Examples
showErrorToast('Operation failed', 'Please try again later')
showValidationError(['name: Required', 'price: Must be positive'])
showStorageError('save catalog', quotaError)
```

#### Warning Notifications

```typescript
// General warning
showWarningToast(message: string, description?: string): void

// Data integrity warnings
showDataIntegrityWarning(count: number): void

// Storage quota warnings
showQuotaWarning(percentage: number): void

// Examples
showWarningToast('Action not saved', 'Please try again')
showDataIntegrityWarning(3)
showQuotaWarning(85)
```

#### Info and Loading

```typescript
// Informational messages
showInfoToast(message: string, description?: string): void

// Async operation with loading state
showLoadingToast(message: string, promise: Promise<unknown>): void

// Examples
showInfoToast('Welcome to Tiny-Till!')
await showLoadingToast('Importing catalog...', importPromise)
```

## Validation Helpers

### Field Validators

**File:** `apps/web/src/lib/validators.ts`

Reusable validation functions for individual fields.

#### Available Validators

```typescript
validateProductName(value: string): ValidationResult
validatePrice(value: string | number): ValidationResult
validateQuantity(value: number): ValidationResult
validateImageFile(file: File): ValidationResult
validateImageDataURL(dataUrl: string): Promise<ValidationResult>
validateUUID(uuid: string): ValidationResult
validateTimestamp(ts: number): ValidationResult

interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}
```

#### Usage Examples

```typescript
import { validatePrice, validateQuantity } from '@/lib/validators'

// Validate price
const priceResult = validatePrice(250)
if (!priceResult.isValid) {
  console.error(priceResult.error)
}

// Validate quantity
const qtyResult = validateQuantity(5)
if (qtyResult.warning) {
  console.warn(qtyResult.warning)
}
```

### CRUD Validation Helpers

**File:** `apps/web/src/lib/validation-helpers.ts`

Operation-level validation for CRUD operations.

#### Product Validation

```typescript
validateProductAdd(input: ProductInput): Promise<ValidationResult>
validateProductUpdate(id: string, updates: ProductUpdate): Promise<ValidationResult>
validateProductDelete(id: string): ValidationResult

// Example
const result = await validateProductAdd({ name: 'Bread', price: 250 })
if (!result.isValid) {
  showValidationError([result.error || 'Validation failed'])
}
```

#### Tally Validation

```typescript
validateTallyAddItem(productId: string, price: number, qty: number): Promise<ValidationResult>
validateTallyUpdateQuantity(productId: string, qty: number): Promise<ValidationResult>
validateTallyRemoveItem(productId: string): ValidationResult
validateTallyClear(): ValidationResult

// Example
const result = await validateTallyAddItem('product-id', 250, 3)
if (!result.isValid) {
  showToast(result.error || 'Validation failed')
}
```

#### Settings Validation

```typescript
validateSettingsUpdate(updates: Partial<Settings>): Promise<ValidationResult>
validateThemeChange(theme: Theme): Promise<ValidationResult>
validateGridDensityChange(density: GridDensity): Promise<ValidationResult>
validateColumnCountChange(count: number | undefined): Promise<ValidationResult>

// Example
const result = await validateThemeChange('dark')
if (!result.isValid) {
  showToast(result.error || 'Invalid theme')
}
```

## Error Recovery

### Recovery Manager

**File:** `apps/web/src/lib/error-recovery.ts`

Provides recovery strategies for different error types.

#### Recovery Functions

```typescript
// Storage error recovery
recoverFromStorageError(error: Error): Promise<boolean>
  - Detects quota exceeded errors
  - Offers storage clearing action
  - Suggests page reload for other storage errors

// Validation error recovery
recoverFromValidationError(error: ZodError): Promise<boolean>
  - Extracts validation issues
  - Provides review and fix action

// Business error recovery
recoverFromBusinessError(error: Error): Promise<boolean>
  - Provides retry action
  - Logs to error store

// Suggest recovery action
suggestRecoveryAction(error: ErrorEntry): RecoveryAction | null

// Attempt data repair
attemptDataRepair(corruptedData: unknown): Promise<boolean>
  - Filters null/undefined values
  - Repairs arrays and objects
```

#### Recovery Actions

```typescript
interface RecoveryAction {
  id: string                   // Unique action identifier
  label: string                 // User-facing button text
  description: string           // Action explanation
  severity: 'suggested' | 'required'  // Urgency level
  execute: () => Promise<boolean>  // Recovery function
}
```

### Recovery Dialog UI

**File:** `apps/web/src/components/error-recovery-dialog.tsx`

Component for displaying errors and executing recovery actions.

#### Props

```typescript
interface ErrorRecoveryDialogProps {
  isOpen: boolean              // Dialog visibility
  onClose: () => void         // Close handler
  errorId: string             // Error to display
}
```

#### Features

- Severity badge (low/medium/high/critical)
- Error details display (JSON formatted)
- Recovery action buttons with execute confirmation
- Acknowledge button to dismiss non-critical errors

## Data Integrity

### Integrity Manager

**File:** `apps/web/src/lib/data-integrity.ts`

Manages data integrity checks across all stores.

#### Integrity Reports

```typescript
interface IntegrityReport {
  store: string                  // 'catalog', 'tally', 'settings'
  isValid: boolean               // No critical/high issues
  issues: IntegrityIssue[]        // Found issues
  warnings: string[]             // Non-critical problems
}

interface IntegrityIssue {
  id: string                    // Issue identifier
  severity: Severity             // Impact level
  type: string                  // Issue category
  message: string               // Description
  entityId?: string             // Related entity ID
  repairable: boolean           // Can be auto-repaired
  repairAction?: () => Promise<void>  // Repair function
}
```

#### Integrity Checks

```typescript
checkCatalogIntegrity(): Promise<IntegrityReport>
  - Product validation
  - Duplicate name detection
  - Price anomaly detection

checkTallyIntegrity(): Promise<IntegrityReport>
  - Orphaned item detection (tally items without products)
  - Negative price detection
  - Total and count limit warnings

checkSettingsIntegrity(): Promise<IntegrityReport>
  - Column count/density conflicts
  - Backup reminder validation

checkAllDataIntegrity(): Promise<IntegrityReport[]>
  - Runs all integrity checks
  - Shows toast for total issues
  - Logs critical errors to error store
```

#### Data Repair

```typescript
repairDataIntegrity(issues: IntegrityIssue[]): Promise<RepairResult>

interface RepairResult {
  success: boolean              // All repairs succeeded
  repairedCount: number        // Number of items repaired
  failedCount: number          // Number of repairs that failed
  messages: string[]          // Repair status messages
}
```

## Error Boundaries

### Error Boundary Components

**Files:**
- `apps/web/src/components/error-boundary.tsx` - General React errors
- `apps/web/src/components/storage-error-boundary.tsx` - Storage errors
- `apps/web/src/components/validation-error-boundary.tsx` - Validation errors

#### General Error Boundary

Catches React rendering errors and component crashes.

**Features:**
- Captures component stack traces
- Logs to error store
- Provides reload and home navigation options
- Displays error details to user

#### Storage Error Boundary

Catches storage operation errors.

**Features:**
- Detects quota exceeded errors
- Detects blocked access errors
- Offers storage clearing action
- Suggests page reload for transient errors

#### Validation Error Boundary

Catches validation component errors.

**Features:**
- Displays user-friendly validation error messages
- Provides recovery suggestion
- Logs to error store with recovery actions

## Best Practices

### Error Logging

1. **Always log errors to console** with context
2. **Use consistent log prefixes** for easy filtering
   ```typescript
   console.log('[ComponentName] Action', data)
   console.error('[ComponentName] Error:', error)
   ```
3. **Include error details** in error store for debugging
4. **Preserve stack traces** when available

### User Feedback

1. **Use toast helpers** for consistent messaging
2. **Provide actionable error messages** (what went wrong, what to do)
3. **Group related errors** to avoid notification spam
4. **Use appropriate severity** (warning vs error)

### Error Recovery

1. **Always provide recovery options** when possible
2. **Prioritize required actions** over suggested ones
3. **Make recovery actions reversible** when possible
4. **Confirm destructive operations** (like clearing storage)
5. **Provide clear descriptions** for recovery actions

### Data Integrity

1. **Run integrity checks** on app initialization
2. **Repair recoverable issues** automatically
3. **Alert users** to unrecoverable issues
4. **Log warnings** for data quality issues
5. **Check for anomalies** regularly

### Store Integration

1. **Validate inputs** before state updates
2. **Handle errors gracefully** with fallbacks
3. **Persist error state** for later review
4. **Use optimistic updates** with rollback capability
5. **Clear errors** on successful operations

## Integration Guide

### Adding Error Handling to New Features

#### 1. Use Validation Helpers

```typescript
import { validateProductName, validatePrice } from '@/lib/validators'

const nameResult = validateProductName(input.name)
const priceResult = validatePrice(input.price)

if (!nameResult.isValid || !priceResult.isValid) {
  showValidationError([nameResult.error, priceResult.error].filter(Boolean))
  return
}
```

#### 2. Add to Error Store

```typescript
import { useErrorStore } from '@/stores/error-store'

const { addError } = useErrorStore()

try {
  // operation
} catch (error) {
  addError({
    type: 'storage',
    severity: 'high',
    message: 'Operation failed',
    details: { error: error.message },
    recoverable: true,
    recoveryActions: [
      {
        id: 'retry',
        label: 'Retry',
        description: 'Try operation again',
        severity: 'suggested',
        execute: async () => {
          // retry logic
          return true
        },
      },
    ],
  })
}
```

#### 3. Use Toast Helpers

```typescript
import {
  showSuccessToast,
  showErrorToast,
  showOperationSuccess,
} from '@/lib/toast-helpers'

// Success
showSuccessToast('Operation completed')
showOperationSuccess('Deleted', 5)

// Error
showErrorToast('Operation failed', 'Please try again')
```

#### 4. Run Integrity Checks

```typescript
import { checkCatalogIntegrity } from '@/lib/data-integrity'

const report = await checkCatalogIntegrity()

if (!report.isValid) {
  // Handle issues
  for (const issue of report.issues) {
    if (issue.repairable && issue.repairAction) {
      await issue.repairAction()
    }
  }
}
```

## Testing Error Handling

### Unit Tests

Test validation functions with edge cases:

```typescript
describe('validatePrice', () => {
  it('accepts valid prices', () => {
    expect(validatePrice(250).isValid).toBe(true)
  })

  it('rejects negative prices', () => {
    expect(validatePrice(-100).isValid).toBe(false)
    expect(validatePrice(-100).error).toBe('Price must be greater than 0')
  })

  it('rejects non-numeric', () => {
    expect(validatePrice('abc').isValid).toBe(false)
  })
})
```

### Integration Tests

Test error flows end-to-end:

1. Trigger error in component
2. Verify error store updated
3. Verify toast notification shown
4. Verify error boundary fallback displays
5. Verify recovery actions execute
6. Verify errors clear on recovery

### Manual Testing

Common error scenarios to test:

1. **Network disconnection** during storage operations
2. **Storage quota exceeded** (simulate with large data)
3. **Invalid inputs** in all forms
4. **Corrupted data** (manually modify IndexedDB)
5. **Concurrent writes** to same data
6. **Browser incompatibility** (different browsers)
7. **Private browsing mode** restrictions

## Monitoring and Debugging

### Error Store Inspection

Use React DevTools to inspect error store state:

```typescript
// In browser console
useErrorStore.getState()

// View all errors
Array.from(useErrorStore.getState().errors.values())

// View critical errors
useErrorStore.getState().getErrorsBySeverity('critical')
```

### Console Logging

Errors are logged with consistent prefixes:

- `[ErrorStore]` - Error store operations
- `[CatalogStore]` - Catalog store operations
- `[TallyStore]` - Tally store operations
- `[SettingsStore]` - Settings store operations
- `[DataIntegrity]` - Integrity check operations
- `[ErrorRecovery]` - Recovery operation logs

Use browser console filtering to focus on specific components.

### Toast Monitoring

Toast notifications are visible in the UI. For debugging:

1. Check Sonner component configuration in `apps/web/src/components/ui/sonner.tsx`
2. Verify theme integration for dark mode
3. Test different toast types (success, error, warning, info)

## Troubleshooting

### Common Issues

**Errors not appearing in error store:**
- Verify error store subscription
- Check `addError()` is called with correct format
- Verify error is not cleared immediately

**Toasts not showing:**
- Check Sonner component is rendered in app
- Verify toast helper is imported and called
- Check for conflicting toasts clearing notifications

**Recovery actions not executing:**
- Verify action function is async
- Check action returns boolean
- Verify error store executeRecovery is called

**Integrity checks failing:**
- Verify stores are hydrated before running checks
- Check for circular dependencies
- Verify data exists before validation

### Performance Considerations

1. **Debounce integrity checks** on rapid state changes
2. **Limit error history** to prevent memory issues
3. **Use async validation** to avoid blocking UI
4. **Batch recovery actions** when possible
5. **Clear old errors** regularly

## Security Considerations

1. **Never expose internal details** in user-facing error messages
2. **Sanitize error data** before logging
3. **Avoid storing sensitive data** in error details
4. **Use generic messages** for unexpected errors
5. **Validate error input** before processing
