# Implementation Plan: Import Preview Modal with Data Analysis and Breakdown

## Task Overview

Create a responsive preview modal that displays detailed import analysis including:
- Count of products to be added vs updated
- Side-by-side comparison of changes
- Conflict indicators
- Data comparison logic matching products by ID
- User confirmation flow with visual indicators
- Ability to review all changes before proceeding

## Current State Analysis

### Existing Components
- `CatalogImport.tsx` - Basic import dialog with file picker and validation
- `useCatalogImport.ts` - Hook handling import validation and parsing
- `catalog-store.ts` - Zustand store with CRUD operations
- `Product` types - Defined in `@tiny-till/types` package
- Validation system - Zod-based validation already implemented

### Known Issues/Gaps
- No preview of changes before import
- No comparison between existing and incoming products
- No categorization of changes (add vs update)
- No visual indicators for conflicts
- No user confirmation flow with detailed breakdown

## Implementation Plan

### Phase 1: Type Definitions and Data Comparison Logic

#### Step 1.1: Define Import Analysis Types
**File:** `packages/types/src/entities/import.ts`

Add new type definitions for import analysis:
```typescript
export type ProductChangeType = 'add' | 'update' | 'conflict' | 'unchanged'

export interface ProductChange {
  productId: string
  changeType: ProductChangeType
  existingProduct?: Product
  newProduct: Product
  changedFields?: string[]
  isConflict: boolean
  conflictType?: 'version' | 'data' | 'id'
}

export interface ImportAnalysis {
  totalProducts: number
  productsToAdd: Product[]
  productsToUpdate: Array<{
    existing: Product
    updated: Product
    changedFields: string[]
  }>
  productsInConflict: ProductChange[]
  unchangedProducts: number
}

export interface ImportPreviewData {
  file: File
  importData: CatalogImport
  analysis: ImportAnalysis
  allChanges: ProductChange[]
}
```

#### Step 1.2: Implement Data Comparison Logic
**File:** `packages/types/src/utils/import-comparison.ts` (NEW)

Create utility functions for comparing products:
```typescript
export function compareProductsForImport(
  existingProducts: Product[],
  importData: CatalogImport
): ImportAnalysis

export function detectProductChanges(
  existing: Product,
  incoming: Product
): string[] | null

export function categorizeProductChange(
  existingProducts: Product[],
  incomingProduct: Product
): ProductChange

export function generateChangeSummary(analysis: ImportAnalysis): {
  adds: number
  updates: number
  conflicts: number
  unchanged: number
}
```

Key comparison logic:
1. Match products by ID
2. Compare all fields (name, price, imageData, timestamps)
3. Identify changed fields
4. Detect conflicts (version mismatches, ID collisions, data inconsistencies)
5. Categorize as add, update, conflict, or unchanged

### Phase 2: Import Preview Modal Component

#### Step 2.1: Create ImportPreview Modal Component
**File:** `apps/web/src/components/ImportPreview.tsx` (NEW)

Component structure:
```typescript
export interface ImportPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previewData: ImportPreviewData | null
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ImportPreview({
  open,
  onOpenChange,
  previewData,
  onConfirm,
  onCancel,
  isLoading = false,
}: ImportPreviewProps) {
  // State management for filtering, searching, selecting changes
  // Modal UI with summary, change list, and confirmation flow
}
```

Modal features:
1. Summary section showing counts (added, updated, conflicts, unchanged)
2. Tabbed or filtered view of changes by type
3. Search/filter functionality for large imports
4. Expandable details for each change
5. Selection controls to include/exclude specific changes

#### Step 2.2: Create Change Summary Component
**File:** `apps/web/src/components/ImportChangeSummary.tsx` (NEW)

Display visual summary of import impact:
```typescript
export interface ImportChangeSummaryProps {
  analysis: ImportAnalysis
}

export function ImportChangeSummary({ analysis }: ImportChangeSummaryProps) {
  // Grid of cards showing counts
  // Color-coded badges for different change types
  // Progress indicators
}
```

Visual elements:
- Cards with icons for each category (add, update, conflict)
- Badge components showing counts
- Color coding (green=add, blue=update, red=conflict, gray=unchanged)
- Progress bar or circular indicator of total changes

#### Step 2.3: Create Product Change Card Component
**File:** `apps/web/src/components/ProductChangeCard.tsx` (NEW)

Display individual product changes:
```typescript
export interface ProductChangeCardProps {
  change: ProductChange
  expanded?: boolean
  onToggleExpand?: () => void
  onSelectChange?: (selected: boolean) => void
  selected?: boolean
}

export function ProductChangeCard({
  change,
  expanded = false,
  onToggleExpand,
  onSelectChange,
  selected = true,
}: ProductChangeCardProps) {
  // Collapsible card showing change type
  // Side-by-side comparison when expanded
  // Field-by-field diff view
  // Checkbox for selective import
}
```

Card features:
1. Change type badge (add, update, conflict)
2. Product name and ID
3. Conflict warning indicator
4. Expandable section showing:
   - Field-by-field comparison (old value vs new value)
   - Visual diff indicators (colors, strikethrough, highlights)
   - Changed field badges
5. Selection checkbox for granular control

#### Step 2.4: Create Side-by-Side Comparison Component
**File:** `apps/web/src/components/ProductFieldComparison.tsx` (NEW)

Display field-level comparisons:
```typescript
export interface ProductFieldComparisonProps {
  existing: Product | undefined
  incoming: Product
  changedFields?: string[]
}

export function ProductFieldComparison({
  existing,
  incoming,
  changedFields,
}: ProductFieldComparisonProps) {
  // Table or grid layout showing field comparisons
  // Color-coded changes
  // Image comparison for imageData field
  // Price formatting
}
```

Features:
1. Table format: Field | Existing Value | New Value
2. Changed fields highlighted
3. Visual indicators for different field types
4. Image preview comparison (if images changed)
5. Price formatting in cents display

#### Step 2.5: Create Conflict Resolution Banner
**File:** `apps/web/src/components/ImportConflictBanner.tsx` (NEW)

Display conflict information:
```typescript
export interface ImportConflictBannerProps {
  conflicts: ProductChange[]
  onResolve?: (conflictId: string) => void
}

export function ImportConflictBanner({
  conflicts,
  onResolve,
}: ImportConflictBannerProps) {
  // Warning banner at top of modal
  // List of conflicts with severity indicators
  // Resolution options (replace, skip, merge)
}
```

Banner features:
1. Prominent warning icon and color
2. Count of conflicts
3. Quick action buttons
4. Expandable conflict details

### Phase 3: Integration with Existing Import Flow

#### Step 3.1: Update useCatalogImport Hook
**File:** `apps/web/src/hooks/useCatalogImport.ts`

Add preview functionality:
```typescript
export interface UseCatalogImportReturn {
  // Existing...
  analyzeImport: (file: File, existingProducts: Product[]) => Promise<ImportPreviewData>
}

// Add analyzeImport method that:
// 1. Parses the file
// 2. Validates the data
// 3. Compares with existing products
// 4. Returns ImportPreviewData with analysis
```

#### Step 3.2: Update CatalogImport Component
**File:** `apps/web/src/components/CatalogImport.tsx`

Integrate preview modal:
1. After file validation, show preview modal instead of immediate import
2. Pass preview data to ImportPreview component
3. Handle user selection of changes to import
4. On confirmation, execute import with selected changes

Changes:
```typescript
// Add state for preview data
const [previewData, setPreviewData] = React.useState<ImportPreviewData | null>(null)

// Update handleFileSelect to analyze instead of just validate
// Add render condition for ImportPreview modal
```

#### Step 3.3: Add Selective Import Logic to Catalog Store
**File:** `apps/web/src/stores/catalog-store.ts`

Add methods for selective import:
```typescript
interface CatalogActions {
  // Existing...
  importWithPreview: (
    previewData: ImportPreviewData,
    selectedChanges: ProductChange[]
  ) => Promise<{ added: number; updated: number; skipped: number }>
}
```

Implementation:
1. Filter changes based on user selection
2. Execute adds and updates separately
3. Handle conflicts based on user choices
4. Return summary of actions performed

### Phase 4: UI Polish and Responsive Design

#### Step 4.1: Implement Responsive Layout
**File:** `apps/web/src/components/ImportPreview.tsx`

Ensure modal works on all screen sizes:
- Mobile: Stacked layout, smaller cards, horizontal scrolling for comparisons
- Tablet: Balanced layout, moderate spacing
- Desktop: Full-featured side-by-side view, maximum detail

Responsive breakpoints:
- `sm` (640px+): Side-by-side field comparisons
- `md` (768px+): Multiple columns in summary
- `lg` (1024px+): Full preview with all features

#### Step 4.2: Add Visual Indicators and Animations
**File:** Various component files

Enhance UX with visual feedback:
1. Loading states during analysis
2. Animated transitions for expand/collapse
3. Hover effects on change cards
4. Progress indicators for large imports
5. Toast notifications for actions

#### Step 4.3: Accessibility Enhancements
**File:** All new components

Ensure accessibility:
1. Keyboard navigation for all interactive elements
2. ARIA labels for changes and comparisons
3. Focus management for modal
4. Screen reader announcements for summaries
5. High contrast support

### Phase 5: Testing and Validation

#### Step 5.1: Create Comparison Logic Tests
**File:** `packages/types/src/utils/import-comparison.test.ts` (NEW)

Unit tests for:
- Product matching by ID
- Change detection (field-level comparison)
- Conflict detection
- Analysis generation
- Edge cases (missing IDs, corrupt data, etc.)

#### Step 5.2: Create Integration Tests
**File:** `apps/web/src/components/__tests__/ImportPreview.test.tsx` (NEW)

Integration tests for:
- Modal opening/closing
- Data display
- User interactions (select, expand, filter)
- Confirmation flow
- Cancellation flow

#### Step 5.3: Manual Testing Scenarios
1. Small import (1-5 products)
2. Large import (50+ products)
3. All new products
4. All existing products (updates only)
5. Mixed new and existing
6. Conflicts present
7. Empty import file
8. Corrupted data after validation

### Phase 6: Documentation

#### Step 6.1: Update Component Documentation
Add JSDoc comments to all new components explaining:
- Props and their purposes
- Usage examples
- Behavior notes

#### Step 6.2: Update Store Documentation
Document new store methods:
- `importWithPreview` parameters and return values
- Edge case handling
- Error scenarios

## File Changes Summary

### New Files to Create
1. `packages/types/src/entities/import.ts` - Add analysis types
2. `packages/types/src/utils/import-comparison.ts` - Comparison logic
3. `apps/web/src/components/ImportPreview.tsx` - Main preview modal
4. `apps/web/src/components/ImportChangeSummary.tsx` - Summary display
5. `apps/web/src/components/ProductChangeCard.tsx` - Individual change card
6. `apps/web/src/components/ProductFieldComparison.tsx` - Field comparison view
7. `apps/web/src/components/ImportConflictBanner.tsx` - Conflict warnings

### Files to Modify
1. `apps/web/src/components/CatalogImport.tsx` - Integrate preview modal
2. `apps/web/src/hooks/useCatalogImport.ts` - Add analysis method
3. `apps/web/src/stores/catalog-store.ts` - Add selective import
4. `packages/types/src/index.ts` - Export new types and utilities

### Test Files to Create
1. `packages/types/src/utils/import-comparison.test.ts`
2. `apps/web/src/components/__tests__/ImportPreview.test.tsx`

## Implementation Order

1. **Phase 1** (Foundation): Types and comparison logic
2. **Phase 2** (UI Components): All modal subcomponents
3. **Phase 3** (Integration): Hook and store updates, main modal
4. **Phase 4** (Polish): Responsive design and accessibility
5. **Phase 5** (Testing): Unit and integration tests
6. **Phase 6** (Documentation): Code documentation

## Success Criteria

1. ✅ Preview modal displays accurate counts of products to add/update
2. ✅ Side-by-side comparison shows all field changes clearly
3. ✅ Conflict indicators are prominent and actionable
4. ✅ User can review all changes before proceeding
5. ✅ Confirmation flow prevents accidental imports
6. ✅ Responsive design works on mobile, tablet, and desktop
7. ✅ All TypeScript types are strict (no `any`)
8. ✅ Code passes linting and type checking (`npm run check-types`)
9. ✅ Build succeeds without errors (`npm run build`)
10. ✅ Accessibility requirements met (keyboard navigation, ARIA labels)

## Edge Cases to Handle

1. **Empty import file** - Show appropriate message
2. **All products unchanged** - Skip confirmation, show message
3. **Only conflicts** - Highlight warning prominently
4. **Large imports** (100+ products) - Add pagination or virtual scrolling
5. **No existing products** - Show all as additions
6. **Image data changes** - Show image previews
7. **Price changes** - Format as currency, highlight clearly
8. **ID collisions** - Mark as conflict with resolution options
9. **Version mismatch** - Show warning with upgrade/downgrade recommendation
10. **User cancels mid-analysis** - Clean up state properly

## Dependencies

### Existing Dependencies
- React 19
- Zustand (for state management)
- Zod (for validation)
- shadcn/ui components (Dialog, Badge, Button, etc.)
- @base-ui/react (Dialog primitive)
- lucide-react (icons)
- sonner (toasts)

### No New External Dependencies Required

All required functionality can be built using existing packages.

## Notes

- Use `cn()` utility from `@/lib/utils` for class merging
- Follow existing component patterns (props destructuring, named exports)
- Use `Product` type from `@tiny-till/types`
- Maintain strict type safety - no `any` types
- Use existing color palette and spacing from Tailwind theme
- Ensure dark mode support via existing theme system
- Use existing toast notification system via `sonner`
