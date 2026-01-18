# Development Guide

This guide provides comprehensive instructions for setting up, developing, testing, and deploying the Tiny-Till application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Development Workflow](#development-workflow)
4. [Project Structure](#project-structure)
5. [Common Tasks](#common-tasks)
6. [Testing](#testing)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: v18.x or later (recommended: v20.x or latest LTS)
- **npm**: v9.x or later (bundled with Node.js)
- **Git**: For version control

### Optional but Recommended

- **VS Code**: Popular editor with excellent TypeScript support
- **GitKraken / GitHub Desktop**: Git GUI client
- **Chrome DevTools**: For debugging and profiling

### Browser Compatibility

The application is tested and supported on:
- Chrome/Edge 100+ (Chromium)
- Firefox 100+
- Safari 15+ (iOS 15+, macOS 15+)

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd tiny-till
```

### Install Dependencies

The project uses npm workspaces with Turborepo. All dependencies are installed from the root.

```bash
npm install
```

This will:
1. Install root dependencies
2. Install app dependencies (`apps/web`)
3. Install package dependencies (`packages/*`)
4. Set up Turborepo symlinks between packages

### Verify Installation

Ensure everything is installed correctly:

```bash
npm run check-types  # Should complete with no errors
npm run build        # Should build successfully
```

## Development Workflow

### Running Development Server

⚠️ **IMPORTANT**: Do NOT run the dev server. This is a static web application intended for GitHub Pages deployment.

Instead, build and preview:

```bash
npm run build
cd apps/web
npx serve dist
```

Or use any static file server of your choice.

### Type Checking

Run TypeScript type checking across all packages:

```bash
npm run check-types
```

This runs in parallel across all packages via Turborepo.

### Building for Production

Build the application for production:

```bash
npm run build
```

This creates optimized builds in:
- `apps/web/dist/` - Production-ready static files

### Linting

Lint the codebase:

```bash
npm run lint  # If configured in turbo.json
```

Check for lint errors individually:
```bash
cd apps/web && npm run lint
```

## Project Structure

### Directory Overview

```
tiny-till/
├── apps/web/              # Main React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── header.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── ...
│   │   ├── lib/           # Utilities & helpers
│   │   ├── routes/        # TanStack Router routes
│   │   ├── stores/        # Zustand state stores
│   │   ├── hooks/         # Custom React hooks
│   │   ├── main.tsx       # App entry point
│   │   └── index.css      # Global styles
│   ├── dist/              # Production build output
│   └── package.json
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── config/            # Shared TS config
│   └── env/               # Environment validation
└── package.json           # Root workspace config
```

### Where to Add New Code

| What You're Adding | Location | Example |
|-------------------|----------|---------|
| **New Route** | `apps/web/src/routes/` | Create `about.tsx` → `/about` |
| **New Page Component** | `apps/web/src/routes/` or `apps/web/src/components/` | Route-specific or reusable |
| **New Reusable Component** | `apps/web/src/components/` | `Badge.tsx`, `ProductCard.tsx` |
| **New shadcn/ui Component** | `apps/web/src/components/ui/` | Add via CLI, e.g., `npx shadcn@latest add badge` |
| **New Store** | `apps/web/src/stores/` | `user-store.ts`, `analytics-store.ts` |
| **Add to Existing Store** | `apps/web/src/stores/*.ts` | Add action to `catalog-store.ts` |
| **New Utility** | `apps/web/src/lib/` | `currency.ts`, `date-formatter.ts` |
| **New Type Interface** | `packages/types/src/entities/` | `Order.ts`, `Customer.ts` |
| **New Utility Function** | `packages/types/src/utils/` | `math.ts`, `validators.ts` |

## Common Tasks

### Adding a New Route

1. Create a new route file in `apps/web/src/routes/`:
```typescript
// routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return <div>About page content</div>;
}
```

2. Run route generation:
```bash
cd apps/web
npx tsr generate
```

3. The route is now available at `/about`

### Creating a New Component

1. Create component file in `apps/web/src/components/`:
```typescript
// components/ProductCard.tsx
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: number;
  className?: string;
}

export function ProductCard({ name, price, className }: ProductCardProps) {
  return (
    <div className={cn("border rounded-lg p-4", className)}>
      <h3>{name}</h3>
      <p>${price.toFixed(2)}</p>
    </div>
  );
}
```

2. Import and use in routes or other components:
```typescript
import { ProductCard } from "@/components/ProductCard";

<ProductCard name="Item" price={9.99} />
```

### Adding a New shadcn/ui Component

1. Add component using shadcn CLI:
```bash
cd apps/web
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add switch
```

2. The component is now available in `src/components/ui/[component].tsx`

3. Import and use:
```typescript
import { Badge } from "@/components/ui/badge";

<Badge variant="secondary">New</Badge>
```

### Adding to a Store

To add a new action or state to an existing store:

1. Open the store file (e.g., `stores/catalog-store.ts`)

2. Add state to interface:
```typescript
interface CatalogState {
  products: Product[];
  isLoading: boolean;
  filter: string;  // New state
}
```

3. Add action to interface:
```typescript
interface CatalogActions {
  addProduct: (input: ProductInput) => void;
  setFilter: (filter: string) => void;  // New action
}
```

4. Implement action in store:
```typescript
setFilter: (filter: string) => {
  set({ filter })
  console.log('[CatalogStore] setFilter', { filter })
},
```

### Adding Persistence to a Store

To add persistence to a new store:

1. Import persist middleware:
```typescript
import { devtools, persist } from 'zustand/middleware'
import { createIndexedDBStorage } from '@/lib/persist-middleware'
import { STORAGE_KEYS } from '@/lib/storage-keys'
```

2. Wrap store with persist:
```typescript
export const useMyStore = create<MyStore>()(
  devtools(
    persist(
      (set, get) => ({ /* store definition */ }),
      {
        name: STORAGE_KEYS.MY_STORE,  // Add to storage-keys.ts
        storage: createIndexedDBStorage<MyStore>(),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('[MyStore] Rehydration failed:', error)
            return
          }
          if (state) {
            state.hasHydrated = true
            console.log('[MyStore] Hydration complete')
          }
        },
      }
    )
  )
)
```

### Using IndexedDB Directly

For direct IndexedDB operations (outside of store persist):

```typescript
import { safeGet, safeSet, safeDelete, clearAll } from '@/lib/storage'

// Get data
const data = await safeGet<MyType>('my-key')

// Set data
await safeSet('my-key', { some: 'data' })

// Delete data
await safeDelete('my-key')

// Clear all data
await clearAll()

// Get storage info
const info = await getStorageInfo()
console.log(`Used: ${info.percentage.toFixed(1)}%`)
```

### Debugging with Zustand DevTools

1. Install Redux DevTools browser extension
2. Open DevTools and go to Redux tab
3. You'll see:
   - All store actions logged
   - Current state of all stores
   - Time-travel debugging (jump to previous states)
   - State diff viewer

4. Stores log actions with prefix:
   - `[CatalogStore] actionName`
   - `[TallyStore] actionName`
   - `[SettingsStore] actionName`

### Working with TanStack Router

**Type-Safe Navigation**:
```typescript
import { Link, useNavigate } from "@tanstack/react-router";

// Using Link component
<Link to="/settings">Settings</Link>

// Using navigate function
const navigate = useNavigate()
navigate({ to: "/settings" })
```

**Navigation with Query Params**:
```typescript
navigate({
  to: "/catalog",
  search: { page: 1, sort: "name" }
})
```

**Accessing Route Params**:
```typescript
import { useParams } from "@tanstack/react-router";

const params = useParams({ strict: false })
const id = params.id
```

**Programmatic Navigation with Guards**:
```typescript
import { useTallyNavigationGuard } from "@/lib/route-guards";

const { navigateWithCheck } = useTallyNavigationGuard(
  hasActiveItems,
  clearTally
)

// This will show confirmation if tally has items
navigateWithCheck("/settings")
```

## Testing

### Manual Testing Procedures

#### Testing Navigation Guards

1. Add item to tally:
   ```javascript
   // In browser console
   import { useTallyStore } from '@/stores/tally-store'
   const store = useTallyStore.getState()
   store.addItem('test-id', 999, 5)
   ```

2. Attempt to navigate to `/settings`

3. Expected: Confirmation modal appears

4. Test "Cancel" - should stay on current page

5. Test "Clear & Continue" - should clear tally and navigate

6. Test with empty tally - should navigate immediately

#### Testing Persistence

**Catalog Store (IndexedDB)**:
1. Add product via CatalogSettings UI or console:
   ```javascript
   const catalogStore = useCatalogStore.getState()
   catalogStore.addProduct({ name: 'Test', price: 999, imageData: '' })
   ```

2. Refresh page

3. Expected: Product still in catalog

4. Open DevTools → Application → IndexedDB → tiny-till-db → tiny-till-store
5. Verify data exists in database

**Settings Store (localStorage)**:
1. Change theme or grid density in Settings page

2. Refresh page

3. Expected: Settings preserved

4. Open DevTools → Application → Local Storage → tiny-till
5. Verify settings stored

**Tally Store (No Persistence)**:
1. Add items to tally

2. Refresh page

3. Expected: Tally is empty (items cleared)

#### Testing Theme System

1. Toggle theme using ModeToggle:
   - Light mode → Dark mode
   - Dark mode → System mode
   - System mode → Light mode

2. Verify CSS variables update correctly

3. Check each page route:
   - `/` (Tally)
   - `/settings`
   - Theme persists across routes

4. Refresh page and verify theme persists

5. Test system theme preference:
   - Change OS theme (Light/Dark)
   - Set app theme to "System"
   - Verify app follows OS preference

#### Testing IndexedDB Quota Handling

1. Check storage usage:
   ```javascript
   navigator.storage.estimate().then(console.log)
   ```

2. Try adding many large products with images to approach quota limit

3. Expected: Warning logged at 80% quota

4. If quota exceeded, expect user-friendly error message

### Testing Checklist

Before considering a feature complete, verify:

- [ ] TypeScript compiles without errors (`npm run check-types`)
- [ ] Production builds successfully (`npm run build`)
- [ ] All routes navigate correctly
- [ ] Navigation guards prevent route changes with active tally
- [ ] IndexedDB persistence works across reloads
- [ ] localStorage persistence works for settings
- [ ] Theme switching works in all modes
- [ ] All shadcn/ui components render correctly
- [ ] Console shows no errors (except expected dev warnings)
- [ ] DevTools Redux tab shows store actions and state

## Build & Deployment

### Production Build

```bash
npm run build
```

This outputs to `apps/web/dist/`:
- `index.html` - Entry HTML file
- `assets/*.js` - JavaScript bundles
- `assets/*.css` - CSS bundle

### Build Output Analysis

After building, check the output:

```bash
ls -lh apps/web/dist/
```

Expected:
- `index.html` (~0.4 kB)
- `assets/index-*.css` (~52 kB, ~9 kB gzipped)
- `assets/index-*.js` (~594 kB, ~187 kB gzipped)

### Optimization

If bundle size is too large (>500 kB gzipped):

1. Analyze bundle:
   ```bash
   cd apps/web
   npx vite-bundle-visualizer
   ```

2. Consider:
   - Code-splitting heavy routes with `React.lazy()`
   - Tree-shaking unused dependencies
   - Using dynamic imports for optional features

### Static Hosting: GitHub Pages

1. Build the application:
   ```bash
   npm run build
   ```

2. Ensure `base` is set in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/tiny-till/',  // Your repo name
     // ... rest of config
   })
   ```

3. Commit and push build artifacts (or use GitHub Actions to auto-deploy)

4. Enable GitHub Pages in repository settings:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `gh-pages`)
   - Folder: `/apps/web/dist`

5. Access at: `https://yourusername.github.io/tiny-till/`

### Custom Domain (Optional)

1. Configure `CNAME` file in `apps/web/dist/`:
   ```
   tiny-till.app
   ```

2. Update DNS settings with your domain provider

3. Update GitHub Pages custom domain settings

## Troubleshooting

### Common Issues

#### TypeScript Errors

**Issue**: "Property X does not exist on type Y"

**Solution**:
- Check type definition in `packages/types/src/`
- Ensure you're importing the correct interface
- Use `unknown` and type guards if type is uncertain

**Issue**: "Implicit 'any' type"

**Solution**:
- Add explicit type annotation
- Never use `any` - use proper types or `unknown`
- Example: `const data: MyType = ...`

#### Build Failures

**Issue**: "Module not found"

**Solution**:
- Install missing dependency: `npm install <package>`
- Check import path uses `@/` alias correctly
- Ensure dependency is in `package.json`

**Issue**: "Cannot find module '@tiny-till/types'"

**Solution**:
- Ensure types package is built: `npm run build`
- Check workspace configuration in root `package.json`
- Restart TypeScript server in editor

#### Development Server Issues

**Issue**: "Port already in use"

**Solution**:
- Kill process using port: `npx kill-port 5173`
- Or use different port in Vite config

**Issue**: "Hot module replacement not working"

**Solution**:
- Restart dev server
- Clear browser cache
- Check Vite config for HMR settings

#### IndexedDB Issues

**Issue**: "IndexedDB not opening"

**Possible causes**:
- Browser in private/incognito mode
- Storage quota exceeded
- Browser not supported

**Solution**:
- Try normal browser mode
- Clear old data: `await clearAll()` in console
- Check browser compatibility

**Issue**: "Quota exceeded error"

**Solution**:
- Clear some old data
- Use smaller images (max 128x128px)
- Check storage usage: `getStorageInfo()`

#### Theme Not Applying

**Issue**: Theme not switching or flickering

**Solution**:
- Ensure ThemeProvider wraps entire app
- Check `disableTransitionOnChange` is set
- Verify CSS variables defined in `index.css`
- Check for CSS specificity conflicts

#### Store Not Persisting

**Issue**: Store state lost on refresh

**Solution**:
- Check persist middleware is configured
- Verify storage key is unique
- Check `hasHydrated` flag is true
- Look for console errors during hydration

#### Router Navigation Issues

**Issue**: Navigation not working

**Solution**:
- Ensure route file exists
- Check route exports `Route` constant
- Verify route path matches file location
- Run `npx tsr generate` to regenerate route tree

**Issue**: Navigation guard not triggering

**Solution**:
- Ensure `navigateWithCheck` is used instead of `navigate`
- Check `hasActiveItems` callback returns correct boolean
- Verify modal component is rendered in root layout

### Debugging Tips

**Console Logging Pattern**:
- All store actions follow: `[ComponentName] ActionName`
- Storage errors: `[Storage] Error description`
- Persistence: `[Persist]` or `[CatalogStore|TallyStore|SettingsStore]`

**React DevTools**:
- Inspect component tree
- View props and state
- Check component re-renders (⚡ icon)

**Redux DevTools (Zustand)**:
- View all store actions
- Time-travel to previous states
- Pinpoint state changes causing bugs

**Network Tab**:
- Verify no unexpected network requests
- Check service worker registration (when added)

**Application Tab**:
- IndexedDB: View stored data
- Local Storage: Check settings
- Session Storage: View session data

### Performance Issues

**Issue**: App feels slow to load

**Solutions**:
- Check bundle size (target <200 kB gzipped)
- Use `React.memo()` for expensive components
- Implement virtual scrolling for large lists
- Lazy load heavy routes with `React.lazy()`

**Issue**: UI lags on interactions

**Solutions**:
- Add `touch-action: manipulation` to interactive elements
- Use `useTransition()` for non-critical updates
- Debounce rapid user inputs
- Profile with Chrome DevTools Performance tab

### Getting Help

If you encounter issues not covered here:

1. Check existing documentation:
   - `ARCHITECTURE.md` - System design details
   - `README.md` - Project overview
   - Library documentation (React, TanStack Router, Zustand)

2. Search error messages:
   - Google the exact error
   - Check Stack Overflow
   - Search GitHub issues

3. Verify environment:
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Browser compatibility

4. Report bug:
   - Create issue in repository
   - Include steps to reproduce
   - Provide error messages and screenshots
   - Specify Node.js and browser versions
