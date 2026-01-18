# Tiny-Till E2E Test Plan

## Overview
This document outlines the comprehensive end-to-end testing plan for the Tiny-Till application. Tests cover CRUD operations, image handling, data persistence, responsive design, accessibility, and cross-browser compatibility.

---

## Test Environment

### Required Devices/Browsers
- Chrome 120+ (Windows, macOS, Android)
- Firefox 121+ (Windows, macOS, Android)
- Safari 17+ (macOS, iOS)
- Edge 120+ (Windows, macOS)

### Device Testing
- iPhone 12+ (iOS 15+)
- Samsung Galaxy S21+ (Android 12+)
- iPad Air/iPad Pro (various sizes)
- Desktop (1920x1080, 1366x768, 2560x1440)

---

## Test Scenarios

### 1. Create Product Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| CP-01 | Add product with name and price only | 1. Navigate to Settings → Catalog<br>2. Click "Add Product"<br>3. Enter name "Test Product"<br>4. Enter price "9.99"<br>5. Click Save | Product added to catalog<br>Success toast displayed<br>Product visible in list |
| CP-02 | Add product with image | 1. Navigate to Settings → Catalog<br>2. Click "Add Product"<br>3. Enter name "Product with Image"<br>4. Enter price "15.50"<br>5. Upload valid image (≤128x128px)<br>6. Click Save | Product added with image<br>Image thumbnail displayed correctly |
| CP-03 | Add product with invalid name (empty) | 1. Click "Add Product"<br>2. Leave name empty<br>3. Enter price "10.00"<br>4. Click Save | Validation error shown<br>Product not added |
| CP-04 | Add product with invalid price (negative) | 1. Enter name "Test Product"<br>2. Enter price "-5.00"<br>3. Click Save | Validation error shown<br>Product not added |
| CP-05 | Add product with oversize image | 1. Enter name and price<br>2. Upload image >128x128px<br>3. Click Save | Validation error: "Image must be 128x128px or smaller"<br>Product not added |
| CP-06 | Add multiple products in succession | 1. Add 5 products with different names/prices<br>2. Verify each addition | All 5 products added<br>Catalog shows all products in order |
| CP-07 | Verify product persistence after reload | 1. Add product<br>2. Refresh page<br>3. Navigate to Catalog | Product still exists<br>Data persisted |
| CP-08 | Add product with duplicate name | 1. Add product "Duplicate"<br>2. Try to add another product "Duplicate" | Validation error: "Product name must be unique"<br>Second product not added |

### 2. Read Product Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| RP-01 | View empty catalog | 1. Clear all products<br>2. Navigate to Catalog | Empty state displayed with "Add Product" button |
| RP-02 | View catalog with single product | 1. Add one product<br>2. Navigate to Catalog | Product displayed in grid<br>Single column on mobile |
| RP-03 | View catalog with many products | 1. Add 20+ products<br>2. Navigate to Catalog<br>3. Scroll through list | All products displayed<br>Responsive grid adjusts columns |
| RP-04 | Search for product by name | 1. Add multiple products<br>2. Enter search query matching one product<br>3. View results | Only matching products shown<br>"X of Y products" count displayed |
| RP-05 | Search with no results | 1. Enter search query with no matches<br>2. View results | "No products found" message<br>Empty search icon displayed |
| RP-06 | Clear search | 1. Perform search<br>2. Click clear (X) button | Search query cleared<br>All products displayed |
| RP-07 | Verify product details display | 1. View product card<br>2. Check name, price, image | Name truncated if too long<br>Price formatted as currency<br>Image shown if available |

### 3. Update Product Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| UP-01 | Edit product name | 1. Click product<br>2. Change name<br>3. Save | Name updated<br>Success toast displayed |
| UP-02 | Edit product price | 1. Click product<br>2. Change price<br>3. Save | Price updated<br>Success toast displayed |
| UP-03 | Replace product image | 1. Click product<br>2. Upload new image<br>3. Save | Image replaced<br>New thumbnail displayed |
| UP-04 | Remove product image | 1. Click product<br>2. Click remove image<br>3. Save | Image removed<br>Placeholder shown |
| UP-05 | Edit multiple fields at once | 1. Click product<br>2. Change name, price, and image<br>3. Save | All fields updated |
| UP-06 | Cancel edit operation | 1. Click product<br>2. Make changes<br>3. Click Cancel | Dialog closes<br>No changes saved |
| UP-07 | Try invalid name during edit | 1. Edit product<br>2. Clear name field<br>3. Try to save | Validation error<br>Changes not saved |
| UP-08 | Verify updates persist after reload | 1. Edit product<br>2. Refresh page<br>3. Navigate to Catalog | Changes persist |

### 4. Delete Product Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| DP-01 | Delete single product | 1. Click delete icon on product<br>2. Confirm dialog | Product removed<br>Success toast displayed |
| DP-02 | Cancel delete operation | 1. Click delete icon<br>2. Click Cancel in dialog | Dialog closes<br>Product not deleted |
| DP-03 | Delete multiple products | 1. Delete 3 products one by one<br>2. Confirm each deletion | All 3 products removed |
| DP-04 | Verify deletion persists | 1. Delete product<br>2. Refresh page<br>3. Navigate to Catalog | Product still deleted |

### 5. Image Handling Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| IH-01 | Upload PNG image | 1. Select PNG file ≤128x128px<br>2. Upload | Image uploaded successfully |
| IH-02 | Upload JPEG image | 1. Select JPEG file ≤128x128px<br>2. Upload | Image uploaded successfully |
| IH-03 | Upload WebP image | 1. Select WebP file ≤128x128px<br>2. Upload | Image uploaded successfully |
| IH-04 | Drag and drop image | 1. Drag image to drop zone<br>2. Drop | Image uploaded successfully |
| IH-05 | Click to upload image | 1. Click upload area<br>2. Select file<br>3. Upload | Image uploaded successfully |
| IH-06 | Remove image after upload | 1. Upload image<br>2. Click remove<br>3. Save | Image removed |
| IH-07 | Attempt invalid image type | 1. Select .gif file<br>2. Try to upload | Validation error<br>Image not uploaded |
| IH-08 | Attempt oversized image | 1. Select 200x200px image<br>2. Try to upload | Validation error: "Image must be 128x128px or smaller" |
| IH-09 | Verify image display quality | 1. Upload image<br>2. Check thumbnail | Thumbnail crisp and clear |
| IH-10 | Image lazy loading | 1. Add many products with images<br>2. Scroll fast | Images load as they appear<br>No layout shift |

### 6. Export Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| EX-01 | Export empty catalog | 1. Clear all products<br>2. Click "Export Catalog"<br>3. Confirm warning | JSON file downloaded<br>Contains empty products array |
| EX-02 | Export catalog with products | 1. Add 10 products<br>2. Click "Export Catalog" | JSON file downloaded<br>All products included |
| EX-03 | Export catalog with images | 1. Add products with images<br>2. Export | JSON includes image data<br>File size reasonable |
| EX-04 | Verify export file format | 1. Export catalog<br>2. Open JSON file<br>3. Validate schema | Valid JSON structure<br>Matches expected schema |
| EX-05 | Verify export timestamp | 1. Export catalog<br>2. Check filename | Filename includes date: `tiny-till-catalog-YYYY-MM-DD.json` |

### 7. Import Workflow

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| IM-01 | Import valid catalog | 1. Click "Import Catalog"<br>2. Select valid JSON file<br>3. Confirm import | Products imported<br>Success summary displayed |
| IM-02 | Import with overwrite | 1. Import catalog with matching IDs<br>2. Confirm import | Existing products updated<br>New products added |
| IM-03 | Import corrupt JSON | 1. Select invalid JSON file<br>2. Try to import | Error: "Invalid JSON file"<br>No changes to catalog |
| IM-04 | Import wrong schema | 1. Select JSON with wrong structure<br>2. Try to import | Error: "File is missing required fields" |
| IM-05 | Cancel import | 1. Select file<br>2. Preview import<br>3. Click Cancel | Dialog closes<br>No changes to catalog |

### 8. Responsive Design Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| RD-01 | Mobile view (320-640px) | 1. Resize to 320px width<br>2. Navigate to Catalog | 1 column grid<br>Header stacked<br>Buttons full width |
| RD-02 | Small mobile view (640-768px) | 1. Resize to 640px width<br>2. Navigate to Catalog | 2 column grid |
| RD-03 | Tablet view (768-1024px) | 1. Resize to 768px width<br>2. Navigate to Catalog | 3-4 column grid |
| RD-04 | Desktop view (1024-1280px) | 1. Resize to 1024px width<br>2. Navigate to Catalog | 4-5 column grid |
| RD-05 | Large desktop view (1280px+) | 1. Resize to 1280px width<br>2. Navigate to Catalog | 6 column grid |
| RD-06 | Touch targets on mobile | 1. Navigate on mobile<br>2. Tap buttons and cards | All touch targets ≥44x44px<br>Responsive to touch |
| RD-07 | Search bar on mobile | 1. Resize to mobile<br>2. Use search bar | Search bar full width<br>Clear button visible |

### 9. Accessibility Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| AC-01 | Keyboard navigation | 1. Use Tab to navigate<br>2. Use Enter to activate | All interactive elements accessible<br>Logical tab order |
| AC-02 | Focus indicators | 1. Tab through page<br>2. Observe focus | Visible focus ring on all elements |
| AC-03 | Escape key closes modals | 1. Open modal/dialog<br>2. Press Escape | Modal/dialog closes |
| AC-04 | Screen reader navigation (NVDA) | 1. Use NVDA on Windows<br>2. Navigate catalog | All elements announced<br>Proper ARIA labels |
| AC-05 | Screen reader navigation (VoiceOver) | 1. Use VoiceOver on macOS/iOS<br>2. Navigate catalog | All elements announced<br>Proper ARIA labels |
| AC-06 | Color contrast | 1. Check contrast ratios<br>2. Use contrast checker | All text ≥4.5:1 contrast |
| AC-07 | Reduced motion preference | 1. Enable "prefers-reduced-motion"<br>2. Navigate app | Animations disabled/respected |
| AC-08 | High contrast mode | 1. Enable high contrast mode<br>2. Navigate app | UI remains readable |
| AC-09 | Font scaling | 1. Increase browser font size to 200%<br>2. Navigate app | No layout break<br>Text remains readable |

### 10. Performance Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| PF-01 | Initial load time | 1. Clear cache<br>2. Load app | Load time < 2s on 4G |
| PF-02 | Time to interactive | 1. Load app<br>2. Measure TTI | TTI < 3s |
| PF-03 | Scroll performance with 100 products | 1. Add 100 products<br>2. Scroll through list | Frame rate > 60fps |
| PF-04 | Memory usage | 1. Add 100 products<br>2. Monitor memory | Memory < 100MB |
| PF-05 | Image loading performance | 1. Add many products with images<br>2. Scroll | Images load progressively<br>No blocking |

### 11. Error Handling Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| EH-01 | Network error during export | 1. Disable network<br>2. Try to export | Error toast displayed<br>No app crash |
| EH-02 | Storage quota exceeded | 1. Fill IndexedDB quota<br>2. Try to add product | Error message displayed<br>Graceful handling |
| EH-03 | Invalid image format | 1. Try to upload invalid file | Validation error shown<br>Image not processed |
| EH-04 | React error boundary | 1. Trigger React error<br>2. Observe UI | Error fallback displayed<br>App remains usable |
| EH-05 | Clear error action | 1. Trigger error<br>2. Click "Clear Data" | Data cleared<br>Error dismissed |
| EH-06 | Retry failed operation | 1. Trigger error<br>2. Click "Retry" | Operation retried<br>Success on retry |

### 12. Cross-Browser Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|----------------|
| CB-01 | Chrome functionality | 1. Open in Chrome<br>2. Test all features | All features work |
| CB-02 | Firefox functionality | 1. Open in Firefox<br>2. Test all features | All features work |
| CB-03 | Safari functionality (macOS) | 1. Open in Safari<br>2. Test all features | All features work |
| CB-04 | Safari functionality (iOS) | 1. Open on iPhone<br>2. Test all features | All features work<br>Touch gestures work |
| CB-05 | Edge functionality | 1. Open in Edge<br>2. Test all features | All features work |
| CB-06 | Browser-specific rendering | 1. Compare UI across browsers<br>2. Check for differences | Consistent appearance<br>Minor differences acceptable |

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Clear browser cache and cookies
- [ ] Reset application data
- [ ] Open DevTools for monitoring
- [ ] Enable Lighthouse for performance testing
- [ ] Enable axe DevTools for accessibility testing

### During Testing
- [ ] Document all issues with screenshots
- [ ] Note browser/device combinations
- [ ] Record performance metrics
- [ ] Check console for errors
- [ ] Verify error messages are user-friendly

### Post-Test
- [ ] Compile test results
- [ ] Prioritize bugs by severity
- [ ] Create GitHub issues for bugs
- [ ] Update documentation if needed
- [ ] Verify fixes resolve issues

---

## Bug Reporting Template

```
**Bug ID:** TEST-XXX
**Title:** [Brief description]
**Severity:** Critical/High/Medium/Low
**Browser/Version:** [Browser and version]
**Device:** [Device name and OS]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Expected Result:** [What should happen]
**Actual Result:** [What actually happens]
**Screenshots:** [Attach if applicable]
**Console Errors:** [Any error messages]
**Additional Notes:** [Any other relevant information]
```

---

## Pass/Fail Criteria

A test scenario is considered PASSED when:
- All steps execute without errors
- Expected results are achieved
- No console errors or warnings
- User experience is smooth and intuitive

A test scenario is considered FAILED when:
- Any step produces an unexpected result
- Console errors or warnings occur
- The app crashes or becomes unresponsive
- User experience is degraded or confusing

---

## Regression Testing

After any code changes, re-run:
- All high-priority test scenarios
- Any scenarios related to changed features
- Performance tests
- Accessibility tests

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-18  
**Status:** Ready for Testing
