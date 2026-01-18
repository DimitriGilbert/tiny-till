# Implementation Plan: Comprehensive Input Validation and Error Boundaries

## Task Overview
Create robust form validation system with proper error messages, validation states, and real-time feedback across all input forms. Implement global React Error Boundaries that catch runtime errors and provide user-friendly recovery UI with fallback components and error logging. Add browser beforeunload event handler to display warnings when users attempt to navigate away with an active tally containing unsaved changes to prevent data loss.

## Current State Analysis

### Existing Components
- **Error Boundaries**: `error-boundary.tsx`, `validation-error-boundary.tsx`, `storage-error-boundary.tsx`
- **Validation Components**: `ValidatedQuantityInput`, `ValidationErrorMessage`, `PriceInput`
- **Error Store**: `error-store.ts` with error logging, recovery actions, stats
- **Validation Libraries**: `validators.ts`, `validation-helpers.ts`, `use-quantity-validation.ts`
- **Forms**: `ProductForm`, `QuantityInputDialog`, `CatalogImport`
- **Beforeunload Handler**: Already implemented in `__root.tsx` (lines 66-78)

### Gaps Identified
1. Error boundaries not wrapped around all critical components
2. No form-level validation summary component
3. Inconsistent validation feedback patterns across forms
4. Error recovery UI needs enhancement
5. Beforeunload handler could be more robust with custom messaging
6. No global error boundary at app root level
7. Missing validation state visual indicators in some inputs
8. No form validation status indicators (valid/invalid/progress)

## Implementation Plan

### Phase 1: Enhance Validation System

#### 1.1 Create Form Validation Status Indicator Component
**File**: `apps/web/src/components/ui/form-validation-status.tsx`
- Visual indicator showing form validation state (valid, invalid, validating)
- Progress indicator for async validation
- A11y: `aria-live="polite"`, proper labels
- Integrates with TanStack Form state
- Variants: inline, block, icon-only

**Props**:
```typescript
interface FormValidationStatusProps {
  isValid: boolean
  isDirty: boolean
  isValidating: boolean
  errorCount: number
  variant?: 'inline' | 'block' | 'icon-only'
  className?: string
}
```

#### 1.2 Create Form Validation Summary Component
**File**: `apps/web/src/components/ui/form-validation-summary.tsx`
- Displays all form errors in a collapsible list
- Shows warning count and error count
- Keyboard navigable error list
- Auto-focus first error on mount
- Clear visual hierarchy (errors > warnings)

**Props**:
```typescript
interface FormValidationSummaryProps {
  errors: Map<string, string>
  warnings: Map<string, string>
  onFocusField?: (fieldName: string) => void
  dismissible?: boolean
  variant?: 'compact' | 'detailed'
  className?: string
}
```

#### 1.3 Create Validated Input Wrapper Component
**File**: `apps/web/src/components/ui/validated-input.tsx`
- Generic wrapper for any input with validation
- Handles error display, success states, loading states
- Supports custom validation functions
- Integrates with TanStack Form fields
- Proper ARIA attributes

**Props**:
```typescript
interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
  isValid?: boolean
  isRequired?: boolean
  helperText?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validationStatus?: 'idle' | 'validating' | 'valid' | 'invalid'
}
```

#### 1.4 Enhance Existing Validation Components
**Files**:
- `apps/web/src/components/ui/validated-quantity-input.tsx` - Add tooltip support, improve a11y
- `apps/web/src/components/price-input.tsx` - Add real-time validation feedback
- `apps/web/src/components/ui/validation-error-message.tsx` - Add animation transitions

### Phase 2: Update Forms with Enhanced Validation

#### 2.1 Update ProductForm
**File**: `apps/web/src/components/product-form.tsx`
- Add `FormValidationStatus` component
- Add `FormValidationSummary` component
- Wrap fields in `ValidatedInput` components
- Implement real-time validation on name field (check uniqueness)
- Show validation progress for async operations
- Add success indicators on valid fields
- Improve error message positioning and clarity

**Changes**:
```typescript
// Add validation status indicator
const validationStatus = {
  isValid: form.state.isValid,
  isDirty: form.state.isDirty,
  isValidating: form.state.isSubmitting,
  errorCount: Object.keys(form.state.fieldMeta).filter(
    key => form.state.fieldMeta[key as keyof FieldMeta]?.errors.length > 0
  ).length
}

// Add validation summary when errors exist
{!form.state.isValid && form.state.isDirty && (
  <FormValidationSummary
    errors={getErrorMap(form.state.fieldMeta)}
    onFocusField={(fieldName) => focusField(fieldName)}
  />
)}
```

#### 2.2 Update QuantityInputDialog
**File**: `apps/web/src/components/quantity-input-dialog.tsx`
- Add `FormValidationStatus` component
- Improve error message display with animations
- Add keyboard navigation for error messages
- Show valid/invalid state more clearly
- Add success animation on valid input

#### 2.3 Update CatalogImport
**File**: `apps/web/src/components/CatalogImport.tsx`
- Add file validation progress indicator
- Show validation summary with error/warning counts
- Add expandable error details
- Improve success state visualization
- Add validation retry button

### Phase 3: Enhance Error Boundary Coverage

#### 3.1 Create Global App Error Boundary
**File**: `apps/web/src/components/app-error-boundary.tsx`
- Wrap entire application tree
- Provide app-wide error recovery
- Include error reporting/export functionality
- Multiple recovery options: reload, clear data, safe mode
- Preserve error state for debugging

**Features**:
- Error context capture (route, user action)
- Error export to clipboard
- Safe mode (disables complex features)
- Retry functionality
- Error statistics display

#### 3.2 Update Root Route with Global Error Boundary
**File**: `apps/web/src/routes/__root.tsx`
- Wrap `ThemeProvider` and children in `AppErrorBoundary`
- Pass error boundary state to stores
- Ensure beforeunload handler works with error boundary

**Changes**:
```typescript
<ErrorBoundary fallback={<GlobalErrorFallback />}>
  <ThemeProvider>
    {/* existing content */}
  </ThemeProvider>
</ErrorBoundary>
```

#### 3.3 Wrap Route Components with Error Boundaries
**Files**: `apps/web/src/routes/index.tsx`, `apps/web/src/routes/settings.tsx`, `apps/web/src/routes/settings.catalog.tsx`
- Add route-specific error boundaries
- Provide context-aware error messages
- Include navigation recovery options

**Changes**:
```typescript
<ValidationErrorBoundary>
  <TallyPage />
</ValidationErrorBoundary>
```

#### 3.4 Wrap Form Components with Error Boundaries
**Files**: `apps/web/src/components/product-form.tsx`, `apps/web/src/components/quantity-input-dialog.tsx`
- Add form-specific error boundaries
- Catch form validation errors gracefully
- Preserve form state on error

#### 3.5 Enhance Error Fallback Components
**Files**:
- `apps/web/src/components/error-boundary.tsx` - Add error details export, retry options
- `apps/web/src/components/validation-error-boundary.tsx` - Add field-level error context
- `apps/web/src/components/storage-error-boundary.tsx` - Add storage usage info, cleanup options

**New Features**:
- Error details expansion (toggle stack traces)
- Copy error to clipboard
- Error export to file
- Retry failed action
- Continue in safe mode

### Phase 4: Enhance Error Recovery UI

#### 4.1 Create Enhanced Error Recovery Dialog
**File**: `apps/web/src/components/enhanced-error-recovery-dialog.tsx`
- Multi-action recovery interface
- Recovery action suggestions based on error type
- Action execution with progress feedback
- Action history and results

**Features**:
- Primary/secondary/tertiary recovery actions
- Action severity indicators
- Estimated recovery time
- Progress indicators for async recovery
- Success/failure feedback for each action

#### 4.2 Update Error Recovery Dialog
**File**: `apps/web/src/components/error-recovery-dialog.tsx`
- Add recovery action suggestions
- Show recovery success rate
- Add retry with different options
- Include error context in UI

#### 4.3 Create Error Stats Component
**File**: `apps/web/src/components/error-stats-widget.tsx`
- Display recent error statistics
- Error frequency trends
- Error type breakdown
- Recovery success rate
- Quick actions for common errors

### Phase 5: Enhance Beforeunload Handler

#### 5.1 Update Beforeunload Handler in Root Route
**File**: `apps/web/src/routes/__root.tsx` (lines 66-78)
- Add custom message support (browser permitting)
- Include tally summary in warning
- Add countdown before allowing exit
- Save unsaved state to sessionStorage for recovery
- Add "stay on page" confirmation option

**Enhanced Logic**:
```typescript
useEffect(() => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (hasActiveItems()) {
      const summary = getTallySummary()
      const itemCount = summary.itemCount
      const total = formatCurrency(summary.total)

      // Store for potential recovery
      sessionStorage.setItem('unsaved-tally', JSON.stringify({
        items: items,
        timestamp: Date.now(),
        summary: { itemCount, total }
      }))

      // Set custom message (browsers may not show it)
      event.preventDefault()
      event.returnValue = `You have ${itemCount} items (${total}) in your tally. Are you sure you want to leave? Your changes will be lost.`
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasActiveItems, items])
```

#### 5.2 Add Unsaved Tally Recovery
**File**: `apps/web/src/components/unsaved-tally-recovery-dialog.tsx`
- Detect unsaved tally from sessionStorage on load
- Offer to restore or discard
- Show summary of recovered tally
- Auto-cleanup on successful restore or discard

**Props**:
```typescript
interface UnsavedTallyRecoveryDialogProps {
  open: boolean
  onRestore: () => void
  onDiscard: () => void
  tallySummary: TallySummary
  recoveryTime: number
}
```

#### 5.3 Add to Root Route
**File**: `apps/web/src/routes/__root.tsx`
- Add effect to check for unsaved tally on mount
- Show recovery dialog if found
- Clean up after user decision

### Phase 6: Add Utility Functions and Hooks

#### 6.1 Create Form Validation Hook
**File**: `apps/web/src/hooks/use-form-validation.ts`
- Generic form validation state management
- Field-level validation tracking
- Form-wide validation status
- Validation summary generation
- Field focus and scroll helpers

#### 6.2 Create Error Boundary Hook
**File**: `apps/web/src/hooks/use-error-boundary.ts`
- Track error boundary state
- Error recovery action execution
- Error logging and stats
- Safe mode toggle

#### 6.3 Create Validation Utility Functions
**File**: `apps/web/src/lib/validation-utils.ts`
- Field error map generation
- Validation state formatting
- Error message normalization
- Validation result aggregation

#### 6.4 Create Error Recovery Utilities
**File**: `apps/web/src/lib/error-recovery-utils.ts`
- Recovery action execution helpers
- Error categorization
- Recovery suggestion generation
- Safe mode feature detection

### Phase 7: Update Type Definitions

#### 7.1 Update Error Types
**File**: `apps/web/src/lib/error-types.ts` (if exists) or create
- Add form validation error types
- Add recovery error types
- Add boundary error contexts

#### 7.2 Update Validation Types
**File**: `apps/web/src/lib/validation-types.ts` (if exists) or create
- Define validation state types
- Field validation metadata types
- Form validation summary types

### Phase 8: Testing and Verification

#### 8.1 Test Form Validation
- Test real-time validation on all forms
- Verify error message accuracy
- Test validation states (idle, validating, valid, invalid)
- Test form submission with errors
- Test keyboard navigation of errors
- Test a11y with screen reader

#### 8.2 Test Error Boundaries
- Trigger errors in various components
- Verify error boundary catches errors
- Test error recovery actions
- Verify error logging
- Test fallback UI rendering
- Test error export/copy functionality

#### 8.3 Test Beforeunload Handler
- Navigate away with active tally
- Verify warning message appears
- Test page reload behavior
- Test cross-tab navigation
- Verify unsaved tally recovery

#### 8.4 Run Type Checking
```bash
npm run check-types
```

#### 8.5 Run Build
```bash
npm run build
```

### Phase 9: Documentation

#### 9.1 Update Component Documentation
- Add JSDoc comments to new components
- Document validation patterns
- Document error boundary usage

#### 9.2 Update AGENTS.md (if needed)
- Document any new conventions
- Update type safety requirements

## File Changes Summary

### New Files to Create
1. `apps/web/src/components/ui/form-validation-status.tsx`
2. `apps/web/src/components/ui/form-validation-summary.tsx`
3. `apps/web/src/components/ui/validated-input.tsx`
4. `apps/web/src/components/app-error-boundary.tsx`
5. `apps/web/src/components/enhanced-error-recovery-dialog.tsx`
6. `apps/web/src/components/error-stats-widget.tsx`
7. `apps/web/src/components/unsaved-tally-recovery-dialog.tsx`
8. `apps/web/src/hooks/use-form-validation.ts`
9. `apps/web/src/hooks/use-error-boundary.ts`
10. `apps/web/src/lib/validation-utils.ts`
11. `apps/web/src/lib/error-recovery-utils.ts`
12. `apps/web/src/lib/error-types.ts` (if not exists)
13. `apps/web/src/lib/validation-types.ts` (if not exists)

### Files to Modify
1. `apps/web/src/routes/__root.tsx` - Update beforeunload, add global error boundary, add unsaved tally recovery
2. `apps/web/src/routes/index.tsx` - Add route error boundary
3. `apps/web/src/routes/settings.tsx` - Add route error boundary
4. `apps/web/src/routes/settings.catalog.tsx` - Add route error boundary
5. `apps/web/src/components/product-form.tsx` - Add validation status/summary, wrap inputs
6. `apps/web/src/components/quantity-input-dialog.tsx` - Add validation status, improve error display
7. `apps/web/src/components/CatalogImport.tsx` - Add validation progress/summary
8. `apps/web/src/components/error-boundary.tsx` - Add error details export, retry options
9. `apps/web/src/components/validation-error-boundary.tsx` - Add field error context
10. `apps/web/src/components/storage-error-boundary.tsx` - Add storage info, cleanup options
11. `apps/web/src/components/price-input.tsx` - Add real-time validation feedback
12. `apps/web/src/components/ui/validated-quantity-input.tsx` - Enhance a11y, add tooltips
13. `apps/web/src/components/ui/validation-error-message.tsx` - Add animations
14. `apps/web/src/components/error-recovery-dialog.tsx` - Enhance recovery UI

## Implementation Order

1. **Phase 1**: Create validation utility components
2. **Phase 2**: Update forms with enhanced validation
3. **Phase 3**: Enhance error boundary coverage (add global boundary)
4. **Phase 4**: Enhance error recovery UI
5. **Phase 5**: Enhance beforeunload handler and add recovery dialog
6. **Phase 6**: Create utility functions and hooks
7. **Phase 7**: Update type definitions
8. **Phase 8**: Testing and verification (run `npm run check-types` and `npm run build`)
9. **Phase 9**: Documentation

## Success Criteria

- [ ] All forms show real-time validation feedback
- [ ] Validation error messages are clear and actionable
- [ ] Form validation status indicators present on all forms
- [ ] Global error boundary catches app-level errors
- [ ] Route-level error boundaries catch route errors
- [ ] Error recovery UI provides multiple recovery options
- [ ] Beforeunload warning displays with active tally
- [ ] Unsaved tally can be recovered after accidental navigation
- [ ] Error logging captures all errors with context
- [ ] `npm run check-types` passes without errors
- [ ] `npm run build` completes successfully
- [ ] A11y compliance (keyboard navigation, screen reader support)
- [ ] Dark mode support for all new components
