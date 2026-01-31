# Task 2.7 Implementation Plan: JSON Export with Versioning and Data Integrity

## Overview

Create a comprehensive export system that generates timestamped JSON catalog files with version metadata, complete product data (including base64 images), price conversions, and data integrity checksums. Implement proper file naming conventions with timestamps, browser download mechanism, and validation to ensure export data integrity and format compliance.

## Requirements Analysis

From task specification:
- Generate timestamped JSON catalog files
- Include version metadata
- Include complete product data with base64 images
- Include price conversions
- Include data integrity checksums
- Implement proper file naming conventions with timestamps
- Build browser download mechanism
- Add validation to ensure export data integrity and format compliance

## Existing Infrastructure

### Already Available:
- **Product Type**: `Product` interface with id, name, price (cents), imageData, createdAt, updatedAt
- **Catalog Store**: Complete CRUD operations via `useCatalogStore`
- **Price Utilities**: `toCents()`, `toDollars()`, `formatPrice()`, `parsePrice()`
- **Validation**: `productSchema`, `productListSchema`, `validateProductList()`, `checkProductIntegrity()`
- **Integrity Checking**: `generateProductChecksum()`, `checkTimestampConsistency()`
- **UI Components**: Button, Dialog, Input, etc. from shadcn/ui
- **Toast Notifications**: sonner for user feedback

### What Needs to Be Created:
1. Export data structure/types
2. Export utility functions
3. Browser download mechanism
4. Export validation functions
5. Export button in catalog UI

## Implementation Plan

### Step 1: Define Export Data Types

**File**: `packages/types/src/entities/export.ts`

**Actions**:
- Create `CatalogExportMetadata` interface for version information
- Create `CatalogExport` interface combining metadata and product list
- Export these types from the package

**Type Definitions**:
```typescript
interface CatalogExportMetadata {
  version: string           // Format version (e.g., "1.0.0")
  format: string            // "tiny-till-catalog"
  exportedAt: number        // Unix timestamp
  productCount: number      // Number of products
  checksum: string          // Data integrity checksum
}

interface CatalogExport {
  meta: CatalogExportMetadata
  products: Product[]
}
```

**Dependencies**:
- Import `Product` from `./product.ts`
- No additional dependencies

### Step 2: Create Export Validation Utilities

**File**: `packages/types/src/validation/export.ts`

**Actions**:
- Create Zod schema for `CatalogExport`
- Create function to validate export format compliance
- Create function to verify checksum integrity

**Functions**:
- `catalogExportSchema`: Zod schema for full export validation
- `validateCatalogExport()`: Validates export structure and product data
- `verifyExportChecksum()`: Verifies checksum matches product data
- `generateExportChecksum()`: Creates checksum for export integrity

**Dependencies**:
- Use existing `productListSchema`
- Import `CatalogExport`, `CatalogExportMetadata` types
- Use crypto API or simple hash function for checksums

### Step 3: Create Export Utility Functions

**File**: `packages/types/src/utils/export.ts`

**Actions**:
- Create function to serialize catalog data for export
- Create function to generate proper filename with timestamp
- Create function to format export data structure

**Functions**:
- `serializeCatalogExport()`: Converts product list to export format with metadata
- `generateExportFilename()`: Creates filename like `catalog-2025-01-18-143022.json`
- `createExportData()`: Main export data creation function

**Dependencies**:
- Import `CatalogExport` type
- Import `ProductList` type
- Import existing validation functions
- Use existing timestamp utilities

### Step 4: Create Browser Download Utility

**File**: `apps/web/src/lib/export/download.ts`

**Actions**:
- Create function to trigger browser download
- Create blob from JSON string
- Create hidden link element for download
- Clean up after download

**Functions**:
- `downloadExportFile()`: Triggers browser download with proper MIME type
- Handles UTF-8 encoding
- Sets download filename
- Provides user feedback via toast on success/failure

**Dependencies**:
- Import `CatalogExport` type
- Import toast from sonner
- No external libraries needed (native browser APIs)

### Step 5: Create Export Service Hook

**File**: `apps/web/src/hooks/useCatalogExport.ts`

**Actions**:
- Create custom hook combining export and download
- Handle export preparation
- Handle validation before export
- Handle download triggering
- Provide loading and error states

**Hook Interface**:
```typescript
interface UseCatalogExportReturn {
  exportCatalog: () => Promise<void>
  isExporting: boolean
  exportError: string | null
}
```

**Dependencies**:
- Import `useCatalogStore` for product data
- Import export utilities from packages/types
- Import download utility
- Import toast for notifications
- Import existing validation functions

### Step 6: Integrate Export Button into Catalog UI

**File**: `apps/web/src/routes/settings.catalog.tsx`

**Actions**:
- Import and use `useCatalogExport` hook
- Add "Export Catalog" button to header section
- Disable button during export
- Show loading state
- Handle export errors gracefully

**UI Changes**:
- Add button next to "Add Product" button
- Use shadcn/ui Button component
- Add loading spinner or text during export
- Position in header flex container

**Dependencies**:
- Use existing `Button` component
- Use existing layout structure
- Import `useCatalogExport` hook

## File Structure Summary

### New Files:
```
packages/types/src/entities/export.ts          (Step 1)
packages/types/src/validation/export.ts        (Step 2)
packages/types/src/utils/export.ts             (Step 3)
apps/web/src/lib/export/download.ts            (Step 4)
apps/web/src/hooks/useCatalogExport.ts         (Step 5)
```

### Modified Files:
```
apps/web/src/routes/settings.catalog.tsx       (Step 6)
packages/types/src/index.ts                    (Export new types)
```

## Implementation Details

### Export Metadata Schema

**Version Format**: SemVer (major.minor.patch)
- Initial version: "1.0.0"
- Major: Breaking changes to export format
- Minor: Additions to metadata (backward compatible)
- Patch: Bug fixes

**Format Identifier**: "tiny-till-catalog"
- Constant string for format identification

### Checksum Algorithm

Use SHA-256 via Web Crypto API for robust integrity checking:
- Compute hash of JSON.stringify() of products array
- Include checksum in metadata
- Verify on import (future task)

**Fallback**: Simple hash function if Web Crypto unavailable
- Use `generateProductChecksum()` pattern as fallback

### Filename Convention

Format: `catalog-YYYY-MM-DD-HHMMSS.json`
- ISO 8601 date format for readability
- 24-hour time format
- Sortable chronologically
- Examples:
  - `catalog-2025-01-18-143022.json`
  - `catalog-2025-12-31-235959.json`

### Browser Download Process

1. Serialize export data to JSON string
2. Create Blob with MIME type `application/json`
3. Create temporary anchor element with download attribute
4. Programmatically click anchor to trigger download
5. Remove anchor element
6. Show success toast to user

### Validation Strategy

**Before Export**:
- Validate all products in catalog using `validateProductList()`
- Check for data integrity issues
- Calculate and embed checksum
- Ensure all required fields present

**Export Format Validation**:
- Use Zod schema for structure validation
- Verify version format
- Verify timestamp validity
- Verify checksum matches data

## Error Handling

### Export Errors:
- Empty catalog (no products)
- Validation failures on products
- Checksum generation failures
- JSON serialization errors
- Download initiation errors

### User Feedback:
- Clear error messages via toast
- Include details on validation failures
- Suggest corrective actions
- Success confirmation with file info

## Testing Considerations

### Unit Tests (Future):
- Test export data structure generation
- Test filename generation with various timestamps
- Test checksum generation and verification
- Test validation functions

### Manual Testing:
- Export empty catalog (should handle gracefully)
- Export single product
- Export large catalog (100+ products)
- Export products with images
- Export products without images
- Test download on different browsers
- Verify JSON file format is correct
- Verify checksum matches data
- Verify filename timestamp is correct

## Integration with Future Tasks

### Task 3.x (Import System):
- Export format will be import format
- Validation functions reused for import
- Checksum verification on import
- Version compatibility checking

### Task 2.8 (UI Polish):
- Export button styling consistency
- Loading states polish
- Error message refinement

## Success Criteria

1. ✅ Export button visible in catalog UI
2. ✅ Clicking export generates JSON file download
3. ✅ File has proper timestamped filename
4. ✅ JSON includes version metadata
5. ✅ JSON includes all product data with images
6. ✅ JSON includes integrity checksum
7. ✅ Validation passes before export
8. ✅ Export works with empty catalog (shows appropriate message)
9. ✅ Export works with large catalogs
10. ✅ User receives feedback on success/failure

## Order of Implementation

1. **Step 1**: Define export types (packages/types/src/entities/export.ts)
2. **Step 2**: Create export validation (packages/types/src/validation/export.ts)
3. **Step 3**: Create export utilities (packages/types/src/utils/export.ts)
4. **Step 4**: Create browser download utility (apps/web/src/lib/export/download.ts)
5. **Step 5**: Create export hook (apps/web/src/hooks/useCatalogExport.ts)
6. **Step 6**: Update types index to export new entities
7. **Step 7**: Integrate export button into catalog UI
8. **Testing**: Manual testing of all scenarios

## Notes

- No external dependencies required
- Uses existing infrastructure where possible
- Prepares data for future import functionality
- Maintains type safety throughout
- Follows existing code style conventions
