# Implementation Plan: Grid Density System with Multiplier Algorithm

## Task Overview
Implement grid density toggle between normal and compact views with UI controls, comprehensive multiplier algorithm for optimal column calculation, automatic real-time column adjustment, visual density preview cards, and Zustand state integration for reactive updates.

## Current State Analysis

### Existing Infrastructure
**Already Implemented:**
- ✅ **Settings Store**: Contains `gridDensity` ('normal' | 'compact') and `columnCountOverride` (2-8) with validation
- ✅ **Grid Utilities**: `calculateColumns()` and `getGridGap()` in `packages/types/src/utils/grid.ts`
- ✅ **Responsive Grid Hook**: `useResponsiveGrid()` with window resize listener and debouncing
- ✅ **Tally Page Integration**: Using grid with dynamic column calculation
- ✅ **Type Definitions**: GridDensity and ColumnCount types defined
- ✅ **Zustand Persistence**: Settings store persists to localStorage

**Missing Components:**
- ❌ **UI Controls**: No toggle UI for density selection in settings page
- ❌ **Visual Preview Cards**: No preview showing grid layouts in both density modes
- ❌ **Enhanced Multiplier Algorithm**: Current algorithm is basic, could be more sophisticated
- ❌ **Settings Page Integration**: Display preferences section is placeholder

### Current Multiplier Algorithm Analysis

**Existing in `packages/types/src/utils/grid.ts`:**
```typescript
- Mobile (<768px): normal=2, compact=3
- Tablet (<1024px): normal=4, compact=6
- Desktop (<1280px): normal=6, compact=7
- Large (<1536px): normal=7, compact=8
- XLarge (>=1536px): normal=8, compact=8
```

**Gap Settings:**
- Normal: `gap-4` (1rem/16px)
- Compact: `gap-3` (0.75rem/12px)

## Implementation Steps

### Step 1: Enhance Multiplier Algorithm
**File**: `packages/types/src/utils/grid.ts`

**Actions:**
1. Add container width-based calculations for more precision:
   - Introduce `calculateOptimalColumns()` that considers:
     - Available container width (not just screen width)
     - Item size (80px normal, 60px compact from task 4.2)
     - Grid gap (16px normal, 12px compact)
     - Minimum and maximum column constraints
     - Target aspect ratio preferences

2. Implement container-aware algorithm:
   ```typescript
   function calculateOptimalColumns(
     containerWidth: number,
     density: GridDensity,
     itemSize: number,
     gap: number,
     minColumns: number = 2,
     maxColumns: number = 8
   ): number
   ```

3. Add multiplier-based calculation:
   - Calculate effective item width: `itemWidth = itemSize + gap`
   - Determine columns: `columns = Math.floor(containerWidth / itemWidth)`
   - Apply density multiplier:
     - Normal mode: multiplier 1.0 (standard spacing)
     - Compact mode: multiplier 1.25 (fits more items)
   - Clamp between min/max columns
   - Respect override if set

4. Add responsive breakpoints with smoother transitions:
   - Use CSS Grid's `minmax()` for fluid columns
   - Provide fallback column counts for older browsers

5. Export new utility functions:
   - `calculateContainerBasedColumns()`
   - `getDensityMultiplier()`
   - `getEffectiveItemSize()`

**Dependencies:**
- Existing grid utilities
- Settings types

### Step 2: Create Grid Density Toggle Component
**File**: `apps/web/src/components/grid-density-toggle.tsx` (new)

**Actions:**
1. Create toggle component with:
   - Segmented control/tabs for Normal | Compact selection
   - Visual preview icons showing grid spacing differences
   - Active state indication
   - Smooth transitions between modes
   - ARIA labels for accessibility

2. Component structure:
   ```typescript
   interface GridDensityToggleProps {
     value: GridDensity
     onChange: (density: GridDensity) => void
   }
   ```

3. Implementation details:
   - Use shadcn/ui Button components or custom tabs
   - Show visual indicator (dots/grid lines) representing density
   - Normal: larger spacing, fewer dots
   - Compact: tighter spacing, more dots
   - Current selection highlighted with active state
   - On change: call `setGridDensity()` from settings store

4. Accessibility:
   - Keyboard navigation (Arrow keys)
   - Screen reader announcements
   - Focus indicators
   - Proper ARIA attributes

**Dependencies:**
- `@/components/ui/button` (or tabs)
- Settings store
- TypeScript types

### Step 3: Create Grid Preview Card Component
**File**: `apps/web/src/components/grid-density-preview-card.tsx` (new)

**Actions:**
1. Create preview card showing grid layout:
   - Visual representation of product grid in selected density
   - Show actual column count calculation based on screen width
   - Display example product cards (small squares)
   - Show gap spacing visually
   - Highlight density mode (normal/compact)

2. Component structure:
   ```typescript
   interface GridDensityPreviewCardProps {
     density: GridDensity
     isActive: boolean
     onClick?: () => void
   }
   ```

3. Implementation details:
   - Use CSS Grid to render mini preview
   - Calculate columns based on card width (responsive)
   - Show 8-12 example "products" (colored squares)
   - Normal mode: 4-6 columns, larger gaps
   - Compact mode: 6-8 columns, smaller gaps
   - Add hover effects
   - Show column count badge

4. Visual design:
   - Card border with active state styling
   - Background color for product items
   - Subtle shadows
   - Smooth animations on hover/active

**Dependencies:**
- Grid utilities
- CSS Grid
- shadcn/ui Card component

### Step 4: Create Density Settings Section Component
**File**: `apps/web/src/components/density-settings-section.tsx` (new)

**Actions:**
1. Create settings section containing:
   - Section title and description
   - Grid density toggle control
   - Two preview cards (normal & compact)
   - Current settings indicator
   - Real-time feedback

2. Component structure:
   ```typescript
   interface DensitySettingsSectionProps {
     currentDensity: GridDensity
     onDensityChange: (density: GridDensity) => void
   }
   ```

3. Layout:
   - Section header: "Grid Density"
   - Subtitle: "Choose how products are displayed"
   - Horizontal layout of two preview cards
   - Each card clickable to select density
   - Active card highlighted
   - Show calculated column count on resize

4. Integration:
   - Subscribe to settings store for current density
   - Subscribe to window resize for column count updates
   - Update preview in real-time

**Dependencies:**
- Grid density toggle component
- Grid preview card component
- Settings store
- Responsive grid hook

### Step 5: Update Settings Page
**File**: `apps/web/src/routes/settings.tsx`

**Actions:**
1. Replace placeholder "Display Preferences" section:
   - Import DensitySettingsSection
   - Wire up to settings store
   - Remove placeholder text

2. Integration:
   ```typescript
   import { DensitySettingsSection } from '@/components/density-settings-section'

   const { gridDensity } = useSettingsStore()
   const setGridDensity = useSettingsStore((state) => state.setGridDensity)

   <DensitySettingsSection
     currentDensity={gridDensity}
     onDensityChange={(density) => {
       setGridDensity(density)
       // Add toast notification
     }}
   />
   ```

3. Add feedback:
   - Show toast notification when density changes
   - Display current column count
   - Show "Auto" indicator for density

**Dependencies:**
- Density settings section component
- Toast helpers
- Settings store

### Step 6: Update Responsive Grid Hook (Optional Enhancement)
**File**: `apps/web/src/hooks/useResponsiveGrid.ts`

**Actions:**
1. Enhance hook with:
   - Container width measurement (use RefCallback)
   - Use enhanced multiplier algorithm
   - Provide calculated column count info
   - Expose algorithm details for preview

2. Add features:
   - `calculatedColumns`: Auto-calculated columns
   - `effectiveColumns`: Final columns (with override)
   - `isOverridden`: Boolean indicating manual override
   - `multiplier`: Current density multiplier

3. Implement container measurement:
   - Use ResizeObserver on grid container
   - Measure actual container width
   - Recalculate columns on resize
   - Debounce for performance

**Dependencies:**
- Enhanced grid utilities
- Settings store

### Step 7: Create Algorithm Documentation Utility
**File**: `apps/web/src/lib/grid-algorithm.ts` (new)

**Actions:**
1. Create documentation and testing utility:
   - Export algorithm explanation
   - Provide column calculation breakdown
   - Show multiplier values
   - Generate test data for different screen sizes

2. Functions:
   ```typescript
   export function getGridAlgorithmInfo(
     screenWidth: number,
     density: GridDensity,
     override?: ColumnCount
   ): AlgorithmInfo

   interface AlgorithmInfo {
     screenWidth: number
     density: GridDensity
     multiplier: number
     calculatedColumns: number
     finalColumns: number
     isOverridden: boolean
     itemSize: number
     gap: number
   }
   ```

3. Use for:
   - Debugging grid calculations
   - Displaying algorithm info in settings
   - Testing column calculations

**Dependencies:**
- Grid utilities
- Settings types

### Step 8: Add Responsive Behavior Indicator
**File**: Update DensitySettingsSection component

**Actions:**
1. Add indicator showing:
   - Current auto-calculated columns
   - Current screen width range
   - Override status
   - Density mode multiplier

2. Implementation:
   - Small text below preview cards
   - Updates in real-time on resize
   - Format: "Auto: 6 columns (Desktop)" or "Override: 5 columns"

3. Styling:
   - Muted text color
   - Small font size
   - Badge for override status

**Dependencies:**
- Window resize listener
- Grid algorithm info utility

### Step 9: Validation and Error Handling
**Files**: Existing validation helpers

**Actions:**
1. Verify existing validation:
   - `validateGridDensityChange()` in `@/lib/validation-helpers`
   - Ensure it handles all GridDensity values
   - Check error messages are user-friendly

2. Add validation for preview cards:
   - Validate container width bounds
   - Validate column count range
   - Handle edge cases (very small/large screens)

3. Error recovery:
   - Gracefully fallback to default if calculation fails
   - Log errors for debugging
   - Show user-friendly error message

### Step 10: Testing and Manual Verification

**Manual Testing Checklist:**
1. Toggle between normal/compact in settings
2. Verify grid updates immediately on tally page
3. Check preview cards show correct layouts
4. Resize window and verify column count updates
5. Set manual column override (task 5.3) and verify it works with density
6. Test on mobile, tablet, desktop breakpoints
7. Verify persistence across page refresh
8. Check accessibility (keyboard navigation, screen reader)
9. Verify no LSP errors
10. Run `npm run check-types` - should pass
11. Run `npm run build` - should succeed

## File Changes Summary

### New Files
1. `apps/web/src/components/grid-density-toggle.tsx` - Toggle control component
2. `apps/web/src/components/grid-density-preview-card.tsx` - Visual preview card
3. `apps/web/src/components/density-settings-section.tsx` - Settings section with previews
4. `apps/web/src/lib/grid-algorithm.ts` - Algorithm documentation utility

### Modified Files
1. `packages/types/src/utils/grid.ts` - Enhance multiplier algorithm
2. `apps/web/src/hooks/useResponsiveGrid.ts` - Optional enhancements
3. `apps/web/src/routes/settings.tsx` - Integrate density settings

### Files to Review
1. `apps/web/src/stores/settings-store.ts` - Verify density actions
2. `apps/web/src/lib/validation-helpers.ts` - Check validation functions

## Technical Implementation Details

### Enhanced Multiplier Algorithm

**Formula:**
```
effectiveItemWidth = baseItemSize × densityMultiplier + gridGap
columns = floor(containerWidth / effectiveItemWidth)
finalColumns = clamp(columns, minColumns, maxColumns)
```

**Density Multipliers:**
- Normal mode: 1.0 (standard 80px items)
- Compact mode: 1.25 (60px items, equivalent to 1.25x multiplier for columns)

**Item Sizes:**
- Normal: 80px × 80px
- Compact: 60px × 60px

**Grid Gaps:**
- Normal: 16px (gap-4)
- Compact: 12px (gap-3)

**Responsive Breakpoints:**
| Screen Size | Normal Columns | Compact Columns |
|-------------|----------------|-----------------|
| <320px | 2 | 2 |
| 320-767px | 2 | 3 |
| 768-1023px | 4 | 6 |
| 1024-1279px | 6 | 7 |
| 1280-1535px | 7 | 8 |
| >=1536px | 8 | 8 |

### UI Component Hierarchy
```
Settings Page
└─ Density Settings Section
   ├─ Section Header (title, description)
   ├─ Preview Cards Grid
   │  ├─ Normal Density Preview Card
   │  └─ Compact Density Preview Card
   └─ Responsive Behavior Indicator
```

### State Management Flow
```
User clicks preview card
    ↓
onClick handler
    ↓
setGridDensity(density) → Settings Store
    ↓
Validation check
    ↓
localStorage persist
    ↓
useResponsiveGrid hook detects change
    ↓
Recalculate columns using multiplier algorithm
    ↓
TallyPage grid re-renders with new column count
```

### Real-Time Update Mechanism
1. Settings store update triggers Zustand reactivity
2. useResponsiveGrid hook subscribes to store changes
3. On change, recalculate columns with new density
4. TallyPage component re-renders with new columnCount
5. CSS grid updates via `grid-cols-{columnCount}` class

## Priority Order

### High Priority (Must Complete)
1. ✅ Enhance multiplier algorithm (Step 1)
2. ✅ Create grid density toggle component (Step 2)
3. ✅ Create grid preview card component (Step 3)
4. ✅ Create density settings section (Step 4)
5. ✅ Update settings page integration (Step 5)

### Medium Priority (Should Complete)
6. ⚪ Update responsive grid hook (Step 6)
7. ⚪ Create algorithm documentation utility (Step 7)
8. ⚪ Add responsive behavior indicator (Step 8)

### Low Priority (Nice to Have)
9. ⚪ Enhanced validation and error handling (Step 9)
10. ⚪ Testing and verification (Step 10)

## Dependencies

### External Dependencies (None Required)
- ✅ Zustand (already installed)
- ✅ React (already installed)
- ✅ Tailwind CSS (already installed)
- ✅ shadcn/ui components (already installed)
- ✅ TypeScript types (already defined)

### Internal Dependencies
- ✅ Settings store (exists)
- ✅ Grid utilities (exists)
- ✅ Responsive grid hook (exists)
- ✅ Validation helpers (exists)

## Risks & Mitigations

### Risk 1: Algorithm Produces Suboptimal Column Counts
**Mitigation**:
- Test on multiple screen sizes (320px to 2560px)
- Use container width instead of screen width where possible
- Provide manual column override (task 5.3)
- Show calculated columns in settings for transparency

### Risk 2: Performance Issues with Frequent Recalculations
**Mitigation**:
- Debounce resize events (already implemented in useResponsiveGrid)
- Use requestAnimationFrame for smooth updates
- Limit preview card complexity
- Memoize calculations

### Risk 3: Preview Cards Don't Accurately Reflect Real Grid
**Mitigation**:
- Use same algorithm for both
- Scale preview to match proportions
- Show actual column count numbers
- Provide responsive behavior indicator
- Allow real-time preview on toggle page

### Risk 4: Settings Changes Not Persisting
**Mitigation**:
- Verify persist middleware is configured
- Test localStorage storage
- Check hydration on page load
- Add console logging for debugging

### Risk 5: Density Toggle Conflicts with Manual Override
**Mitigation**:
- Document behavior clearly
- Clear override when changing density (or keep it?)
- Show override status indicator
- Provide reset to auto option

**Decision**: Keep columnCountOverride when changing density, but recalculate auto columns. Override takes precedence.

## Success Criteria

### Functional Requirements
1. ✅ Grid density toggle between normal and compact views
2. ✅ UI controls in settings page with visual feedback
3. ✅ Comprehensive multiplier algorithm calculates optimal columns
4. ✅ Algorithm considers container width, item size, and density
5. ✅ Automatic column adjustment updates grid in real-time
6. ✅ Visual density preview cards show both modes
7. ✅ Preview cards update on window resize
8. ✅ Connected to Zustand state for reactive updates
9. ✅ Settings persist across page refreshes

### Non-Functional Requirements
1. ✅ No TypeScript errors
2. ✅ No LSP errors in IDE
3. ✅ Type safety maintained throughout
4. ✅ Responsive design works on mobile, tablet, desktop
5. ✅ Performance acceptable (no lag on resize)
6. ✅ Accessible (keyboard navigation, ARIA labels)
7. ✅ Builds successfully (`npm run build`)
8. ✅ Type checking passes (`npm run check-types`)

### User Experience
1. ✅ Density toggle is intuitive and clear
2. ✅ Preview cards accurately represent actual grid
3. ✅ Changes apply immediately without page refresh
4. ✅ Visual feedback for current selection
5. ✅ Helpful indicator showing column count
6. ✅ Smooth transitions between modes

## Notes

### Algorithm Design Philosophy
The multiplier algorithm balances two competing priorities:
1. **Information Density**: Show as many items as possible (compact mode)
2. **Usability**: Ensure items are large enough to interact with (normal mode)

### Container vs Screen Width
- **Current Implementation**: Uses screen width (window.innerWidth)
- **Enhanced Implementation**: Could use container width (more accurate)
- **Recommendation**: Keep screen width for simplicity, measure container in task 5.3

### Integration with Task 5.3 (Manual Column Override)
This task focuses on density toggle. Task 5.3 will add manual column override slider. They work together:
- Density sets the baseline calculation
- Override allows manual adjustment
- Changing density recalculates baseline, override stays unless cleared

### Visual Design Considerations
- Preview cards should use same visual language as actual product cards
- Color coding: Normal = blue/accent, Compact = green/success
- Use shadcn/ui Card component for consistency
- Add subtle animations for polish

### Future Enhancements (Out of Scope)
- Custom density levels (beyond normal/compact)
- Per-screen density settings
- Density presets for different product catalogs
- Grid animation on density change
- Density history/quick switcher
