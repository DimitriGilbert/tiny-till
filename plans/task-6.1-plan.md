# Implementation Plan: Virtual Scrolling for Large Catalogs (Task 6.1)

## Overview

This plan outlines the implementation of virtual scrolling for product catalogs to handle 100+ products smoothly without jank. We'll use `@tanstack/react-virtual` to create an optimized virtualized grid system that renders only visible items.

## Current State Analysis

**Existing Implementation:**
- `ProductList` component (apps/web/src/components/product-list.tsx:20-181) renders all products using standard mapping
- Grid layout with responsive columns (2-8 columns based on screen size)
- Product cards with images, names, prices, and action buttons
- Search filtering with keyboard navigation support
- Uses `useResponsiveGrid` hook for responsive column calculation
- Uses `useKeyboardNavigation` hook for keyboard navigation

**Performance Bottlenecks:**
- All products rendered simultaneously, causing DOM bloat with large catalogs (100+ items)
- No item recycling or windowing
- Each ProductCard maintains React state even when off-screen
- Search still requires full array scan (acceptable for now)

## Implementation Goals

1. **Smooth scrolling** for 100+ products with zero jank
2. **Dynamic item measurement** to handle variable-height product cards
3. **Responsive grid** that adapts to window resizing
4. **Keyboard navigation** preserved in virtualized context
5. **Scroll restoration** when navigating back
6. **Loading states** maintained during hydration/updates
7. **Minimal refactoring** of existing ProductCard component

## Architecture

### Component Hierarchy

```
VirtualizedProductGrid (NEW)
  ├── VirtualGridContainer (NEW - uses useVirtualizer)
  │   ├── VirtualRow (NEW - wraps grid row)
  │   │   └── ProductCard (existing, minimal changes)
  └── Search/Filter UI (existing, moved up)
```

### Key Components

1. **VirtualizedProductGrid** - Main component replacing ProductList
2. **VirtualGridContainer** - Core virtualization logic
3. **useVirtualGrid** - Hook managing virtual scrolling state
4. **VirtualRow** - Row wrapper component for proper measurement

## Detailed Implementation Steps

### Step 1: Install Dependencies

**File:** apps/web/package.json
- Add `@tanstack/react-virtual` to dependencies

**Actions:**
```bash
npm install @tanstack/react-virtual
```

**Verification:**
- Install completes without errors
- Package appears in package.json dependencies

---

### Step 2: Create useVirtualGrid Hook

**File:** apps/web/src/hooks/useVirtualGrid.ts (NEW)

**Purpose:** Manage virtual scrolling state, measurements, and row calculations

**Implementation Details:**

```typescript
interface UseVirtualGridProps {
  items: Product[]
  columnCount: number
  estimatedItemHeight: number
  overscan?: number
}

interface VirtualGridState {
  rowVirtualizer: UseVirtualizerReturn<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  totalRows: number
  getRowProducts: (rowIndex: number) => Product[]
  getRowHeight: (rowIndex: number) => number
}
```

**Key Functions:**

1. **calculateRowProducts()** - Map products to rows based on column count
2. **estimateRowHeight()** - Calculate estimated height based on density settings
3. **updateMeasurements()** - Handle dynamic height updates when cards render
4. **handleResize()** - Debounced resize handler for window/column changes

**Integration Points:**
- Uses `@tanstack/react-virtual`'s `useVirtualizer` hook
- Returns row index, start position, and size for each virtual row
- Provides ref callback for container measurement

---

### Step 3: Create VirtualGridContainer Component

**File:** apps/web/src/components/virtual-grid-container.tsx (NEW)

**Purpose:** Core virtualization component that renders only visible rows

**Key Features:**

1. **Container Setup**
   - Fixed height container with overflow-y-auto
   - Proper padding for scroll bar
   - ARIA roles for accessibility

2. **Virtual Row Rendering**
   - Render rows using virtualizer.getVirtualItems()
   - Apply absolute positioning via transform styles
   - Handle dynamic row heights via size measurement

3. **Measurement Callback**
   - Register ref callback for each rendered row
   - Track actual heights and update virtualizer
   - Debounce updates to prevent layout thrashing

4. **Accessibility**
   - Maintain proper ARIA roles and labels
   - Ensure keyboard navigation works through virtualized items
   - Announce virtual scrolling position to screen readers

**Implementation Skeleton:**

```typescript
interface VirtualGridContainerProps {
  items: Product[]
  columnCount: number
  gridGap: string
  renderProduct: (product: Product, index: number) => React.ReactNode
  overscan?: number
  isLoading?: boolean
}
```

**Styling:**
- Use absolute positioning for rows
- Transform for smooth GPU acceleration
- Smooth scrolling enabled
- Preserve existing grid gap classes

---

### Step 4: Create VirtualRow Component

**File:** apps/web/src/components/virtual-row.tsx (NEW)

**Purpose:** Lightweight wrapper for each grid row

**Responsibilities:**

1. **Positioning**
   - Apply transform based on virtual row data
   - Handle row height (estimated or measured)

2. **Measurement**
   - Register height with parent container
   - Update when layout changes (images loading, etc.)

3. **Keyboard Navigation**
   - Ensure tab order is preserved
   - Support arrow key navigation across rows

**Implementation:**

```typescript
interface VirtualRowProps {
  row: VirtualItem
  products: Product[]
  columnCount: number
  gridGap: string
  renderProduct: (product: Product, index: number) => React.ReactNode
  onMeasure?: (height: number) => void
}
```

---

### Step 5: Create VirtualizedProductGrid Component

**File:** apps/web/src/components/virtualized-product-grid.tsx (NEW)

**Purpose:** Main replacement for ProductList with virtualization

**Features:**

1. **Search Integration**
   - Preserve existing search UI and logic
   - Filter products before virtualization

2. **Loading States**
   - Show skeletons during initial load
   - Handle hydration state from catalog-store

3. **Empty State**
   - Preserve existing EmptyState component
   - Show when filtered results are empty

4. **Keyboard Navigation**
   - Integrate with existing `useKeyboardNavigation` hook
   - Adapt for virtualized rows (calculate row/col from index)

5. **Focus Management**
   - Maintain focused item state across virtualization
   - Scroll focused item into view when needed

**Component Structure:**

```typescript
interface VirtualizedProductGridProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
  onAddProduct?: () => void
}
```

**Key Implementation:**

```typescript
function VirtualizedProductGrid({ onEdit, onDelete, isLoading: externalLoading, onAddProduct }: VirtualizedProductGridProps) {
  const { products, searchProducts, isLoading, hasHydrated } = useCatalogStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const { columnCount, gridGap, isCompact } = useResponsiveGrid()

  const filteredProducts = searchProducts(searchQuery)
  const productMap = React.useRef<Map<string, HTMLElement>>(new Map())

  // Calculate estimated row height based on density
  const estimatedRowHeight = isCompact ? 180 : 240

  // Virtual grid setup
  const {
    containerRef,
    rowVirtualizer,
    totalRows,
    getRowProducts,
  } = useVirtualGrid({
    items: filteredProducts,
    columnCount,
    estimatedItemHeight: estimatedRowHeight,
    overscan: 3,
  })

  // Rest of component logic...
}
```

---

### Step 6: Update ProductList Component

**File:** apps/web/src/components/product-list.tsx

**Changes:**

**Option A (Recommended): Deprecate ProductList**
- Rename existing component to `ProductListLegacy`
- Keep for backward compatibility during testing
- Create new `ProductList` that conditionally renders virtualized version

**Option B: Replace ProductList**
- Completely replace `ProductList` with `VirtualizedProductGrid`
- Update all imports (only in `settings.catalog.tsx` currently)

**Recommended Approach:** Option A for safer rollout

---

### Step 7: Update Catalog Route

**File:** apps/web/src/routes/settings.catalog.tsx

**Changes:**
- Update import from ProductList to VirtualizedProductGrid (if using Option B)
- Or add feature flag for virtualized version (if using Option A)

**Implementation:**

```typescript
import { VirtualizedProductGrid } from '@/components/virtualized-product-grid'

// Replace ProductList with VirtualizedProductGrid
<VirtualizedProductGrid
  onEdit={handleEditProduct}
  onDelete={handleDeleteProduct}
  onAddProduct={handleAddProduct}
/>
```

---

### Step 8: Keyboard Navigation Adaptation

**File:** apps/web/src/hooks/use-keyboard-navigation.ts

**Modifications Needed:**

1. **Adapt for Virtualization**
   - Update to work with virtualized row indices
   - Calculate global index from row/col position

2. **New Props Interface:**

```typescript
interface UseKeyboardNavigationProps<T> {
  items: T[]
  itemId: (item: T) => string
  onItemSelect?: (item: T) => void
  getItemElement?: (id: string) => HTMLElement | null
  columnCount: number
  totalRows: number // NEW
  getRowProducts?: (rowIndex: number) => T[] // NEW
  enabled?: boolean
}
```

3. **Navigation Logic Updates:**
   - Arrow Up/Down: Move between rows (respect virtual row bounds)
   - Arrow Left/Right: Move within row
   - Home/End: Navigate to first/last item in virtual list

---

### Step 9: Scroll Position Restoration

**File:** apps/web/src/hooks/useVirtualGrid.ts

**Implementation:**

1. **Add Scroll Persistence**
   - Store scroll position in session storage
   - Restore on component mount

2. **Route Change Handling**
   - Save scroll position before navigation
   - Restore when returning to catalog route

3. **Implementation:**

```typescript
const SCROLL_POSITION_KEY = 'catalog-scroll-position'

function saveScrollPosition(scrollTop: number) {
  sessionStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString())
}

function restoreScrollPosition(): number | null {
  const saved = sessionStorage.getItem(SCROLL_POSITION_KEY)
  return saved ? parseInt(saved, 10) : null
}
```

---

### Step 10: Dynamic Height Handling

**Challenge:** Product cards have variable heights due to:
- Images with different aspect ratios
- Product names with varying line counts
- Price formatting differences

**Solution:**

1. **Initial Estimate**
   - Use conservative height estimate based on density
   - Normal density: 240px per row
   - Compact density: 180px per row

2. **Measurement Update**
   - After each row renders, measure actual height
   - Update virtualizer measurements via `rowVirtualizer.measure()`
   - Use ResizeObserver for image load events

3. **Implementation in VirtualRow:**

```typescript
React.useEffect(() => {
  if (rowRef.current) {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        onMeasure?.(height)
      }
    })

    observer.observe(rowRef.current)

    return () => observer.disconnect()
  }
}, [onMeasure])
```

---

### Step 11: Window Resizing Support

**File:** apps/web/src/hooks/useVirtualGrid.ts

**Implementation:**

1. **Column Count Changes**
   - Watch for column count changes from useResponsiveGrid
   - Recalculate total rows when column count changes
   - Update virtualizer measurements

2. **Resize Handler:**

```typescript
React.useEffect(() => {
  const handleResize = () => {
    rowVirtualizer.scrollToIndex(0)
  }

  window.addEventListener('resize', handleResize, { passive: true })

  return () => window.removeEventListener('resize', handleResize)
}, [columnCount])
```

---

### Step 12: Image Loading Optimization

**File:** apps/web/src/components/product-card.tsx

**Changes Needed:**

1. **Lazy Loading Enhancement**
   - Ensure `loading="lazy"` is on all images (already present)
   - Add IntersectionObserver for images near viewport

2. **Measurement Trigger**
   - After image loads, trigger row measurement update
   - Use `onLoad` callback to notify parent VirtualRow

3. **Implementation:**

```typescript
const handleImageLoad = React.useCallback(() => {
  // Notify parent row to remeasure
  if (rowRef.current) {
    const height = rowRef.current.getBoundingClientRect().height
    onMeasure?.(height)
  }
}, [onMeasure])
```

---

### Step 13: Loading States for Virtual List

**File:** apps/web/src/components/virtualized-product-grid.tsx

**Implementation:**

1. **Initial Load Skeleton**
   - Show placeholder rows while data hydrates
   - Match expected row count for smooth transition

2. **Skeleton Component:**

```typescript
function VirtualGridSkeleton({ columnCount, rowHeight, rows = 6 }: SkeletonProps) {
  return (
    <div className="grid gap-4 grid-cols-N">
      {Array.from({ length: rows * columnCount }).map((_, i) => (
        <div key={`skeleton-${i}`} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-square" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
```

3. **Loading Logic:**

```typescript
if (!hasHydrated || externalLoading || isLoading) {
  return <VirtualGridSkeleton columnCount={columnCount} rowHeight={estimatedRowHeight} />
}
```

---

### Step 14: Performance Testing & Optimization

**Testing Checklist:**

1. **Small Catalog (10-20 items)**
   - Smooth scrolling
   - No flickering
   - Proper focus management

2. **Medium Catalog (50-100 items)**
   - Consistent performance
   - No jank on scroll
   - Fast navigation

3. **Large Catalog (100+ items)**
   - Stable 60fps scrolling
   - Memory efficiency (check DevTools)
   - Initial render time under 500ms

4. **Extreme Catalog (500+ items)**
   - Still performant (virtualization shines)
   - No memory leaks
   - Smooth search/filter

**Optimization Tasks:**

1. **Profile with React DevTools**
   - Check unnecessary re-renders
   - Verify component memoization
   - Identify bottlenecks

2. **Chrome DevTools Performance**
   - Record scrolling performance
   - Check layout thrashing
   - Verify GPU acceleration

3. **Memory Profiling**
   - Check for memory leaks
   - Verify item cleanup
   - Monitor closure size

---

### Step 15: Accessibility Testing

**Checklist:**

1. **Screen Reader Support**
   - Announce item count
   - Proper ARIA labels
   - Scroll position announcements

2. **Keyboard Navigation**
   - Tab order preserved
   - Arrow keys work across virtualized rows
   - Enter/Space to select items

3. **Focus Management**
   - Focus stays on visible items
   - Scroll to focused item when navigating
   - Proper focus restoration after navigation

---

### Step 16: Edge Cases & Error Handling

**Scenarios to Handle:**

1. **Empty Catalog**
   - Show EmptyState component (existing)
   - No virtualizer needed

2. **Single Product**
   - Grid still works
   - No special cases needed

3. **Zero Search Results**
   - Show "No products found" state
   - Clear search button available

4. **Rapid Filtering**
   - Debounce search input (150ms)
   - Cancel in-progress measurements

5. **Image Load Failures**
   - Show placeholder instead of broken image
   - Don't affect row measurement

6. **Column Count Override**
   - Settings can override automatic column count
   - Virtualizer adapts immediately

---

### Step 17: TypeScript Types

**File:** apps/web/src/types/virtual-grid.ts (NEW)

**Type Definitions:**

```typescript
import type { VirtualItem } from '@tanstack/react-virtual'
import type { UseVirtualizerReturn } from '@tanstack/react-virtual'
import type { Product } from '@tiny-till/types'

export interface VirtualGridRowData {
  index: number
  start: number
  size: number
  products: Product[]
}

export interface VirtualGridOptions {
  items: Product[]
  columnCount: number
  estimatedItemHeight: number
  overscan?: number
}

export interface UseVirtualGridReturn {
  containerRef: React.RefObject<HTMLDivElement>
  rowVirtualizer: UseVirtualizerReturn<HTMLDivElement>
  totalRows: number
  getRowProducts: (rowIndex: number) => Product[]
}
```

---

### Step 18: Testing

**Unit Tests:**

1. **useVirtualGrid Hook**
   - Row calculation with different column counts
   - Measurement updates
   - Resize handling

**Integration Tests:**

1. **VirtualizedProductGrid Component**
   - Renders correct items in viewport
   - Handles search filtering
   - Maintains keyboard navigation

2. **VirtualRow Component**
   - Measures and reports height
   - Renders correct number of products

**Manual Testing:**

1. Test with 10, 50, 100, 500 products
2. Test on mobile, tablet, desktop
3. Test with/without images
4. Test keyboard navigation
5. Test search functionality

---

### Step 19: Documentation

**Files to Update:**

1. **Component Documentation** (if exists)
   - Add VirtualizedProductGrid to component docs
   - Document props and usage

2. **README.md** (if applicable)
   - Note virtual scrolling implementation
   - Performance characteristics

---

### Step 20: Validation & Rollout

**Validation Steps:**

1. **Type Checking**
   ```bash
   npm run check-types
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **LSP Errors**
   - Fix any TypeScript errors in IDE
   - Ensure all imports are correct

4. **Manual Smoke Test**
   - Start app (DO NOT run dev server in CI)
   - Navigate to catalog
   - Add 100+ test products
   - Verify smooth scrolling

---

## File Changes Summary

### New Files Created

1. `apps/web/src/hooks/useVirtualGrid.ts` - Virtual scrolling state management
2. `apps/web/src/components/virtual-grid-container.tsx` - Core virtualization component
3. `apps/web/src/components/virtual-row.tsx` - Row wrapper for measurement
4. `apps/web/src/components/virtualized-product-grid.tsx` - Main virtualized grid component
5. `apps/web/src/types/virtual-grid.ts` - TypeScript types for virtualization

### Modified Files

1. `apps/web/package.json` - Add @tanstack/react-virtual dependency
2. `apps/web/src/components/product-list.tsx` - Deprecate or replace
3. `apps/web/src/routes/settings.catalog.tsx` - Import virtualized component
4. `apps/web/src/hooks/use-keyboard-navigation.ts` - Adapt for virtualization (optional enhancement)
5. `apps/web/src/components/product-card.tsx` - Add image load callback (optional optimization)

### Files Preserved (No Changes)

- `apps/web/src/stores/catalog-store.ts` - No changes needed
- `apps/web/src/hooks/useResponsiveGrid.ts` - No changes needed
- `apps/web/src/stores/settings-store.ts` - No changes needed
- All shadcn/ui components - No changes needed

---

## Implementation Order (Priority)

**Phase 1: Core Virtualization (Required)**
1. Install @tanstack/react-virtual
2. Create useVirtualGrid hook
3. Create VirtualGridContainer component
4. Create VirtualRow component
5. Create VirtualizedProductGrid component
6. Update ProductList (deprecate)
7. Update catalog route

**Phase 2: Enhancements (Recommended)**
8. Keyboard navigation adaptation
9. Scroll position restoration
10. Dynamic height handling
11. Window resizing support

**Phase 3: Optimizations (Nice to Have)**
12. Image loading optimization
13. Loading states refinement
14. Performance testing & optimization
15. Accessibility testing

**Phase 4: Polish (Optional)**
16. Edge cases & error handling
17. TypeScript types
18. Testing
19. Documentation
20. Validation & rollout

---

## Success Criteria

✅ **Performance**
- Smooth 60fps scrolling with 100+ products
- Initial render time < 500ms
- Memory usage stable with 500+ products
- No layout thrashing on scroll

✅ **Functionality**
- All existing features work (search, filter, edit, delete)
- Keyboard navigation preserved
- Responsive grid adapts to screen size
- Scroll position restored on navigation

✅ **User Experience**
- No visual flickering
- Seamless item appearance/disappearance
- Loading states clear
- Empty states handled gracefully

✅ **Code Quality**
- TypeScript strict mode passes
- No LSP errors
- Follows project conventions
- Proper error handling

✅ **Accessibility**
- Screen reader compatible
- Keyboard navigation works
- Focus management correct
- ARIA labels proper

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex row measurement | Medium | Start with conservative estimates, update incrementally |
| Keyboard navigation in virtual context | Medium | Adapt existing hook, test thoroughly |
| Image loading affecting layout | Low | Use ResizeObserver, trigger remeasure |
| Scroll position restoration issues | Low | Test with various scroll positions |
| Performance regression for small catalogs | Low | Add feature flag to disable for < 50 items |

---

## Rollout Strategy

**Phase 1: Feature Flag (Recommended)**
- Add setting to enable/disable virtual scrolling
- Default to enabled for 100+ products
- Allow manual override
- Monitor for issues

**Phase 2: Full Rollout**
- Remove feature flag after testing
- Deprecate ProductListLegacy
- Update documentation

---

## Notes

1. **No Backend Changes Required** - All client-side
2. **No Schema Changes** - Existing Product interface unchanged
3. **Minimal Breaking Changes** - ProductList props interface preserved
4. **Progressive Enhancement** - Falls back gracefully if virtualization fails
5. **Testing Required** - Manual testing with large catalogs essential
6. **Performance Monitoring** - Consider adding metrics in production

---

## Additional Resources

- @tanstack/react-virtual docs: https://tanstack.com/virtual/latest/docs/react/virtual
- Virtual scrolling best practices: https://web.dev/virtual-scrolling/
- React 19 concurrent rendering: https://react.dev/blog/2024/12/05/react-19
