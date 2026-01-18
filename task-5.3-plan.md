# Task 5.3 Implementation Plan: Manual Column Override with Live Preview and Responsive Indicators

## Overview
Build manual column count slider component (2-8 columns) with live preview functionality, reactive state updates, responsive behavior indicators, and visual override status indicators.

## Current State Analysis
- Settings store has `columnCountOverride` state and `setColumnCountOverride` action
- Types package defines `ColumnCount` (2-8) and `calculateColumns()` utility
- `DensitySettingsSection` shows column info but lacks manual override UI
- `GridDensityPreviewCard` has preview functionality but needs column-specific enhancements
- No slider component exists in UI library

## Implementation Steps

### Step 1: Create Column Count Slider Component
**File:** `apps/web/src/components/column-count-slider.tsx`

**Requirements:**
- Range slider from 2-8 columns
- Debounced input handling (150ms delay) to prevent excessive re-renders
- Live value display showing current column count
- Visual tick marks at each column value (2, 3, 4, 5, 6, 7, 8)
- Props interface:
  ```typescript
  interface ColumnCountSliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    disabled?: boolean
    className?: string
  }
  ```

**Implementation Details:**
- Use HTML5 `<input type="range">` with custom Tailwind styling
- Add slider track with gradient indicating current value position
- Add tick marks below slider for visual reference
- Implement debounced onChange to avoid rapid state updates
- Add ARIA labels for accessibility

### Step 2: Create Column Count Live Preview Component
**File:** `apps/web/src/components/column-count-preview.tsx`

**Requirements:**
- Dynamic grid preview showing actual content layout
- Responsive to density settings (normal/compact)
- Shows correct number of columns based on current selection
- Displays placeholder product cards with realistic sizing
- Real-time updates when slider moves

**Implementation Details:**
- Accept `columns`, `density`, and `override` props
- Use `calculateColumns()` to determine preview layout
- Generate preview items array (12 items minimum)
- Apply correct gap using `getGridGap()` and `getGridGapValue()`
- Use `getItemSize()` for accurate item dimensions
- Style placeholder cards to match actual product cards
- Add visual indicator when override is active

### Step 3: Create Responsive Behavior Indicator Component
**File:** `apps/web/src/components/responsive-column-indicator.tsx`

**Requirements:**
- Display auto-calculated columns vs manual override
- Show current breakpoint (Mobile, Tablet, Desktop, etc.)
- Visual distinction between auto and override modes
- Current screen width display
- Smooth transitions on state changes

**Implementation Details:**
- Accept `screenWidth`, `autoColumns`, `manualColumns`, `isOverridden` props
- Use `getBreakpointLabel()` helper from existing code
- Display badge: "Auto: X columns" or "Override: X columns"
- Color coding: blue for auto, amber for override
- Screen width display in pixels
- Responsive layout for mobile vs desktop

### Step 4: Add Visual Override Status Badge Component
**File:** `apps/web/src/components/override-status-badge.tsx`

**Requirements:**
- Small badge showing override status
- Icon indicator (lock icon for override, auto-refresh for auto)
- Color differentiation (warning/active for override, neutral for auto)
- Tooltip or text explanation
- Compact design for settings UI

**Implementation Details:**
- Badge variant for shadcn/ui styling
- Use lucide-react icons (Lock vs Settings2)
- Props: `isOverridden`, `columnCount`
- Optional: "Reset to Auto" button functionality
- Accessible ARIA labels

### Step 5: Create Column Override Section Container Component
**File:** `apps/web/src/components/column-override-section.tsx`

**Requirements:**
- Combines slider, preview, and indicator components
- Manages local state for preview updates
- Integrates with Settings store
- Provides reset to auto functionality
- Handles screen resize events

**Implementation Details:**
- State management for screen info and preview columns
- `useEffect` for resize handling with debouncing
- Integration with `useSettingsStore`
- Callback to `setColumnCountOverride`
- Reset button that sets override to `undefined`
- Error handling with toast notifications

### Step 6: Integrate Column Override Section into DensitySettingsSection
**File:** `apps/web/src/components/density-settings-section.tsx` (modifications)

**Changes:**
- Import `ColumnOverrideSection`
- Add props for `columnCountOverride` and `setColumnCountOverride`
- Replace or augment existing column indicator with new section
- Maintain backward compatibility with existing density toggle
- Ensure proper spacing and layout

**Implementation Details:**
- Add column override section below density preview cards
- Pass relevant settings state to new section
- Keep existing responsive indicator as fallback or remove
- Test interaction between density and column count changes

### Step 7: Update Settings Page to Pass Column Count Handlers
**File:** `apps/web/src/routes/settings.tsx` (modifications)

**Changes:**
- Import `setColumnCountOverride` from settings store
- Add `onColumnCountChange` handler
- Pass handler to `DensitySettingsSection`
- Add toast notifications for column count changes

**Implementation Details:**
- Add try/catch error handling
- Toast success message: "Column count set to X"
- Toast error message with validation details
- Debounce rapid changes to avoid toast spam

### Step 8: Add Responsive Column Limits Validation
**File:** `apps/web/src/lib/validation-helpers.ts` (augment if needed)

**Requirements:**
- Validate column count against screen size limits
- Warn if selected columns exceed what screen can display
- Provide fallback to valid range
- Minimum of 2 columns always enforced

**Implementation Details:**
- Add validation function: `validateColumnForScreen(count: number, screenWidth: number)`
- Calculate maximum columns for screen width using density
- Return validation result with recommended adjustment
- Integrate with existing `validateColumnCountChange` if possible

### Step 9: Enhance Preview with Realistic Content
**File:** `apps/web/src/components/column-count-preview.tsx` (enhancement)

**Additions:**
- Display product card placeholders with:
  - Placeholder images (colored rectangles or icons)
  - Product name text
  - Price display
  - More accurate dimensions matching actual cards
- Hover effects on preview items
- Animation when column count changes

**Implementation Details:**
- Use skeleton loading pattern from `skeleton.tsx`
- Add transition animations for smooth column changes
- Realistic text placeholders using repeated "Product Name"
- Price display using current currency from settings

### Step 10: Testing and Validation

**Manual Testing Checklist:**
- [ ] Slider moves smoothly from 2-8
- [ ] Live preview updates immediately on slider move
- [ ] Debounced changes work correctly (no stuttering)
- [ ] Responsive indicator shows correct breakpoint
- [ ] Override badge displays correctly
- [ ] Reset to auto button clears override
- [ ] Density changes affect column calculations
- [ ] Screen resize updates indicators
- [ ] Settings persist on page reload
- [ ] Toast notifications appear correctly
- [ ] Validation errors prevent invalid inputs

**Responsive Testing:**
- [ ] Mobile (<768px): Component fits, slider usable
- [ ] Tablet (768-1024px): Layout adapts, preview shows correctly
- [ ] Desktop (1024px+): Full functionality
- [ ] XL Desktop (1536px+): 8 columns display properly

**Type Checking:**
- Run `npm run check-types` and fix all errors
- Ensure no `any` types used
- Verify strict type safety throughout

## File Changes Summary

### New Files Created:
1. `apps/web/src/components/column-count-slider.tsx` - Slider component
2. `apps/web/src/components/column-count-preview.tsx` - Live preview component
3. `apps/web/src/components/responsive-column-indicator.tsx` - Responsive indicator
4. `apps/web/src/components/override-status-badge.tsx` - Status badge
5. `apps/web/src/components/column-override-section.tsx` - Container component

### Files Modified:
1. `apps/web/src/components/density-settings-section.tsx` - Integrate column override
2. `apps/web/src/routes/settings.tsx` - Add column count handlers
3. `apps/web/src/lib/validation-helpers.ts` - Add responsive validation (if needed)

## Technical Considerations

### State Management
- Use React local state for UI-specific updates (preview, screen info)
- Use Zustand store for persisted settings (`columnCountOverride`)
- Debounce slider input to prevent excessive re-renders

### Performance
- Debounce resize events (150ms delay, existing pattern)
- Use `React.memo` for preview components
- Optimize re-renders with proper dependency arrays
- Use `requestAnimationFrame` for smooth updates

### Accessibility
- ARIA labels on slider input
- Keyboard navigation support (arrow keys for slider)
- Screen reader announcements for column count changes
- Focus indicators on interactive elements
- Proper color contrast ratios

### Responsive Design
- Minimum 2 columns enforced on all screens
- Maximum columns limited by screen width
- Preview adapts to container width
- Touch-friendly slider on mobile

### User Experience
- Smooth transitions when column count changes
- Clear visual feedback for override vs auto mode
- Reset button with confirmation or toast
- Helpful tooltips or descriptions
- Consistent with existing shadcn/ui design system

## Dependencies
- Existing: React, Zustand, Tailwind CSS, shadcn/ui
- Existing: @tiny-till/types for utilities
- New: lucide-react for icons (already installed)

## Success Criteria
1. Slider component works with range 2-8
2. Live preview shows grid changes in real-time
3. Responsive indicator displays correct information
4. Override status is clearly visible
5. Settings persist correctly
6. Component works on all screen sizes
7. Type checking passes without errors
8. No `any` types used
9. Code follows project conventions
10. Manual testing checklist complete
