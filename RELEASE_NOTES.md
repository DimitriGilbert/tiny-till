# Tiny-Till v1.0.0 Release Notes

## Release Information
- **Version:** 1.0.0
- **Release Date:** January 19, 2026
- **Status:** Production Release

## Overview

Tiny-Till v1.0.0 marks the first production release of our lightweight, local-first Point of Sale (POS) calculator designed for on-the-go sellers. This release includes comprehensive product catalog management, an intuitive tally interface, settings customization, documentation portal, in-app help system, and full PWA support for offline functionality.

---

## New Features

### Core Functionality
- **Product Catalog Management**: Full CRUD operations for products including inline add/edit, image support (max 128x128px), and validation
- **Tally System**: Tap-to-increment interface with quantity badge editing, live total calculation, and transient in-memory state
- **Responsive Grid**: Auto-adjusting columns (2-8) based on screen size and user preferences
- **Density Modes**: Normal and Compact views for different screen sizes and use cases
- **Theme Support**: Light, Dark, and System theme detection with persistent storage

### Import/Export
- **Export Catalog**: Download product catalog as JSON file with metadata
- **Import Catalog**: Import catalog files with conflict resolution, validation, and preview
- **Data Integrity**: Schema validation, version compatibility checks, and graceful error handling

### Storage
- **IndexedDB Integration**: Efficient storage using Zustand persist middleware with idb-keyval
- **Storage Monitoring**: Real-time storage usage tracking with warnings at 80% quota
- **Storage Cleanup**: Tools to clear old data and manage storage efficiently

### User Experience
- **Onboarding Tour**: Interactive guided tour for first-time users
- **Context-Aware Hints**: In-app hints and tooltips based on user actions
- **Help Center**: Comprehensive searchable help documentation
- **Feedback System**: Bug reporting and feature request forms

### Progressive Web App
- **Service Worker**: Offline support with cache-first strategy
- **PWA Manifest**: Installable on mobile and desktop devices
- **Offline Banner**: Visual indicator for offline/online status
- **404 Handling**: SPA routing support with fallback pages

### Documentation
- **Documentation Portal**: Full documentation site at `/docs` with:
  - Getting Started guide
  - Features overview
  - Backup and Restore instructions
  - Troubleshooting guide
- **Search**: Full-text search across documentation
- **Code Examples**: Syntax-highlighted code samples
- **Mobile Responsive**: Optimized reading experience on all devices

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader**: ARIA labels and semantic markup
- **Skip Links**: Skip to main content
- **Focus Indicators**: Clear focus states for interactive elements
- **Color Contrast**: WCAG 2.1 AA compliant color schemes

---

## Improvements

### Performance
- **Bundle Optimization**: Vendor code splitting and tree-shaking
- **Compression**: Gzip and Brotli compression for all assets
- **Code Splitting**: Manual chunk configuration for vendors
- **Lazy Loading**: Optimized loading for heavy components

### Developer Experience
- **Type Safety**: Full TypeScript strict mode with comprehensive types
- **Build System**: Turborepo for efficient monorepo builds
- **Testing**: Playwright test suite with E2E, integration, and component tests
- **Validation**: Runtime validation with Zod

### User Interface
- **Colorful Design**: Cheerful color palette with kawaii-inspired aesthetics
- **Subtle Animations**: Smooth transitions and micro-interactions
- **Responsive Layout**: Mobile-first design optimized for touch
- **Visual Feedback**: Pulse animations, toast notifications, and loading states

---

## Bug Fixes

### Production Release Fixes
- **BUG-002**: Removed TanStack Router DevTools from production build (conditionally rendered only in development)
- **BUG-004**: Removed console.error statements from production code
- **Bug**: Fixed Playwright HTML reporter folder conflict with test-results folder
- **Bug**: Improved error handling in beforeunload event handler

### Known Issues

### Bundle Size (Documented)
- **Issue**: Initial JavaScript bundle is 284 KB gzipped (target was <200 KB)
- **Impact**: Slightly longer initial load on slow connections
- **Workaround**: Application remains fully functional; PWA caching reduces repeat load times
- **Planned Fix**: Post-release optimization with route-based code splitting (v1.1.0)

### Build Warnings
- **Issue**: Dynamic import warnings for modules that are also statically imported
- **Impact**: None - warnings only; application functions correctly
- **Planned Fix**: Code review and import strategy optimization (v1.0.1)

### Empty Theme Chunk
- **Issue**: Empty `theme.js` chunk (0.00 KB) generated in build
- **Impact**: Minimal - one unnecessary file
- **Planned Fix**: Investigation and removal (v1.0.1)

---

## Technical Specifications

### Dependencies
- **React**: 19.2.3
- **TanStack Router**: 1.141.1
- **TanStack React Virtual**: 3.13.18
- **TanStack React Form**: 1.12.3
- **Base UI**: 1.0.0
- **Tailwind CSS**: 4.0.15
- **Zod**: 4.1.13
- **Zustand**: 4.x (via persist middleware)
- **idb-keyval**: 6.2.2

### Browser Support
- **Chrome/Edge**: 100+
- **Firefox**: 100+
- **Safari**: 15+ (iOS 15+, macOS Safari 15+)

### Build Output
- **JavaScript (gzipped)**: ~284 KB
- **CSS (gzipped)**: ~21 KB
- **Total Initial Load**: ~305 KB
- **Service Worker**: Precaches 36 entries (1.6 MB)

---

## Installation

### GitHub Pages (Production)
1. Visit https://your-username.github.io/tiny-till
2. Add to home screen from browser menu (install PWA)
3. Open offline - all features work without internet

### Manual Deployment
```bash
git clone https://github.com/your-username/tiny-till.git
cd tiny-till
npm install
npm run build
npm run deploy:manual
```

---

## Migration Guide

### From Development to Production
No migration required - your local IndexedDB data will work with the production build. Simply:
1. Export your catalog from development build
2. Install or load production build
3. Import your catalog

### Backup Recommendations
- Export catalog after significant changes
- Keep backup files in safe location
- Use the built-in backup reminder feature

---

## Documentation

- **User Documentation**: Visit `/docs` route in-app
- **Source Code**: https://github.com/your-username/tiny-till
- **Issue Tracker**: https://github.com/your-username/tiny-till/issues
- **Feature Requests**: Use in-app "Suggest Feature" form or GitHub Issues

---

## Support

### Getting Help
- **In-App Help**: Click the help button (?) on any page
- **Documentation**: Comprehensive guides at `/docs`
- **Report Issues**: Use in-app "Report Bug" form
- **Email Support**: support@tiny-till.app (if configured)

### Troubleshooting
For common issues and solutions, see the [Troubleshooting Guide](/docs/troubleshooting).

---

## Acknowledgments

This release represents significant effort from the development team and valuable feedback from early adopters and beta testers. Special thanks to:
- All contributors to the open-source project
- Beta testers who provided detailed feedback
- The React, TanStack, and Tailwind communities

---

## What's Next?

### v1.1.0 (Planned)
- Route-based code splitting to reduce bundle size
- Further performance optimizations
- Additional keyboard shortcuts

### v1.2.0 (Roadmap)
- Tax calculation feature
- Receipt view for customer display
- Catalog categorization

### v2.0.0 (Future)
- Multi-currency support
- Barcode scanning integration
- Cloud sync option

---

## Legal

- **License**: See LICENSE file in repository
- **Privacy**: Local-first architecture - no data leaves your device
- **Terms**: By using Tiny-Till, you agree to the terms in the repository

---

**End of v1.0.0 Release Notes**
