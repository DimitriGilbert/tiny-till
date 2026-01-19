# Browser Compatibility

This document tracks known browser-specific issues and workarounds for Tiny-Till.

## Table of Contents

- [Overview](#overview)
- [iOS Safari](#ios-safari)
- [Chrome Android](#chrome-android)
- [Firefox Desktop](#firefox-desktop)
- [Safari Desktop](#safari-desktop)
- [Chrome Desktop](#chrome-desktop)
- [Testing Focus Areas](#testing-focus-areas)

## Overview

Tiny-Till is tested on the following browsers and devices:

### High Priority (Must Support)
- Chrome Desktop (macOS/Windows) - Latest, Latest-1
- Firefox Desktop (macOS/Windows) - Latest, Latest-1
- Safari Desktop (macOS) - Latest, Latest-1
- Chrome iOS (iPhone SE, iPhone 14) - Latest, Latest-1
- Safari iOS (iPhone SE, iPhone 14) - Latest, Latest-1
- Chrome Android (Pixel 5, Galaxy S21) - Latest, Latest-1

### Medium Priority (Should Support)
- Firefox Android (Pixel 5) - Latest

## iOS Safari

### Known Issues

#### 1. Backdrop Filter Not Supported (iOS < 16)

**Description**: The `backdrop-filter` CSS property is not supported on iOS versions below 16.

**Impact**: Glass-morphism effects may not appear on older iOS devices.

**Workaround**:
```css
.glass-effect {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}

/* Fallback for iOS < 16 */
@supports not (backdrop-filter: blur(10px)) {
  .glass-effect {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

**Test Focus**: Verify glass effects have readable fallback on iOS 15.

#### 2. 100vh Includes Address Bar

**Description**: On iOS Safari, `100vh` includes the address bar height, causing content to be cut off.

**Impact**: Full-screen layouts may have content hidden behind the address bar.

**Workaround**:
```css
.full-screen {
  height: 100vh;
  height: -webkit-fill-available;
  height: dvh; /* Dynamic viewport height (iOS 16+) */
}
```

**Test Focus**: Verify content is fully visible without scrolling on all iOS viewports.

#### 3. Touch Event Timing Differences

**Description**: iOS Safari has different timing for touch events compared to other browsers.

**Impact**: Double-tap or long-press gestures may not work as expected.

**Workaround**:
```typescript
element.addEventListener('touchend', (e) => {
  e.preventDefault();
  // Handle touch
}, { passive: false });
```

**Test Focus**: Test touch interactions on iOS devices to ensure gestures work correctly.

#### 4. Safe Area Notches

**Description**: Modern iPhones have notches that can obscure content.

**Impact**: Content near edges may be hidden by the notch.

**Workaround**:
```css
.container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**Test Focus**: Verify content is not obscured by notches on iPhone X and later.

#### 5. Auto-scroll on Input Focus

**Description**: iOS Safari automatically scrolls to show the virtual keyboard when an input is focused.

**Impact**: Layout may shift unexpectedly when users interact with inputs.

**Workaround**: Use fixed positioning for modals and ensure sufficient padding.

**Test Focus**: Test input interactions on mobile devices to ensure layout doesn't break.

### Test Focus Areas

- [ ] PWA install prompt behavior
- [ ] Service worker caching
- [ ] IndexedDB storage limits
- [ ] Touch interactions and gestures
- [ ] Virtual keyboard behavior
- [ ] Safe area handling
- [ ] Orientation changes
- [ ] Low memory mode
- [ ] Offline functionality
- [ ] Address bar auto-hide behavior

## Chrome Android

### Known Issues

#### 1. Overscroll Behavior Inconsistent

**Description**: Chrome Android has inconsistent overscroll behavior across versions.

**Impact**: Pull-to-refresh or bounce effects may interfere with app behavior.

**Workaround**:
```css
.no-overscroll {
  overscroll-behavior: contain;
}
```

**Test Focus**: Test scrolling behavior on Android devices to ensure overscroll doesn't interfere.

#### 2. Autocomplete Interferes with Custom Inputs

**Description**: Chrome's autocomplete can interfere with custom input components.

**Impact**: Autocomplete suggestions may appear over custom UI elements.

**Workaround**:
```html
<input autocomplete="off" />
```

**Test Focus**: Verify autocomplete doesn't interfere with custom input components.

#### 3. Chrome Data Saver Affects Offline Functionality

**Description**: Data Saver mode can affect offline functionality and caching.

**Impact**: Service worker caching may not work as expected.

**Workaround**: Test with Data Saver enabled and disabled.

**Test Focus**: Test offline functionality with and without Data Saver.

#### 4. Touch Targets Too Small

**Description**: Android guidelines recommend larger touch targets (48dp vs iOS 44pt).

**Impact**: Touch targets may be too small for optimal Android experience.

**Workaround**:
```css
.touch-target {
  min-width: 48px;
  min-height: 48px;
}
```

**Test Focus**: Ensure all interactive elements meet 48x48px minimum on Android.

#### 5. Back Button Navigation

**Description**: Chrome Android's back button can interfere with app navigation.

**Impact**: Users may navigate away unexpectedly when using the system back button.

**Workaround**: Implement proper route guards and confirm before leaving with unsaved changes.

**Test Focus**: Test back button behavior and ensure navigation guards work.

### Test Focus Areas

- [ ] Touch interactions and gestures
- [ ] Back button navigation handling
- [ ] Address bar behavior on scroll
- [ ] Virtual keyboard behavior
- [ ] Overscroll and pull-to-refresh
- [ ] Data Saver mode
- [ ] Accessibility features
- [ ] Dark mode support
- [ ] Screen reader compatibility
- [ ] Offline functionality

## Firefox Desktop

### Known Issues

#### 1. Grid Layout Slight Differences

**Description**: Firefox has slight differences in CSS Grid implementation.

**Impact**: Grid layouts may have minor pixel differences compared to Chrome.

**Workaround**: Use explicit track sizes and gaps:
```css
.grid {
  grid-template-columns: repeat(6, minmax(150px, 1fr));
  gap: 16px;
}
```

**Test Focus**: Verify grid layouts look correct on Firefox.

#### 2. Web Speech API Differences

**Description**: Firefox's implementation of Web Speech API differs from Chrome.

**Impact**: Speech recognition features may not work or work differently.

**Workaround**: Feature detect speech API and provide fallback:
```typescript
const supportsSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
```

**Test Focus**: Verify speech features work or have appropriate fallbacks.

#### 3. IndexedDB Transaction Timing

**Description**: Firefox has different transaction timing compared to Chrome.

**Impact**: Operations may complete at different times, affecting test flakiness.

**Workaround**: Use proper transaction handling:
```typescript
const transaction = db.transaction(['store'], 'readwrite');
transaction.oncomplete = () => {
  // Transaction complete
};
```

**Test Focus**: Verify IndexedDB operations complete correctly on Firefox.

#### 4. Flexbox Rendering Differences

**Description**: Firefox has different flexbox rendering in edge cases.

**Impact**: Flex layouts may have minor differences.

**Workaround**: Use explicit flex properties and avoid ambiguous values.

**Test Focus**: Verify flex layouts render correctly on Firefox.

#### 5. Font Rendering Differences

**Description**: Firefox renders fonts differently from other browsers.

**Impact**: Text may appear slightly different in size or spacing.

**Workaround**: Use system fonts and consistent font sizing.

**Test Focus**: Verify text is readable and correctly sized on Firefox.

### Test Focus Areas

- [ ] Responsive grid layouts
- [ ] Storage quota warnings
- [ ] Service worker registration
- [ ] IndexedDB operations
- [ ] Text rendering and spacing
- [ ] Form validation
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Accessibility features
- [ ] Performance under load

## Safari Desktop

### Known Issues

#### 1. IndexedDB Quota Limits

**Description**: Safari has stricter IndexedDB quota limits than other browsers.

**Impact**: Large catalogs with images may hit storage limits sooner.

**Workaround**: Monitor storage usage and warn user:
```javascript
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(({usage, quota}) => {
    const percentage = (usage / quota) * 100;
    if (percentage > 80) {
      // Warn user
    }
  });
}
```

**Test Focus**: Test with large catalogs to ensure storage limits are handled.

#### 2. WebKit Layout Thrashing

**Description**: Safari is more prone to layout thrashing (forced reflows).

**Impact**: Performance may degrade with frequent DOM reads/writes.

**Workaround**: Batch DOM operations and use requestAnimationFrame.

**Test Focus**: Test performance with large catalogs and frequent updates.

#### 3. Date Input Formatting

**Description**: Safari has different date input formatting compared to other browsers.

**Impact**: Date inputs may appear differently or not work as expected.

**Workaround**: Use custom date inputs or consistent formatting.

**Test Focus**: Verify date inputs work correctly on Safari.

#### 4. Service Worker Caching Behavior

**Description**: Safari's service worker caching behavior can be inconsistent.

**Impact**: Offline functionality may not work as expected.

**Workaround**: Implement proper cache strategies and test thoroughly.

**Test Focus**: Verify service worker caching works correctly on Safari.

#### 5. Touch Event Support

**Description**: Safari Desktop has limited touch event support compared to iOS Safari.

**Impact**: Touch gestures may not work on Safari Desktop.

**Workaround**: Support both mouse and touch events.

**Test Focus**: Verify interactions work with both mouse and touch on Safari Desktop.

### Test Focus Areas

- [ ] Service worker caching
- [ ] IndexedDB storage limits
- [ ] Performance with large datasets
- [ ] Date/time inputs
- [ ] Touch and mouse interactions
- [ ] Form validation
- [ ] Keyboard navigation
- [ ] Accessibility features
- [ ] Offline functionality
- [ ] PWA features

## Chrome Desktop

### Known Issues

#### 1. Autofill Interference

**Description**: Chrome's autofill can interfere with custom input styling.

**Impact**: Autofill suggestions may overlap custom input styling.

**Workaround**:
```css
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset;
}
```

**Test Focus**: Verify inputs work correctly with autofill enabled.

#### 2. Spell Check Underlines

**Description**: Chrome's spell check adds underlines that may interfere with custom styling.

**Impact**: Spell check underlines may appear on inputs where they're not wanted.

**Workaround**:
```html
<input spellcheck="false" />
```

**Test Focus**: Verify spell check doesn't interfere with input styling.

#### 3. Input Autocapitalize

**Description**: Chrome autocapitalizes input text, which may not be desired.

**Impact**: Inputs may have unexpected capitalization.

**Workaround**:
```html
<input autocapitalize="off" />
```

**Test Focus**: Verify input capitalization behavior.

#### 4. Vibration API Limitations

**Description**: Chrome limits vibration API usage.

**Impact**: Haptic feedback may not work as expected.

**Workaround**: Feature detect and provide fallback.

**Test Focus**: Verify haptic feedback works or has appropriate fallback.

#### 5. Media Queries Precision

**Description**: Chrome has high precision in media queries, which can cause flickering at exact breakpoints.

**Impact**: Layout may flicker at exact breakpoint values.

**Workaround**: Use ranges instead of exact values in media queries.

**Test Focus**: Verify layouts don't flicker at breakpoints.

### Test Focus Areas

- [ ] Form validation
- [ ] Autocomplete and autofill
- [ ] Keyboard navigation
- [ ] Accessibility features
- [ ] Performance with large datasets
- [ ] Service worker caching
- [ ] Offline functionality
- [ ] PWA features
- [ ] Spell check behavior
- [ ] Input interactions

## Testing Focus Areas

### Cross-Browser Testing Checklist

- [ ] **Layout**: Verify layouts render correctly on all browsers
- [ ] **Typography**: Verify text is readable and properly sized
- [ ] **Color**: Verify colors render correctly and meet contrast requirements
- [ ] **Interactions**: Verify all user interactions work smoothly
- [ ] **Forms**: Verify form inputs work and validate correctly
- [ ] **Navigation**: Verify navigation between routes works
- [ ] **Storage**: Verify data persistence and retrieval works
- [ ] **Performance**: Verify performance is acceptable on all browsers
- [ ] **Accessibility**: Verify accessibility features work correctly
- [ ] **Offline**: Verify offline functionality works correctly

### Device-Specific Testing

#### Mobile Testing
- [ ] Touch interactions work smoothly
- [ ] Virtual keyboard doesn't interfere with UI
- [ ] Gestures work as expected
- [ ] Safe areas are respected
- [ ] Orientation changes work correctly
- [ ] Performance is acceptable
- [ ] Battery usage is reasonable

#### Desktop Testing
- [ ] Mouse interactions work smoothly
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Hover states work correctly
- [ ] Scroll behavior is smooth
- [ ] Performance is acceptable

### Progressive Enhancement

- [ ] Features degrade gracefully on unsupported browsers
- [ ] Polyfills are used where appropriate
- [ ] Feature detection is used instead of browser detection
- [ ] Fallbacks are provided for unsupported features
- [ ] Error messages are clear and helpful

### Performance Testing

- [ ] Initial load time is acceptable
- [ ] Time to interactive is acceptable
- [ ] Scrolling is smooth (60fps)
- [ ] Animations are smooth
- [ ] Memory usage is reasonable
- [ ] No layout thrashing
- [ ] No jank during interactions

## Reporting Issues

When reporting browser-specific issues, include:

1. **Browser and version**: "Chrome 120, Safari 17, Firefox 121"
2. **OS and version**: "macOS 14, iOS 17, Windows 11, Android 14"
3. **Device**: "iPhone 14 Pro, Pixel 7, MacBook Pro M3"
4. **Steps to reproduce**: Detailed steps to reproduce the issue
5. **Expected behavior**: What should happen
6. **Actual behavior**: What actually happens
7. **Screenshots/videos**: Visual evidence of the issue
8. **Console errors**: Any console errors or warnings
9. **Network requests**: Relevant network activity

## Maintenance

### Regular Testing Schedule

- **Weekly**: Test on latest browser versions
- **Monthly**: Test on latest-1 browser versions
- **Quarterly**: Full cross-browser audit
- **Release cycle**: Test on all supported browsers before release

### Update Schedule

- When new browser versions are released
- When new iOS/Android versions are released
- When new device models are released
- When browser deprecations are announced

### Browser Deprecation

When browsers are deprecated:

1. Update browser matrix
2. Update test configurations
3. Document breaking changes
4. Update this document
5. Communicate changes to team

## Resources

- [Browser Compatibility Data (MDN)](https://developer.mozilla.org/en-US/docs/Web)
- [Can I Use](https://caniuse.com/)
- [Web Platform Tests](https://wpt.fyi/)
- [Playwright Browser Support](https://playwright.dev/docs/browsers)
- [Safari WebKit Release Notes](https://webkit.org/blog/)
- [Chrome Platform Status](https://www.chromestatus.com/)
- [Firefox Platform Status](https://platform-status.mozilla.org/)
