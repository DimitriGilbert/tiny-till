# Task 5.4 Implementation Plan: Settings Page UI with Comprehensive Persistence and Testing

## Overview
Enhance settings page with comprehensive localStorage persistence, visual feedback indicators, settings reset functionality with confirmation, accessibility features (keyboard navigation, screen reader support), and preference change detection with system preference sync.

## Current State Analysis
- Settings page exists at `apps/web/src/routes/settings.tsx` with basic sections
- Settings store (`settings-store.ts`) has `persist` middleware for localStorage
- Theme store (`theme-store.ts`) has theme persistence with system preference sync
- DensitySettingsSection and ColumnOverrideSection exist with some UI components
- GridDensityPreviewCard, ColumnCountPreview, OverrideStatusBadge components exist
- ConfirmationDialog component exists for reset confirmation
- Basic toast notifications via sonner
- No reset settings functionality implemented
- Limited visual feedback for settings changes
- No dedicated status indicators for all settings
- Accessibility improvements needed (keyboard navigation, screen reader announcements)

## Implementation Steps

### Step 1: Create Settings Status Badge Component
**File:** `apps/web/src/components/settings-status-badge.tsx`

**Requirements:**
- Generic status badge component for all settings changes
- Visual states: "Default", "Modified", "Syncing", "Success"
- Status indicators with appropriate icons and colors
- Animation for status transitions
- Compact design for settings UI
- Accessible ARIA labels and live regions

**Implementation Details:**
- Props interface:
  ```typescript
  interface SettingsStatusBadgeProps {
    status: 'default' | 'modified' | 'syncing' | 'success'
    label?: string
    showText?: boolean
    className?: string
  }
  ```
- Use lucide-react icons (Check, RefreshCw, AlertCircle)
- Color coding: neutral for default, amber for modified, blue for syncing, green for success
- Tailwind animations for smooth transitions
- `aria-live="polite"` for status announcements
- Use `useSettingsStore` for status tracking

### Step 2: Create Settings Change Indicator Component
**File:** `apps/web/src/components/settings-change-indicator.tsx`

**Requirements:**
- Visual indicator showing which settings have been modified
- Compare current settings with defaults
- Show unsaved changes count
- Clear visual feedback for pending changes
- Animation when changes are detected

**Implementation Details:**
- Props interface:
  ```typescript
  interface SettingsChangeIndicatorProps {
    hasChanges: boolean
    changeCount: number
    onReset?: () => void
    className?: string
  }
  ```
- Use `useSettingsStore` to track changes
- Compare with default values from `initialState`
- Display badge with change count
- "Reset All" button when changes exist
- Use OverrideStatusBadge as inspiration
- Animation for badge appearance

### Step 3: Create Theme Settings Section Component
**File:** `apps/web/src/components/theme-settings-section.tsx`

**Requirements:**
- Theme selection interface (Light, Dark, System)
- System preference sync indicator
- Live theme preview
- Visual feedback for theme changes
- Accessibility support

**Implementation Details:**
- Props interface:
  ```typescript
  interface ThemeSettingsSectionProps {
    currentTheme: Theme
    resolvedTheme: 'light' | 'dark'
    onThemeChange: (theme: Theme) => void
    className?: string
  }
  ```
- Use existing `ModeToggle` component as base
- Add status badge for theme sync
- Show system theme indicator when "system" is selected
- Live preview cards (light/dark themed boxes)
- Screen reader announcements for theme changes
- Keyboard navigation (arrow keys, Enter)
- Use existing theme store hooks

### Step 4: Create Reset Settings Confirmation Component
**File:** `apps/web/src/components/reset-settings-dialog.tsx`

**Requirements:**
- Confirmation dialog for resetting all settings
- Shows which settings will be reset
- Warning about data loss (none for settings only)
- Preview of default settings
- Confirmation with destructive action styling

**Implementation Details:**
- Use existing `ConfirmationDialog` component
- Props interface:
  ```typescript
  interface ResetSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    currentSettings: Settings
    defaultSettings: Settings
  }
  ```
- Display list of settings that will be reset
- Show "System" indicator for theme default
- Use existing toast for success feedback
- Destructive button variant for confirmation
- Focus management after confirmation

### Step 5: Create Settings Success Toast Component
**File:** `apps/web/src/components/settings-success-toast.tsx`

**Requirements:**
- Success notification for settings changes
- Animated checkmark icon
- Shows which setting was changed
- Optional auto-dismiss
- Consistent with sonner toast design

**Implementation Details:**
- Helper function to trigger toast:
  ```typescript
  function showSettingsSuccess(setting: string, value: string, description?: string)
  ```
- Use `toast.success` from sonner
- Include checkmark animation
- Show setting name and new value
- Optional description for complex changes
- Use consistent timeout (3000ms)

### Step 6: Create Settings Preview Section Component
**File:** `apps/web/src/components/settings-preview-section.tsx`

**Requirements:**
- Live preview of settings changes
- Shows how settings affect the UI
- Updates in real-time
- Tabs for different previews (Tally, Catalog, etc.)
- Visual indicators for active settings

**Implementation Details:**
- Props interface:
  ```typescript
  interface SettingsPreviewSectionProps {
    settings: Settings
    className?: string
  }
  ```
- Tab navigation for preview types
- Mini product grid preview (using existing GridDensityPreviewCard)
- Mini column preview (using existing ColumnCountPreview)
- Theme preview with light/dark boxes
- Responsive layout for mobile/desktop
- Smooth animations for transitions

### Step 7: Create Settings Action Section Component
**File:** `apps/web/src/components/settings-action-section.tsx`

**Requirements:**
- Container for all settings actions
- Reset settings button
- Export/import settings (optional future enhancement)
- Clear visual separation from settings sections
- Accessibility features

**Implementation Details:**
- Props interface:
  ```typescript
  interface SettingsActionSectionProps {
    hasChanges: boolean
    onReset: () => void
    onOpenResetDialog: () => void
    className?: string
  }
  ```
- Reset button (destructive variant)
- Change indicator badge
- "Reset to Defaults" vs "Clear Changes" options
- Keyboard navigation support
- Accessible labels and descriptions
- Loading state during reset

### Step 8: Enhance Settings Store with Change Detection
**File:** `apps/web/src/stores/settings-store.ts` (modifications)

**Additions:**
- Track unsaved changes
- Compare with default values
- Add `hasUnsavedChanges` selector
- Add `getChangedSettings` selector
- Add change history (optional)

**Implementation Details:**
- Add to `SettingsState`:
  ```typescript
  hasUnsavedChanges: boolean
  changedSettings: Array<keyof Settings>
  ```
- Add to `SettingsActions`:
  ```typescript
  markAsSaved: () => void
  getChangedSettings: () => Array<keyof Settings>
  ```
- Update setters to track changes
- Compare with `initialState` on each change
- Persist change tracking state

### Step 9: Enhance Theme Store with System Preference Sync
**File:** `apps/web/src/stores/theme-store.ts` (enhancement)

**Additions:**
- System preference change detection
- Automatic sync when system theme changes
- Notification when theme syncs to system
- Manual sync button for "system" mode

**Implementation Details:**
- Add `syncStatus` state: 'idle' | 'syncing' | 'synced'
- Enhance existing `useSystemThemeSync` hook
- Add visual indicator for sync status
- Trigger toast notification on system sync
- Debounce sync events to avoid spam
- Add manual sync action: `syncToSystemTheme`

### Step 10: Create Accessibility Utilities
**File:** `apps/web/src/lib/accessibility-utils.ts`

**Requirements:**
- Helper functions for accessibility features
- Focus management utilities
- Screen reader announcements
- Keyboard navigation helpers
- ARIA attribute generators

**Implementation Details:**
- Export functions:
  ```typescript
  function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite')
  function trapFocusInElement(element: HTMLElement)
  function getFocusableElements(container: HTMLElement)
  function setAriaLiveRegion(element: HTMLElement, value: 'polite' | 'assertive')
  function handleKeyboardNavigation(event: KeyboardEvent, handlers: KeyHandlers)
  ```
- Use existing DOM utilities where possible
- Provide TypeScript types for handlers
- Test with screen readers

### Step 11: Update Settings Page Route Component
**File:** `apps/web/src/routes/settings.tsx` (complete refactor)

**Changes:**
- Import new components
- Restructure layout with sections
- Add reset functionality
- Add visual indicators
- Implement keyboard navigation
- Add screen reader support

**Implementation Details:**
- Use `useSettingsStore` for all settings
- Use `useTheme` hook for theme management
- Add state for reset dialog
- Add state for current preview tab
- Implement keyboard shortcuts:
  - `Escape`: Close dialogs
  - `ArrowUp/Down`: Navigate settings
  - `Enter`: Select setting
  - `Ctrl/Cmd+R`: Reset settings
- Add `aria-live` regions for announcements
- Add landmark regions (`main`, `nav`, `section`)
- Implement success toasts for all changes
- Add loading states where needed

**Structure:**
```typescript
function SettingsPage() {
  // Store hooks
  const settings = useSettingsStore()
  const theme = useTheme()

  // Local state
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState<'tally' | 'catalog'>('tally')

  // Handlers
  const handleResetSettings = () => { /* ... */ }
  const handleThemeChange = (theme: Theme) => { /* ... */ }
  const handleDensityChange = (density: GridDensity) => { /* ... */ }
  const handleColumnCountChange = (count: ColumnCount | undefined) => { /* ... */ }

  return (
    <main>
      {/* Header */}
      {/* Change Indicator */}
      {/* Sections:
         - Theme Settings
         - Grid Density Settings
         - Column Override Settings
         - Preview Section
         - Action Section */}
      {/* Reset Dialog */}
      {/* Live Regions */}
    </main>
  )
}
```

### Step 12: Add Visual Feedback for All Settings Changes
**File:** `apps/web/src/routes/settings.tsx` (additions)

**Implementation:**
- Status badge on each section that was modified
- Animation when settings change
- Highlight changed settings
- Success toast on save/reset
- Loading indicator during sync

**Implementation Details:**
- Track which settings changed in component state
- Add `changedSettings: Set<string>` state
- Update on each settings change
- Clear after toast is shown
- Use CSS animations for smooth transitions
- Visual highlight using `ring` or `border` classes

### Step 13: Implement Keyboard Navigation
**File:** `apps/web/src/routes/settings.tsx` (accessibility enhancements)

**Requirements:**
- Tab navigation through all controls
- Arrow key navigation within groups
- Enter/Space to activate controls
- Escape to close dialogs
- Focus trapping in modals

**Implementation Details:**
- Set `tabIndex` appropriately
- Add `onKeyDown` handlers
- Use existing accessibility utilities
- Ensure visible focus indicators
- Test with keyboard only
- Document keyboard shortcuts

### Step 14: Implement Screen Reader Support
**File:** `apps/web/src/routes/settings.tsx` (ARIA enhancements)

**Requirements:**
- Proper landmark regions
- ARIA labels for all controls
- Live regions for announcements
- Descriptive text for complex controls
- Group related controls with `fieldset`/`legend`

**Implementation Details:**
- Add `role="region"` with `aria-label`
- Add `aria-labelledby` references
- Add `aria-describedby` for help text
- Use `fieldset`/`legend` for grouped controls
- Create hidden description elements if needed
- Test with NVDA/VoiceOver

### Step 15: Create Testing Utilities
**File:** `apps/web/src/lib/settings-test-utils.ts`

**Requirements:**
- Test helpers for settings
- Mock localStorage
- Mock system preferences
- Validation helpers for tests
- Accessibility test helpers

**Implementation Details:**
- Export functions:
  ```typescript
  function mockLocalStorage()
  function mockSystemTheme(theme: 'light' | 'dark')
  function createMockSettings(overrides?: Partial<Settings>)
  function assertSettingsMatch(expected: Settings, actual: Settings)
  function simulateKeyboardEvent(element: HTMLElement, key: string, options?: KeyboardEventInit)
  ```

### Step 16: Create Comprehensive Test Suite
**File:** `apps/web/src/__tests__/settings.test.tsx`

**Requirements:**
- Unit tests for all components
- Integration tests for settings page
- Accessibility tests (axe-core)
- Persistence tests
- Keyboard navigation tests

**Implementation Details:**
- Test cases:
  - Theme change persists and syncs
  - Grid density change persists
  - Column count override persists
  - Reset to defaults works
  - All settings restore on page reload
  - Visual indicators show correctly
  - Keyboard navigation works
  - Screen reader announcements work
  - Focus management is correct
  - Toast notifications appear
- Use React Testing Library
- Use jest-dom matchers
- Use axe-core for accessibility
- Mock localStorage
- Mock system preferences

## File Changes Summary

### New Files Created:
1. `apps/web/src/components/settings-status-badge.tsx` - Status indicator for settings
2. `apps/web/src/components/settings-change-indicator.tsx` - Change detection indicator
3. `apps/web/src/components/theme-settings-section.tsx` - Theme settings UI
4. `apps/web/src/components/reset-settings-dialog.tsx` - Reset confirmation dialog
5. `apps/web/src/components/settings-success-toast.tsx` - Success notification helper
6. `apps/web/src/components/settings-preview-section.tsx` - Live preview of settings
7. `apps/web/src/components/settings-action-section.tsx` - Settings actions container
8. `apps/web/src/lib/accessibility-utils.ts` - Accessibility helper utilities
9. `apps/web/src/lib/settings-test-utils.ts` - Testing utilities

### Files Modified:
1. `apps/web/src/routes/settings.tsx` - Complete refactor with new features
2. `apps/web/src/stores/settings-store.ts` - Add change detection
3. `apps/web/src/stores/theme-store.ts` - Enhance system sync
4. `apps/web/src/components/density-settings-section.tsx` - Add status indicators
5. `apps/web/src/components/column-override-section.tsx` - Add status indicators

### Test Files Created:
1. `apps/web/src/__tests__/settings.test.tsx` - Comprehensive test suite

## Technical Considerations

### State Management
- Use Zustand store for persisted settings (existing)
- Use React local state for UI-specific updates
- Track changes by comparing with defaults
- Use `hasHydrated` to prevent SSR mismatches

### Persistence
- Already handled by Zustand persist middleware
- Ensure all settings use the same storage key
- Handle migration if storage schema changes
- Test persistence across page reloads

### Change Detection
- Compare current values with `initialState`
- Track which settings have changed
- Reset change tracker on save/reset
- Display change count in UI

### System Preference Sync
- Listen for `prefers-color-scheme` media query
- Auto-sync when theme is "system"
- Debounce sync events (300ms)
- Show toast notification on sync
- Manual sync button for user control

### Visual Feedback
- Status badges for each section
- Animation on setting changes
- Success toasts for all changes
- Loading states during sync
- Highlight modified sections

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation throughout
- Screen reader announcements
- Focus trapping in modals
- Color contrast compliance (WCAG AA)
- Visible focus indicators
- Landmark regions for navigation

### Performance
- Debounce rapid changes
- Use `React.memo` for preview components
- Optimize re-renders with proper dependencies
- Use `requestAnimationFrame` for smooth animations

### Responsive Design
- Layout adapts to mobile/tablet/desktop
- Preview sections scale appropriately
- Touch-friendly controls
- Readable text at all sizes
- Usable without mouse

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock store dependencies
- Test all prop combinations
- Test event handlers

### Integration Tests
- Test settings page as whole
- Test interactions between components
- Test persistence flow
- Test system preference sync

### Accessibility Tests
- Automated tests with axe-core
- Manual testing with screen readers
- Keyboard-only navigation testing
- Focus management testing

### Persistence Tests
- Test localStorage writes/reads
- Test hydration from storage
- Test settings survive page reload
- Test reset to defaults
- Test migration scenarios

### Manual Testing Checklist
- [ ] All settings persist to localStorage
- [ ] Settings restore correctly on page reload
- [ ] Theme changes and syncs to system preference
- [ ] Grid density changes persist
- [ ] Column count changes persist
- [ ] Reset to defaults works with confirmation
- [ ] Visual indicators show modified settings
- [ ] Success toasts appear for all changes
- [ ] Status badges display correctly
- [ ] Live preview updates in real-time
- [ ] Keyboard navigation works throughout
- [ ] Tab order is logical
- [ ] Arrow keys navigate within groups
- [ ] Escape closes dialogs
- [ ] Screen reader announces changes
- [ ] Focus traps in modals
- [ ] Focus indicators are visible
- [ ] All controls have accessible labels
- [ ] Landmark regions are properly marked
- [ ] Layout is responsive (mobile/tablet/desktop)
- [ ] Touch targets are adequate size (44px min)
- [ ] Loading states show correctly
- [ ] Error messages display appropriately

### Type Checking
- Run `npm run check-types` and fix all errors
- Ensure no `any` types used
- Verify strict type safety throughout

### Build Verification
- Run `npm run build` and ensure success
- Check for console warnings
- Verify bundle size acceptable
- Test production build locally

## Dependencies
- Existing: React, Zustand, TanStack Router, Tailwind CSS, shadcn/ui
- Existing: @tiny-till/types for types
- Existing: lucide-react for icons
- Existing: sonner for toasts
- New: @axe-core/react for accessibility testing (if needed)

## Success Criteria
1. All settings persist to localStorage correctly
2. Settings restore on page reload
3. System theme preference syncs automatically
4. Reset to defaults works with confirmation
5. Visual indicators show for all changes
6. Success toasts appear for all changes
7. Keyboard navigation works throughout
8. Screen reader support is complete
9. Accessibility tests pass (axe-core)
10. Unit tests pass with good coverage
11. Integration tests pass
12. Type checking passes without errors
13. Build succeeds without warnings
14. No `any` types used
15. Code follows project conventions
16. Manual testing checklist complete
