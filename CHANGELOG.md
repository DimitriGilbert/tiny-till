# Changelog

All notable changes to Tiny-Till are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-19

### Added
- **Core Features**
  - Product catalog management with full CRUD operations
  - Tap-to-increment tally system with quantity editing
  - Responsive grid with auto-adjusting columns (2-8)
  - Normal and Compact density modes
  - Live total calculation with item count
  - Transient tally state (resets on refresh)

- **Import/Export**
  - Export catalog to JSON file with metadata
  - Import catalog with conflict resolution
  - Schema validation and version compatibility checks
  - Import preview showing changes before applying

- **Storage**
  - IndexedDB integration via Zustand persist middleware
  - Storage usage monitoring with warnings at 80% quota
  - Storage cleanup utilities
  - Efficient blob storage for product images

- **User Experience**
  - Interactive onboarding tour for new users
  - Context-aware hints and tooltips
  - Comprehensive help center with search
  - Feedback forms for bugs and feature requests
  - Toast notifications with rich formatting

- **Progressive Web App**
  - Service Worker with cache-first strategy
  - PWA manifest for installability
  - Offline support with fallback pages
  - 404.html for SPA routing

- **Documentation**
  - Full documentation portal at `/docs`
  - Getting Started guide
  - Features overview
  - Backup and Restore instructions
  - Troubleshooting guide
  - Search functionality

- **Accessibility**
  - Keyboard navigation for all features
  - Screen reader support with ARIA labels
  - Skip links to main content
  - Focus indicators on interactive elements
  - WCAG 2.1 AA color contrast

- **Theming**
  - Light, Dark, and System theme options
  - Persistent theme storage
  - Real-time theme switching

### Changed
- Implemented comprehensive error handling across all features
- Optimized bundle with vendor code splitting
- Added gzip and Brotli compression for all assets
- Improved responsive design for mobile, tablet, and desktop

### Fixed
- Removed DevTools from production build
- Removed console.error statements from production code
- Fixed Playwright HTML reporter folder conflict
- Improved beforeunload error handling

### Technical
- **Dependencies**
  - React 19.2.3
  - TanStack Router 1.141.1
  - TanStack React Virtual 3.13.18
  - TanStack React Form 1.12.3
  - Base UI 1.0.0
  - Tailwind CSS 4.0.15
  - Zod 4.1.13

- **Build System**
  - Turborepo for monorepo builds
  - Vite 6.2.2 for build tooling
  - TypeScript 5.x with strict mode

- **Testing**
  - Playwright test suite
  - E2E tests for user flows
  - Integration tests for features
  - Component tests for UI elements

### Known Issues
- Bundle size: Initial load is 284 KB gzipped (target <200 KB)
- Build warnings: Dynamic import conflicts (non-blocking)
- Empty theme chunk: 0.00 KB file generated

### Browser Support
- Chrome/Edge 100+
- Firefox 100+
- Safari 15+ (iOS 15+, macOS Safari 15+)

---

## [Unreleased]

### Planned (v1.1.0)
- Route-based code splitting for bundle optimization
- Additional performance optimizations
- Keyboard shortcuts for power users

### Planned (v1.2.0)
- Tax calculation feature
- Receipt view for customer display
- Catalog categorization

### Future (v2.0.0)
- Multi-currency support
- Barcode scanning integration
- Optional cloud sync

---

## Version Reference

- [1.0.0]: https://github.com/your-username/tiny-till/releases/tag/v1.0.0
- [Unreleased]: https://github.com/your-username/tiny-till/compare/v1.0.0...HEAD
