# Task 3.5: Comprehensive Error Handling and User Feedback System

## Implementation Plan

### Overview
This task implements comprehensive error handling for the catalog import system, covering all edge cases with user-friendly error messages, retry logic, detailed logging, and clear status reporting.

---

## Phase 1: Error Message Library (Core Foundation)

### 1.1 Create Error Message Library
**File:** `apps/web/src/lib/error-messages.ts`

Create a centralized error message system with:
- Error code to message mapping
- Actionable guidance for each error type
- Recovery step suggestions
- User-friendly descriptions

Error Categories:
1. **File Read Errors**
   - `FILE_READ_ERROR`: "Failed to read file"
   - `FILE_ACCESS_DENIED`: "File access denied"
   - `FILE_ENCODING_ERROR`: "File encoding error"

2. **Parse Failures**
   - `INVALID_JSON`: "Invalid JSON syntax"
   - `JSON_PARSE_ERROR`: "JSON parsing failed"
   - `UNEXPECTED_TOKEN`: "Unexpected token in JSON"

3. **Validation Errors**
   - `VALIDATION_FAILED`: "Validation failed"
   - `MISSING_REQUIRED_FIELD`: "Required field missing"
   - `INVALID_FIELD_TYPE`: "Invalid field type"
   - `DUPLICATE_PRODUCT_ID`: "Duplicate product ID"

4. **Import Conflicts**
   - `CONFLICT_DETECTED`: "Import conflict detected"
   - `VERSION_CONFLICT`: "Version conflict"
   - `DATA_CONFLICT`: "Data conflict"

5. **Storage Failures**
   - `STORAGE_QUOTA_EXCEEDED`: "Storage quota exceeded"
   - `STORAGE_WRITE_ERROR`: "Storage write failed"
   - `STORAGE_READ_ERROR`: "Storage read failed"
   - `INDEXEDDB_ERROR`: "IndexedDB error"

6. **Network Errors**
   - `NETWORK_ERROR`: "Network error"
   - `REQUEST_TIMEOUT`: "Request timeout"
   - `OFFLINE_MODE`: "You are offline"

Each error entry includes:
- User-friendly title
- Detailed description
- Affected operations
- Recovery steps (array of actionable steps)
- Error severity mapping

---

### 1.2 Create Error Context Interface
**File:** `apps/web/src/lib/error-context.ts`

Define error context interfaces:
```typescript
interface ErrorContext {
  operation: string
  fileName?: string
  fileSize?: number
  productCount?: number
  lineNumber?: number
  fieldName?: string
  currentAction?: string
  timestamp: number
  errorId: string
}
```

---

## Phase 2: Enhanced Error Logging System

### 2.1 Create Error Logger Utility
**File:** `apps/web/src/lib/error-logger.ts`

Implement comprehensive error logging:
- Structured error logging with context
- Error severity levels (debug, info, warning, error, critical)
- Error persistence (localStorage for recent errors)
- Error export functionality
- Error filtering and querying

Features:
- `logError(error: Error, context: ErrorContext, severity: ErrorSeverity)`
- `getRecentErrors(count?: number): ErrorLog[]`
- `getErrorsByType(type: string): ErrorLog[]`
- `clearErrorLog()`
- `exportErrorLog(): string` (JSON format)
- `getErrorStats(): ErrorStats`

---

### 2.2 Create Error Log Types
**File:** `apps/web/src/lib/error-types.ts`

Define error log types:
```typescript
interface ErrorLog {
  id: string
  timestamp: number
  severity: ErrorSeverity
  type: string
  code: string
  message: string
  context: ErrorContext
  stackTrace?: string
  recoveryAttempted: boolean
  resolved: boolean
  resolvedAt?: number
}

interface ErrorStats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  resolved: number
  unresolved: number
}
```

---

### 2.3 Enhance Error Store Integration
**File:** `apps/web/src/stores/error-store.ts` (MODIFY)

Update error store to:
- Track error logs
- Store error statistics
- Provide error log query methods
- Integrate with error logger
- Track recovery attempts
- Maintain error resolution status

Add new actions:
- `getErrorLogs(): ErrorLog[]`
- `getErrorStats(): ErrorStats`
- `markErrorAsResolved(id: string): void`
- `trackRecoveryAttempt(errorId: string, success: boolean): void`

---

## Phase 3: Retry Logic System

### 3.1 Create Retry Handler Utility
**File:** `apps/web/src/lib/retry-handler.ts`

Implement retry logic with:
- Exponential backoff strategy
- Max retry attempts configuration
- Jitter to prevent thundering herd
- Retry condition evaluation
- Retry context tracking

```typescript
interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: Error, attempt: number) => boolean
  onRetry?: (attempt: number, error: Error) => void
}

interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalDelay: number
}
```

Functions:
- `retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions): Promise<RetryResult<T>>`
- `isRecoverableError(error: Error): boolean`
- `calculateBackoffDelay(attempt: number, options: RetryOptions): number`

---

### 3.2 Create Import-Specific Retry Logic
**File:** `apps/web/src/lib/import-retry.ts`

Implement specialized retry logic for import operations:
- File read retry
- JSON parse retry
- Validation retry
- Storage operation retry
- Batch processing retry

Retryable operations:
1. File reading (transient I/O errors)
2. IndexedDB operations (quota/locking issues)
3. Validation (schema re-evaluation)
4. Batch imports (partial failures)

---

### 3.3 Integrate Retry Logic into Import Execution
**File:** `packages/types/src/utils/import-execution.ts` (MODIFY)

Update `executeImportAtomic` to:
- Implement retry for failed batch operations
- Track retry attempts per product
- Provide progress updates during retries
- Aggregate retry statistics

---

## Phase 4: Enhanced Toast Notification System

### 4.1 Extend Toast Helpers
**File:** `apps/web/src/lib/toast-helpers.ts` (MODIFY)

Add new toast functions:
- `showErrorWithRetry(message: string, onRetry: () => void, context?: object)`
- `showImportProgress(title: string, progress: ImportProgress)`
- `showImportSuccess(result: ImportExecutionResult)`
- `showImportFailure(result: ImportExecutionResult, onRetry?: () => void)`
- `showValidationError(issue: ValidationIssue, onFix?: () => void)`
- `showStorageErrorWithRecovery(message: string, actions: RecoveryAction[])`

Each toast includes:
- Title and description
- Action buttons (retry, fix, dismiss, view details)
- Progress indicators for long-running operations
- Detailed error context (expandable)
- Recovery suggestions

---

### 4.2 Create Toast Action Components
**File:** `apps/web/src/components/toast-actions.tsx`

Build reusable toast action components:
- `RetryButton` - Trigger retry with visual feedback
- `FixButton` - Open fix dialog for validation errors
- `ViewDetailsButton` - Show error details dialog
- `DismissButton` - Dismiss toast
- `ActionButtons` - Container for multiple actions

---

### 4.3 Create Error Detail Toast Variant
**File:** `apps/web/src/components/error-detail-toast.tsx`

Specialized toast component showing:
- Error code and title
- Full error message
- Error context (file, line, field, etc.)
- Stack trace (dev mode)
- Recovery suggestions
- Action buttons

---

## Phase 5: Enhanced Progress Indicators

### 5.1 Create Detailed Progress Types
**File:** `packages/types/src/entities/import.ts` (MODIFY - if not already done)

Ensure `ImportProgress` includes:
```typescript
interface ImportProgress {
  total: number
  processed: number
  added: number
  updated: number
  skipped: number
  failed: number
  currentProduct?: {
    id: string
    name: string
  }
  error?: string
  startTime: number
  estimatedTimeRemaining?: number
  retryAttempts: number
  currentBatch?: number
  totalBatches?: number
}
```

---

### 5.2 Enhance Import Progress Component
**File:** `apps/web/src/components/ImportProgress.tsx` (MODIFY)

Add:
- Estimated time remaining calculation
- Retry attempt counter
- Batch processing indicator
- Success/failure ratio
- Pause/resume button (for large imports)
- Detailed status breakdown

Features:
- Real-time progress updates
- ETA calculation based on processing speed
- Visual indicators for retries
- Detailed error summary
- Actionable error items (click to view details)

---

### 5.3 Create Progress Notification Toast
**File:** `apps/web/src/components/progress-toast.tsx`

Dedicated toast for import progress:
- Shows current progress percentage
- Current product being processed
- Processing speed (items/second)
- Estimated time remaining
- Success/failure counters
- Cancel button

---

### 5.4 Create Detailed Progress Modal
**File:** `apps/web/src/components/ImportProgressModal.tsx`

Modal showing:
- Full progress bar
- Detailed statistics (added, updated, skipped, failed)
- Processing queue visualization
- Failed items list with error details
- Retry failed items button
- Close on complete

---

## Phase 6: Error Recovery Dialogs

### 6.1 Create Error Recovery Dialog Component
**File:** `apps/web/src/components/error-recovery-dialog.tsx` (ENHANCE existing)

Enhance existing dialog to:
- Show multiple recovery options
- Display recovery steps
- Provide preview of recovery action
- Confirm recovery before execution
- Show recovery progress
- Report recovery success/failure

---

### 6.2 Create Conflict Resolution Dialog
**File:** `apps/web/src/components/conflict-resolution-dialog.tsx`

Specialized dialog for import conflicts:
- Show side-by-side comparison
- Field-by-field conflict indicators
- Resolution strategy selection (merge, replace, skip)
- Preview resolution result
- Batch conflict resolution (apply strategy to all)

---

### 6.3 Create Storage Recovery Dialog
**File:** `apps/web/src/components/storage-recovery-dialog.tsx**

Dialog for storage-related errors:
- Show storage usage statistics
- List options to free space
- Provide data export before clearing
- Show recovery steps
- Confirm destructive actions

---

## Phase 7: Error Log Viewer

### 7.1 Create Error Log Viewer Component
**File:** `apps/web/src/components/error-log-viewer.tsx`

Comprehensive error log viewer with:
- Error list with filtering (type, severity, resolved status)
- Error search functionality
- Sort options (date, severity, type)
- Error detail view (click to expand)
- Error statistics dashboard
- Export error logs button
- Clear logs button
- Auto-refresh toggle

Features:
- Pagination for large log sets
- Real-time updates (when import is running)
- Color-coded severity indicators
- Grouping by error type
- Time-based filtering (today, week, month)

---

### 7.2 Create Error Detail Panel
**File:** `apps/web/src/components/error-detail-panel.tsx`

Detailed view of single error:
- Error header (code, type, severity)
- Full error message
- Error context display
- Stack trace (dev mode)
- Recovery suggestions
- Recovery history (attempts, results)
- Related errors (same type/context)
- Actions (retry, dismiss, export)

---

### 7.3 Create Error Statistics Dashboard
**File:** `apps/web/src/components/error-stats-dashboard.tsx`

Visual dashboard showing:
- Total errors chart (by day/week)
- Error type distribution (pie chart)
- Severity breakdown (bar chart)
- Resolution rate (success percentage)
- Top errors (frequency)
- Recent errors timeline

---

## Phase 8: Integration with Import Workflow

### 8.1 Enhance useCatalogImport Hook
**File:** `apps/web/src/hooks/useCatalogImport.ts` (MODIFY)

Integrate all error handling:
- Wrap operations in error logging
- Implement retry logic for file operations
- Enhanced error context tracking
- Progress updates with error details
- Recovery action suggestions

Add new return values:
```typescript
interface UseCatalogImportReturn {
  // existing...
  errorLogs: ErrorLog[]
  errorStats: ErrorStats
  retryImport: () => Promise<void>
  exportErrorLog: () => string
}
```

---

### 8.2 Enhance CatalogImport Component
**File:** `apps/web/src/components/CatalogImport.tsx` (MODIFY)

Update component to:
- Show detailed error toasts with retry actions
- Display error summary for failed imports
- Provide error log viewer access
- Show progress toasts with real-time updates
- Handle retry on partial failures

---

### 8.3 Enhance ImportPreview Component
**File:** `apps/web/src/components/ImportPreview.tsx` (MODIFY)

Add error handling:
- Show validation errors with fix suggestions
- Display conflict resolution warnings
- Provide recovery actions before import
- Show data integrity warnings

---

### 8.4 Update Import Execution with Error Tracking
**File:** `apps/web/src/stores/catalog-store.ts` (MODIFY - importAtomic function)

Enhance importAtomic to:
- Log each product operation
- Track errors per product
- Collect error statistics
- Provide detailed progress with errors
- Support partial retry (retry only failed items)

---

## Phase 9: Testing and Validation

### 9.1 Create Error Scenarios Test Suite
**File:** `apps/web/src/lib/__tests__/error-handling.test.ts`

Test all error scenarios:
- File read errors (corrupted file, permission denied)
- Parse failures (invalid JSON, unexpected tokens)
- Validation errors (missing fields, invalid types)
- Import conflicts (version, data conflicts)
- Storage failures (quota, write errors)
- Network errors (timeout, offline)
- Recovery attempts
- Retry logic
- Error logging
- Toast notifications

### 9.2 Manual Testing Checklist
Verify:
- All error types display user-friendly messages
- Recovery actions work correctly
- Retry logic functions as expected
- Error logs are captured and viewable
- Progress indicators are accurate
- Toast notifications are actionable
- Error details are comprehensive
- Recovery dialogs provide clear guidance

---

## File Changes Summary

### New Files to Create
1. `apps/web/src/lib/error-messages.ts` - Error message library
2. `apps/web/src/lib/error-context.ts` - Error context interfaces
3. `apps/web/src/lib/error-logger.ts` - Error logging utility
4. `apps/web/src/lib/error-types.ts` - Error log types
5. `apps/web/src/lib/retry-handler.ts` - Retry logic handler
6. `apps/web/src/lib/import-retry.ts` - Import-specific retry logic
7. `apps/web/src/components/toast-actions.tsx` - Toast action components
8. `apps/web/src/components/error-detail-toast.tsx` - Error detail toast
9. `apps/web/src/components/progress-toast.tsx` - Progress notification toast
10. `apps/web/src/components/ImportProgressModal.tsx` - Detailed progress modal
11. `apps/web/src/components/conflict-resolution-dialog.tsx` - Conflict resolution dialog
12. `apps/web/src/components/storage-recovery-dialog.tsx` - Storage recovery dialog
13. `apps/web/src/components/error-log-viewer.tsx` - Error log viewer
14. `apps/web/src/components/error-detail-panel.tsx` - Error detail panel
15. `apps/web/src/components/error-stats-dashboard.tsx` - Error statistics dashboard

### Files to Modify
1. `apps/web/src/stores/error-store.ts` - Add error log tracking and stats
2. `apps/web/src/lib/toast-helpers.ts` - Add new toast functions
3. `apps/web/src/components/ImportProgress.tsx` - Enhance with detailed progress
4. `apps/web/src/components/error-recovery-dialog.tsx` - Enhance existing
5. `apps/web/src/hooks/useCatalogImport.ts` - Integrate error handling
6. `apps/web/src/components/CatalogImport.tsx` - Add error handling UI
7. `apps/web/src/components/ImportPreview.tsx` - Add conflict/error handling
8. `apps/web/src/stores/catalog-store.ts` - Enhance importAtomic with error tracking
9. `packages/types/src/utils/import-execution.ts` - Add retry logic to execution
10. `packages/types/src/entities/import.ts` - Ensure ImportProgress has all fields

---

## Implementation Order

1. **Phase 1-2** (Foundation): Error message library + logging system
2. **Phase 3** (Core Logic): Retry logic implementation
3. **Phase 4** (Notifications): Enhanced toast system
4. **Phase 5** (Progress): Enhanced progress indicators
5. **Phase 6** (Recovery): Error recovery dialogs
6. **Phase 7** (Visualization): Error log viewer and stats
7. **Phase 8** (Integration): Integration with import workflow
8. **Phase 9** (Testing): Testing and validation

---

## Success Criteria

- ✅ All error types have user-friendly messages with actionable guidance
- ✅ Recoverable errors have retry logic with exponential backoff
- ✅ All errors are logged with full context
- ✅ Toast notifications provide immediate feedback with recovery actions
- ✅ Progress indicators show detailed status including errors
- ✅ Error log viewer displays comprehensive error history
- ✅ Recovery dialogs provide clear step-by-step guidance
- ✅ Import workflow handles all edge cases gracefully
- ✅ Users can retry failed operations seamlessly
- ✅ Error statistics provide insights into system health

---

## Dependencies

This task builds upon:
- Task 3.1: File Upload Interface (file reading)
- Task 3.2: Validation Engine (validation errors)
- Task 3.3: Preview Modal (conflict detection)
- Task 3.4: Import Execution (import operations)

Existing components to leverage:
- error-store.ts
- error-recovery.ts
- toast-helpers.ts
- ImportProgress.tsx
- useCatalogImport.ts

---

## Notes

- Follow existing code patterns and conventions
- Use TypeScript strictly (no `any` types)
- Maintain consistency with shadcn/ui components
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test error scenarios thoroughly
- Keep error messages concise and actionable
- Ensure error recovery doesn't cause data loss
- Balance detailed logging with performance
