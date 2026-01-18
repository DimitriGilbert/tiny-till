# Implementation Plan: Set up IndexedDB Persistence Layer with idb-keyval

## Overview
This plan details the implementation of a robust IndexedDB persistence layer using idb-keyval wrapper integrated with Zustand's persist middleware across all stores (Catalog, Tally, and Settings).

## Current State Analysis

### Existing Stores
- **settings-store.ts**: User preferences (theme, grid density, column count, backup reminder)
- **tally-store.ts**: Active tally sessions with product items (Map-based state)
- **catalog-store.ts**: Product catalog (array-based state)

### Current Middleware
- All stores use `devtools` middleware only
- No persistence mechanism implemented
- State resets on page reload

### Technology Stack
- Zustand for state management
- TypeScript with strict mode
- Turborepo monorepo structure
- Web application (browser-only)

---

## Implementation Steps

### Step 1: Install Dependencies
**File**: `apps/web/package.json`

**Actions**:
1. Add `idb-keyval` to dependencies
2. Add `zustand` persist middleware (if not already available)
3. Verify version compatibility

**Commands**:
```bash
npm install idb-keyval
```

---

### Step 2: Create IndexedDB Configuration Module
**File**: `apps/web/src/lib/storage.ts` (NEW)

**Purpose**: Centralized IndexedDB configuration with connection handling, error boundaries, and browser compatibility checks.

**Implementation Details**:
1. Import idb-keyval functions (`get`, `set`, `del`, `clear`)
2. Create custom store instance with specific database name (`tiny-till-db`)
3. Implement connection retry logic with exponential backoff
4. Add browser compatibility detection (check for IndexedDB support)
5. Create quota management utilities using `navigator.storage.estimate()`
6. Implement error handling wrapper for all storage operations
7. Add logging for storage events (success, error, quota warnings)

**Key Functions**:
- `isIndexedDBSupported()`: Feature detection
- `getStorageInfo()`: Quota information
- `safeGet<T>(key: string)`: Typed get with error handling
- `safeSet<T>(key: string, value: T)`: Typed set with quota check
- `safeDelete(key: string)`: Delete with error handling
- `clearAll()`: Clear all data with confirmation logic

---

### Step 3: Create Store-Specific Storage Keys
**File**: `apps/web/src/lib/storage-keys.ts` (NEW)

**Purpose**: Define storage key constants for each store to prevent key collisions.

**Implementation**:
```typescript
export const STORAGE_KEYS = {
  CATALOG: 'tiny-till-catalog',
  TALLY: 'tiny-till-tally',
  SETTINGS: 'tiny-till-settings',
  VERSION: 'tiny-till-version',
} as const
```

---

### Step 4: Implement Custom Persist Middleware
**File**: `apps/web/src/lib/persist-middleware.ts` (NEW)

**Purpose**: Custom wrapper around Zustand's persist middleware with enhanced error handling, retry logic, and serialization for complex types (Map).

**Implementation Details**:
1. Import `persist` from `zustand/middleware`
2. Import storage utilities from `storage.ts`
3. Create serializer/deserializer for Map objects in TallyStore
4. Implement version migration support (for future schema changes)
5. Add hydration status tracking (isHydrated flag)
6. Implement partial storage (selective state persistence)
7. Add error boundary to prevent store crashes on storage failures
8. Implement onRehydrateStorage callback for loading indicators

**Key Features**:
- Map serialization: Convert Map to/from Array for storage
- Retry logic: Exponential backoff on transient failures
- Fallback to memory on storage unavailability
- Version checking: Migrate old data if schema changes
- Hydration control: Prevent premature renders before hydration

---

### Step 5: Update Settings Store with Persistence
**File**: `apps/web/src/stores/settings-store.ts`

**Changes**:
1. Import `persist` middleware and storage utilities
2. Add `persist` middleware to store creation
3. Configure partial storage (persist theme, gridDensity, columnCountOverride, backupReminder)
4. Add `hasHydrated` state to track hydration status
5. Implement onRehydrateStorage callback
6. Add error handling for storage failures
7. Update type definitions to include hydration state

**Configuration**:
- Storage key: `STORAGE_KEYS.SETTINGS`
- Serialize/Deserialize: Plain object (no special handling needed)
- Version: 1
- Partial state: All fields (persist entire settings state)

---

### Step 6: Update Tally Store with Persistence
**File**: `apps/web/src/stores/tally-store.ts`

**Changes**:
1. Import `persist` middleware and storage utilities
2. Add custom serializer for Map objects
3. Add `persist` middleware to store creation
4. Configure partial storage (persist items, isActive, lastModified)
5. Add `hasHydrated` state
6. Implement onRehydrateStorage callback
7. Add error handling for storage failures
8. Update type definitions

**Special Considerations**:
- Map serialization: Convert `Map<string, TallyItem>` to `Array<[string, TallyItem]>`
- Date serialization: Convert `lastModified` timestamp to/from number
- Partial state: Persist active tally state but allow manual clear

**Configuration**:
- Storage key: `STORAGE_KEYS.TALLY`
- Serialize/Deserialize: Custom Map conversion
- Version: 1
- Partial state: Persist items, isActive, lastModified

---

### Step 7: Update Catalog Store with Persistence
**File**: `apps/web/src/stores/catalog-store.ts`

**Changes**:
1. Import `persist` middleware and storage utilities
2. Add `persist` middleware to store creation
3. Configure partial storage (persist products only, exclude isLoading, error)
4. Add `hasHydrated` state
5. Implement onRehydrateStorage callback
6. Add error handling for storage failures
7. Update type definitions

**Configuration**:
- Storage key: `STORAGE_KEYS.CATALOG`
- Serialize/Deserialize: Plain array (no special handling)
- Version: 1
- Partial state: Persist products only, exclude transient state (isLoading, error)

---

### Step 8: Create Storage Monitoring Hook
**File**: `apps/web/src/hooks/use-storage.ts` (NEW)

**Purpose**: React hook to monitor storage usage and provide quota warnings.

**Implementation Details**:
1. Create hook that returns storage usage info
2. Implement periodic quota checks (debounced)
3. Provide warning when approaching storage limits (>80%)
4. Expose methods to clear storage by store
5. Return hydration status for all stores

**Hook API**:
```typescript
interface StorageInfo {
  quotaUsed: number
  quotaLimit: number
  percentage: number
  isNearLimit: boolean
  clearStore: (storeName: 'catalog' | 'tally' | 'settings') => Promise<void>
  clearAll: () => Promise<void>
}

export function useStorage(): StorageInfo
```

---

### Step 9: Create Hydration Loading Indicator Component
**File**: `apps/web/src/components/hydrate-loader.tsx` (NEW)

**Purpose**: Display loading state during store hydration to prevent UI flashes.

**Implementation**:
1. Import useStorage hook
2. Check hydration status for all stores
3. Display loading indicator if any store not hydrated
4. Use existing shadcn/ui Loader component
5. Ensure smooth fade-in when hydration complete

**Usage**: Wrap application root or specific components that depend on persisted state.

---

### Step 10: Update Main Entry Point
**File**: `apps/web/src/main.tsx`

**Changes**:
1. Add HydrateLoader component to app root
2. Ensure stores hydrate before initial render
3. Add error boundary for storage-related crashes
4. Initialize storage monitoring on mount

---

### Step 11: Add Error Boundary for Storage Errors
**File**: `apps/web/src/components/storage-error-boundary.tsx` (NEW)

**Purpose**: Catch storage-related errors and provide recovery options.

**Implementation Details**:
1. Create React Error Boundary component
2. Detect storage-related errors (quota exceeded, IndexedDB blocked)
3. Provide user-friendly error messages
4. Offer recovery actions (clear storage, reload page)
5. Log errors to console with detailed context

---

### Step 12: Update Store Index Exports
**File**: `apps/web/src/stores/index.ts`

**Changes**:
1. Export new storage utilities from `lib/storage.ts`
2. Export storage keys from `lib/storage-keys.ts`
3. Export `useStorage` hook
4. Maintain existing store exports

---

### Step 13: Create Storage Testing Utilities
**File**: `apps/web/src/lib/storage-test.ts` (NEW)

**Purpose**: Utilities for testing persistence across browser sessions.

**Implementation Details**:
1. Create test functions to simulate storage operations
2. Implement data integrity verification
3. Add cross-session validation helpers
4. Include functions for manual storage inspection

**Test Functions**:
- `testCatalogPersistence()`: Verify catalog save/load
- `testTallyPersistence()`: Verify tally save/load
- `testSettingsPersistence()`: Verify settings save/load
- `simulateQuotaExceeded()`: Test quota handling
- `simulateStorageBlocked()`: Test fallback behavior

---

### Step 14: Create Type Definitions for Persistence
**File**: `apps/web/src/types/persistence.ts` (NEW)

**Purpose**: TypeScript types for persistence layer.

**Implementation**:
1. Define storage state interfaces
2. Define storage error types
3. Define persistence configuration types
4. Export hydration state types

---

## Testing Strategy

### Manual Testing Checklist

#### 1. Installation and Setup
- [ ] `idb-keyval` installed successfully
- [ ] No TypeScript errors in new files
- [ ] All imports resolve correctly

#### 2. Storage Connectivity
- [ ] IndexedDB database created successfully
- [ ] Connection retry logic works on transient failures
- [ ] Browser compatibility detection works
- [ ] Fallback to memory on blocked storage

#### 3. Settings Store Persistence
- [ ] Settings saved to IndexedDB on change
- [ ] Settings loaded correctly on page reload
- [ ] Theme preference persists across sessions
- [ ] Grid density preference persists
- [ ] Column count override persists
- [ ] Backup reminder setting persists

#### 4. Tally Store Persistence
- [ ] Active tally items saved to IndexedDB
- [ ] Tally state restored on page reload
- [ ] Map serialization works correctly
- [ ] lastModified timestamp preserved
- [ ] Clear tally works and updates storage

#### 5. Catalog Store Persistence
- [ ] Products saved to IndexedDB
- [ ] Product list restored on page reload
- [ ] Large catalogs (100+ products) persist correctly
- [ ] Product updates reflected in storage immediately

#### 6. Error Handling
- [ ] Quota exceeded displays warning
- [ ] Storage errors caught and logged
- [ ] Fallback to memory works on storage failure
- [ ] Error boundary catches storage crashes
- [ ] Retry logic works on transient errors

#### 7. Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile browsers (iOS Safari, Chrome Android)

#### 8. Edge Cases
- [ ] Private browsing mode (IndexedDB may be blocked)
- [ ] Storage quota nearly full
- [ ] Concurrent writes from multiple tabs
- [ ] Corrupted storage data
- [ ] Browser refresh during write operation

### Automated Testing (Future Enhancement)
- Unit tests for storage utilities
- Integration tests for persist middleware
- Mock IndexedDB for testing
- Test coverage for error scenarios

---

## File Changes Summary

### New Files
1. `apps/web/src/lib/storage.ts` - IndexedDB configuration and utilities
2. `apps/web/src/lib/storage-keys.ts` - Storage key constants
3. `apps/web/src/lib/persist-middleware.ts` - Custom persist middleware
4. `apps/web/src/hooks/use-storage.ts` - Storage monitoring hook
5. `apps/web/src/components/hydrate-loader.tsx` - Hydration loading indicator
6. `apps/web/src/components/storage-error-boundary.tsx` - Error boundary
7. `apps/web/src/lib/storage-test.ts` - Testing utilities
8. `apps/web/src/types/persistence.ts` - Persistence type definitions

### Modified Files
1. `apps/web/package.json` - Add idb-keyval dependency
2. `apps/web/src/stores/settings-store.ts` - Add persistence
3. `apps/web/src/stores/tally-store.ts` - Add persistence
4. `apps/web/src/stores/catalog-store.ts` - Add persistence
5. `apps/web/src/stores/index.ts` - Update exports
6. `apps/web/src/main.tsx` - Add hydrate loader and error boundary

---

## Implementation Order

1. **Phase 1: Foundation** (Steps 1-3)
   - Install dependencies
   - Create storage configuration
   - Define storage keys

2. **Phase 2: Middleware** (Step 4)
   - Implement custom persist middleware with serialization

3. **Phase 3: Store Updates** (Steps 5-7)
   - Update Settings store
   - Update Tally store
   - Update Catalog store

4. **Phase 4: UI Components** (Steps 8-11)
   - Create storage monitoring hook
   - Create hydrate loader
   - Create error boundary
   - Update main entry point

5. **Phase 5: Polish** (Steps 12-14)
   - Update exports
   - Create testing utilities
   - Add type definitions

---

## Success Criteria

- All three stores persist data to IndexedDB
- State survives application reloads
- Data can be loaded across browser sessions
- Error handling works for quota exceeded
- Fallback mechanisms work when IndexedDB is blocked
- No TypeScript errors
- No runtime errors in console
- Build succeeds with `npm run build`
- Type checking passes with `npm run check-types`

---

## Risk Mitigation

### Risk: IndexedDB Not Supported
**Mitigation**: Feature detection with fallback to localStorage

### Risk: Quota Exceeded
**Mitigation**: Quota monitoring and user warnings before limit reached

### Risk: Map Serialization Issues
**Mitigation**: Thorough testing of Map to Array conversion

### Risk: Storage Corruption
**Mitigation**: Version checking and migration logic

### Risk: Concurrent Writes
**Mitigation**: Atomic operations and retry logic

### Risk: Performance Impact
**Mitigation**: Debounced writes, partial persistence, async operations

---

## Notes

- All persistence operations are asynchronous
- Hydration status tracked per-store to prevent UI flashes
- Partial state persistence to avoid saving transient state (isLoading, error)
- Map serialization specifically for TallyStore's items Map
- Version migration support for future schema changes
- Error boundary prevents app crashes from storage failures
- Storage monitoring provides proactive quota warnings

---

## Estimated Time

- Phase 1: 30 minutes
- Phase 2: 1 hour
- Phase 3: 1 hour
- Phase 4: 1 hour
- Phase 5: 30 minutes
- Testing: 1-2 hours

**Total Estimated Time**: 4-5.5 hours
