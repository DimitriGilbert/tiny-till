# Implementation Plan: Storage Management and Image Compatibility Checks

## Task Overview

Develop comprehensive storage monitoring using Navigator.storage.estimate() API to detect browser storage limits for both localStorage and IndexedDB. Implement storage quota warnings with user-friendly messages when approaching limits, and provide graceful degradation strategies. Add image format compatibility checks and feature detection for WebP, AVIF, and JPEG support. Implement fallback mechanisms for older browsers and proper MIME type validation before upload or display. Include storage usage monitoring and cleanup strategies.

## Current State Analysis

### Existing Infrastructure
- **Storage library** (`apps/web/src/lib/storage.ts`): Basic `getStorageInfo()` function using `navigator.storage.estimate()` with 80% threshold warning
- **Storage hook** (`apps/web/src/hooks/use-storage.ts`): React hook providing storage info, refresh, and clear all functionality
- **Image processing** (`packages/types/src/utils/image.ts`, `image-processing.ts`): Basic validation and compression for PNG, JPEG, WebP
- **ImageUpload component** (`apps/web/src/components/ImageUpload.tsx`): Handles image upload with MIME type validation and compression to WebP

### Gaps to Address
1. No detailed storage breakdown (localStorage vs IndexedDB)
2. No proactive user-facing quota warnings with actionable suggestions
3. No graceful degradation when storage is full
4. No image format feature detection (especially AVIF)
5. No fallback mechanism for unsupported formats
6. No storage cleanup utilities or user-facing cleanup tools
7. No storage monitoring integration in settings or catalog management

---

## Implementation Plan

### Phase 1: Enhanced Storage Monitoring and Detection

#### 1.1 Extend Storage Types and Interfaces
**File**: `packages/types/src/utils/storage.ts` (new file)

Create comprehensive TypeScript types for storage management:
```typescript
// New types to define
- StorageType: 'localStorage' | 'indexedDB' | 'cache'
- StorageBreakdown: Object with usage per storage type
- StorageWarningLevel: 'normal' | 'warning' | 'critical'
- StorageQuotaConfig: Thresholds and warning messages
- ImageFormatSupport: Support status for WebP, AVIF, JPEG
```

#### 1.2 Enhanced Storage Info Function
**File**: `apps/web/src/lib/storage.ts`

**Changes**:
- Extend `getStorageInfo()` to estimate breakdown by storage type
- Add `getLocalStorageSize()` function to calculate localStorage usage
- Add `getIndexedDBSize()` function to estimate IndexedDB usage
- Add `detectStorageSupport()` to check browser API availability
- Add warning level calculation (normal: <70%, warning: 70-90%, critical: >90%)

**New functions**:
```typescript
- getDetailedStorageInfo(): Promise<DetailedStorageInfo>
- estimateStorageByType(): Promise<StorageBreakdown>
- getLocalStorageUsage(): Promise<number>
- checkQuotaExceeded(error: Error): boolean
```

---

### Phase 2: Image Format Compatibility Detection

#### 2.1 Image Format Feature Detection
**File**: `packages/types/src/utils/image-support.ts` (new file)

Create feature detection utilities:
```typescript
// New functions
- supportsWebP(): Promise<boolean>
- supportsAVIF(): Promise<boolean>
- supportsJPEG(): boolean
- getBestSupportedFormat(): Promise<PreferredFormat>
- detectImageCapabilities(): Promise<ImageFormatSupport>
```

Implementation approach:
- Create test images for each format using Canvas
- Load test images in browser to verify support
- Cache results in sessionStorage to avoid repeated detection

#### 2.2 Extended Image Types
**File**: `packages/types/src/utils/image.ts`

**Changes**:
- Add AVIF to `ACCEPTED_MIME_TYPES`
- Add `PreferredFormat` type for auto-selection
- Add fallback chain definition: AVIF > WebP > JPEG > PNG
- Add format validation with feature detection

#### 2.3 Updated Image Processing with Fallback
**File**: `packages/types/src/utils/image-processing.ts`

**Changes**:
- Modify `compressImage()` to accept `preferredFormat` with auto-fallback
- Add `compressImageWithFallback()` that tries formats in priority order
- Add `getOptimalFormat()` based on detected browser support and file size
- Update `encodeBase64()` to handle all formats correctly

---

### Phase 3: Storage Quota Warning System

#### 3.1 Storage Store for State Management
**File**: `apps/web/src/stores/storage-store.ts` (new file)

Create Zustand store for storage state:
```typescript
interface StorageState {
  storageInfo: DetailedStorageInfo | null
  warningLevel: StorageWarningLevel
  lastChecked: number | null
  imageSupport: ImageFormatSupport | null
}

interface StorageActions {
  checkStorage: () => Promise<void>
  checkImageSupport: () => Promise<void>
  dismissWarning: () => void
  forceRefresh: () => Promise<void>
}
```

#### 3.2 Storage Warning Alert Component
**File**: `apps/web/src/components/storage-warning-alert.tsx` (new file)

Create reusable alert component for storage warnings:
- Shows storage usage percentage and breakdown
- Displays actionable messages based on warning level
- "Clear Images" button for users to free space
- "View Details" link to storage management section
- Dismissible with user preference persisted

#### 3.3 Storage Quota Toast Notifications
**File**: `apps/web/src/lib/storage-toasts.ts` (new file)

Create toast notification helpers:
```typescript
- showStorageWarning(level: StorageWarningLevel): void
- showQuotaExceeded(): void
- showStorageRecovered(): void
```

#### 3.4 Integration with Existing Components
**File**: `apps/web/src/routes/__root.tsx`

**Changes**:
- Add `StorageWarningAlert` to root layout
- Initialize storage store and check on app load
- Add periodic storage check (every 5 minutes)
- Handle quota exceeded errors globally

---

### Phase 4: Graceful Degradation and Error Handling

#### 4.1 Graceful Degradation Utilities
**File**: `apps/web/src/lib/storage-graceful.ts` (new file)

Create fallback strategies:
```typescript
- handleStorageQuotaExceeded<T>(operation: () => Promise<T>): Promise<T>
- fallbackToLocalStorage<T>(key: string, value: T): Promise<boolean>
- compressDataForStorage(data: string): Promise<string>
- suggestCleanupActions(info: DetailedStorageInfo): string[]
```

#### 4.2 Updated Persist Middleware
**File**: `apps/web/src/lib/persist-middleware.ts`

**Changes**:
- Wrap `safeSet()` with quota error handling
- Add automatic image data compression before storage
- Implement retry logic with exponential backoff
- Add cleanup suggestion toast on quota errors

#### 4.3 Image Upload with Storage Checks
**File**: `apps/web/src/components/ImageUpload.tsx`

**Changes**:
- Pre-check available storage before upload
- Show warning if storage is near limit (>70%)
- Offer to compress more aggressively if space is limited
- Fallback to lower quality format if needed
- Show detailed error message on quota exceeded

#### 4.4 Store Updates with Storage Safety
**Files**: `apps/web/src/stores/catalog-store.ts`, `tally-store.ts`

**Changes**:
- Wrap store actions with storage checks
- Add storage-safe product/image updates
- Show toast notification on storage errors
- Provide retry option for failed operations

---

### Phase 5: Storage Usage Monitoring and Cleanup

#### 5.1 Storage Usage Display Component
**File**: `apps/web/src/components/storage-usage-display.tsx` (new file)

Create visual storage usage component:
- Progress bar showing total usage percentage
- Breakdown by type (localStorage, IndexedDB, images)
- Human-readable format (MB/GB)
- Warning color coding (green <70%, yellow 70-90%, red >90%)

#### 5.2 Storage Cleanup Utilities
**File**: `apps/web/src/lib/storage-cleanup.ts` (new file)

Create cleanup helper functions:
```typescript
- clearOldImages(olderThanDays: number): Promise<number>
- compressAllImages(): Promise<{original: number, compressed: number}>
- removeUnusedKeys(): Promise<number>
- calculatePotentialSavings(): Promise<number>
```

#### 5.3 Storage Cleanup Dialog Component
**File**: `apps/web/src/components/storage-cleanup-dialog.tsx` (new file)

Create user-facing cleanup tool:
- Show list of cleanup options with potential savings
- Preview what will be deleted before confirming
- Progress indicator for cleanup operations
- Success toast with space freed

#### 5.4 Settings Integration
**File**: `apps/web/src/routes/settings.tsx`

**Changes**:
- Add "Storage Management" section
- Include `StorageUsageDisplay` component
- Add "Cleanup Storage" button
- Show image format support info
- Add storage preferences (auto-cleanup, compression level)

---

### Phase 6: Image Upload Component Enhancements

#### 6.1 Updated Image Upload with Format Detection
**File**: `apps/web/src/components/ImageUpload.tsx`

**Changes**:
- Use `getBestSupportedFormat()` for optimal compression
- Show supported formats in help text
- Fallback to JPEG/PNG if WebP/AVIF unsupported
- Display actual format used after compression
- Add storage space check before processing

#### 6.2 Format Preference Settings
**File**: `apps/web/src/stores/settings-store.ts`

**Changes**:
- Add `preferredImageFormat` setting
- Add `compressionQuality` setting (0.5-1.0)
- Add `autoOptimizeImages` boolean setting

#### 6.3 Settings Store Extensions
**File**: `packages/types/src/entities/settings.ts`

**Changes**:
- Add image format preferences to Settings interface
- Add storage preferences (warning thresholds, auto-cleanup)

---

## File Changes Summary

### New Files to Create
1. `packages/types/src/utils/storage.ts` - Storage-related types and utilities
2. `packages/types/src/utils/image-support.ts` - Image format feature detection
3. `apps/web/src/stores/storage-store.ts` - Storage state management
4. `apps/web/src/components/storage-warning-alert.tsx` - Storage warning UI
5. `apps/web/src/lib/storage-toasts.ts` - Toast notification helpers
6. `apps/web/src/lib/storage-graceful.ts` - Graceful degradation utilities
7. `apps/web/src/components/storage-usage-display.tsx` - Visual storage usage
8. `apps/web/src/lib/storage-cleanup.ts` - Cleanup utilities
9. `apps/web/src/components/storage-cleanup-dialog.tsx` - Cleanup UI

### Files to Modify
1. `apps/web/src/lib/storage.ts` - Enhanced storage monitoring
2. `packages/types/src/utils/image.ts` - Extended image types
3. `packages/types/src/utils/image-processing.ts` - Fallback support
4. `apps/web/src/lib/persist-middleware.ts` - Error handling
5. `apps/web/src/components/ImageUpload.tsx` - Storage checks and format detection
6. `apps/web/src/stores/catalog-store.ts` - Storage-safe operations
7. `apps/web/src/routes/__root.tsx` - Global storage monitoring
8. `apps/web/src/routes/settings.tsx` - Storage management section
9. `packages/types/src/entities/settings.ts` - New settings preferences
10. `apps/web/src/stores/settings-store.ts` - Image format settings

---

## Implementation Order

### Priority 1: Core Storage Monitoring
1. Create storage types and interfaces
2. Extend storage library with detailed info
3. Create storage store for state management
4. Add storage warning alert component
5. Integrate with root layout

### Priority 2: Image Format Detection
1. Create image support detection utilities
2. Extend image types and processing with fallback
3. Update ImageUpload component with format detection
4. Add format preference settings

### Priority 3: Storage Management UI
1. Create storage usage display component
2. Create storage cleanup utilities
3. Create storage cleanup dialog
4. Integrate storage management into settings page

### Priority 4: Error Handling and Graceful Degradation
1. Create graceful degradation utilities
2. Update persist middleware with error handling
3. Update stores with storage-safe operations
4. Add toast notifications for storage events

---

## Testing Strategy

### Unit Tests
- Storage info calculation accuracy
- Image format detection logic
- Fallback chain selection
- Cleanup utility effectiveness
- Error handling edge cases

### Integration Tests
- Storage monitoring across stores
- Image upload with various browsers
- Storage quota warning triggers
- Cleanup dialog operations
- Settings persistence and recovery

### Manual Testing Checklist
- Test on Chrome, Firefox, Safari
- Test with storage near limits
- Test AVIF/WebP support detection
- Test cleanup operations
- Test error recovery
- Test offline behavior

---

## Success Criteria

1. Storage usage is accurately tracked and displayed to users
2. Warnings appear at 70% (warning) and 90% (critical) thresholds
3. Image formats are detected and optimal format is selected automatically
4. Fallback to JPEG/PNG works for browsers without AVIF/WebP
5. Users can clean up storage with a single click
6. Quota exceeded errors are handled gracefully with user guidance
7. All new functionality works without dev server (build + check-types)
8. TypeScript strict mode compliance (no `any` types)
9. Bundle size impact is minimal (<5KB added)
