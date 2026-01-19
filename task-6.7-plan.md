# Task 6.7 Implementation Plan: Enhance Accessibility with Keyboard Navigation and ARIA

## Overview
This plan outlines a comprehensive accessibility enhancement for the tiny-till web application, focusing on keyboard navigation, ARIA support, focus management, semantic HTML, and reduced motion preferences.

## Current State Assessment

### Existing Accessibility Features
- **Utilities:** `accessibility-utils.ts` provides live region announcements, focus trapping, keyboard handlers
- **Focus Styles:** `focus-styles.ts` and `index.css` include focus indicators with `:focus-visible`
- **Reduced Motion:** Basic implementation in `index.css` using `prefers-reduced-motion`
- **Keyboard Navigation Hook:** `use-keyboard-navigation.ts` for grid navigation
- **Partial ARIA:** Some components have `aria-label`, `aria-live`, `aria-hidden`
- **Base UI Components:** Using Base UI primitives with built-in accessibility

### Gaps Identified
1. **Missing ARIA landmarks** (main, nav, banner, etc.)
2. **Inconsistent focus management** across all interactive elements
3. **Incomplete screen reader announcements** for dynamic content
4. **Limited keyboard shortcuts** documentation and implementation
5. **Missing skip links** for keyboard users
6. **Inconsistent form error associations**
7. **Dialogs lack proper focus trapping** (partial implementation)

---

## Implementation Phases

### Phase 1: Global Accessibility Enhancements

#### 1.1 Add Skip Link (High Priority)
**File:** `apps/web/src/main.tsx`

**Actions:**
- Add skip link component before the app root
- Style to be visible on focus, hidden otherwise
- Allow skipping to main content

```tsx
// After app root check
<SkipLink targetId="main-content" />
```

**File:** `apps/web/index.html`

**Actions:**
- Add `id="main-content"` to the main container element or ensure it's added via React

#### 1.2 Add ARIA Landmarks (High Priority)
**File:** `apps/web/src/routes/__root.tsx`

**Actions:**
- Wrap header with `<header role="banner">`
- Wrap navigation with `<nav aria-label="Main navigation">`
- Wrap main content area with `<main id="main-content" role="main">`
- Add aria-label to content regions (Tally vs Settings pages)

#### 1.3 Enhance Focus Management Utilities
**File:** `apps/web/src/lib/accessibility-utils.ts`

**Actions:**
- Add `restoreFocus()` utility to return focus after dialogs close
- Add `announceStatus()` for status changes
- Add `getKeyboardShortcutHint()` to generate accessible labels for keyboard shortcuts
- Document existing functions with JSDoc comments

#### 1.4 Create Skip Link Component
**File:** `apps/web/src/components/skip-link.tsx` (new)

**Actions:**
- Create skip link component
- Ensure proper styling (hidden by default, visible on focus)
- Support multiple skip targets

---

### Phase 2: Focus Indicators Enhancement

#### 2.1 Review and Enhance Focus Styles
**File:** `apps/web/src/index.css`

**Actions:**
- Verify focus ring contrast meets WCAG 2.1 AA standards (3:1 minimum)
- Test focus indicators in both light and dark modes
- Ensure focus indicators work for all interactive elements:
  - Buttons
  - Links
  - Inputs
  - Select dropdowns
  - Custom components (product cards, badges, etc.)
- Add high contrast mode support with `@media (prefers-contrast: more)`

#### 2.2 Add Focus Styles to Custom Components
**Files:**
- `apps/web/src/components/product-card.tsx`
- `apps/web/src/components/tally-product-card.tsx`
- `apps/web/src/components/header.tsx` (nav buttons)
- `apps/web/src/components/mode-toggle.tsx`

**Actions:**
- Apply consistent focus styles using `focusStyles` or `focusVisibleStyles` from `focus-styles.ts`
- Ensure all interactive buttons have visible focus indicators
- Test keyboard tab order through components

#### 2.3 Ensure Focus Management in All Interactive Components
**Files:** All component files with interactive elements

**Actions:**
- Verify `tabindex` attributes are correct
- Add `aria-pressed` for toggle buttons where applicable
- Add `aria-expanded` for dropdowns/accordions
- Ensure disabled state is properly communicated via `aria-disabled`

---

### Phase 3: Keyboard Navigation

#### 3.1 Document and Implement Global Keyboard Shortcuts
**File:** `apps/web/src/lib/keyboard-shortcuts.ts` (new)

**Actions:**
- Create constants for all keyboard shortcuts
- Implement keyboard shortcut handler
- Add on-screen shortcut hints where appropriate
- Document shortcuts in a modal/dialog

#### 3.2 Enhance Grid Keyboard Navigation
**File:** `apps/web/src/hooks/use-keyboard-navigation.ts`

**Actions:**
- Add Page Up/Page Down support for faster grid traversal
- Add ARIA announcements for focus changes
- Integrate with `announceToScreenReader()` for item selection
- Ensure proper focus management with virtual grid rendering

#### 3.3 Implement Keyboard Shortcuts in Tally Page
**File:** `apps/web/src/routes/index.tsx`

**Actions:**
- Add keyboard shortcut for clear cart (Ctrl/Cmd + Delete)
- Add keyboard shortcut for product search (Ctrl/Cmd + F)
- Add arrow key navigation for product cards (hook already exists, ensure integration)
- Document shortcuts in page aria-label

#### 3.4 Implement Keyboard Shortcuts in Settings Page
**File:** `apps/web/src/routes/settings.tsx`

**Actions:**
- Tab navigation through settings sections (already exists via default browser behavior)
- Add keyboard shortcut to reset settings (Ctrl/Cmd + R - already partially implemented)
- Ensure settings changes are announced to screen readers

#### 3.5 Add Keyboard Support to All Dialogs
**Files:**
- `apps/web/src/components/quantity-input-dialog.tsx`
- `apps/web/src/components/clear-cart-dialog.tsx`
- `apps/web/src/components/reset-settings-dialog.tsx`
- `apps/web/src/components/storage-cleanup-dialog.tsx`
- All other dialog components

**Actions:**
- Use `trapFocusInElement()` from `accessibility-utils.ts` for focus trapping
- Ensure Escape key closes dialogs (verify Base UI Dialog handles this)
- Store and restore previous focus on dialog close
- Ensure dialog content is focusable when opened

---

### Phase 4: ARIA Labels, Roles, and Landmarks

#### 4.1 Add ARIA Labels to Navigation
**File:** `apps/web/src/components/header.tsx`

**Actions:**
- Add `aria-label="Main navigation"` to nav element
- Add `aria-current="page"` to active navigation link
- Ensure navigation links have descriptive labels (already present)
- Add skip link target reference

#### 4.2 Add ARIA Labels to Product Cards
**Files:**
- `apps/web/src/components/product-card.tsx`
- `apps/web/src/components/tally-product-card.tsx`

**Actions:**
- Ensure `aria-label` includes: name, price, quantity (for tally cards)
- Add `aria-describedby` for additional info if needed
- Verify button roles are clear

#### 4.3 Add ARIA Labels to Form Inputs
**Files:**
- `apps/web/src/components/price-input.tsx`
- `apps/web/src/components/product-form.tsx`
- `apps/web/src/components/ImageUpload.tsx`

**Actions:**
- Ensure all inputs have associated labels (via `for` attribute or `aria-label`)
- Add `aria-describedby` to link inputs with error messages
- Add `aria-invalid` for validation errors
- Add `aria-required` for required fields

#### 4.4 Add ARIA to Settings Components
**Files:**
- `apps/web/src/components/theme-settings-section.tsx`
- `apps/web/src/components/density-settings-section.tsx`
- `apps/web/src/components/column-count-slider.tsx`
- `apps/web/src/components/backup-frequency-select.tsx`

**Actions:**
- Add `role="group"` to related form controls
- Add `aria-label` to setting groups
- Ensure radio buttons/selects have proper ARIA attributes
- Announce setting changes with `aria-live`

#### 4.5 Add ARIA to Toast Notifications
**File:** `apps/web/src/components/ui/sonner.tsx`

**Actions:**
- Verify sonner has proper ARIA roles and live region attributes
- Ensure toast announcements are respectful of screen reader interruptions
- Test with different toast types (success, error, warning, info)

#### 4.6 Add ARIA to Loading States
**File:** `apps/web/src/components/loading-state.tsx`

**Actions:**
- Add `role="status"` to loading messages
- Add `aria-live="polite"` for loading announcements
- Add `aria-busy` to containers with loading state

---

### Phase 5: Live Regions and Screen Reader Compatibility

#### 5.1 Enhance Live Region Announcements
**File:** `apps/web/src/lib/accessibility-utils.ts`

**Actions:**
- Add queueing mechanism for multiple announcements
- Add debouncing for rapid-fire announcements
- Add `announceStatus()` function for status changes
- Ensure announcements respect `aria-live` priority (polite vs assertive)

#### 5.2 Add Live Regions to Dynamic Content

##### Tally Page
**File:** `apps/web/src/routes/index.tsx`

**Actions:**
- Add live region for cart updates (total, item count)
- Announce when product is added/removed
- Announce when cart is cleared

##### Settings Page
**File:** `apps/web/src/routes/settings.tsx`

**Actions:**
- Live region for unsaved changes (already exists at line 287-294, verify)
- Announce when settings are saved
- Announce when settings are reset

##### Product Grid
**Files:**
- `apps/web/src/components/tally-product-card.tsx`
- `apps/web/src/components/product-card.tsx`

**Actions:**
- Announce quantity changes with `aria-live` (badge already has it, verify)
- Announce when products are loaded/empty state

#### 5.3 Add Screen Reader Only Labels
**Files:** Multiple components with icons

**Actions:**
- Ensure all icon-only buttons have `aria-label` or `sr-only` text
- Review ModeToggle, button icons, action buttons
- Add `aria-hidden="true"` to decorative icons (already present in some, verify all)

---

### Phase 6: Reduced Motion and Animations

#### 6.1 Review and Expand Reduced Motion Support
**File:** `apps/web/src/index.css`

**Actions:**
- Verify all animations respect `prefers-reduced-motion`
- Add reduced motion variants for custom animations:
  - `animate-pulse-once`
  - `animate-shake`
  - `animate-spring-pulse`
  - `animate-spring-enter`
  - `animate-spring-exit`
  - `animate-highlight`
  - `animate-ripple`
- Ensure animations in components use these utility classes

#### 6.2 Add Reduced Motion to Component Animations
**Files:**
- `apps/web/src/lib/animations.ts`
- All component files with animations

**Actions:**
- Create reduced motion variants in animation presets
- Apply reduced motion utilities consistently
- Test with `prefers-reduced-motion: reduce` enabled

---

### Phase 7: Semantic HTML Structure

#### 7.1 Audit Heading Hierarchy
**Files:** All route and component files

**Actions:**
- Ensure h1 is used once per page (Tally page, Settings page)
- Ensure heading hierarchy is logical (h1 → h2 → h3)
- Add `aria-level` if needed for non-semantic heading structures
- Use headings to structure content, not just for styling

#### 7.2 Use Semantic HTML Elements
**Files:**
- `apps/web/src/components/header.tsx`
- `apps/web/src/routes/index.tsx`
- `apps/web/src/routes/settings.tsx`

**Actions:**
- Use `<header>` for page headers
- Use `<nav>` for navigation
- Use `<main>` for main content
- Use `<section>` for content sections with `aria-label`
- Use `<article>` if appropriate for self-contained content
- Use `<aside>` for sidebar/secondary content (if applicable)
- Use `<ul>` and `<li>` for lists (product grid uses div, consider if semantic list is better)

#### 7.3 Ensure Proper Form Structure
**Files:**
- `apps/web/src/components/product-form.tsx`
- `apps/web/src/components/quantity-input-dialog.tsx`
- `apps/web/src/components/ImageUpload.tsx`

**Actions:**
- Use `<form>` element for forms
- Use `<fieldset>` and `<legend>` for related form groups
- Ensure proper label-input associations
- Use `<button type="submit">` for submit buttons
- Use `<button type="button">` for non-submit buttons

---

### Phase 8: Accessible Component Patterns

#### 8.1 Review and Enhance Dialog Components
**Files:**
- `apps/web/src/components/ui/dialog.tsx`
- All dialog components

**Actions:**
- Verify Base UI Dialog provides proper ARIA attributes
- Ensure `role="dialog"` or `role="alertdialog"`
- Ensure `aria-modal="true"`
- Ensure `aria-labelledby` and `aria-describedby` are set
- Test focus trapping with keyboard
- Test Escape key closes dialog
- Test focus restoration on close

#### 8.2 Review and Enhance Form Components
**Files:**
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/checkbox.tsx` (if exists)
- Form components

**Actions:**
- Ensure inputs have visible labels or accessible labels
- Link error messages with `aria-describedby`
- Use `aria-invalid` for invalid state
- Use `aria-required` for required fields
- Ensure form validation errors are announced

#### 8.3 Review and Enhance Button Components
**File:** `apps/web/src/components/ui/button.tsx`

**Actions:**
- Verify focus styles are adequate
- Ensure disabled state is properly styled and announced
- Add `aria-pressed` for toggle buttons
- Add `aria-expanded` for buttons that show/hide content

#### 8.4 Review and Enhance Grid/List Components
**Files:**
- `apps/web/src/components/virtualized-product-grid.tsx`
- `apps/web/src/components/virtual-grid-container.tsx`
- `apps/web/src/components/product-list.tsx` (if exists)

**Actions:**
- Add `role="grid"` for grid structures
- Add `role="gridcell"` or `role="listitem"` for items
- Ensure keyboard navigation works properly
- Announce row/column position for grids (if applicable)

---

### Phase 9: Testing and Validation

#### 9.1 Keyboard Navigation Testing
**Actions:**
- Test entire app with keyboard only (no mouse)
- Verify tab order is logical
- Test all keyboard shortcuts
- Test focus trapping in dialogs
- Test focus restoration after dialogs close
- Test arrow key navigation in grids

#### 9.2 Screen Reader Testing
**Actions:**
- Test with NVDA (Windows), VoiceOver (Mac), TalkBack (Android), VoiceOver (iOS)
- Verify all interactive elements are announced
- Verify dynamic content changes are announced
- Verify form errors are announced
- Verify navigation landmarks are recognized
- Verify skip links work

#### 9.3 Contrast Testing
**Actions:**
- Test focus indicators in light mode
- Test focus indicators in dark mode
- Verify all colors meet WCAG 2.1 AA standards
- Test with high contrast mode enabled

#### 9.4 Reduced Motion Testing
**Actions:**
- Enable `prefers-reduced-motion: reduce`
- Verify all animations are disabled
- Verify transitions respect preference
- Verify functionality is not affected

#### 9.5 Automated Testing
**Actions:**
- Run axe-core or similar accessibility linter
- Fix all critical and serious issues
- Address moderate and minor issues where possible

---

## File Changes Summary

### New Files to Create
1. `apps/web/src/components/skip-link.tsx` - Skip link component
2. `apps/web/src/lib/keyboard-shortcuts.ts` - Keyboard shortcuts management

### Files to Modify

#### Core Files
- `apps/web/index.html` - Add main content id
- `apps/web/src/main.tsx` - Add skip link integration
- `apps/web/src/index.css` - Enhanced focus styles, reduced motion

#### Route Files
- `apps/web/src/routes/__root.tsx` - Add ARIA landmarks
- `apps/web/src/routes/index.tsx` - Keyboard shortcuts, live regions
- `apps/web/src/routes/settings.tsx` - Live regions, keyboard shortcuts

#### Utility Files
- `apps/web/src/lib/accessibility-utils.ts` - Enhance utilities
- `apps/web/src/lib/focus-styles.ts` - Review and enhance

#### Component Files
- `apps/web/src/components/header.tsx` - ARIA labels, keyboard support
- `apps/web/src/components/mode-toggle.tsx` - ARIA labels
- `apps/web/src/components/product-card.tsx` - ARIA labels, focus styles
- `apps/web/src/components/tally-product-card.tsx` - ARIA labels, focus styles
- `apps/web/src/components/quantity-input-dialog.tsx` - Focus trapping
- `apps/web/src/components/clear-cart-dialog.tsx` - Focus trapping
- `apps/web/src/components/reset-settings-dialog.tsx` - Focus trapping
- `apps/web/src/components/storage-cleanup-dialog.tsx` - Focus trapping
- `apps/web/src/components/product-form.tsx` - ARIA labels, form structure
- `apps/web/src/components/price-input.tsx` - ARIA labels, error associations
- `apps/web/src/components/ImageUpload.tsx` - ARIA labels, error associations
- `apps/web/src/components/theme-settings-section.tsx` - ARIA labels
- `apps/web/src/components/density-settings-section.tsx` - ARIA labels
- `apps/web/src/components/column-count-slider.tsx` - ARIA labels
- `apps/web/src/components/backup-frequency-select.tsx` - ARIA labels
- `apps/web/src/components/loading-state.tsx` - ARIA roles, live regions
- `apps/web/src/components/ui/sonner.tsx` - Review ARIA attributes

#### UI Component Files
- `apps/web/src/components/ui/button.tsx` - Review ARIA attributes
- `apps/web/src/components/ui/dialog.tsx` - Verify ARIA attributes
- `apps/web/src/components/ui/input.tsx` - Review ARIA attributes
- `apps/web/src/components/ui/label.tsx` - Review associations

---

## Implementation Order

### Priority 1 (Critical for keyboard navigation)
1. Add skip link
2. Add ARIA landmarks to root layout
3. Enhance focus indicators (verify contrast)
4. Add focus trapping to all dialogs
5. Ensure all buttons have keyboard support

### Priority 2 (Screen reader support)
1. Add ARIA labels to navigation
2. Add ARIA labels to product cards
3. Add ARIA labels to form inputs
4. Add live regions for dynamic content
5. Add screen reader-only labels where needed

### Priority 3 (Enhanced UX)
1. Implement global keyboard shortcuts
2. Document keyboard shortcuts
3. Expand reduced motion support
4. Ensure semantic HTML structure
5. Enhance component patterns

### Priority 4 (Testing and validation)
1. Keyboard navigation testing
2. Screen reader testing
3. Contrast testing
4. Reduced motion testing
5. Automated accessibility testing

---

## Success Criteria

### WCAG 2.1 AA Compliance
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible and meet contrast requirements
- [ ] All pages have appropriate ARIA landmarks
- [ ] All form inputs have associated labels
- [ ] Error messages are associated with inputs
- [ ] Dynamic content changes are announced
- [ ] Reduced motion preferences are respected
- [ ] Color contrast meets AA standards
- [ ] Screen reader testing passed with at least one major screen reader

### Additional Success Criteria
- [ ] Skip link implemented and functional
- [ ] Dialogs properly trap focus
- [ ] Keyboard shortcuts documented
- [ ] No automated accessibility errors (axe-core critical/serious issues)
- [ ] Semantic HTML used throughout

---

## Notes and Considerations

### Existing Accessibility Features to Preserve
- `announceToScreenReader()` utility in `accessibility-utils.ts`
- `trapFocusInElement()` utility
- `use-keyboard-navigation.ts` hook
- `prefers-reduced-motion` support in `index.css`
- Base UI components' built-in accessibility

### Potential Conflicts
- Custom focus styles may conflict with Base UI components - need to test thoroughly
- Virtual grid rendering may complicate keyboard navigation - ensure proper implementation
- Touch gestures may conflict with keyboard navigation - prioritize keyboard for accessibility

### Dependencies
- Base UI React primitives (@base-ui/react) - leverage built-in accessibility where possible
- Existing utilities in `accessibility-utils.ts` and `focus-styles.ts`
- React 19 features for accessibility (if applicable)

### Testing Requirements
- Test across different browsers (Chrome, Firefox, Safari, Edge)
- Test with different screen readers (NVDA, VoiceOver, TalkBack, VoiceOver iOS)
- Test on different devices (desktop, mobile, tablet)
- Test with different accessibility settings (high contrast, reduced motion, screen magnification)

---

## Estimated Implementation Time

- **Phase 1-2:** 4-6 hours
- **Phase 3-4:** 6-8 hours
- **Phase 5-6:** 4-5 hours
- **Phase 7-8:** 5-7 hours
- **Phase 9:** 8-10 hours

**Total Estimated Time:** 27-36 hours

---

## Next Steps

1. Review this plan and adjust as needed
2. Begin with Priority 1 implementations
3. Test after each phase
4. Iterate based on test results
5. Document any deviations from the plan
