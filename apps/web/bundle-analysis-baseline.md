# Bundle Analysis Baseline

## Current Bundle Size

Production build (generated: 2026-01-19)

```
dist/assets/index-DTxIi3zo.js   928.98 kB │ gzip: 281.31 kB
dist/assets/index-BRrtT8PV.css  125.69 kB │ gzip:  18.64 kB
dist/registerSW.js                0.13 kB │ gzip:   0.45 kB
dist/index.html                   1.07 kB │ gzip:   0.45 kB
```

**Total gzipped size**: ~300 KB
**Target**: <200 KB gzipped
**Reduction needed**: ~100 KB gzipped (33%)

## Bundle Composition

### Main Dependencies (estimated)
- React & React DOM: ~45 KB gzipped
- TanStack Router: ~25 KB gzipped
- TanStack Virtual: ~15 KB gzipped
- Base UI (@base-ui/react): ~40 KB gzipped
- Lucide React: ~35 KB gzipped
- Zod: ~20 KB gzipped
- Next-themes: ~5 KB gzipped
- Zustand: ~3 KB gzipped
- Sonner: ~10 KB gzipped
- Tailwind CSS (runtime): ~15 KB gzipped
- Application code: ~67 KB gzipped

### Current Issues

1. **Single Bundle**: All code is in one bundle (index.js)
2. **No Route Splitting**: All routes load initially
3. **No Vendor Splitting**: All dependencies in main bundle
4. **Large CSS**: 125.69 KB uncompressed, 18.64 KB gzipped
5. **Build Warnings**:
   - Multiple dynamic imports not moving to separate chunks due to static imports
   - Chunk size warning (>500 KB)

### Build Warnings

```
(!) /home/didi/workspace/Code/eric-loop/runs/tiny-till/packages/types/src/utils/export.ts is dynamically imported but also statically imported
(!) /home/didi/workspace/Code/eric-loop/runs/tiny-till/packages/types/src/index.ts is dynamically imported but also statically imported
(!) /home/didi/workspace/Code/eric-loop/runs/tiny-till/apps/web/src/lib/validators.ts is dynamically imported but also statically imported

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
```

## Route Structure

- `/` - Tally Page (root, default)
- `/settings` - Settings Page
- `/settings/catalog` - Catalog Management (nested route)

## Next Steps

1. Implement manual chunk splitting (Phase 7)
2. Implement route-based lazy loading (Phase 3.1)
3. Optimize third-party libraries (Phase 3.3)
4. Reduce CSS size (Phase 6.3)
5. Optimize images and fonts (Phase 6)
