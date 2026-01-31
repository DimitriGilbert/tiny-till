# Implementation Plan: Core Theme Management System with OS Preference Detection

## Task Overview
Create comprehensive Zustand store for theme state management supporting light, dark, and system modes with automatic OS preference detection, real-time updates, localStorage persistence, and seamless transitions.

## Current State Analysis

### Existing Infrastructure
- **ThemeProvider**: Currently uses `next-themes` library in `apps/web/src/components/theme-provider.tsx`
- **Settings Store**: Contains basic theme state but lacks comprehensive management
- **CSS Variables**: Defined in `apps/web/src/index.css` for light (default) and dark themes
- **Zustand**: Available and actively used for state management
- **Theme Type**: Defined as `'light' | 'dark' | 'system'` in packages
- **Persistence**: IndexedDB-based persist middleware available
- **Current Theme Toggle**: Using `next-themes` with `attribute="class"` and storage key `"vite-ui-theme"`

### Key Observations
1. CSS theme switching is already in place (`.dark` class on html/body)
2. The settings store has theme property but needs to be enhanced or separated
3. Need to migrate from `next-themes` to custom Zustand implementation
4. localStorage is preferred over IndexedDB for theme (simpler, faster access)

## Implementation Steps

### Step 1: Create Dedicated Theme Store
**File**: `apps/web/src/stores/theme-store.ts`

**Actions**:
1. Create new Zustand store `useThemeStore` with:
   - State:
     - `theme`: Theme ('light' | 'dark' | 'system')
     - `resolvedTheme`: 'light' | 'dark' (actual applied theme)
     - `isHydrated`: boolean (tracking hydration status)
   - Actions:
     - `setTheme(theme: Theme)`: Set theme mode
     - `toggleTheme()`: Cycle through light -> dark -> system -> light
     - `resetToSystem()`: Reset to system preference
     - `applyTheme(theme: 'light' | 'dark')`: Internal action to apply CSS class

2. Implement OS preference detection:
   - Use `window.matchMedia('(prefers-color-scheme: dark)')`
   - Set up event listener for real-time OS preference changes
   - Update `resolvedTheme` when OS preference changes (only when theme mode is 'system')

3. Implement localStorage persistence:
   - Use zustand's `persist` middleware
   - Store key: `STORAGE_KEYS.THEME` (add to storage-keys.ts)
   - Partialize to persist only `theme` (not `resolvedTheme` or `isHydrated`)

4. Implement migration logic:
   - Check for legacy `next-themes` storage key (`vite-ui-theme`)
   - Migrate 'system' mode to detected OS preference on first load
   - Clean up legacy storage after migration

5. Implement CSS class application:
   - Apply/remove `.dark` class on `<html>` element
   - Apply to `<body>` as fallback
   - Handle transitions smoothly

**Dependencies**:
- `zustand` ✓ (already installed)
- Add storage key constant

### Step 2: Update Storage Keys
**File**: `apps/web/src/lib/storage-keys.ts`

**Actions**:
1. Add `THEME: 'tiny-till-theme'` to `STORAGE_KEYS` constant

### Step 3: Create Theme Utility Functions
**File**: `apps/web/src/lib/theme-utils.ts` (new file)

**Actions**:
1. Create utility functions:
   - `getSystemTheme()`: Detect system preference using matchMedia
   - `applyThemeToDOM(theme: 'light' | 'dark')`: Apply CSS class to DOM
   - `removeThemeFromDOM()`: Remove theme class
   - `migrateLegacyTheme()`: Migrate from next-themes storage

2. Create React hook for theme detection:
   - `useSystemTheme()`: Hook that listens to OS preference changes

### Step 4: Add Theme Transition Styles
**File**: `apps/web/src/index.css`

**Actions**:
1. Add smooth transitions for theme-related CSS variables:
   - Add `transition-property` for color variables
   - Set appropriate `transition-duration` (200-300ms)
   - Use `transition-timing-function` for smooth easing

2. Add disable transitions class:
   - Create `.no-theme-transition` class to disable transitions temporarily
   - Prevent FOUC (Flash of Unstyled Content) during hydration

**Example additions**:
```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
}

.no-theme-transition,
.no-theme-transition * {
  transition: none !important;
}
```

### Step 5: Update Theme Provider Component
**File**: `apps/web/src/components/theme-provider.tsx`

**Actions**:
1. Replace `next-themes` implementation with Zustand store integration
2. Create new `ThemeProvider` component that:
   - Hydrates theme store on mount
   - Prevents FOUC by hiding content until hydration completes
   - Provides theme context for child components

3. Export `useTheme` hook from store:
   - Re-export `useThemeStore` or create convenience hook
   - Provide consistent API with previous implementation

4. Maintain backward compatibility:
   - Keep same component interface (`{ children, ...props }`)
   - Accept `defaultTheme`, `storageKey` props for migration

### Step 6: Update Root Route
**File**: `apps/web/src/routes/__root.tsx`

**Actions**:
1. Update ThemeProvider props:
   - Remove `disableTransitionOnChange` (handle in CSS)
   - Update `storageKey` if needed
   - Keep `attribute="class"` (still needed)

2. Ensure ThemeProvider wraps entire app
   - Already in place, verify no changes needed

### Step 7: Update Settings Store (Optional but Recommended)
**File**: `apps/web/src/stores/settings-store.ts`

**Actions**:
1. Remove theme management from settings store:
   - Remove `theme` from SettingsState
   - Remove `setTheme` from SettingsActions
   - Remove theme from initialState

2. Or integrate with theme store:
   - Keep theme in settings for unified settings UI
   - Delegate to theme store for actual theme management
   - **Decision**: Remove to keep concerns separate

3. Update validation helpers:
   - Remove `validateThemeChange` if it exists
   - Clean up theme-related validation

### Step 8: Create Theme Context (Alternative Approach)
**File**: `apps/web/src/contexts/theme-context.tsx` (optional)

**Actions**:
1. If Context API is preferred for components:
   - Create ThemeContext using theme store
   - Provide `ThemeProvider` component using Context
   - Export `useTheme` hook

2. **Decision**: Use Zustand directly (simpler, no Context needed)

### Step 9: Update Environment/Validation
**File**: Check validation helpers if needed

**Actions**:
1. Remove theme validation if exists
2. Add simple validation in theme store if needed
3. Ensure type safety with Theme type

### Step 10: Testing Considerations
**Manual Testing Checklist**:
1. Theme switching works between light, dark, system
2. OS preference changes are detected in real-time
3. Theme persists across page refreshes
4. Migration from next-themes works
5. No FOUC on page load
6. Transitions are smooth
7. System mode respects OS preference
8. Can switch away from system mode
9. Can reset to system mode

## File Changes Summary

### New Files
1. `apps/web/src/stores/theme-store.ts` - Main theme store
2. `apps/web/src/lib/theme-utils.ts` - Theme utility functions

### Modified Files
1. `apps/web/src/lib/storage-keys.ts` - Add THEME key
2. `apps/web/src/lib/index.css` - Add theme transitions
3. `apps/web/src/components/theme-provider.tsx` - Replace with Zustand integration
4. `apps/web/src/stores/settings-store.ts` - Remove theme management
5. `apps/web/src/routes/__root.tsx` - Update ThemeProvider props (if needed)

### Files to Remove (Optional)
- None (keep next-themes for potential future use or remove dependency)

## Technical Implementation Details

### Theme Store Structure
```typescript
interface ThemeState {
  theme: Theme              // 'light' | 'dark' | 'system'
  resolvedTheme: 'light' | 'dark'  // Actually applied
  isHydrated: boolean
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resetToSystem: () => void
  _applyTheme: (theme: 'light' | 'dark') => void  // Internal
  _syncSystemTheme: () => void  // Internal
}
```

### OS Preference Detection Flow
1. On store creation, check `window.matchMedia('(prefers-color-scheme: dark)')`
2. If `theme === 'system'`, set `resolvedTheme` based on matchMedia result
3. Add event listener for `change` event on matchMedia
4. On OS preference change, update `resolvedTheme` if `theme === 'system'`
5. Apply CSS class to DOM immediately

### Migration Flow
1. On store creation, check for legacy `vite-ui-theme` in localStorage
2. If found, parse value ('light', 'dark', 'system')
3. If 'system', detect current OS preference
4. Store new value in new storage key
5. Delete legacy storage key
6. Apply theme to DOM

### Persistence Strategy
- Use zustand's `persist` middleware
- Persist only `theme` (user's preference)
- Do not persist `resolvedTheme` (recalculated)
- Use localStorage (not IndexedDB) for faster access
- Hydrate before rendering to prevent FOUC

### DOM Application
- Apply `.dark` class to `<html>` element
- Apply to `<body>` as fallback
- Use `document.documentElement` for direct access
- Update on theme changes and OS preference changes

### Transitions
- Add CSS transitions for color-related properties
- Disable transitions during hydration (add `.no-theme-transition`)
- Enable transitions after hydration complete
- Respect `prefers-reduced-motion` media query

## Priority Order
1. **High Priority**:
   - Create theme store with basic functionality
   - Implement OS preference detection
   - Add localStorage persistence
   - Update theme provider

2. **Medium Priority**:
   - Add theme transitions
   - Implement migration logic
   - Update settings store

3. **Low Priority**:
   - Add utility functions file (can be inline in store)
   - Update validation helpers (if needed)
   - Remove next-themes dependency

## Dependencies
- ✅ `zustand` (already installed)
- ✅ CSS variables (already defined)
- ✅ Theme type (already defined)
- None to install

## Risks & Mitigations

### Risk 1: FOUC (Flash of Unstyled Content)
- **Mitigation**: Hide content until theme hydration completes
- **Implementation**: Use `.no-theme-transition` class and loading state

### Risk 2: OS Preference Listener Not Cleaning Up
- **Mitigation**: Return cleanup function from useEffect in store initialization
- **Implementation**: Store listener reference in store or use external effect

### Risk 3: Migration Failing
- **Mitigation**: Try-catch migration, fallback to default if fails
- **Implementation**: Graceful degradation to 'system' mode

### Risk 4: Theme Updates Not Reflecting
- **Mitigation**: Ensure DOM updates happen immediately after state change
- **Implementation**: Use zustand's subscribe or custom effect

## Success Criteria
1. ✅ Theme store created with light, dark, system modes
2. ✅ OS preference detected and applied in real-time
3. ✅ Theme persists across page refreshes
4. ✅ Smooth transitions between themes
5. ✅ Migration from next-themes works correctly
6. ✅ No FOUC on page load
7. ✅ Reactive state updates without page refresh
8. ✅ All TypeScript types are correct
9. ✅ All linting and type checking passes
10. ✅ Build succeeds without errors

## Notes
- The current settings-store contains theme state that should be removed or delegated
- CSS variables are already defined for both themes, no changes needed there
- The `.dark` class selector is already in place (line 5 of index.css)
- Next-themes can remain in package.json or be removed (decision: remove to reduce bundle)
- Consider creating a composable theme hook for components that need theme information
