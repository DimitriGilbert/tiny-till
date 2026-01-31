# Task 7.3: Production Build Configuration and Optimization - Implementation Plan

## Overview
Configure production Vite build with Content Security Policy headers, asset optimization, compression, caching strategies, service worker configuration, and performance monitoring. Validate build output and ensure security headers are properly configured.

## Current State Analysis

### Existing Configuration
- `apps/web/vite.config.ts`:
  - Basic code splitting with manual chunks configured
  - Terser minification with console removal
  - CSS code splitting enabled
  - Chunk size warning limit: 200KB
  - Compressed size reporting enabled
- `apps/web/src/sw.ts`:
  - Service worker with Workbox caching strategies
  - Background sync plugin configured
  - Cache versioning based on date
  - Offline fallback handling
- `apps/web/index.html`:
  - Basic meta tags and PWA manifest links
  - No CSP headers

### Gaps Identified
1. No Content Security Policy (CSP) headers configured
2. No explicit gzip/Brotli compression configuration
3. No build output validation scripts
4. No performance monitoring integration
5. Service worker could be optimized for production
6. No bundle analysis tools configured
7. No build artifact size tracking
8. No deployment-ready configuration for GitHub Pages

## Implementation Steps

### Step 1: Content Security Policy Configuration

**Objective:** Configure strict CSP headers to prevent XSS attacks and code injection

**Actions:**
1. Create `apps/web/public/_headers` file for netlify/vercel-style headers
2. Add CSP meta tag to `apps/web/index.html`
3. Configure CSP in Vite config for dev server preview
4. Add environment-specific CSP directives

**CSP Policy:**
```typescript
const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"]
}
```

**Files to Modify:**
- `apps/web/index.html` - Add CSP meta tag
- `apps/web/public/_headers` - Create for deployment
- `apps/web/vite.config.ts` - Add CSP configuration

---

### Step 2: Enhanced Asset Optimization

**Objective:** Optimize bundle sizes, tree shaking, and code splitting

**Actions:**
1. Update Vite build configuration with enhanced optimization
2. Add Rollup-specific optimizations
3. Configure additional tree shaking options
4. Optimize manual chunk strategy
5. Add bundle size limits and warnings

**Build Optimizations:**
```typescript
build: {
  target: "es2020",
  cssMinify: true,
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        // Refine existing chunk strategy
        // Add route-based chunking for TanStack Router
      },
      compact: true,
      inlineDynamicImports: false,
      preserveEntrySignatures: "strict"
    },
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  },
  chunkSizeWarningLimit: 150, // Reduce from 200KB
  reportCompressedSize: true,
  cssCodeSplit: true
}
```

**Files to Modify:**
- `apps/web/vite.config.ts` - Enhanced build configuration

---

### Step 3: Compression Configuration

**Objective:** Configure gzip and Brotli compression for production builds

**Actions:**
1. Install and configure `vite-plugin-compression`
2. Set up gzip compression with optimal settings
3. Configure Brotli compression for better compression ratios
4. Add compression to preview server for testing

**Configuration:**
```typescript
import compression from "vite-plugin-compression"

export default defineConfig({
  plugins: [
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
      deleteOriginFile: false
    })
  ]
})
```

**Files to Modify:**
- `apps/web/package.json` - Add `vite-plugin-compression`
- `apps/web/vite.config.ts` - Add compression plugins

---

### Step 4: Enhanced Caching Strategies

**Objective:** Optimize caching for production with proper cache headers

**Actions:**
1. Update service worker with production-optimized caching strategies
2. Add cache-first strategy for immutable assets
3. Configure stale-while-revalidate for API responses
4. Add network timeout handling
5. Optimize cache expiration policies

**Service Worker Updates:**
- Refine cache names with build hash
- Add runtime caching for dynamic content
- Configure cache revalidation strategies
- Add cache analytics hooks

**Files to Modify:**
- `apps/web/src/sw.ts` - Enhanced caching strategies

---

### Step 5: Performance Monitoring Setup

**Objective:** Integrate performance monitoring and build metrics

**Actions:**
1. Create `apps/web/src/lib/performance-monitor.ts` for runtime metrics
2. Add Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
3. Configure build performance analysis
4. Add bundle size tracking
5. Create performance reporting utilities

**Performance Monitoring:**
```typescript
// Track Core Web Vitals
// Log build metrics
// Monitor bundle sizes
// Track resource loading times
// Export performance data for analysis
```

**Files to Create:**
- `apps/web/src/lib/performance-monitor.ts` - Performance tracking utilities

---

### Step 6: Build Validation Script

**Objective:** Create automated build validation and reporting

**Actions:**
1. Create `apps/web/scripts/validate-build.ts` script
2. Validate bundle sizes against thresholds
3. Check for missing CSP headers
4. Verify compression artifacts are generated
5. Generate build report with metrics
6. Add validation to build process

**Validation Checks:**
- Bundle size limits
- All chunks generated
- Compression files present
- Source maps excluded in production
- CSP headers configured
- Service worker properly built

**Files to Create:**
- `apps/web/scripts/validate-build.ts` - Build validation script

**Files to Modify:**
- `apps/web/package.json` - Add validate:build script

---

### Step 7: Service Worker Production Configuration

**Objective:** Optimize service worker for production deployment

**Actions:**
1. Update Vite PWA plugin configuration for production
2. Configure proper service worker caching strategies
3. Add workbox runtime caching for production
4. Configure service worker update strategy
5. Add offline page handling

**PWA Plugin Updates:**
```typescript
VitePWA({
  registerType: "autoUpdate",
  strategies: "generateSW",
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    runtimeCaching: [
      // Enhanced production caching strategies
    ],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true
  }
})
```

**Files to Modify:**
- `apps/web/vite.config.ts` - Enhanced PWA configuration
- `apps/web/public/offline.html` - Create offline page

---

### Step 8: GitHub Pages Deployment Configuration

**Objective:** Configure deployment settings for GitHub Pages

**Actions:**
1. Update Vite base path for GitHub Pages
2. Configure proper asset paths
3. Add 404 handling for SPA
4. Configure deployment scripts

**Configuration:**
```typescript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  // Rest of config
})
```

**Files to Modify:**
- `apps/web/vite.config.ts` - Add base path configuration
- `apps/web/public/404.html` - Create 404 page

---

### Step 9: Build Artifacts and Optimization Verification

**Objective:** Generate optimized artifacts and verify build quality

**Actions:**
1. Build the application with production configuration
2. Verify all optimizations are applied
3. Check compression artifacts
4. Validate bundle sizes
5. Test CSP headers
6. Verify service worker registration
7. Run build validation script

**Verification Steps:**
```bash
npm run build
npm run validate:build
npm run check-types
```

**Expected Artifacts:**
- Minified JavaScript bundles
- Minified and purged CSS
- Gzip compressed files (.gz)
- Brotli compressed files (.br)
- Service worker with proper caching
- Source maps excluded
- Optimized assets

---

## File Changes Summary

### Files to Create
1. `apps/web/public/_headers` - Security headers for deployment
2. `apps/web/public/offline.html` - Offline fallback page
3. `apps/web/public/404.html` - SPA 404 handler
4. `apps/web/src/lib/performance-monitor.ts` - Performance tracking utilities
5. `apps/web/scripts/validate-build.ts` - Build validation script

### Files to Modify
1. `apps/web/vite.config.ts` - Main build configuration
   - Add compression plugins
   - Enhanced build optimization
   - CSP configuration
   - PWA plugin updates
   - Base path configuration

2. `apps/web/index.html` - Add CSP meta tags

3. `apps/web/package.json` - Add dependencies and scripts
   - `vite-plugin-compression`
   - `validate:build` script

4. `apps/web/src/sw.ts` - Enhanced service worker caching

### Dependencies to Add
- `vite-plugin-compression` - For gzip/Brotli compression

---

## Validation Criteria

### Build Output Verification
- [ ] All JavaScript bundles < 150KB (except vendor chunks)
- [ ] Total bundle size < 500KB
- [ ] All CSS files minified and purged
- [ ] Source maps NOT included in production build
- [ ] Gzip compression files present for all assets > 10KB
- [ ] Brotli compression files present for all assets > 10KB
- [ ] Service worker built and registered correctly

### Security Verification
- [ ] CSP meta tag present in index.html
- [ ] _headers file with proper security headers
- [ ] No inline scripts (except CSP hash)
- [ ] All external resources use HTTPS
- [ ] Service worker scope is correct

### Performance Verification
- [ ] Performance monitor initializes correctly
- [ ] Web Vitals are tracked
- [ ] Build metrics are logged
- [ ] Bundle analysis completes successfully

### Caching Verification
- [ ] Static assets cached with CacheFirst
- [ ] API responses cached with StaleWhileRevalidate
- [ ] Navigation cached with NetworkFirst
- [ ] Cache expiration policies configured
- [ ] Background sync queue configured

---

## Build and Validation Commands

```bash
# Clean build
npm run build

# Type checking
npm run check-types

# Build validation (new script)
npm run validate:build

# Preview production build
npm run serve

# Analyze bundle size (optional, can add rollup-plugin-visualizer)
npm run build -- --report
```

---

## Success Criteria

1. Production build completes without errors
2. `npm run check-types` passes
3. `npm run validate:build` passes all checks
4. Build artifacts include:
   - Minified bundles
   - Gzip and Brotli compressed files
   - Optimized service worker
   - Proper security headers
5. Total bundle size < 500KB
6. No chunks exceed 150KB warning limit
7. CSP properly configured and functional
8. Performance monitoring operational
9. Service worker caching strategies optimized
10. Application loads and functions correctly in production mode

---

## Notes

- All configurations should be environment-aware (dev vs production)
- CSP policy can be tightened after initial deployment testing
- Bundle size limits can be adjusted based on actual usage patterns
- Consider adding Rollup Visualizer for bundle analysis in future
- Performance monitoring data can be extended with analytics integration
- Service worker strategies should be monitored and adjusted based on production metrics
