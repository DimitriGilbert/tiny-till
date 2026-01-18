# Master Product Requirements Document: Tiny-Till

## 1. Overview

### Executive Summary
**Tiny-Till** is a lightweight, local-first Progressive Web Application (PWA) designed for on-the-go sellers (e.g., bakers on delivery routes, farmers' market stall vendors) to replace physical calculators and manual tallying. It provides a fast, reliable, and offline-capable interface to calculate sales totals without the overhead of cloud-based Point of Sale (POS) systems or accounting features.

### Problem Statement
Small-scale vendors operating in environments with spotty or non-existent internet connectivity currently rely on manual calculators, mental math, or paper notes. These methods are error-prone, slow during peak service hours, and lack data portability. Existing POS solutions are often too complex, require constant connectivity, and involve unnecessary accounting workflows.

### Value Proposition
*   **Speed & Efficiency:** "Tap-to-add" grid interface allows for rapid tallying of items, significantly reducing transaction time.
*   **Resilience:** A local-first architecture ensures 100% functionality offline without internet dependency.
*   **Simplicity:** Zero-friction setup with no logins, no databases, and no accounting features—purely a calculation tool.
*   **Portability:** Responsive design optimized for smartphones (mobile) and tablets, with PWA capabilities for installation.
*   **Privacy-First:** Transient tally data exists only in memory—no transaction history, no tracking, no persistence.

## 2. Objectives

### Key Goals
*   **Business:** Reduce the time spent per customer transaction by at least 50% compared to manual calculators.
*   **Technical:** Ensure 100% offline functionality with <100ms latency on user interactions (taps, inputs).
*   **User Experience:** Provide an intuitive, large-touch-target interface that can be operated one-handed in high-pressure environments.
*   **Data Integrity:** Maintain a reliable, portable product catalog while ensuring transaction privacy through ephemeral tally state.

### Success Metrics (KPIs)
*   **Time to First Tally:** Ability to load the app and add the first item within 5 seconds.
*   **Offline Reliability:** 100% success rate in maintaining product catalog state across page refreshes and browser restarts.
*   **User Error Rate:** Minimize "Undo/Clear" actions, indicating accurate inputs on the first try.
*   **Adoption:** Qualitative feedback rating ease-of-use ≥ 4/5 from pilot users.
*   **Catalog Portability:** Successful import/export operations with zero data corruption incidents.

## 3. Target Audience

### User Personas
*   **The Delivery Baker (Primary):** Moves from house to house, often in areas with poor reception. Needs to quickly sum various bread types and pastries while holding items. Values speed and large buttons.
*   **The Market Stall Holder:** Stationary but busy, handling long queues. Needs a "quick-key" interface to manage high volume and prefers a grid view to see many options at once.
*   **The Casual Seller:** Sells occasionally (garage sales, pop-ups). Needs a "pick up and go" tool with no learning curve.

### User Stories
*   As a baker, I want to tap a product card to increment the count so I can tally orders quickly without typing.
*   As a seller, I want to tap the quantity badge on a card to manually enter a specific amount (e.g., "50") for bulk orders.
*   As a user, I want to manage my product list (add/edit/remove) inline so I can update prices on the fly.
*   As a user, I want to export my product catalog to a file so I can back it up or transfer it to another device.
*   As a user, I want to import a catalog from another device and have it seamlessly merge with or replace my existing products.
*   As a user, I want to switch between "Normal" and "Compact" views to fit more items on my tablet screen, with the grid automatically adjusting to maximize space.
*   As a user, I want to add small thumbnail images to products to help me identify items quickly without slowing down the app.
*   As a user, I want my current tally to reset on refresh so there's no trace of previous transactions, ensuring customer privacy.

## 4. Features

### 4.1 Core Features (MVP - Phases 1-5)

#### A. Product Management (The Catalog)
*   **Description:** A streamlined list view to manage sellable inventory.
*   **Functionality:**
    *   **Inline Add:** A persistent "+" row at the top of the list allowing input for:
        *   Product Name (required, max 50 characters)
        *   Price (required, numeric, ≥ 0.01)
        *   Optional Thumbnail Image (128x128px maximum, enforced on client)
    *   **Inline Edit:** Tap any product row to enter edit mode with inline fields for Name, Price, and Image.
    *   **Delete:** Swipe-to-delete or dedicated trash icon with confirmation prompt.
    *   **Image Handling:**
        *   Maximum dimensions: 128x128 pixels
        *   Stored as base64-encoded data URLs or Blob references in IndexedDB
        *   Visual indicator if image upload is in progress or failed validation
        *   Clear warning if user attempts to upload larger images: "Image must be 128x128px or smaller"
        *   Future enhancement: Client-side resizing/optimization (post-MVP)
    *   **Validation:**
        *   Product names must be unique within the catalog
        *   Prices must be positive numbers with up to 2 decimal places
        *   Images must meet size constraints before being added to the catalog
*   **Persistence:** The product catalog is saved to IndexedDB via Zustand's persist middleware configured to use IndexedDB storage directly. This ensures:
    *   Catalog data persists across sessions and browser restarts
    *   Image blobs are stored efficiently in IndexedDB
    *   Automatic synchronization between Zustand state and IndexedDB
*   **Access:** Available via Settings or dedicated "Manage Catalog" route.

#### B. The Tally Page (Grid Interface)
*   **Description:** The primary workspace for calculating sales. This is the root route (`/`) of the application.
*   **Layout & Display:**
    *   **Responsive Grid:** Automatically adjusts columns based on screen width and user preference:
        *   Mobile: 2-3 columns
        *   Tablet: 4-6 columns
        *   Large Tablet/Desktop: 6-8 columns
    *   **Density Toggle:** Settings allow switching between:
        *   **Normal View:** Detailed cards with larger touch targets (min 80x80px)
        *   **Compact View:** Smaller footprint cards (min 60x60px) with automatic column count increase to utilize space savings
            *   Example: If user has 6 columns in Normal view, switching to Compact automatically increases to 8 columns (configurable via algorithm: `compactColumns = Math.ceil(normalColumns * 1.33)`)
    *   **Visual Feedback:** Product cards display:
        *   Product Name (truncated with ellipsis if needed)
        *   Price (formatted as currency)
        *   Optional Thumbnail Image (128x128px)
        *   Quantity Badge (only visible when quantity > 0)
*   **Interaction Logic:**
    *   **Tap Card Body:** Adds 1 to the quantity. Visual "pulse" or highlight animation confirms action.
    *   **Tap Quantity Badge:** Opens an inline numeric input overlay allowing manual entry:
        *   **Input Validation:**
            *   Must be a non-negative integer
            *   Decimals are rounded down
            *   Negative numbers are rejected with error message
            *   Non-numeric characters are rejected
            *   **Zero (0) is treated as "remove from cart"** — the item quantity resets to 0 and the badge disappears
        *   **Overlay UI:**
            *   Large numeric keypad for touch input
            *   Clear "Cancel" and "Confirm" buttons
            *   "Remove" button (trash icon) that explicitly sets quantity to 0
    *   **Live Total:** A sticky footer displays the Grand Total of the current transaction in real-time:
        *   Format: `$XXX.XX` with proper currency symbol based on locale
        *   Updates immediately on any quantity change
        *   Includes item count: `Total: $45.50 (12 items)`
    *   **Reset/Clear Cart:** 
        *   Prominent "Clear" button in footer or header
        *   Confirmation prompt: "Start new tally? Current items will be cleared."
        *   Resets all quantities to 0 for the next customer
*   **Data Behavior:** 
    *   The tally (cart) is **purely transient and held in memory only**.
    *   **No persistence mechanism** — no sessionStorage, no localStorage, no IndexedDB.
    *   **On page refresh:** The tally is completely reset to empty state.
    *   **On browser close:** All tally data is lost.
    *   **Rationale:** This is not an accounting tool. Each transaction is independent, and privacy is maintained by ensuring no transaction history exists.
    *   Managed via a dedicated Zustand store (`useTallyStore`) that is **not** configured with persist middleware.

#### C. Settings Page
*   **Description:** Configuration for appearance, display preferences, and data management.
*   **Functionality:**
    *   **Theme Management:**
        *   Toggle between Light, Dark, and System (auto-detect OS preference)
        *   Persisted in localStorage via a separate settings store
    *   **Display Preferences:**
        *   Grid Density: Toggle between "Compact" and "Normal" views
        *   Column Count Override: Manual slider (2-8 columns) with preview
        *   Responsive behavior indicator showing current auto-calculated columns
    *   **Data Portability:**
        *   **Export Catalog:**
            *   Downloads current catalog as JSON file: `tiny-till-catalog-YYYY-MM-DD.json`
            *   Includes all product data (name, price, image data)
            *   Clear success message with file name confirmation
        *   **Import Catalog:**
            *   File picker accepting `.json` files
            *   **Validation Process:**
                *   Schema validation against defined TypeScript interfaces
                *   Version compatibility check (future-proofing)
                *   Graceful handling of corrupt/invalid files with specific error messages
            *   **Conflict Resolution:**
                *   Products matched by ID
                *   **Overwrite strategy:** Imported products overwrite existing products with matching IDs
                *   New products are added
                *   Deleted products (present locally but not in import) are preserved unless user opts to "Replace All"
            *   **UI Feedback:**
                *   Import preview showing what will change (X products updated, Y products added)
                *   Confirmation prompt before applying changes
                *   Success summary: "Imported 15 products (5 updated, 10 new)"
    *   **Backup Reminder:**
        *   Prominent "Last backup: X days ago" indicator
        *   Suggestion to export after significant catalog changes

### 4.2 Future Features (Post-MVP)
*   **PWA Support:** Service Worker and manifest file for "Add to Home Screen" installation (Phase 6).
*   **Tax Calculation:** Simple global tax toggle or percentage input applied to grand total.
*   **Receipt View:** A simplified, full-screen summary to show the customer (handshake mode) — displays items and total without edit controls.
*   **Catalog Categorization:** Tabs or filters to group products (e.g., "Breads," "Pastries," "Seasonal").
*   **Image Optimization:** Client-side resizing/compression for images larger than 128x128px before storing in IndexedDB.
*   **Multi-Device Sync:** Optional cloud backup via user-provided storage (Dropbox, Google Drive).
*   **Offline Analytics:** Local-only usage statistics (e.g., most-tapped products) without external reporting.

## 5. Technical Requirements

### Tech Stack
*   **Framework:** React 19+ (Vite for build tooling)
*   **Routing:** TanStack Router v1 (File-based routing, type-safe)
*   **Styling:** Tailwind CSS v4 (Utility-first, JIT mode)
*   **UI Components:** Shadcn UI 
*   **Language:** TypeScript 5+ (Strict mode, no implicit any)
*   **State Management:** **Zustand v4** (Lightweight, minimal boilerplate)
*   **Storage:** 
    *   **Catalog:** IndexedDB (via `idb` v7+ wrapper) with Zustand persist middleware configured for IndexedDB storage
    *   **Tally:** In-memory only (Zustand store without persistence)
    *   **Settings:** localStorage (via Zustand persist middleware)
*   **Monorepo:** Turborepo (single package for now, structured for future expansion)

### System Architecture

#### Routing Structure (TanStack Router)
```
/                          -> Tally Page (root route, default)
/settings                  -> Settings & Catalog Management
/settings/catalog          -> Dedicated Catalog Edit View (nested route)
```

*   **Default Behavior:** All non-root routes redirect to `/` on refresh to prevent user confusion and data loss.
*   **Navigation Guard:** If user attempts to navigate away from `/` with active tally (items > 0), show confirmation: "You have items in your current tally. Clear and continue?"

#### Data Flow Architecture

**Catalog Store (`useCatalogStore`):**
```typescript
interface Product {
  id: string; // UUID v4
  name: string;
  price: number; // Stored as cents (integer) to avoid float math errors
  imageData?: string; // Base64 data URL or Blob reference, max 128x128px
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

interface CatalogStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importCatalog: (data: Product[]) => Promise<ImportResult>;
  exportCatalog: () => string; // Returns JSON string
}
```

*   **Persistence:** Zustand's `persist` middleware configured with custom IndexedDB storage:
    ```typescript
    import { persist, createJSONStorage } from 'zustand/middleware';
    import { get, set, del } from 'idb-keyval'; // or custom idb wrapper
    
    const catalogStore = persist(
      (set, get) => ({ /* store definition */ }),
      {
        name: 'tiny-till-catalog',
        storage: createJSONStorage(() => ({
          getItem: async (name) => await get(name),
          setItem: async (name, value) => await set(name, value),
          removeItem: async (name) => await del(name),
        })),
      }
    );
    ```

**Tally Store (`useTallyStore`):**
```typescript
interface TallyItem {
  productId: string;
  quantity: number; // Always positive integer
  price: number; // Snapshot of price at time of add (cents)
}

interface TallyStore {
  items: Map<string, TallyItem>; // Key: productId
  addItem: (productId: string, price: number) => void;
  setQuantity: (productId: string, quantity: number) => void; // 0 removes item
  clearTally: () => void;
  getTotal: () => number; // Computed total in cents
  getItemCount: () => number; // Total number of items
}
```

*   **No Persistence:** Plain Zustand store without persist middleware. State resets on page refresh/reload.

**Settings Store (`useSettingsStore`):**
```typescript
interface SettingsStore {
  theme: 'light' | 'dark' | 'system';
  gridDensity: 'normal' | 'compact';
  columnCountOverride?: number; // undefined = auto-calculate
  setTheme: (theme: SettingsStore['theme']) => void;
  setGridDensity: (density: SettingsStore['gridDensity']) => void;
  setColumnCount: (count: number | undefined) => void;
}
```

*   **Persistence:** Zustand's `persist` middleware with default localStorage storage.

#### Responsive Logic & Grid Columns

**Auto-Calculation Algorithm:**
```typescript
const calculateColumns = (
  screenWidth: number,
  density: 'normal' | 'compact',
  override?: number
): number => {
  if (override) return override;
  
  const baseColumns = screenWidth < 640 ? 2 : 
                      screenWidth < 768 ? 3 :
                      screenWidth < 1024 ? 4 : 6;
  
  return density === 'compact' ? Math.ceil(baseColumns * 1.33) : baseColumns;
};
```

*   Tailwind breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
*   Dynamic grid classes applied via TailwindMerge to prevent conflicts

### Security & Performance

#### Security
*   **Input Sanitization:**
    *   Product names: Escape HTML entities to prevent XSS
    *   Price inputs: Strict numeric validation with regex `/^\d+(\.\d{1,2})?$/`
    *   Image data: Validate MIME types (only PNG, JPEG, WebP) before encoding
*   **Data Isolation:** All data stored locally; no network requests except for future optional features.
*   **Content Security Policy (CSP):** Configure Vite to inject strict CSP headers in production build.

#### Performance
*   **Touch Optimization:**
    *   Apply `touch-action: manipulation` to all interactive elements to eliminate 300ms delay
    *   Use `passive: true` for scroll event listeners
*   **Rendering Optimization:**
    *   Wrap Product Card components in `React.memo` with custom comparison
    *   Use `key` props based on stable product IDs
    *   Implement virtual scrolling (e.g., `@tanstack/react-virtual`) if catalog exceeds 100 products
*   **Math Precision:**
    *   Store all prices as integers (cents) to avoid floating-point errors
    *   Example: $19.99 stored as `1999`
    *   Conversion utility: `toCents(price: number): number` and `toDollars(cents: number): number`
    *   Use `Intl.NumberFormat` for currency display formatting
*   **Image Optimization:**
    *   Enforce 128x128px limit on upload via client-side validation
    *   Lazy load images in grid view using native `loading="lazy"`
    *   Consider WebP format preference with JPEG fallback
*   **IndexedDB Efficiency:**
    *   Use indexes on `product.id` for fast lookups
    *   Batch operations for import/export to minimize transaction overhead
*   **Bundle Size:**
    *   Target < 200KB gzipped for initial bundle
    *   Code-split Settings page and Catalog management routes
    *   Tree-shake unused Shadcn components

### Browser Compatibility
*   **Target Browsers:**
    *   Chrome/Edge 100+ (Chromium)
    *   Safari 15+ (iOS 15+)
    *   Firefox 100+
*   **Progressive Enhancement:**
    *   Fallback to localStorage if IndexedDB is unavailable (with warning about image limitations)
    *   Graceful degradation for CSS Grid if not supported (flex fallback)
*   **Testing Matrix:**
    *   iPhone 12 (Safari iOS 15)
    *   Samsung Galaxy S21 (Chrome Android 12)
    *   iPad Air (Safari iPadOS 16)

### Import/Export Specifications

#### JSON Schema
```typescript
interface CatalogExport {
  version: string; // "1.0.0" - for future compatibility
  exportDate: string; // ISO 8601 timestamp
  products: Product[];
  metadata?: {
    productCount: number;
    totalValue: number; // Sum of all prices in cents
  };
}
```

#### Import Validation Rules
1. **Schema Validation:**
   *   Check for required `version` and `products` fields
   *   Validate each product against `Product` interface
   *   Reject if any required fields are missing
2. **Data Integrity:**
   *   Ensure all prices are valid numbers
   *   Validate image data is proper base64 or empty
   *   Check for duplicate product IDs within import
3. **Error Handling:**
   *   Parse errors: "Invalid JSON file. Please check the file format."
   *   Schema errors: "File is missing required fields: [list]"
   *   Version mismatch: "This catalog was exported from a newer version. Please update Tiny-Till."
4. **User Feedback:**
   *   Show validation progress for large files (> 50 products)
   *   Detailed error logs available in console for debugging
   *   User-friendly error messages in UI

#### Overwrite Strategy Details
*   **Matching Logic:** Products are matched by their `id` field (UUID)
*   **Overwrite Behavior:**
    *   If imported product ID exists locally: Replace all fields (name, price, imageData, updatedAt)
    *   If imported product ID is new: Add to catalog with `createdAt` = current timestamp
    *   Local products not in import: **Preserved** (no deletions during import)
*   **Future Enhancement:** Add "Replace All" checkbox that clears local catalog before importing

## 6. Timeline & Milestones

### Detailed Phase Breakdown

**Phase 1: Foundation & Routing (Days 1-2)**
*   Setup Vite + React + TypeScript project within Turborepo structure
*   Configure TanStack Router with file-based routing:
    *   Root route (`/`) for Tally Page
    *   Settings route (`/settings`) with nested catalog management
    *   Redirect guards for non-root routes on refresh
*   Install and configure Shadcn UI theme system
*   Setup Tailwind CSS with custom design tokens
*   Define TypeScript interfaces for Product, TallyItem, and Stores
*   **Deliverable:** Functional routing with empty pages and theme toggle

**Phase 2: Catalog Store & IndexedDB (Days 3-4)**
*   Implement `useCatalogStore` with Zustand + IndexedDB persist middleware
*   Build IndexedDB wrapper utilities (via `idb-keyval` or custom)
*   Implement CRUD operations for products
*   Build inline product add/edit UI in Settings page
*   Add image upload with 128x128px validation
*   Implement JSON export functionality with schema generation
*   **Deliverable:** Fully functional catalog management with persistence

**Phase 3: Import & Validation (Day 5)**
*   Build JSON import UI with file picker
*   Implement schema validation with detailed error handling
*   Create conflict resolution logic (overwrite strategy)
*   Add import preview modal showing changes
*   Test with various edge cases (corrupt files, version mismatches, large catalogs)
*   **Deliverable:** Robust import/export system with validation

**Phase 4: Tally Engine & Grid (Days 6-8)**
*   Implement `useTallyStore` (in-memory only, no persistence)
*   Build responsive grid layout with auto-column calculation
*   Create Product Card component with tap-to-increment logic
*   Implement quantity badge with manual input overlay
    *   Add numeric validation (zero = remove, reject negatives/decimals)
    *   Build accessible keypad UI
*   Build sticky footer with live total calculation (cents-based math)
*   Implement "Clear Cart" with confirmation
*   Add visual feedback animations (pulse, highlight)
*   **Deliverable:** Fully functional tally interface with responsive grid

**Phase 5: Display Preferences & Polish (Days 9-11)**
*   Implement compact/normal view toggle with auto-column adjustment
*   Build column count override slider in settings
*   Add theme persistence and system theme detection
*   Optimize rendering performance (React.memo, virtual scrolling if needed)
*   Mobile touch optimization (eliminate tap delay)
*   Accessibility audit (keyboard navigation, screen reader support)
*   **Deliverable:** Polished, performant UI with all display options

**Phase 6: Testing & Edge Cases (Days 12-13)**
*   Cross-browser testing (Chrome, Safari, Firefox)
*   Mobile device testing (iOS Safari, Chrome Android)
*   Test import/export with large catalogs (100+ products)
*   Test image handling with various formats and sizes
*   Verify tally reset behavior on refresh
*   Performance profiling and optimization
*   **Deliverable:** QA-approved, production-ready application

**Phase 7: Deployment & Documentation (Day 14)**
*   Configure production Vite build
*   Setup static hosting (Vercel/Netlify/GitHub Pages)
*   Add PWA manifest (Phase 6 feature if time permits)
*   Write user documentation (quick start guide)
*   Create backup reminder modal for first-time users
*   **Deliverable:** Live application with deployment pipeline

**Total Estimated Time:** 14 days (assumes one full-time developer with React/TypeScript expertise)

## 7. Risks, Mitigations & Open Items

| Risk / Question | Impact | Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Storage Quota Exceeded** | Users with large catalogs (100+ products with images) may hit browser storage limits (typically 50-100MB for IndexedDB). | **MVP:** Enforce strict 128x128px image limit, which caps single image at ~20KB. Monitor storage usage in settings. **Future:** Implement warning at 80% quota, suggest removing unused products. | Mitigated |
| **Image Format Compatibility** | Some browsers may not support WebP or newer formats. | Accept PNG, JPEG, WebP but provide fallback rendering. Use `<picture>` element with multiple sources. | Mitigated |
| **Data Loss (Catalog)** | If user clears browser data, local catalog is permanently deleted. | **Primary:** Prominently feature "Export Catalog" button with "Last backup" reminder in settings. **Secondary:** Add first-launch tutorial highlighting backup importance. Suggest weekly exports. | Mitigated |
| **Accidental Refresh During Tally** | User refreshes browser mid-transaction, losing current tally. | **Design Decision:** Accepted risk to maintain privacy and simplicity. Clear messaging in UI: "Tally resets on refresh." Consider adding browser `beforeunload` warning if tally is not empty. | Accepted |
| **Floating-Point Math Errors** | JavaScript math errors (e.g., 0.1 + 0.2 = 0.30000000000000004) cause incorrect totals. | Store all prices as integers (cents). Use utility functions for conversion. Example: $19.99 stored as `1999`, displayed via `Intl.NumberFormat`. | Mitigated |
| **Touch Event Conflicts** | Double-tap zoom, accidental long-press, or gesture conflicts on mobile. | Apply `touch-action: manipulation` to disable default gestures on interactive elements. Test on multiple devices. Add `user-select: none` to prevent text selection on rapid taps. | Mitigated |
| **Import File Validation Bypass** | Malicious or corrupted JSON files could break application state. | Implement strict JSON schema validation with try-catch blocks. Validate every field before state update. Show detailed error messages. Never directly assign unvalidated data to Zustand store. | Mitigated |
| **Concurrent Edit Conflicts** | If catalog is modified in multiple tabs, IndexedDB sync via Zustand persist could conflict. | Document as "single-tab application." Future: Add tab synchronization via BroadcastChannel API. | Documented |
| **Browser Compatibility (iOS Safari)** | Older iOS versions (< 15) may have IndexedDB bugs or limited support. | Target iOS 15+ officially. Add browser detection and show upgrade prompt for unsupported versions. Provide localStorage fallback without images. | Mitigated |
| **Performance Degradation (Large Catalog)** | Grid rendering slows down with 200+ products. | **Phase 4:** Implement virtual scrolling (`@tanstack/react-virtual`) if catalog exceeds 100 items. Use windowing to render only visible cards. | Monitored |
| **Image Upload UX Confusion** | Users may not understand 128x128px restriction or why larger images are rejected. | Add clear in-app guidance: "Images must be 128×128 pixels or smaller. Use small thumbnails only." Provide visual example of acceptable image. | Mitigated |
| **Zero Quantity Behavior** | Users may not realize entering "0" removes item from tally. | Add tooltip on quantity badge: "Tap to edit. Enter 0 to remove." Show confirmation animation when item is removed. | Mitigated |

### Accepted Trade-offs
1. **No Transaction History:** By design, tally data is ephemeral. This is a calculator, not a register.
2. **Single-Device Workflow:** No cloud sync in MVP. Users must manually export/import to move catalogs between devices.
3. **Limited Image Support:** 128x128px is sufficient for recognition but not for high-quality display. Future enhancement can add client-side resizing.
4. **Manual Backups:** Users are responsible for exporting their catalog. This aligns with the "local-first" philosophy.

### Open Items for Future Consideration
*   **PWA Offline Caching:** Service worker for app shell caching (Phase 6 post-MVP).
*   **Receipt Printing:** Bluetooth printer integration for physical receipts (Phase 7+ if user demand exists).
*   **Multi-Currency Support:** Currently assumes single currency. Future: Add currency selector in settings.
*   **Barcode Scanner Integration:** Use device camera to scan product barcodes for quick add-to-tally (Phase 8+ feasibility study needed).
*   **Voice Input:** "Add 3 baguettes" voice commands for hands-free operation (accessibility feature).

---

## 8. Appendix

### A. Development Setup Checklist
- [X] Initialize Turborepo with single `apps/tiny-till` package
- [X] Configure TanStack Router v1 with file-based routing
- [X] Install Shadcn UI and configure Tailwind theme
- [ ] Setup Zustand stores with TypeScript strict mode
- [ ] Configure IndexedDB wrapper (`idb-keyval` or custom)
- [ ] Add ESLint + Prettier with React/TypeScript rules
- [ ] Setup Vitest for unit tests
- [ ] Configure Vite for production builds with CSP headers

### B. Testing Requirements
*   **Unit Tests:**
    *   Zustand store actions (add/remove/update products)
    *   Math utilities (cents conversion, total calculation)
    *   Input validation (price, quantity, image size)
    *   JSON export/import logic
*   **Manual Testing:**
    *   Cross-device responsive behavior
    *   Touch gesture handling (tap, double-tap, long-press)
    *   Theme switching and persistence
    *   Offline functionality (network disconnect test)

### C. Accessibility Requirements (WCAG 2.1 Level AA)
*   **Keyboard Navigation:**
    *   All interactive elements accessible via Tab key
    *   Escape key closes modals/overlays
    *   Enter key submits forms
*   **Visual:**
    *   Minimum 4.5:1 contrast ratio for text
    *   Large touch targets (≥ 44x44px)
    *   Focus indicators on all interactive elements
    * MUST USE frontend-design SKILL !
      * colorful and cheerful design
      * kawaii vibes
      * subtle animations and effects
*   **Motion:**
    *   Respect `prefers-reduced-motion` for animations
    *   Option to disable pulse/highlight effects in settings

### D. Deployment Configuration
*   **Static Hosting:** on github pages
*   **Build Command:** `bun run build` (Vite production build)
*   **Output Directory:** `dist`
*   **Environment Variables:** None required (fully client-side)
*   **Custom Domain:** Optional `tiny-till.app` or similar
*   **HTTPS:** Enforced (required for PWA features in future)

---

**Document Version:** 2.0  
**Last Updated:** [Current Date]  
**Author:** Product Team  
**Status:** Ready for Development
