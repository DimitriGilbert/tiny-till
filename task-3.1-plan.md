# Task 3.1 Implementation Plan: File Upload Interface with TypeScript Schema Definition

## Overview
Build complete file picker component with drag-and-drop support, file type validation (.json only), and basic file structure checks. Define comprehensive TypeScript interfaces for catalog data structure using Zod for runtime validation. Implement file reading, parsing, and initial syntax error handling with user-friendly feedback.

## Analysis
- Existing export functionality provides reference for data structures
- ImageUpload component provides drag-and-drop pattern to follow
- Catalog store uses Zod validation for product data
- Export format already defined in `packages/types/src/entities/export.ts`
- Validation schema for export exists in `packages/types/src/validation/export.ts`

## Implementation Steps

### Step 1: Create Import Types and Schemas
**File: `packages/types/src/entities/import.ts`**
- Define `CatalogImport` interface (alias to `CatalogExport`)
- Define `ImportValidationError` interface for error reporting
- Define `ImportResult` interface with success status and data/error

**File: `packages/types/src/validation/import.ts`**
- Import existing `catalogExportSchema` for validation
- Create `catalogImportSchema` as alias
- Create `validateCatalogImport()` function using Zod parsing
- Create `validateJSONSyntax()` for initial JSON syntax checking
- Create `checkFileStructure()` for basic structure validation
- Export types and validation functions

**File: `packages/types/src/index.ts`**
- Export all import-related types and functions

### Step 2: Create Import Utility Functions
**File: `packages/types/src/utils/import.ts`**
- `parseJSONFile(file: File): Promise<unknown>` - Read and parse JSON file
- `validateImportFile(data: unknown): ImportValidationResult` - Validate parsed data
- `checkFileExtension(file: File): boolean` - Validate .json extension
- `checkFileSize(file: File, maxSize: number): boolean` - Validate file size
- `createImportError(error: unknown): ImportValidationError` - Normalize errors

### Step 3: Create File Picker Component
**File: `apps/web/src/components/FilePicker.tsx`**
- Component interface:
  - `onFileSelect: (file: File) => void` - Callback for selected file
  - `disabled?: boolean` - Disable picker
  - `className?: string` - Styling
- Features:
  - Drag-and-drop zone with visual feedback (referencing ImageUpload pattern)
  - Click to browse files button
  - File type validation (.json only) via accept attribute
  - File size validation (e.g., max 10MB)
  - Loading state during file processing
  - Error display with user-friendly messages
  - Support for keyboard navigation (Enter/Space to trigger)
- State:
  - `isDragging` for drag-over visual feedback
  - `isProcessing` for loading state
  - `error` for display
- Events:
  - `onDragOver`, `onDragLeave`, `onDrop`
  - `onClick` for file input trigger
  - `onChange` for file input selection
- Accessibility:
  - ARIA labels for drop zone
  - Keyboard support
  - Screen reader announcements

### Step 4: Create Import Hook
**File: `apps/web/src/hooks/useCatalogImport.ts`**
- Hook interface:
  - `isImporting: boolean` - Loading state
  - `importError: string | null` - Error message
  - `validateImport: (file: File) => Promise<ImportValidationResult>` - Validate file
  - `parseImportFile: (file: File) => Promise<CatalogImport>` - Parse file
- Features:
  - File extension validation
  - File size validation
  - JSON syntax validation
  - Schema validation using Zod
  - User-friendly error messages
  - Toast notifications for feedback
- Error handling:
  - Invalid file extension
  - File too large
  - JSON parse errors
  - Schema validation errors
  - Missing required fields
- Use sonner for toast notifications

### Step 5: Create Import UI Component
**File: `apps/web/src/components/CatalogImport.tsx`**
- Component interface:
  - `onImport: (data: CatalogImport) => void` - Callback for successful import
  - `disabled?: boolean` - Disable import
- Features:
  - File picker integration
  - Validation progress display
  - Error display with actionable messages
  - Preview of import data (basic info only for this task)
  - Cancel button during processing
- State:
  - `selectedFile` - Currently selected file
  - `validationResult` - Validation status
  - `isProcessing` - Loading state
- Layout:
  - Card or modal-based design
  - File picker area
  - Status messages
  - Action buttons (Import, Cancel)
- Integration with FilePicker component

### Step 6: Update Catalog Page
**File: `apps/web/src/routes/settings.catalog.tsx`**
- Add "Import Catalog" button next to Export button
- Add state for import dialog visibility
- Add import dialog integration
- Connect CatalogImport component
- Handle successful import callback (placeholder for now - actual import logic in task 3.4)
- Add toast notifications for import success/errors

### Step 7: Add Download Helper (if not exists)
**File: `apps/web/src/lib/export/download.ts` (check if exists)**
- If exists, verify it handles export file generation
- If needed, ensure proper file download functionality

### Step 8: Testing and Validation
**Manual Testing Checklist:**
- File picker drag-and-drop functionality
- File picker click-to-browse functionality
- File type validation (reject non-JSON files)
- File size validation (reject oversized files)
- JSON syntax error handling (display user-friendly message)
- Schema validation error handling (display detailed issues)
- Loading states during processing
- Error state display and recovery
- Keyboard navigation accessibility
- Screen reader announcements

**Integration Testing:**
- Test with valid export file from existing export functionality
- Test with invalid JSON files
- Test with malformed export files
- Test with empty files
- Test with large files

### Step 9: Documentation
**Update Files:**
- `README.md` - Document import functionality (if applicable)
- Code comments - Add inline documentation for complex logic
- Component prop types - Ensure proper TypeScript documentation

## File Changes Summary

### New Files
1. `packages/types/src/entities/import.ts` - Import type definitions
2. `packages/types/src/validation/import.ts` - Import validation schemas
3. `packages/types/src/utils/import.ts` - Import utility functions
4. `apps/web/src/components/FilePicker.tsx` - File picker component
5. `apps/web/src/hooks/useCatalogImport.ts` - Import hook
6. `apps/web/src/components/CatalogImport.tsx` - Import UI component

### Modified Files
1. `packages/types/src/index.ts` - Export import types and functions
2. `apps/web/src/routes/settings.catalog.tsx` - Add import button and dialog

## Dependencies
- `zod` - Already installed, used for validation
- `lucide-react` - Already installed, for icons (Upload, FileText, etc.)
- `sonner` - Already installed, for toast notifications
- `@tiny-till/types` - Internal types package

## Technical Considerations

### Drag-and-Drop Pattern
- Reference `ImageUpload.tsx` implementation
- Use `dragover` event with `preventDefault()` to allow dropping
- Use `dragleave` with target checking to handle nested elements
- Use `drop` event to access `e.dataTransfer.files`

### File Validation
- Extension check: `file.name.endsWith('.json')`
- MIME type: `file.type === 'application/json'`
- Size check: `file.size <= MAX_FILE_SIZE`
- JSON parsing: `JSON.parse(fileContent)`

### Error Handling
- JSON parse errors: Catch `SyntaxError` from `JSON.parse()`
- Zod validation errors: Extract from `zodError.issues`
- File errors: Check `File` API error conditions
- Display user-friendly messages in UI components

### State Management
- Use React state for component-level state
- Use hooks for business logic (validation, parsing)
- Return validation results to parent component
- Actual import state updates will be handled in task 3.4

### Accessibility
- Use `aria-label` for file picker
- Use `aria-describedby` for help text
- Use `role="alert"` for error messages
- Support keyboard navigation
- Focus management after file selection

## Success Criteria
1. File picker component accepts .json files via drag-and-drop or click
2. File type validation rejects non-JSON files with clear message
3. File size validation rejects oversized files
4. JSON syntax errors are caught and displayed user-friendly
5. Schema validation uses existing Zod schema from export
6. Import hook provides validation results
7. Catalog page has Import button that opens import dialog
8. Toast notifications provide feedback on import validation
9. Components follow existing code patterns (ImageUpload, useCatalogExport)
10. TypeScript types are comprehensive and strict
11. No LSP errors
12. `npm run check-types` passes
13. `npm run build` passes

## Notes for Future Tasks
- This task handles file validation and parsing only
- Task 3.2 will enhance validation with detailed error reporting
- Task 3.3 will add import preview modal
- Task 3.4 will implement actual import execution and conflict resolution
- Task 3.5 will add comprehensive error handling
- Task 3.6 will implement backup reminder system
