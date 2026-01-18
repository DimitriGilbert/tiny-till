# Task 4.1 Implementation Plan: Responsive Grid Layout with Auto-Column Algorithm

## Overview
Implement a responsive grid layout for the main tally page with an auto-column calculation algorithm that dynamically adjusts based on screen width and density settings.

## Current State Analysis

### Existing Infrastructure
- **Settings Store**: `apps/web/src/stores/settings-store.ts`
  - Already has `gridDensity: 'normal' | 'compact'`
  - Already has `columnCountOverride?: 2 | 3 | 4 | 5 | 6 | 7 | 8`
  
- **Types Package**: `packages/types/src/utils/grid.ts`
  - Already has `calculateColumns()` utility function
  - Already has `GridDensity` and `ColumnCount` types

- **ProductList Component**: `apps/web/src/components/product-list.tsx`
  - Has basic responsive grid with hardcoded breakpoints
  - Has column count state and resize handling
  - Uses keyboard navigation with column count

- **Main Tally Page**: `apps/web/src/routes/index.tsx`
  - Currently has placeholder structure
  - Needs grid layout implementation

### Identified Issues
1. Current `calculateColumns()` function uses different breakpoints than required
2. No integration with density settings for grid gap spacing
3. No dedicated hook for responsive grid logic
4. Main tally page doesn't use ProductList or grid layout
5. Column count logic needs to match task requirements

## Implementation Steps

### Step 1: Update Grid Calculation Algorithm
**File**: `packages/types/src/utils/grid.ts`

**Changes Required**:
- Update `calculateColumns()` to use task-specific breakpoints:
  - Mobile (320px-768px): 2-3 columns
  - Tablet (768px-1024px): 4-6 columns
  - Desktop (1024px+): 6-8 columns
- Add density multiplier logic:
  - Normal: base column count
  - Compact: increase by ~25-33% (ceiling)
- Add grid gap calculation based on density
- Export additional utility: `getGridGap(density: GridDensity): string`

**Implementation Details**:
```typescript
// New breakpoint logic
if (screenWidth < 320) return 2
if (screenWidth < 768) return density === 'compact' ? 3 : 2
if (screenWidth < 1024) return density === 'compact' ? 6 : 4
// Desktop: 6-8 columns based on width
if (screenWidth < 1280) return density === 'compact' ? 7 : 6
if (screenWidth < 1536) return density === 'compact' ? 8 : 7
return density === 'compact' ? 8 : 8

// Gap calculation
const getGridGap = (density: GridDensity): string => 
  density === 'compact' ? 'gap-3' : 'gap-4'
```

### Step 2: Create Responsive Grid Hook
**File**: `apps/web/src/hooks/useResponsiveGrid.ts` (new file)

**Purpose**: Encapsulate responsive grid logic with resize handling

**Responsibilities**:
- Calculate optimal column count based on screen width and density
- Monitor window resize events with debouncing
- Return column count and grid gap classes
- Handle density changes from settings store
- Use requestAnimationFrame for smooth updates

**Interface**:
```typescript
interface UseResponsiveGridReturn {
  columnCount: number
  gridGap: string
  containerClassName: string
  isCompact: boolean
}

export function useResponsiveGrid(): UseResponsiveGridReturn
```

**Implementation Details**:
- Import `calculateColumns` and `getGridGap` from `@tiny-till/types`
- Subscribe to `useSettingsStore` for density and override
- Initialize column count on mount
- Add resize listener with `requestAnimationFrame` for performance
- Cleanup listener on unmount
- Debounce resize events (100-150ms recommended)
- Memoize computed values

### Step 3: Update ProductList Component
**File**: `apps/web/src/components/product-list.tsx`

**Changes Required**:
- Remove hardcoded `updateColumnCount` function
- Replace with `useResponsiveGrid` hook
- Update grid container classes to use dynamic `gridGap`
- Update skeleton grid to match dynamic columns
- Remove static breakpoint classes
- Use dynamic column count from hook

**Implementation Details**:
```typescript
// Import new hook
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid'

// Inside ProductList component
const { columnCount, gridGap, containerClassName, isCompact } = useResponsiveGrid()

// Update grid containers
<div className={cn('grid', gridGap, containerClassName)}>

// Update keyboard navigation to use hook's columnCount
```

### Step 4: Update Main Tally Page
**File**: `apps/web/src/routes/index.tsx`

**Changes Required**:
- Import and integrate ProductList component
- Remove placeholder content
- Add proper container structure with responsive padding
- Include search functionality wrapper
- Add page title and layout structure

**Implementation Details**:
```typescript
import { ProductList } from '@/components/product-list'
import { useCatalogStore } from '@/stores/catalog-store'

function TallyPage() {
  const { hasHydrated } = useCatalogStore()
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tally</h1>
        <p className="text-muted-foreground mt-1">
          Select products to add to your tally
        </p>
      </header>
      <ProductList 
        onAddProduct={() => {/* navigate to add */}}
      />
    </div>
  )
}
```

### Step 5: Update Card Component for Compact Mode
**File**: `apps/web/src/components/product-card.tsx`

**Changes Required**:
- Add prop for density mode
- Adjust spacing and sizing in compact mode
- Reduce padding and font sizes when compact
- Ensure responsive behavior with density

**Implementation Details**:
```typescript
interface ProductCardProps {
  // existing props...
  density?: 'normal' | 'compact'
}

// Update size prop on Card component
<Card size={density === 'compact' ? 'xs' : 'sm'}>

// Adjust padding based on density
className={cn(
  'transition-all',
  density === 'compact' && 'gap-1'
)}
```

### Step 6: Add Density Settings UI (Optional but Recommended)
**File**: `apps/web/src/routes/settings.tsx` or create density toggle component

**Purpose**: Allow users to toggle between normal and compact density

**Implementation Details**:
- Add setting toggle in settings page
- Use `setGridDensity` from settings store
- Persist user preference

## Testing Requirements

### Manual Testing Checklist
- [ ] Verify column count changes at breakpoints:
  - 320px: 2 columns (normal), 3 columns (compact)
  - 768px: 4 columns (normal), 6 columns (compact)
  - 1024px: 6 columns (normal), 7-8 columns (compact)
  - 1280px+: 7-8 columns (normal), 8 columns (compact)
- [ ] Test resize handling is smooth without layout shifts
- [ ] Verify density toggle changes column count immediately
- [ ] Verify grid gap spacing adjusts with density
- [ ] Test keyboard navigation works with dynamic columns
- [ ] Verify no horizontal scroll on mobile
- [ ] Test performance on rapid window resize
- [ ] Verify proper cleanup of resize listeners
- [ ] Test column count override setting works

### Performance Testing
- Monitor resize event handler performance
- Ensure requestAnimationFrame prevents unnecessary recalculations
- Verify no memory leaks from event listeners
- Check re-render performance during resize

## Edge Cases to Handle

1. **Very Small Screens (< 320px)**: Ensure minimum 2 columns
2. **Ultra-Wide Screens (> 2000px)**: Cap at 8 columns
3. **Rapid Resize Events**: Use debouncing to prevent performance issues
4. **Density Toggle During Resize**: Ensure smooth transition
5. **Column Count Override**: Should always take precedence
6. **Mobile Landscape vs Portrait**: Test orientation changes
7. **Initial Render**: Ensure correct columns on first paint

## Files to Modify

### Core Implementation
1. `packages/types/src/utils/grid.ts` - Update calculation algorithm
2. `apps/web/src/hooks/useResponsiveGrid.ts` - New file (create)
3. `apps/web/src/components/product-list.tsx` - Integrate hook
4. `apps/web/src/routes/index.tsx` - Replace with ProductList
5. `apps/web/src/components/product-card.tsx` - Add density support

### Optional Enhancements
6. `apps/web/src/routes/settings.tsx` - Add density toggle UI
7. `apps/web/src/components/density-toggle.tsx` - New component (optional)

## Type Safety Requirements

- Ensure all column counts are validated against `ColumnCount` type
- Use proper TypeScript types for hook returns
- Add JSDoc comments for new utility functions
- Validate density values are `GridDensity` type

## Accessibility Considerations

- Ensure focus management works with dynamic columns
- Maintain keyboard navigation after column count changes
- Test with screen readers on all breakpoint sizes
- Ensure grid gap doesn't affect tab order
- Verify ARIA labels work with dynamic layouts

## Performance Optimizations

- Use `requestAnimationFrame` for resize handling
- Debounce resize events (100-150ms)
- Memoize computed values in hook
- Avoid unnecessary re-renders in ProductList
- Use CSS Grid for layout (GPU accelerated)

## Success Criteria

- [ ] Grid displays 2-3 columns on mobile (320px-768px)
- [ ] Grid displays 4-6 columns on tablet (768px-1024px)
- [ ] Grid displays 6-8 columns on desktop (1024px+)
- [ ] Density toggle increases column count by ~25-33%
- [ ] Grid gap adjusts based on density setting
- [ ] Resize events handled smoothly with no jank
- [ ] Column count override setting works correctly
- [ ] Keyboard navigation works with dynamic columns
- [ ] No TypeScript errors
- [ ] All tests pass

## Post-Implementation Steps

1. Run type checking: `npm run check-types`
2. Run build: `npm run build`
3. Fix any LSP errors
4. Manual testing on various screen sizes
5. Performance profiling during resize events
6. Accessibility testing with keyboard and screen reader
