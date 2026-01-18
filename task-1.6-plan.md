# Task 1.6: TanStack Router Implementation Plan

## Overview
Configure TanStack Router with file-based routing for all required routes: root (Tally), Settings, and Catalog. The router is already partially configured, so this task focuses on completing the route structure, adding navigation guards, lazy loading, and navigation utilities.

## Current State
- TanStack Router v1.141.1 installed
- Router plugin configured in `vite.config.ts`
- Root route (`__root.tsx`) exists with ThemeProvider and Header
- Index route (`/`) exists as Tally page (displaying ASCII logo)
- Header component has basic navigation structure
- Router configured in `main.tsx` with RouteProvider

## Required Routes Structure
```
/                          -> Tally Page (root route, existing)
/settings                  -> Settings & Catalog Management (NEW)
/settings/catalog          -> Dedicated Catalog Edit View (NEW, nested)
```

## Implementation Steps

### Step 1: Create Settings Route
**File:** `apps/web/src/routes/settings.tsx`

**Actions:**
1. Import `createFileRoute` from `@tanstack/react-router`
2. Create route with `createFileRoute("/settings")`
3. Export `Route` constant
4. Create `SettingsPage` component with placeholder UI
5. Add basic page structure with heading and placeholder sections for:
   - Theme Management
   - Display Preferences
   - Data Portability (Export/Import)
6. Ensure proper TypeScript typing for route params (none needed for this route)

**Code Pattern:**
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {/* Placeholder sections */}
    </div>
  );
}
```

### Step 2: Create Catalog Route (Nested)
**File:** `apps/web/src/routes/settings.catalog.tsx`

**Actions:**
1. Import `createFileRoute` from `@tanstack/react-router`
2. Create route with `createFileRoute("/settings/catalog")`
3. Export `Route` constant
4. Create `CatalogPage` component with placeholder UI
5. Add basic page structure with:
   - "Back to Settings" navigation link
   - Heading for Catalog Management
   - Placeholder for product list
   - Placeholder for add product form
6. Ensure proper TypeScript typing for route params (none needed)

**Code Pattern:**
```typescript
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/catalog")({
  component: CatalogPage,
});

function CatalogPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <Link to="/settings" className="text-blue-500 hover:underline">
        ← Back to Settings
      </Link>
      <h1 className="text-2xl font-bold mb-4">Catalog Management</h1>
      {/* Placeholder sections */}
    </div>
  );
}
```

### Step 3: Add Navigation Links to Header
**File:** `apps/web/src/components/header.tsx`

**Actions:**
1. Update the `links` array to include Settings route
2. Add "Settings" link pointing to `/settings`
3. Maintain existing "Home" link pointing to `/`
4. Update array type to be `readonly` for type safety

**Updated Code Pattern:**
```typescript
const links = [
  { to: "/", label: "Tally" },
  { to: "/settings", label: "Settings" }
] as const;
```

### Step 4: Implement Route Guard for Non-Root Routes on Refresh
**File:** `apps/web/src/routes/__root.tsx`

**Actions:**
1. Import `useNavigate` from `@tanstack/react-router`
2. Import `useEffect` from "react"
3. Add navigation guard logic to redirect non-root routes to root on page refresh
4. Check if current path is not `/` and redirect to `/`
5. Use `useEffect` with empty dependency array to run once on mount
6. Store a flag in sessionStorage to detect page refresh

**Implementation Details:**
- Use `sessionStorage` to set a flag on initial load
- On refresh, check if flag exists (indicating refresh)
- If current path is not `/`, redirect to `/`
- Clear flag after redirect to prevent infinite loops

**Code Pattern:**
```typescript
import { useNavigate, useLocation } from "@tanstack/react-router";

function RootComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("has-reloaded");
    if (!hasReloaded) {
      sessionStorage.setItem("has-reloaded", "true");
    } else {
      if (location.pathname !== "/") {
        navigate({ to: "/" });
      }
    }
  }, [navigate, location.pathname]);

  // ... rest of component
}
```

**Note:** This implementation respects the PRD requirement that "All non-root routes redirect to `/` on refresh to prevent user confusion and data loss."

### Step 5: Implement Tally Active Guard (Navigation Away Protection)
**File:** Create new file `apps/web/src/lib/route-guards.ts`

**Actions:**
1. Create a utility function for tally protection
2. Import `useNavigate` and `useLocation` from `@tanstack/react-router`
3. Create a hook `useTallyNavigationGuard()` that:
   - Checks if there are items in the current tally (quantity > 0)
   - Shows confirmation dialog before navigating away from `/`
   - Uses browser's `confirm()` API for simplicity (can be enhanced with modal later)
4. Export the hook for use in components

**Code Pattern:**
```typescript
import { useCallback } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export function useTallyNavigationGuard(hasActiveTally: () => boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithCheck = useCallback(
    (to: string) => {
      if (location.pathname === "/" && hasActiveTally()) {
        const shouldProceed = confirm(
          "You have items in your current tally. Clear and continue?"
        );
        if (!shouldProceed) return;
      }
      navigate({ to });
    },
    [navigate, location.pathname, hasActiveTally]
  );

  return { navigateWithCheck };
}
```

**Note:** This hook will be integrated with the tally store in future tasks (Task 4+), but we're setting up the infrastructure now.

### Step 6: Configure Lazy Loading for Routes
**File:** Update existing route files to use lazy loading

**Actions:**
1. Update `apps/web/src/routes/settings.tsx` to use lazy component loading
2. Update `apps/web/src/routes/settings.catalog.tsx` to use lazy component loading
3. Use TanStack Router's `lazy()` function for components
4. This improves initial load time by code-splitting settings routes

**Code Pattern for Settings:**
```typescript
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: lazyRouteComponent(() => import("./SettingsPage")),
});

function SettingsPage() {
  // component code
}
```

**Alternative:** Use React.lazy with Suspense:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SettingsPage = lazy(() => import("./SettingsPage").then(m => ({ default: m.SettingsPage })));

export const Route = createFileRoute("/settings")({
  component: () => (
    <Suspense fallback={<Loader />}>
      <SettingsPage />
    </Suspense>
  ),
});
```

**Note:** Verify which approach TanStack Router v1.141.1 supports best and use the recommended pattern.

### Step 7: Add Type-Safe Route Parameter Handling
**File:** `apps/web/src/routes/__root.tsx` (already has RouterAppContext)

**Actions:**
1. Verify `RouterAppContext` interface exists in `__root.tsx` (currently empty `{}`)
2. This interface allows type-safe context sharing across routes
3. Document that this will be used for:
   - Tally store access
   - Settings store access
   - Catalog store access
4. No changes needed now, but ensure interface is properly exported

### Step 8: Update Tally Route (Root Index)
**File:** `apps/web/src/routes/index.tsx`

**Actions:**
1. Update component name from `HomeComponent` to `TallyPage` for clarity
2. Update heading text to "Tally" instead of ASCII logo
3. Keep placeholder structure but prepare for future grid implementation
4. Ensure route properly exports `Route` constant

**Updated Code Pattern:**
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TallyPage,
});

function TallyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Tally</h1>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <p className="text-muted-foreground">
            Product grid will be displayed here.
          </p>
        </section>
      </div>
    </div>
  );
}
```

### Step 9: Verify Router Configuration
**File:** `apps/web/src/main.tsx` (no changes expected)

**Actions:**
1. Verify router is created with `routeTree` from `routeTree.gen`
2. Confirm `defaultPreload: "intent"` is set (for lazy loading)
3. Verify `defaultPendingComponent: () => <Loader />` is set
4. Ensure `context: {}` is properly typed
5. Confirm module augmentation is correct for TypeScript

**Expected State (already exists):**
```typescript
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: {},
});
```

### Step 10: Generate Route Tree
**File:** Auto-generated `apps/web/src/routeTree.gen.ts`

**Actions:**
1. Run dev server or build to trigger route tree generation
2. The TanStack Router plugin will automatically generate `routeTree.gen.ts`
3. Verify that all three routes are included in the generated file:
   - `/` (Tally)
   - `/settings` (Settings)
   - `/settings/catalog` (Catalog)
4. No manual changes needed - file is auto-generated

**Command:**
```bash
cd apps/web && npm run build
# or
cd apps/web && npm run dev
```

## File Changes Summary

### New Files Created
1. `apps/web/src/routes/settings.tsx` - Settings route page
2. `apps/web/src/lib/route-guards.ts` - Navigation guard utilities

### Files Modified
1. `apps/web/src/components/header.tsx` - Add Settings navigation link
2. `apps/web/src/routes/__root.tsx` - Add refresh redirect logic
3. `apps/web/src/routes/index.tsx` - Rename component to TallyPage
4. `apps/web/src/routes/settings.catalog.tsx` - Create catalog nested route (new file)

### Auto-Generated Files (No Manual Changes)
1. `apps/web/src/routeTree.gen.ts` - Updated by TanStack Router plugin

## Verification Checklist

After implementation, verify:

- [ ] All routes accessible via navigation links
- [ ] Settings route loads at `/settings`
- [ ] Catalog route loads at `/settings/catalog`
- [ ] Refresh on non-root routes redirects to `/`
- [ ] Back/forward navigation works correctly
- [ ] Route tree generation includes all routes
- [ ] TypeScript compilation succeeds (`npm run check-types`)
- [ ] Build succeeds (`npm run build`)
- [ ] No LSP errors in any route files
- [ ] Navigation guard utilities are properly typed
- [ ] Lazy loading configuration is correct

## Implementation Notes

1. **Type Safety:** All routes will have full TypeScript type safety through TanStack Router's type system. No `any` types will be used.

2. **Lazy Loading:** Settings and Catalog routes will be lazy-loaded to improve initial bundle size and load time.

3. **Route Guards:**
   - Refresh guard: Automatically redirects to `/` on page refresh for non-root routes
   - Tally guard: Infrastructure set up, will be fully integrated when tally store is implemented (future task)

4. **Navigation Pattern:** Using TanStack Router's `Link` component throughout ensures type-safe navigation and proper prefetching.

5. **Context:** The `RouterAppContext` interface in `__root.tsx` is currently empty but ready for future store integration.

## Dependencies Required

All required dependencies are already installed:
- `@tanstack/react-router`: ^1.141.1
- `@tanstack/react-router-devtools`: ^1.141.1
- `@tanstack/router-plugin`: ^1.141.1

No additional installations needed.

## Future Integration Points

This task sets up the routing infrastructure for:
- **Task 2+:** Zustand stores (catalog, tally, settings) will be integrated via `RouterAppContext`
- **Task 4+:** Tally navigation guard will be fully integrated with the tally store
- **Task 5+:** Settings page will display actual settings options
- **Task 6+:** Catalog page will display actual product management UI

## Success Criteria

1. All three routes (`/`, `/settings`, `/settings/catalog`) are accessible and functional
2. Navigation works between all routes
3. Refresh on non-root routes properly redirects to `/`
4. TypeScript compilation succeeds without errors
5. Build succeeds without errors
6. No LSP errors in the codebase
7. Route tree is properly generated
8. Navigation utilities are properly typed and ready for future use
