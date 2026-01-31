# Task 6.8: Performance Profiling and Bundle Optimization - Implementation Plan

## Overview

This task focuses on comprehensive performance optimization to achieve a strict <200KB gzipped bundle target while maintaining full functionality. The plan covers performance analysis, bundle optimization strategies, critical rendering path optimization, and addressing Core Web Vitals issues.

## Phase 1: Performance Baseline Assessment

### 1.1 Build Initial Bundle Analysis
- **Action**: Build production bundle and analyze current size
- **Tool**: `npm run build`
- **Analysis**:
  - Measure uncompressed and gzipped bundle sizes
  - Identify largest dependencies and modules
  - Document current bundle composition
- **Files**: Record baseline metrics in `apps/web/bundle-analysis-baseline.md`
- **Expected Output**: Current bundle size breakdown, largest modules list, dependency tree

### 1.2 Chrome DevTools Performance Profiling
- **Action**: Record performance profiles for key user flows
- **Flows to profile**:
  - Application initial load
  - Catalog page with 100+ products
  - Tally page with product selection
  - Settings navigation and theme switching
  - Import/export operations
- **Metrics to capture**:
  - Total bundle size and parsing time
  - JavaScript execution time
  - Layout shift events
  - Long tasks (>50ms)
  - Network waterfall
- **Tools**: Chrome DevTools Performance tab, Network tab
- **Files**: Save performance traces to `apps/web/performance-traces/`

### 1.3 Lighthouse Audit
- **Action**: Run comprehensive Lighthouse audit
- **Categories**:
  - Performance
  - Accessibility
  - Best Practices
  - SEO
- **Metrics to track**:
  - Performance score
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Cumulative Layout Shift (CLS)
  - Total Blocking Time (TBT)
- **Command**: `lighthouse http://localhost:3001 --output=html --output=json --output-path=./lighthouse-report.html`
- **Files**: Save Lighthouse reports to `apps/web/lighthouse-reports/`

### 1.4 WebPageTest Analysis
- **Action**: Run WebPageTest for detailed performance analysis
- **Test configurations**:
  - Desktop: Chrome, Cable connection, 3 runs
  - Mobile: Chrome, 3G connection, 3 runs
- **Key metrics**:
  - Time to First Byte (TTFB)
  - Start Render
  - Visual Complete
  - Speed Index
  - Hero rendering time
- **Tools**: webpagetest.org API or local WebPageTest instance
- **Files**: Save reports to `apps/web/webpagetest-reports/`

### 1.5 Web Vitals Measurement
- **Action**: Implement and measure Web Vitals in production-like environment
- **Vitals to track**:
  - LCP (Largest Contentful Paint) - Target: <2.5s
  - FID (First Input Delay) - Target: <100ms
  - CLS (Cumulative Layout Shift) - Target: <0.1
  - INP (Interaction to Next Paint) - Target: <200ms
  - FCP (First Contentful Paint) - Target: <1.8s
  - TTFB (Time to First Byte) - Target: <800ms
- **Implementation**: Use web-vitals library if not already integrated
- **Files**: Create `apps/web/src/lib/web-vitals.ts`

## Phase 2: Bundle Size Analysis and Dependency Audit

### 2.1 Dependency Size Audit
- **Action**: Analyze all dependencies and their sizes
- **Tools**:
  - `npx vite-bundle-visualizer`
  - `npx rollup-plugin-visualizer`
  - `package-size` CLI
- **Analysis items**:
  - Identify top 10 largest dependencies
  - Check for duplicate functionality across libraries
  - Identify unused dependencies
  - Check for lighter alternatives to heavy libraries
- **Files**: Document findings in `apps/web/dependency-audit.md`

### 2.2 Tree Shaking Analysis
- **Action**: Verify tree shaking effectiveness
- **Check items**:
  - Identify imported but unused code
  - Check for side effects preventing tree shaking
  - Verify module exports are ES6
  - Analyze package.json `sideEffects` configuration
- **Tools**: `esbuild` with `--analyze` flag, `webpack-bundle-analyzer` (if migrating)
- **Files**: Create tree shaking optimization plan

### 2.3 Code Duplication Detection
- **Action**: Find and eliminate code duplication
- **Areas to check**:
  - Utility functions across multiple files
  - Similar component patterns
  - Repeated validation logic
  - Duplicate type definitions
- **Tools**: `jscpd` (JavaScript Copy/Paste Detector), manual code review
- **Files**: Consolidate duplicates into shared utilities

### 2.4 Large File Analysis
- **Action**: Identify and optimize large files
- **Analysis**:
  - List files >5KB
  - Identify optimization opportunities
  - Check for embedded assets (base64 images, fonts)
  - Review component complexity
- **Files**: Document large file optimization plan

## Phase 3: Aggressive Bundle Optimization

### 3.1 Route-Based Code Splitting
- **Action**: Implement lazy loading for all routes
- **Implementation**:
  - Convert all route components to lazy-loaded imports
  - Use `createLazyFileRoute` from TanStack Router
  - Implement loading states for each route
  - Ensure proper TypeScript typing
- **Files to modify**:
  - `apps/web/src/routes/index.tsx`
  - `apps/web/src/routes/settings.tsx`
  - `apps/web/src/routes/settings.catalog.tsx`
  - Any additional route files
- **Expected Impact**: 30-40% initial bundle reduction

### 3.2 Component-Level Code Splitting
- **Action**: Lazy load heavy components
- **Components to lazy load**:
  - `virtualized-product-grid.tsx` (large component)
  - `CatalogImport.tsx` (import logic)
  - `product-form.tsx` (complex form)
  - `error-log-viewer.tsx` (diagnostic component)
  - `storage-recovery-dialog.tsx` (recovery logic)
- **Implementation**:
  - Wrap components in `React.lazy()`
  - Add `Suspense` boundaries with loading states
  - Ensure proper error boundaries
- **Files**: Modify relevant route files and components

### 3.3 Third-Party Library Optimization
- **Action**: Optimize heavy third-party dependencies
- **Libraries to optimize**:
  - **lucide-react**: Switch to icon tree-shaking import method or use specific icon imports
  - **zod**: Verify minimal imports, avoid importing entire schema
  - **next-themes**: Check if all features are needed, consider custom implementation
  - **idb-keyval**: Verify minimal usage, consider direct IndexedDB for simple cases
  - **shadcn components**: Remove unused components, analyze component tree
- **Implementation**:
  - Use named imports instead of importing entire libraries
  - Replace heavy libraries with lighter alternatives
  - Implement custom solutions for simple use cases
- **Expected Impact**: 10-15% bundle reduction

### 3.4 Dynamic Import for Feature Modules
- **Action**: Load non-critical features on demand
- **Features to dynamically import**:
  - Error logging and analysis tools
  - Storage cleanup dialogs
  - Backup reminder system
  - PWA install prompt logic
- **Implementation**:
  - Convert to dynamic imports
  - Trigger loading only when feature is accessed
  - Add appropriate loading states
- **Files**: Modify component files and hooks

### 3.5 Virtual Scroll Optimization
- **Action**: Optimize @tanstack/react-virtual implementation
- **Optimizations**:
  - Ensure proper memoization of item renderers
  - Implement overscan optimization
  - Use `useMemo` for derived data
  - Implement stable keys for virtual items
  - Consider using `useVirtualizer` with custom windowing
- **Files**: Review and optimize `apps/web/src/hooks/useVirtualGrid.ts`, `apps/web/src/components/virtualized-product-grid.tsx`

## Phase 4: Critical Rendering Path Optimization

### 4.1 Critical CSS Extraction
- **Action**: Identify and inline critical CSS
- **Implementation**:
  - Analyze above-the-fold content CSS requirements
  - Extract critical CSS for initial render
  - Inline critical CSS in HTML head
  - Defer non-critical CSS loading
- **Tools**: Vite's critical CSS extraction plugins or manual extraction
- **Files**: Modify `apps/web/index.html`, `apps/web/index.css`

### 4.2 Font Loading Optimization
- **Action**: Optimize font loading strategy
- **Implementation**:
  - Use `font-display: swap` for faster rendering
  - Preload critical fonts
  - Subset fonts to include only used glyphs
  - Consider system font stack fallback
  - Remove Google Fonts dependency if possible
- **Files**: Update `apps/web/index.css`, `apps/web/index.html`

### 4.3 Progressive Enhancement
- **Action**: Implement progressive loading strategy
- **Priorities**:
  1. Critical: Header, navigation, basic grid
  2. Important: Product cards, tally functionality
  3. Secondary: Settings, import/export, error tools
- **Implementation**:
  - Ensure core functionality works without JavaScript
  - Implement skeleton screens for slow-loading components
  - Add loading states for non-critical features
- **Files**: Modify route components, add skeleton components

### 4.4 Preload and Prefetch Optimization
- **Action**: Implement smart resource preloading
- **Strategies**:
  - Preload critical fonts and CSS
  - Prefetch likely-next routes
  - Preconnect to external domains
  - Use `preload` for critical scripts
  - Use `prefetch` for less critical resources
- **Files**: Update `apps/web/index.html`, Vite configuration

### 4.5 JavaScript Execution Optimization
- **Action**: Optimize JavaScript execution timing
- **Strategies**:
  - Use `defer` for non-critical scripts
  - Implement idle callback patterns for heavy computations
  - Use `requestIdleCallback` for background tasks
  - Optimize React rendering with `useMemo` and `useCallback`
  - Reduce re-renders with proper memoization
- **Files**: Review and optimize all component files

## Phase 5: Core Web Vitals Optimization

### 5.1 CLS (Cumulative Layout Shift) Optimization
- **Action**: Eliminate layout shifts
- **Areas to address**:
  - Reserve space for dynamic content (images, modals)
  - Implement aspect ratio boxes for product images
  - Add explicit heights to containers
  - Use CSS containment where appropriate
  - Implement skeleton placeholders for lazy-loaded content
  - Reserve space for toasts and banners
- **Implementation**:
  - Update `tally-product-card.tsx` with reserved image space
  - Add CSS containment to grid containers
  - Implement skeleton components for loading states
  - Reserve footer space for sticky elements
- **Target**: CLS < 0.1
- **Files**: Modify component files, update CSS

### 5.2 LCP (Largest Contentful Paint) Optimization
- **Action**: Improve LCP performance
- **Strategies**:
  - Optimize and prioritize LCP element (likely product grid or hero)
  - Lazy load images below the fold
  - Implement responsive images with proper sizing
  - Optimize image format (WebP, AVIF)
  - Reduce JavaScript execution before LCP
  - Optimize critical CSS
- **Implementation**:
  - Identify LCP element in each route
  - Optimize largest content images
  - Implement image loading strategies (`loading="lazy"`)
  - Reduce critical path CSS size
- **Target**: LCP < 2.5s
- **Files**: Update route components, image components

### 5.3 FID and INP Optimization
- **Action**: Reduce input delay and interaction time
- **Strategies**:
  - Reduce JavaScript main thread work
  - Break up long tasks
  - Implement code splitting for heavy interactions
  - Optimize event handlers
  - Use passive event listeners for scroll/touch
  - Defer non-critical JavaScript
- **Implementation**:
  - Identify long tasks via performance profiles
  - Break up large JavaScript blocks
  - Use `requestIdleCallback` for background work
  - Optimize touch and scroll event listeners
- **Targets**: FID < 100ms, INP < 200ms
- **Files**: Optimize event handlers and heavy computations

### 5.4 TBT (Total Blocking Time) Reduction
- **Action**: Reduce main thread blocking
- **Strategies**:
  - Minimize and defer JavaScript
  - Implement web workers for heavy computations
  - Optimize React rendering with proper memoization
  - Reduce bundle size and parsing time
  - Avoid synchronous layouts
  - Optimize animations with CSS transforms
- **Target**: TBT < 200ms
- **Files**: Optimize computationally intensive functions

## Phase 6: Asset Optimization

### 6.1 Image Optimization
- **Action**: Optimize all images
- **Strategies**:
  - Convert to modern formats (WebP, AVIF)
  - Implement responsive images with `srcset`
  - Use appropriate compression levels
  - Lazy load below-the-fold images
  - Implement placeholder blur-up effect
  - Consider removing unnecessary images
- **Files**: Optimize product images, icons, and any embedded images

### 6.2 Font Optimization
- **Action**: Optimize font delivery
- **Strategies**:
  - Subset fonts to include only used characters
  - Use variable fonts instead of multiple font files
  - Implement font loading strategies (preload, swap)
  - Consider using system fonts instead of custom fonts
  - Remove unused font weights
- **Files**: Update font imports, create font subsets

### 6.3 CSS Optimization
- **Action**: Optimize CSS delivery
- **Strategies**:
  - Purge unused CSS (Tailwind's built-in purging)
  - Minimize CSS specificity
  - Remove duplicate styles
  - Critical CSS inlining
  - Defer non-critical CSS
  - Use CSS containment
- **Files**: Review and optimize `apps/web/index.css` and component styles

## Phase 7: Build Configuration Optimization

### 7.1 Vite Build Optimization
- **Action**: Optimize Vite build configuration
- **Configuration updates** (`apps/web/vite.config.ts`):
  ```typescript
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'tanstack-vendor': ['@tanstack/react-router', '@tanstack/react-virtual'],
            'ui-vendor': ['@base-ui/react'],
            'utils': ['clsx', 'class-variance-authority', 'tailwind-merge']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          pure_funcs: ['console.log']
        },
        mangle: {
          safari10: true
        }
      },
      chunkSizeWarningLimit: 200,
      reportCompressedSize: true,
      cssCodeSplit: true
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@tanstack/react-router']
    }
  })
  ```
- **Files**: Update `apps/web/vite.config.ts`

### 7.2 Compression Configuration
- **Action**: Ensure proper compression for production
- **Implementation**:
  - Configure gzip compression
  - Configure Brotli compression
  - Set proper cache headers
  - Implement compression middleware
- **Files**: Update Vite config, add compression plugins

### 7.3 Source Maps Configuration
- **Action**: Configure appropriate source maps for production
- **Strategy**:
  - Use hidden source maps for production
  - Exclude source maps from build output
  - Generate source maps for debugging purposes only
- **Files**: Update Vite build configuration

### 7.4 Asset Hashing
- **Action**: Implement proper asset hashing for caching
- **Implementation**:
  - Use content-based hashing for all assets
  - Configure long cache headers for hashed assets
  - Implement cache invalidation strategy
- **Files**: Update Vite configuration, server headers

## Phase 8: Memory and Runtime Performance

### 8.1 Memory Leak Detection
- **Action**: Identify and fix memory leaks
- **Tools**: Chrome DevTools Memory profiler, `why-did-you-render`
- **Areas to check**:
  - Event listener cleanup
  - Timer/interval cleanup
  - Subscription cleanup
  - Store subscriptions
  - Reference cycles
- **Files**: Review all useEffect hooks, event listeners, and subscriptions

### 8.2 React Performance Optimization
- **Action**: Optimize React rendering performance
- **Optimizations**:
  - Add proper `React.memo` for expensive components
  - Use `useMemo` for expensive calculations
  - Use `useCallback` for stable function references
  - Implement virtual scrolling (already done in 6.1)
  - Optimize context usage (split contexts if needed)
  - Reduce prop drilling where possible
- **Files**: Review and optimize all React components

### 8.3 Store Optimization
- **Action**: Optimize Zustand stores for performance
- **Optimizations**:
  - Implement selective subscriptions
  - Use shallow comparison where appropriate
  - Batch store updates
  - Optimize middleware usage
  - Implement efficient persistence
- **Files**: Review and optimize all store files (`apps/web/src/stores/`)

### 8.4 Hook Optimization
- **Action**: Optimize custom hooks for performance
- **Optimizations**:
  - Implement proper cleanup in all hooks
  - Use memoization for expensive operations
  - Avoid unnecessary re-renders
  - Implement efficient dependency arrays
- **Files**: Review and optimize all custom hooks (`apps/web/src/hooks/`)

## Phase 9: Service Worker and Caching Optimization

### 9.1 Service Worker Cache Strategy
- **Action**: Optimize service worker caching
- **Strategies**:
  - Cache first for app shell
  - Network first for dynamic content
  - Stale-while-revalidate for API calls
  - Implement cache expiration
  - Implement cache cleanup
- **Files**: Review and optimize `apps/web/src/sw.ts`

### 9.2 Offline Capabilities
- **Action**: Ensure robust offline functionality
- **Implementation**:
  - Implement proper offline fallbacks
  - Cache critical assets for offline use
  - Implement background sync for failed requests
  - Add offline indicators
- **Files**: Update service worker, add offline UI components

### 9.3 Cache Invalidation
- **Action**: Implement smart cache invalidation
- **Strategies**:
  - Use version-based cache invalidation
  - Implement cache tags for selective invalidation
  - Add cache metadata
  - Implement cache warming strategies
- **Files**: Update service worker, caching logic

## Phase 10: Performance Monitoring

### 10.1 Production Performance Monitoring
- **Action**: Implement performance monitoring
- **Metrics to track**:
  - Real User Monitoring (RUM) data
  - Core Web Vitals
  - Custom performance metrics
  - Error rates
  - Bundle loading times
- **Implementation**:
  - Integrate web-vitals library
  - Implement performance reporting
  - Set up performance dashboards
  - Configure performance budgets
- **Files**: Create `apps/web/src/lib/performance-monitoring.ts`

### 10.2 Performance Budgets
- **Action**: Define and enforce performance budgets
- **Budgets to set**:
  - Bundle size: <200KB gzipped total
  - JavaScript: <100KB gzipped
  - CSS: <50KB gzipped
  - Images: <20KB per image average
  - Fonts: <30KB gzipped total
- **Implementation**:
  - Configure budget enforcement in CI
  - Add build warnings for budget violations
  - Implement automated performance regression detection
- **Files**: Update CI/CD configuration, Vite config

## Phase 11: Testing and Validation

### 11.1 Performance Regression Testing
- **Action**: Set up automated performance testing
- **Implementation**:
  - Integrate Lighthouse CI
  - Set up WebPageTest automated testing
  - Configure performance budgets in CI
  - Implement automated bundle size checks
- **Files**: Update CI/CD configuration, `.github/workflows/`

### 11.2 Cross-Browser Performance Testing
- **Action**: Test performance across browsers
- **Browsers to test**:
  - Chrome (desktop and mobile)
  - Firefox (desktop and mobile)
  - Safari (desktop and iOS)
  - Edge (desktop)
- **Metrics to validate**:
  - Bundle loading times
  - Core Web Vitals
  - Feature functionality
- **Files**: Create test reports

### 11.3 Feature Testing After Optimization
- **Action**: Comprehensive feature testing
- **Test areas**:
  - All routes and navigation
  - Catalog management (CRUD, import/export)
  - Tally functionality
  - Settings and preferences
  - Offline functionality
  - PWA features
  - Error handling and recovery
- **Validation**: Ensure no functionality is broken by optimizations
- **Files**: Create test report

### 11.4 Real-World Performance Testing
- **Action**: Test with real-world scenarios
- **Scenarios**:
  - Large catalogs (100+ products)
  - Slow network conditions (3G, 4G)
  - Low-end devices
  - Multiple browser tabs open
  - Limited storage scenarios
- **Files**: Create performance test report

## Phase 12: Documentation and Knowledge Transfer

### 12.1 Performance Optimization Documentation
- **Action**: Document all optimizations
- **Content**:
  - Optimization strategies implemented
  - Before/after metrics
  - Performance monitoring setup
  - Best practices for future development
  - Performance budget guidelines
- **Files**: Create `apps/web/PERFORMANCE.md`

### 12.2 Developer Guidelines
- **Action**: Create performance development guidelines
- **Guidelines**:
  - Component development best practices
  - Bundle size considerations
  - Performance monitoring practices
  - Code splitting patterns
  - Lazy loading strategies
- **Files**: Update `AGENTS.md` with performance guidelines

## Implementation Order

### Priority 1 (Critical Path - First Week)
1. Phase 1: Performance Baseline Assessment
2. Phase 2: Bundle Size Analysis and Dependency Audit
3. Phase 7: Build Configuration Optimization
4. Phase 3.1: Route-Based Code Splitting
5. Phase 10.2: Performance Budgets

### Priority 2 (High Impact - Second Week)
6. Phase 3.2-3.5: Component and Library Optimization
7. Phase 4: Critical Rendering Path Optimization
8. Phase 5.1-5.2: CLS and LCP Optimization
9. Phase 11.1: Performance Regression Testing Setup

### Priority 3 (Refinement - Third Week)
10. Phase 6: Asset Optimization
11. Phase 8: Memory and Runtime Performance
12. Phase 5.3-5.4: FID/INP and TBT Optimization
13. Phase 9: Service Worker and Caching Optimization

### Priority 4 (Validation - Fourth Week)
14. Phase 10.1: Production Performance Monitoring
15. Phase 11.2-11.4: Comprehensive Testing
16. Phase 12: Documentation and Knowledge Transfer
17. Final validation against <200KB gzipped target

## Success Criteria

### Bundle Size
- ✅ Total gzipped bundle size: <200KB
- ✅ JavaScript gzipped size: <100KB
- ✅ CSS gzipped size: <50KB

### Core Web Vitals
- ✅ LCP: <2.5s (good)
- ✅ FID: <100ms (good)
- ✅ CLS: <0.1 (good)
- ✅ INP: <200ms (good)
- ✅ FCP: <1.8s (good)
- ✅ TTFB: <800ms (good)

### Lighthouse Score
- ✅ Performance: >90
- ✅ Accessibility: >90
- ✅ Best Practices: >90
- ✅ SEO: >90

### Functionality
- ✅ All features work correctly
- ✅ No regressions from optimization
- ✅ Cross-browser compatibility maintained
- ✅ Offline functionality intact
- ✅ PWA features functional

### Monitoring
- ✅ Performance monitoring implemented
- ✅ Automated testing set up
- ✅ Performance budgets enforced
- ✅ Documentation complete

## Risk Mitigation

### Potential Issues and Solutions

1. **Bundle size target too aggressive**
   - Risk: Cannot achieve <200KB without breaking functionality
   - Mitigation: Implement incremental optimizations, document trade-offs, focus on critical path optimization

2. **Code splitting causes loading delays**
   - Risk: Lazy loading creates poor UX with spinners
   - Mitigation: Implement smart prefetching, use skeleton screens, optimize bundle chunk sizes

3. **Optimizations break functionality**
   - Risk: Tree shaking removes needed code, lazy loading breaks features
   - Mitigation: Comprehensive testing, gradual rollout, maintain feature flagging

4. **Performance gains not significant**
   - Risk: Optimizations yield minimal improvements
   - Mitigation: Focus on highest-impact optimizations first, use data-driven decisions

5. **Cross-browser compatibility issues**
   - Risk: Optimizations work in Chrome but not in Safari/Firefox
   - Mitigation: Test across browsers early, use progressive enhancement, provide fallbacks

## File Changes Summary

### New Files
- `apps/web/bundle-analysis-baseline.md`
- `apps/web/PERFORMANCE.md`
- `apps/web/performance-traces/` (directory)
- `apps/web/lighthouse-reports/` (directory)
- `apps/web/webpagetest-reports/` (directory)
- `apps/web/src/lib/web-vitals.ts`
- `apps/web/src/lib/performance-monitoring.ts`

### Modified Files
- `apps/web/vite.config.ts` - Build optimization configuration
- `apps/web/package.json` - Dependency updates
- `apps/web/index.html` - Preloading, critical resources
- `apps/web/index.css` - Critical CSS, optimization
- `apps/web/src/main.tsx` - Performance monitoring integration
- `apps/web/src/routes/__root.tsx` - Optimization patterns
- `apps/web/src/routes/index.tsx` - Lazy loading
- `apps/web/src/routes/settings.tsx` - Lazy loading
- `apps/web/src/routes/settings.catalog.tsx` - Lazy loading
- All component files in `apps/web/src/components/` - Memoization, optimization
- All hook files in `apps/web/src/hooks/` - Performance optimization
- All store files in `apps/web/src/stores/` - Store optimization
- `apps/web/src/sw.ts` - Caching optimization

### Removed Files
- Unused dependencies (identified in dependency audit)
- Unused components (if found)
- Duplicate utility functions (consolidated)

## Estimated Timeline

- **Week 1**: Performance baseline, dependency audit, build config, route splitting
- **Week 2**: Component/library optimization, critical path, CLS/LCP fixes
- **Week 3**: Asset optimization, runtime performance, FID/INP/TBT fixes
- **Week 4**: Service worker optimization, monitoring, testing, documentation

Total estimated effort: 4 weeks

## Next Steps

1. Execute Phase 1 (Performance Baseline Assessment)
2. Document current state and establish metrics
3. Begin Priority 1 optimizations
4. Iterate and measure after each major optimization
5. Validate against success criteria
6. Complete final testing and documentation
