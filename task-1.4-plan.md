# Task 1.4: Implement Core Zustand Stores with Strict Typing

## Task Overview

Create three Zustand stores for the tiny-till application with TypeScript strict typing, middleware for logging, and proper error boundaries.

## Pre-existing Resources

The following types are already available from `@tiny-till/types`:

**Entities:**
- `Product` - Catalog product with id, name, price, imageData
- `TallyItem` - Tally entry with productId, quantity, price
- `TallyState` - Map<string, TallyItem>
- `Settings` - User preferences (theme, gridDensity, columnCountOverride, backupReminder)

**Utilities:**
- `generateUUID()` - crypto.randomUUID wrapper
- `Timestamps` - Created/updatedAt timestamps

## Implementation Plan

### Step 1: Install Zustand Dependencies

Install `zustand` in the web app package:

```bash
npm install zustand
```

Add to `apps/web/package.json` dependencies.

---

### Step 2: Create Stores Directory Structure

Create directory: `apps/web/src/stores/`

Create files:
- `apps/web/src/stores/catalog-store.ts`
- `apps/web/src/stores/tally-store.ts`
- `apps/web/src/stores/settings-store.ts`
- `apps/web/src/stores/index.ts` (barrel export)

---

### Step 3: Implement Catalog Store

**File:** `apps/web/src/stores/catalog-store.ts`

**State Interface:**
```typescript
interface CatalogState {
  products: Product[]
  isLoading: boolean
  error: string | null
}
```

**Actions:**
- `addProduct(product: ProductInput): void`
- `updateProduct(id: string, updates: ProductUpdate): void`
- `deleteProduct(id: string): void`
- `getProduct(id: string): Product | undefined`
- `clearError(): void`
- `setLoading(loading: boolean): void`

**Middleware:**
- Custom logger middleware for state changes
- Error boundary action to catch and store errors

**Typed Hook Export:**
```typescript
export const useCatalogStore = create<CatalogState & CatalogActions>()(
  devtools(
    logger(
      (set, get, api) => ({
        // ... implementation
      })
    ),
    { name: 'CatalogStore' }
  )
)
```

**Implementation Notes:**
- Use `@tiny-till/types` for Product types
- Generate UUID for new products using `generateUUID()`
- Add timestamps using current Unix time (Date.now())
- Validate product updates before applying

---

### Step 4: Implement Tally Store

**File:** `apps/web/src/stores/tally-store.ts`

**State Interface:**
```typescript
interface TallyStoreState {
  items: TallyState
  isActive: boolean
  lastModified: number | null
}
```

**Actions:**
- `addItem(productId: string, price: number, quantity?: number): void`
- `removeItem(productId: string): void`
- `updateQuantity(productId: string, quantity: number): void`
- `incrementItem(productId: string): void`
- `clearTally(): void`
- `getSummary(): TallySummary`
- `hasActiveItems(): boolean`

**Middleware:**
- Custom logger middleware for state changes
- DevTools integration for debugging

**Typed Hook Export:**
```typescript
export const useTallyStore = create<TallyStoreState & TallyActions>()(
  devtools(
    logger(
      (set, get, api) => ({
        // ... implementation
      })
    ),
    { name: 'TallyStore' }
  )
)
```

**Implementation Notes:**
- Use Map for efficient lookups
- Auto-quantity increment defaults to 1
- Remove items when quantity reaches 0
- Track lastModified timestamp
- Calculate summary (total, itemCount, productCount)

---

### Step 5: Implement Settings Store

**File:** `apps/web/src/stores/settings-store.ts`

**State Interface:**
```typescript
interface SettingsState {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride: ColumnCount | undefined
  backupReminder: number | undefined
}
```

**Actions:**
- `setTheme(theme: Theme): void`
- `setGridDensity(density: GridDensity): void`
- `setColumnCountOverride(count: ColumnCount | undefined): void`
- `setBackupReminder(days: number | undefined): void`
- `resetSettings(): void`

**Middleware:**
- Custom logger middleware
- DevTools integration

**Typed Hook Export:**
```typescript
export const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    logger(
      (set, get, api) => ({
        // ... implementation
      })
    ),
    { name: 'SettingsStore' }
  )
)
```

**Implementation Notes:**
- Import types from `@tiny-till/types`
- Default theme: 'system'
- Default gridDensity: 'normal'
- Reset action restores defaults

---

### Step 6: Create Logger Middleware

**File:** `apps/web/src/stores/middleware/logger.ts` (optional: inline in stores)

Implement custom logger middleware:
```typescript
const logger = (config) => (set, get, api) =>
  config(
    (args) => {
      set(args)
      console.log('[STORE]', api.name, get())
    },
    get,
    api
  )
```

---

### Step 7: Create Barrel Export

**File:** `apps/web/src/stores/index.ts`

Export all typed hooks:
```typescript
export { useCatalogStore } from './catalog-store'
export { useTallyStore } from './tally-store'
export { useSettingsStore } from './settings-store'
```

---

### Step 8: Update TypeScript Configuration

Ensure strict typing is enforced (already configured):
- `strict: true` in tsconfig
- No `any` types allowed
- All state and actions must be typed

---

### Step 9: Independent Store Validation

Create test utilities or manual validation logic:

**Catalog Store Validation:**
- Product IDs are unique
- Prices are non-negative integers
- Timestamps are valid numbers
- Images are valid base64 strings

**Tally Store Validation:**
- Quantities are non-negative integers
- Products exist before adding to tally
- Calculated totals match manual calculation
- Empty tally has summary with zeros

**Settings Store Validation:**
- Theme values match union type
- GridDensity matches union type
- ColumnCount within 2-8 range
- BackupReminder is positive number or undefined

---

### Step 10: Type Checking and Build Verification

Run required commands:
```bash
npm run check-types
npm run build
```

Fix any TypeScript errors before claiming success.

---

## File Changes Summary

**New Files:**
1. `apps/web/src/stores/catalog-store.ts`
2. `apps/web/src/stores/tally-store.ts`
3. `apps/web/src/stores/settings-store.ts`
4. `apps/web/src/stores/index.ts`
5. `apps/web/src/stores/middleware/logger.ts` (optional)

**Modified Files:**
1. `apps/web/package.json` - Add zustand dependency

---

## Success Criteria

1. ✅ Three Zustand stores created with strict TypeScript typing
2. ✅ Typed hooks exported from stores/index.ts
3. ✅ Logger middleware integrated for all stores
4. ✅ DevTools middleware integrated for all stores
5. ✅ All actions and reducers properly typed
6. ✅ Independent validation logic for each store
7. ✅ `npm run check-types` passes
8. ✅ `npm run build` passes
9. ✅ No `any` types used anywhere

---

## Notes

- This task does NOT include IndexedDB persistence (task 1.5)
- Stores use in-memory state only for now
- Error boundaries are action-level (catch and store errors in state)
- No actual component integration yet - just store implementation
- Follow existing code patterns from AGENTS.md
