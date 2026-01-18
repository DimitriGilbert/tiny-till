# Validation Testing Procedures

## Overview

This document provides testing procedures for validating the Tiny-Till application's comprehensive validation framework and error handling system.

## Test Environment Setup

### Prerequisites

1. Clean browser storage
2. Disable browser extensions that might interfere with storage
3. Open browser DevTools console for error logging
4. Open React DevTools for state inspection

### Test Data Preparation

```javascript
// Clear all storage
indexedDB.deleteDatabase('tiny-till-catalog')
localStorage.clear()
sessionStorage.clear()

// Reload to start fresh
window.location.reload()
```

## Field-Level Validation Tests

### 1. Product Name Validation

#### Test Cases

| Input | Expected Result | Notes |
|--------|----------------|--------|
| Valid name: "Baguette" | Pass | |
| Empty string | Fail: "Product name is required" | |
| Whitespace only | Fail: "Product name is required" | |
| Leading/trailing spaces | Fail: "Should not have leading/trailing whitespace" | |
| 51 characters | Fail: "Cannot exceed 50 characters" | Boundary test |
| Special characters | Fail/Pass depending on allowed | Test `@#$%^&*` |
| Duplicate name in catalog | Fail: "Already exists" | Test with CRUD |

**Procedure:**
1. Go to Settings > Catalog
2. Click "+ Add Product"
3. Enter each test input
4. Verify error message appears immediately
5. Verify error clears when corrected

### 2. Price Validation

#### Test Cases

| Input | Expected Result | Notes |
|--------|----------------|--------|
| "0.01" (1 cent) | Pass | Minimum valid |
| "0" or "-1" | Fail: "Must be greater than 0" | |
| "1,000,000.00" | Fail: "Exceeds limit" | Boundary test |
| "abc" | Fail: "Must be a valid number" | |
| "1.234" | Fail: "Must be whole number of cents" | Precision test |
| "$5.00" | Fail: "Must be a valid number" | Currency symbols |
| Empty | Fail: "Price is required" | |

**Procedure:**
1. Test in Add Product form
2. Test in Edit Product form
3. Test with price input component
4. Verify error messages are clear
5. Verify formatting preserves cents

### 3. Quantity Validation

#### Test Cases

| Input | Expected Result | Notes |
|--------|----------------|--------|
| "1" | Pass | Minimum positive |
| "0" | Fail/Pass depending on context | See below |
| "-1" | Fail: "Cannot be negative" | |
| "9,999" | Pass | Maximum valid |
| "10,000" | Fail: "Cannot exceed 9,999" | Boundary test |
| "1.5" | Fail: "Must be whole number" | Decimals |
| Non-numeric | Fail | |

**Procedure:**
1. Add product to tally with quantity input
2. Tap quantity badge and enter values
3. Test keypad input
4. Verify zero quantity removes item
5. Verify negative values rejected

### 4. Image Validation

#### Test Cases

| Image | Expected Result | Notes |
|--------|----------------|--------|
| 128x128 PNG | Pass | Maximum valid |
| 129x128 PNG | Fail: "Exceeds 128×128 limit" | Boundary test |
| 1x1 PNG | Pass | Minimum valid |
| Large file | Fail: "Exceeds limit" | Test with large images |
| Invalid format (PDF) | Fail: "Must be PNG, JPEG, or WebP" | |
| Corrupt file | Fail: "Invalid data URL" | |
| Blob URL | Pass | Valid for temporary storage |

**Procedure:**
1. Go to Settings > Catalog
2. Click image upload button
3. Test with various image files
4. Verify visual feedback for progress
5. Verify error messages for invalid images
6. Verify thumbnail displays correctly for valid images

## CRUD Operation Validation Tests

### 1. Product CRUD

#### Add Product

**Test Scenarios:**

1. **Valid Addition**
   - Fill all fields with valid data
   - Click Add
   - Verify product appears in list
   - Verify success toast

2. **Invalid Name**
   - Enter invalid name (empty, too long, etc.)
   - Click Add
   - Verify error toast
   - Verify product not added

3. **Invalid Price**
   - Enter invalid price (zero, negative)
   - Click Add
   - Verify error toast
   - Verify product not added

4. **Duplicate Name**
   - Add product with existing name
   - Verify error toast
   - Verify uniqueness check works

5. **Storage Failure**
   - Simulate quota exceeded (fill IndexedDB)
   - Attempt to add product
   - Verify storage error toast
   - Verify error boundary appears if critical

#### Update Product

**Test Scenarios:**

1. **Valid Update**
   - Click product to edit
   - Change name or price
   - Save changes
   - Verify product updated
   - Verify success toast

2. **Invalid Update**
   - Enter invalid data in edit mode
   - Save changes
   - Verify error toast
   - Verify product not changed

3. **Timestamp Update**
   - Edit product
   - Save changes
   - Verify updatedAt > createdAt
   - Verify timestamp consistency

#### Delete Product

**Test Scenarios:**

1. **Valid Delete**
   - Delete product
   - Confirm deletion
   - Verify product removed
   - Verify success toast

2. **Delete Non-Existent**
   - Attempt to delete product that doesn't exist
   - Verify error toast
   - Verify no state change

### 2. Tally CRUD

#### Add Item

**Test Scenarios:**

1. **Valid Addition**
   - Add product to tally
   - Verify item appears in footer
   - Verify total updated
   - Verify item count updated

2. **Invalid Product**
   - Add item with non-existent product ID
   - Verify error
   - Verify item not added

3. **Invalid Price**
   - Add item with negative price
   - Verify error
   - Verify item not added

4. **Orphaned Item**
   - Delete product from catalog while in tally
   - Add item for deleted product
   - Verify orphan detection
   - Verify integrity warning

#### Update Quantity

**Test Scenarios:**

1. **Valid Update**
   - Change quantity via badge
   - Enter valid number
   - Confirm
   - Verify quantity updated

2. **Invalid Update**
   - Enter negative number
   - Verify error
   - Verify quantity unchanged

3. **Zero Quantity**
   - Enter 0
   - Verify item removed
   - Verify no error toast

#### Clear Tally

**Test Scenarios:**

1. **Valid Clear**
   - Click Clear button
   - Confirm
   - Verify all items removed
   - Verify total reset to 0

2. **Cancel Clear**
   - Click Clear button
   - Click Cancel
   - Verify items remain
   - Verify no state change

### 3. Settings CRUD

#### Theme Change

**Test Scenarios:**

1. **Valid Theme**
   - Change theme to light/dark/system
   - Verify theme applies
   - Verify setting persisted

2. **Invalid Theme**
   - Programmatically set invalid theme
   - Verify error
   - Verify theme unchanged

#### Grid Density Change

**Test Scenarios:**

1. **Valid Density**
   - Change density to normal/compact
   - Verify grid updates
   - Verify setting persisted

2. **Invalid Density**
   - Programmatically set invalid density
   - Verify error
   - Verify density unchanged

#### Column Count Override

**Test Scenarios:**

1. **Valid Count**
   - Set column count (2-8)
   - Verify grid columns change
   - Verify setting persisted

2. **Invalid Count**
   - Set count outside 2-8
   - Verify error
   - Verify count unchanged

3. **Conflict with Density**
   - Set 2 columns with compact density
   - Verify error or auto-correction
   - Verify business logic validation

## Error Recovery Tests

### 1. Storage Error Recovery

**Test Scenarios:**

1. **Quota Exceeded**
   - Fill IndexedDB to quota limit
   - Attempt to add product
   - Verify error dialog appears
   - Verify "Clear Storage" action available
   - Execute recovery action
   - Verify storage cleared
   - Verify page reloads

2. **Storage Blocked**
   - Enable private browsing mode
   - Reload app
   - Verify error detected
   - Verify error dialog appears
   - Verify "Reload Page" action available
   - Execute recovery action
   - Verify page reloads

3. **Transient Error**
   - Simulate transient storage error
   - Verify error logged to store
   - Verify recovery suggested
   - Verify non-destructive options available

### 2. Validation Error Recovery

**Test Scenarios:**

1. **Invalid Input Error**
   - Submit form with invalid data
   - Verify validation errors displayed
   - Verify error logged to store
   - Verify "Fix Validation" action available
   - Verify action closes dialog

2. **Multiple Errors**
   - Submit form with multiple invalid fields
   - Verify all errors shown
   - Verify error messages are grouped
   - Verify recovery action suggests reviewing all fields

### 3. Business Error Recovery

**Test Scenarios:**

1. **Logic Violation**
   - Trigger business logic error
   - Verify error logged to store
   - Verify "Retry Operation" action available
   - Execute retry
   - Verify operation retried

2. **Retry Success**
   - Execute recovery retry action
   - Verify operation succeeds on retry
   - Verify error acknowledged
   - Verify error store updated

## Data Integrity Tests

### 1. Catalog Integrity

**Test Scenarios:**

1. **Valid Catalog**
   - Load catalog with valid products
   - Run integrity check on hydration
   - Verify no errors
   - Verify no warnings

2. **Duplicate Products**
   - Add products with duplicate names
   - Run integrity check
   - Verify duplicate warnings
   - Verify issues reported

3. **Invalid Products**
   - Manually corrupt product in IndexedDB
   - Reload app
   - Run integrity check
   - Verify errors detected
   - Verify warnings shown

4. **Anomaly Detection**
   - Add product with very high price (>$10,000)
   - Run integrity check
   - Verify anomaly warning
   - Verify warning logged

### 2. Tally Integrity

**Test Scenarios:**

1. **Valid Tally**
   - Add items with valid products
   - Run integrity check
   - Verify no errors
   - Verify totals match

2. **Orphaned Items**
   - Delete product while in tally
   - Run integrity check
   - Verify orphan error detected
   - Verify repairable action available
   - Execute repair
   - Verify orphan removed

3. **Negative Prices**
   - Manually set item price to negative
   - Run integrity check
   - Verify error detected
   - Verify repair action available

4. **Overflow Protection**
   - Add 100,000 items to tally
   - Verify overflow check
   - Verify error toast
   - Verify operation blocked

### 3. Settings Integrity

**Test Scenarios:**

1. **Valid Settings**
   - Load valid settings
   - Run integrity check
   - Verify no errors

2. **Column/Density Conflict**
   - Set 2 columns with compact density
   - Run integrity check
   - Verify error detected
   - Verify repairable

3. **Invalid Backup Reminder**
   - Set negative backup reminder
   - Run integrity check
   - Verify error detected
   - Verify repairable

## Toast Notification Tests

### 1. Success Toasts

**Test Scenarios:**

1. **Simple Success**
   - Complete valid operation
   - Verify success toast appears
   - Verify auto-dismisses after delay
   - Verify check icon

2. **Operation Success**
   - Complete batch operation
   - Verify toast shows count
   - Verify proper pluralization
   - Verify green color

### 2. Error Toasts

**Test Scenarios:**

1. **Single Error**
   - Trigger validation error
   - Verify error toast appears
   - Verify error message
   - Verify x icon
   - Verify red color

2. **Multiple Errors**
   - Trigger multiple validation errors
   - Verify grouped toast
   - Verify error count mentioned
   - Verify "and X more" text for >3 errors

3. **Storage Error**
   - Trigger storage error
   - Verify error toast appears
   - Verify action context
   - Verify persists until dismissed

### 3. Warning Toasts

**Test Scenarios:**

1. **Integrity Warning**
   - Trigger integrity check with issues
   - Verify warning toast appears
   - Verify issue count shown
   - Verify yellow color

2. **Quota Warning**
   - Fill storage to 80%+ capacity
   - Run operation
   - Verify quota warning toast
   - Verify percentage shown

### 4. Info Toasts

**Test Scenarios:**

1. **Informational Message**
   - Trigger info toast
   - Verify message appears
   - Verify info icon
   - Verify blue color

2. **Loading Toast**
   - Start async operation
   - Verify loading toast appears
   - Verify spinner icon
   - Verify auto-dismisses on completion

## Error Boundary Tests

### 1. General Error Boundary

**Test Scenarios:**

1. **Component Error**
   - Programmatically throw error in component
   - Verify error boundary catches error
   - Verify fallback UI displayed
   - Verify error logged to store
   - Verify stack trace preserved

2. **Navigation Options**
   - Verify "Reload Page" button works
   - Verify "Go to Home" button works
   - Verify app recovers after reload

### 2. Storage Error Boundary

**Test Scenarios:**

1. **Storage Error in Component**
   - Trigger storage error in wrapped component
   - Verify storage error boundary catches error
   - Verify storage-specific fallback
   - Verify quota vs blocked detection

2. **Recovery Actions**
   - Verify "Clear Storage" button works
   - Verify storage cleared
   - Verify app reloads

### 3. Validation Error Boundary

**Test Scenarios:**

1. **Validation Error in Component**
   - Trigger validation error in wrapped component
   - Verify validation error boundary catches error
   - Verify validation-specific fallback
   - Verify user-friendly message

## Performance Tests

### 1. Validation Performance

**Test Scenarios:**

1. **Field Validation**
   - Measure time for field validator calls
   - Verify <1ms per validation
   - Test with 1000 rapid inputs

2. **Schema Validation**
   - Measure time for Zod schema validation
   - Verify <5ms per object
   - Test with large catalogs (100+ products)

3. **Integrity Checks**
   - Measure time for integrity check on large catalog
   - Verify <100ms for 100 products
   - Verify UI remains responsive during check

### 2. Error Store Performance

**Test Scenarios:**

1. **Error Addition**
   - Add 100 errors to error store
   - Verify UI remains responsive
   - Verify no memory leaks

2. **Error Cleanup**
   - Acknowledge and clear errors
   - Verify Map updates are efficient
   - Verify garbage collection works

## Integration Tests

### 1. End-to-End Flow

**Test Scenarios:**

1. **Product Addition Flow**
   - Navigate to Settings > Catalog
   - Add product with valid data
   - Verify validation passes
   - Verify product added to catalog
   - Verify toast notification
   - Verify storage persisted
   - Verify integrity check passes
   - Reload page
   - Verify product still exists

2. **Tally Operation Flow**
   - Navigate to home
   - Add product to tally
   - Verify validation passes
   - Verify item added
   - Verify total calculated correctly
   - Verify UI updates immediately
   - Refresh page
   - Verify tally resets (by design)

3. **Settings Change Flow**
   - Navigate to Settings
   - Change theme
   - Verify validation passes
   - Verify theme applies
   - Verify setting persisted
   - Reload page
   - Verify theme persists

### 2. Error Recovery Flow

**Test Scenarios:**

1. **Storage Recovery Flow**
   - Fill storage to limit
   - Attempt to add product
   - Verify storage error dialog appears
   - Click "Clear Storage"
   - Verify confirmation
   - Verify storage cleared
   - Verify app reloads
   - Verify app works without storage

2. **Data Repair Flow**
   - Manually corrupt data in IndexedDB
   - Reload app
   - Verify integrity check runs
   - Verify errors detected
   - Verify repairable actions shown
   - Execute repairs
   - Verify data repaired
   - Verify app works normally

## Cross-Browser Testing

### Browsers to Test

- Chrome/Edge 100+
- Firefox 100+
- Safari 15+ (macOS/iOS)
- Mobile browsers (Chrome Android, Safari iOS)

### Test Areas

1. **IndexedDB Compatibility**
   - Verify storage works across browsers
   - Test quota limits vary by browser
   - Test private browsing restrictions

2. **Error Boundary Behavior**
   - Verify errors caught in all browsers
   - Verify fallback UI displays correctly
   - Verify recovery actions work

3. **Toast Notifications**
   - Verify Sonner works across browsers
   - Test dark mode styling
   - Test mobile viewport

## Accessibility Testing

### Error Messages

**Test Scenarios:**

1. **Screen Reader**
   - Enable screen reader
   - Trigger error toast
   - Verify error message announced
   - Verify role and aria attributes

2. **Keyboard Navigation**
   - Trigger error dialog
   - Verify keyboard accessible
   - Verify focus management
   - Verify Tab order logical

### Color Contrast

**Test Scenarios:**

1. **Light Mode**
   - Verify error text contrast (WCAG AA)
   - Verify toast background contrast
   - Verify error boundary contrast

2. **Dark Mode**
   - Verify error text contrast in dark mode
   - Verify toast visibility
   - Verify error boundary visibility

## Security Testing

### Error Message Safety

**Test Scenarios:**

1. **XSS in Error Messages**
   - Inject script in error details
   - Verify script not executed
   - Verify HTML properly escaped

2. **Sensitive Data Exposure**
   - Check error store in DevTools
   - Verify no sensitive data in details
   - Verify passwords/keys not logged

## Regression Testing

### Previous Issues

1. **Regression Check**
   - Review past bug reports
   - Verify issues still handled
   - Verify improvements don't break old fixes

2. **Edge Cases**
   - Empty catalog
   - Large catalog (200+ products)
   - Empty tally
   - Large tally (1000+ items)
   - Rapid state changes
   - Concurrent operations

## Test Reporting

### Bug Report Template

When reporting validation/error handling bugs, include:

```
Browser: <version>
OS: <version>
Error Type: <validation/storage/business>
Severity: <low/medium/high/critical>
Steps to Reproduce:
1.
2.
3.

Expected Result: <what should happen>
Actual Result: <what actually happened>
Console Errors: <paste logs>
Error Store State: <from DevTools>
```

### Success Criteria

- ✅ All validation tests pass
- ✅ All error recovery flows work
- ✅ All toast notifications appear correctly
- ✅ All error boundaries catch errors
- ✅ All integrity checks detect issues
- ✅ All repairs succeed
- ✅ No console errors
- ✅ No memory leaks
- ✅ Cross-browser compatible
- ✅ Accessibility compliant
