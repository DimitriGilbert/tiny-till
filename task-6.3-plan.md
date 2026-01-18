# Implementation Plan: Service Worker with Workbox Offline Strategy

## Task Overview
Set up service worker registration and implement comprehensive offline functionality using Workbox. Configure cache-first strategy for app shell (HTML, CSS, JS), runtime caching for dynamic content, stale-while-revalidate for API responses, and proper asset precaching. Implement background sync capabilities, cache versioning, proper cache management and cleanup mechanisms, and offline fallback pages for reliable offline operation.

## Current State Analysis
- React 19 app with TanStack Router and Vite
- PWA manifest already configured at `/public/manifest.json`
- Existing PWA install hook (`usePWAInstall.ts`) handles installation prompts
- No service worker implementation exists
- No offline capabilities currently implemented
- App uses client-side storage (IndexedDB via Zustand) for state management

## Implementation Steps

### Phase 1: Dependencies and Configuration Setup

#### Step 1.1: Install Workbox and Vite PWA Plugin
**File:** `apps/web/package.json`
**Action:** Add dependencies to the web app's package.json
```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^0.20.0",
    "workbox-window": "^7.0.0"
  }
}
```
**Details:**
- `vite-plugin-pwa`: Provides Workbox integration with Vite
- `workbox-window`: Service worker registration utilities

#### Step 1.2: Configure Vite PWA Plugin
**File:** `apps/web/vite.config.ts`
**Action:** Add Vite PWA plugin configuration
**Details:**
- Configure workbox strategies for different asset types
- Set up cache names and versioning
- Configure precaching manifest generation
- Set up runtime caching rules
- Configure cleanup and expiration policies
- Enable self-destroying cache for smoother updates

**Configuration Requirements:**
- App shell: CacheFirst strategy for HTML, CSS, JS
- Dynamic content: NetworkFirst with cache fallback
- API responses: StaleWhileRevalidate
- Assets: CacheFirst with expiration
- Background sync enabled
- Cache cleanup on updates
- Offline fallback pages configured

### Phase 2: Service Worker Implementation

#### Step 2.1: Create Service Worker Entry Point
**File:** `apps/web/src/sw.ts` (new file)
**Action:** Create service worker entry file
**Details:**
- Import workbox utilities
- Configure precache manifest injection
- Set up runtime caching strategies
- Configure cache expiration and cleanup
- Set up offline fallback handlers
- Add background sync support
- Implement cache versioning

#### Step 2.2: Configure Cache Strategies
**Action:** Define caching strategies in service worker

**App Shell Assets (CacheFirst):**
- HTML entry point
- CSS bundles
- JavaScript bundles
- Critical runtime assets

**Dynamic Content (NetworkFirst):**
- Route pages
- Components loaded dynamically
- User-generated content

**API Responses (StaleWhileRevalidate):**
- External API calls (if any)
- Third-party resources
- Data fetching operations

**Static Assets (CacheFirst):**
- Images (product icons, app icons)
- Fonts
- Static media files

#### Step 2.3: Implement Cache Management
**Action:** Add cache lifecycle management

**Features:**
- Cache versioning using timestamp/semver
- Automatic cleanup of old caches on updates
- Cache expiration policies (maxAge, maxEntries)
- Stale cache cleanup
- Cache quota management

#### Step 2.4: Set Up Offline Fallbacks
**Action:** Configure offline fallback responses

**Fallback Strategy:**
- HTML pages: Serve offline.html for document requests
- Images: Serve placeholder icon
- API responses: Return offline-friendly error objects
- Other requests: Return generic offline response

### Phase 3: Service Worker Registration

#### Step 3.1: Create Service Worker Registration Hook
**File:** `apps/web/src/hooks/useServiceWorker.ts` (new file)
**Action:** Create custom hook for service worker registration
**Details:**
- Register service worker on mount
- Handle registration errors gracefully
- Handle service worker updates
- Listen for installation and activation events
- Provide offline status to components
- Handle update availability and user prompts
- Force refresh on new service worker activation

**Hook Interface:**
```typescript
export function useServiceWorker() {
  return {
    isOffline: boolean,
    updateAvailable: boolean,
    updateServiceWorker: () => Promise<void>,
    skipWaiting: () => void
  }
}
```

#### Step 3.2: Integrate Registration in Main App
**File:** `apps/web/src/main.tsx`
**Action:** Call service worker registration hook
**Details:**
- Call `useServiceWorker` hook
- Display update notification when available
- Handle service worker activation
- Reload app on update acceptance

### Phase 4: Offline Fallback UI

#### Step 4.1: Create Offline Fallback Page
**File:** `apps/web/public/offline.html` (new file)
**Action:** Create static HTML fallback page
**Details:**
- Standalone HTML page (no external dependencies)
- Styled with inline CSS or minimal styles
- Clear offline message
- "Retry connection" button
- App branding consistent with main app
- Responsive design
- Accessibility compliant

#### Step 4.2: Create Offline Status Component
**File:** `apps/web/src/components/offline-banner.tsx` (new file)
**Action:** Create offline status indicator
**Details:**
- Show banner when offline
- Dismissible with localStorage preference
- Visual indicator (icon + message)
- Positioned at top or bottom of screen
- Accessible ARIA announcements

#### Step 4.3: Update Root Layout
**File:** `apps/web/src/routes/__root.tsx`
**Action:** Integrate offline banner
**Details:**
- Import and render offline banner component
- Use offline status from `useServiceWorker` hook
- Conditionally show based on online/offline state

### Phase 5: Background Sync Implementation

#### Step 5.1: Set Up Background Sync
**File:** `apps/web/src/sw.ts` (update)
**Action:** Configure Workbox background sync
**Details:**
- Define sync queues for critical operations
- Queue: data sync (catalog changes)
- Queue: analytics (if applicable)
- Configure retry logic with exponential backoff
- Set up sync event handlers

**Sync Queue Examples:**
- `catalog-sync-queue`: For catalog import/export operations
- `settings-sync-queue`: For settings changes that might sync
- `tally-sync-queue`: For active tally data backup

#### Step 5.2: Create Sync Queue Manager
**File:** `apps/web/src/lib/background-sync.ts` (new file)
**Action:** Create utility for background sync operations
**Details:**
- Queue operations for background sync
- Monitor sync queue status
- Handle sync success/failure callbacks
- Provide sync status UI feedback

### Phase 6: Testing and Verification

#### Step 6.1: Service Worker Registration Testing
**Test Scenarios:**
- Service worker registers successfully on load
- Service worker update detection works
- Manual update triggers correctly
- Service worker activation reloads app
- Registration errors handled gracefully

#### Step 6.2: Caching Strategy Testing
**Test Scenarios:**
- App shell assets cached on first load
- Subsequent loads use cache (faster)
- Cache updates when app is refreshed
- Dynamic content updates properly
- API responses use stale-while-revalidate

#### Step 6.3: Offline Functionality Testing
**Test Scenarios:**
- App loads offline with cached shell
- Offline banner appears when network unavailable
- Offline fallback page shows for unvisited routes
- Images show placeholders when offline
- App remains functional for basic operations

#### Step 6.4: Background Sync Testing
**Test Scenarios:**
- Queued operations sync when online
- Retry logic works on failed sync
- Sync status updates in UI
- Data persists until successful sync

#### Step 6.5: Cache Management Testing
**Test Scenarios:**
- Old caches cleaned on app update
- Cache versioning works correctly
- Cache expiration removes old entries
- Quota management prevents overflow

### Phase 7: Build Configuration Updates

#### Step 7.1: Update Build Output
**File:** `apps/web/package.json`
**Action:** Ensure build scripts are correct
**Details:**
- `vite build` generates service worker
- Service worker precache manifest included
- Assets hashed for proper cache busting

#### Step 7.2: Type Safety
**File:** Create TypeScript declarations if needed
**Details:**
- Add types for service worker events
- Add types for cache configuration
- Ensure no `any` types used

## File Structure Changes

### New Files to Create:
```
apps/web/
├── src/
│   ├── sw.ts                          # Service worker entry point
│   ├── hooks/
│   │   └── useServiceWorker.ts       # Service worker registration hook
│   ├── lib/
│   │   └── background-sync.ts        # Background sync utilities
│   └── components/
│       └── offline-banner.tsx         # Offline status indicator
└── public/
    └── offline.html                   # Offline fallback page
```

### Files to Modify:
```
apps/web/
├── package.json                      # Add dependencies
├── vite.config.ts                    # Add Vite PWA plugin config
└── src/
    └── main.tsx                      # Register service worker
    └── routes/
        └── __root.tsx                # Integrate offline banner
```

## Key Configuration Decisions

### Cache Naming Convention
```
app-shell-v1          # HTML, CSS, JS bundles
dynamic-content-v1    # Route pages, dynamic components
api-responses-v1      # API responses, external data
static-assets-v1      # Images, fonts, media
```

### Cache Expiration Policies
- **App Shell**: 7 days, max 50 entries
- **Dynamic Content**: 1 day, max 100 entries
- **API Responses**: 5 minutes, max 50 entries
- **Static Assets**: 30 days, max 200 entries

### Background Sync Configuration
- Max sync attempts: 5
- Retry backoff: exponential (1s, 2s, 4s, 8s, 16s)
- Sync timeout: 30 seconds
- Queue max size: 1000 entries

### Versioning Strategy
- Use build timestamp for cache version
- Format: `YYYYMMDD-HHMMSS`
- Stored in service worker cache name
- Triggers cache cleanup on changes

## Implementation Order (Priority Sequence)

1. **Critical Path** (Must be done first):
   - Install dependencies (Step 1.1)
   - Configure Vite PWA plugin (Step 1.2)
   - Create service worker entry point (Step 2.1)
   - Set up service worker registration hook (Step 3.1)
   - Integrate registration in main app (Step 3.2)

2. **Core Functionality** (Next priority):
   - Configure cache strategies (Step 2.2)
   - Implement cache management (Step 2.3)
   - Create offline fallback page (Step 4.1)
   - Create offline status component (Step 4.2)
   - Integrate offline banner in root layout (Step 4.3)

3. **Enhanced Features** (Can be done after core):
   - Set up offline fallbacks (Step 2.4)
   - Configure background sync (Step 5.1)
   - Create sync queue manager (Step 5.2)

4. **Quality Assurance** (Final step):
   - All testing scenarios (Phase 6)
   - Build configuration verification (Phase 7)

## Success Criteria

### Functional Requirements:
✓ Service worker registers on app load
✓ App shell cached with CacheFirst strategy
✓ Dynamic content cached with NetworkFirst strategy
✓ API responses use StaleWhileRevalidate
✓ Assets precached and versioned
✓ Background sync queues configured
✓ Old caches cleaned on updates
✓ Offline fallback page available
✓ Offline status indicator displays
✓ App functions offline with cached data

### Performance Requirements:
✓ First load: < 3 seconds
✓ Subsequent loads (cached): < 500ms
✓ Cache cleanup doesn't block main thread
✓ Background sync retries efficiently

### Type Safety Requirements:
✓ All code uses proper TypeScript types
✓ No `any` types used
✓ Type checking passes (`npm run check-types`)

### Build Requirements:
✓ Build succeeds (`npm run build`)
✓ Service worker generated in dist/
✓ Precache manifest included
✓ No build errors or warnings

## Known Challenges and Solutions

### Challenge 1: Service Worker Update Management
**Problem:** Users might not get updates immediately
**Solution:** Implement skipWaiting and clientsClaim, prompt users to update

### Challenge 2: Cache Invalidation
**Problem:** Old cached content might persist
**Solution:** Use cache versioning and cleanup on service worker activation

### Challenge 3: Offline Detection Reliability
**Problem:** `navigator.onLine` not always accurate
**Solution:** Use `window.addEventListener('online')` and `window.addEventListener('offline')`, fallback to fetch failures

### Challenge 4: Cache Storage Limits
**Problem:** Browser storage quotas vary
**Solution:** Implement cache expiration, max entries, and cleanup strategies

### Challenge 5: Background Sync Browser Support
**Problem:** Not all browsers support Background Sync API
**Solution:** Feature detect, provide graceful fallback to immediate retry on online

## Dependencies Required

### New Dev Dependencies:
- `vite-plugin-pwa`: ^0.20.0
- `workbox-window`: ^7.0.0

### New Runtime Dependencies:
- None (workbox bundles included in service worker)

## Integration Points

### Existing Components to Update:
1. **main.tsx** - Add service worker registration
2. **__root.tsx** - Add offline status banner
3. **Vite config** - Add PWA plugin

### New Integrations:
1. **Service worker hook** - For all components needing offline status
2. **Background sync** - For catalog and settings operations
3. **Offline fallback** - Served by service worker for failed requests

## Notes

- Service worker will only be active in production build (Vite plugin behavior)
- Development mode will skip service worker for faster iteration
- All caching strategies are configurable in Vite PWA plugin
- Cache names use semantic versioning for easy debugging
- Background sync is optional but highly recommended for data reliability

## Post-Implementation Checklist

- [ ] Install all dependencies
- [ ] Configure Vite PWA plugin with all strategies
- [ ] Create service worker entry point
- [ ] Implement all cache strategies
- [ ] Set up cache management and cleanup
- [ ] Create offline fallback HTML page
- [ ] Create service worker registration hook
- [ ] Integrate registration in main.tsx
- [ ] Create offline status banner component
- [ ] Integrate offline banner in root layout
- [ ] Configure background sync
- [ ] Test service worker registration
- [ ] Test cache-first app shell loading
- [ ] Test network-first dynamic content
- [ ] Test stale-while-revalidate API responses
- [ ] Test offline fallback behavior
- [ ] Test offline status indicator
- [ ] Test cache cleanup on updates
- [ ] Test background sync functionality
- [ ] Run `npm run check-types` (must succeed)
- [ ] Run `npm run build` (must succeed)
- [ ] Verify service worker in production build
- [ ] Test offline functionality in production build
- [ ] Verify all type safety requirements met
- [ ] No LSP errors present
