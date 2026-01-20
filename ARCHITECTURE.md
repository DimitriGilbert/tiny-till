# Architecture

This document provides a comprehensive overview of the Tiny-Till application architecture, systems design, and key implementation details.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Core Systems](#core-systems)
4. [Data Flow](#data-flow)
5. [Type System](#type-system)
6. [Security Considerations](#security-considerations)

## Project Structure

Tiny-Till is organized as a Turborepo monorepo to enable future scaling while maintaining simplicity for the current single-application scope.

```
tiny-till/
├── apps/
│   └── web/                    # Frontend React application
│       ├── src/
│       │   ├── components/     # React components
│       │   │   ├── ui/         # shadcn/ui components
│       │   │   ├── header.tsx
│       │   │   ├── theme-provider.tsx
│       │   │   ├── mode-toggle.tsx
│       │   │   └── ...
│       │   ├── lib/            # Utilities and helpers
│       │   │   ├── storage.ts          # IndexedDB utilities
│       │   │   ├── persist-middleware.ts   # Zustand persistence
│       │   │   ├── storage-keys.ts      # Storage key constants
│       │   │   ├── route-guards.ts      # Navigation protection
│       │   │   ├── navigation-utils.ts  # Navigation helpers
│       │   │   └── utils.ts             # General utilities
│       │   ├── routes/          # TanStack Router file-based routes
│       │   │   ├── __root.tsx            # Root layout
│       │   │   ├── index.tsx             # Tally page
│       │   │   ├── settings.tsx         # Settings page
│       │   │   └── settings.catalog.tsx  # Catalog settings
│       │   ├── stores/          # Zustand state management
│       │   │   ├── catalog-store.ts     # Product catalog (IndexedDB)
│       │   │   ├── tally-store.ts       # Current tally (in-memory)
│       │   │   ├── settings-store.ts    # App settings (localStorage)
│       │   │   └── index.ts
│       │   ├── hooks/           # Custom React hooks
│       │   │   └── use-storage.ts
│       │   ├── main.tsx         # Application entry point
│       │   └── index.css        # Global styles
│       ├── dist/                # Production build output
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   ├── config/                  # Shared TypeScript configuration
│   │   ├── package.json
│   │   └── tsconfig.base.json
│   ├── env/                     # Environment variable validation
│   │   ├── src/
│   │   │   └── web.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── types/                   # Shared TypeScript types and interfaces
│       ├── src/
│       │   ├── entities/        # Core data models
│       │   │   ├── base.ts
│       │   │   ├── product.ts
│       │   │   ├── tally-item.ts
│       │   │   └── settings.ts
│       │   ├── guards/          # Type guards
│       │   ├── utils/           # Utility functions
│       │   │   ├── currency.ts
│       │   │   ├── grid.ts
│       │   │   ├── timestamps.ts
│       │   │   └── uuid.ts
│       │   ├── validation/      # Zod schemas
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── turbo.json                  # Turborepo configuration
├── tsconfig.json               # Root TypeScript config
├── package.json                # Root workspace config
└── README.md
```

### Directory Purposes

- **apps/web**: The main React application, containing all UI, routing, state management, and business logic
- **packages/config**: Shared TypeScript configuration across all packages for consistency
- **packages/env**: Environment variable validation using Zod (currently minimal, future use)
- **packages/types**: Shared TypeScript types, interfaces, utilities, and validation schemas

## Technology Stack

### Core Framework
- **React 19**: Modern React with latest features for component composition and state management
- **TypeScript 5**: Strict type safety with enhanced developer experience
- **Vite**: Fast build tool with HMR and optimized production builds

### Routing & Navigation
- **TanStack Router v1**: Type-safe, file-based routing with integrated devtools
  - File-based route structure (`/`, `/settings`, `/catalog`)
  - Navigation guards for protecting routes with active tally
  - Type-safe navigation with autocompletion

### State Management
- **Zustand v4**: Lightweight, performant state management with minimal boilerplate
  - Three separate stores for different concerns
  - Built-in devtools integration
  - Persist middleware for state persistence

### Storage & Persistence
- **IndexedDB**: Browser-native database for large data storage
  - Used via `idb-keyval` wrapper for simplified API
  - Stores product catalog with images
  - Handles quota detection and error recovery
- **localStorage**: Simple key-value storage for app settings
  - Used via Zustand persist middleware
  - Stores theme preferences and display settings

### Styling & UI
- **Tailwind CSS v4**: Utility-first CSS framework with Vite plugin
  - JIT compilation for optimal bundle size
  - Custom design tokens via CSS variables
  - Dark mode support via class strategy
- **shadcn/ui**: Reusable, accessible component primitives built on Radix UI
  - Dialog, Button, Input, Card, Label, Checkbox, Skeleton components
  - Customizable via Tailwind classes
  - Copy-and-paste components, no runtime library overhead
- **next-themes**: Theme provider for React with system preference detection
  - Light/dark/system theme modes
  - Prevents flash of incorrect theme on page load

### Build & Tooling
- **Turborepo**: Monorepo build system with caching
  - Parallel task execution across packages
  - Remote caching support
  - Shared configuration management
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting for consistency

## Core Systems

### Routing System

The routing system is built on TanStack Router's file-based approach, providing type safety and excellent developer experience.

#### Route Structure

```
/                              → TallyPage (root, default)
/settings                      → SettingsPage
/settings.catalog              → CatalogSettings (nested route)
```

#### Key Features

**File-Based Routing**
- Routes are defined by creating files in `src/routes/`
- Route components export a `Route` constant from `createFileRoute()`
- Automatic type inference for route params and search params

**Navigation Guards**
- Implemented in `src/lib/route-guards.ts`
- Prevents navigation away from tally page when items are in cart
- Shows confirmation dialog: "You have items in your current tally. Clear and continue?"
- Options to cancel (stay on page) or confirm (clear tally and navigate)

**Browser Beforeunload Protection**
- Added to root route component
- Shows browser's native "unsaved changes" warning when closing tab with active tally
- Cleaned up on component unmount to prevent memory leaks

**Route Refresh Behavior**
- Non-root routes redirect to `/` on page refresh
- Uses sessionStorage flag to track reload state
- Prevents user confusion from landing on settings page after refresh

#### Implementation Example

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TallyPage,
});

function TallyPage() {
  return <div>Tally interface goes here</div>;
}
```

### State Management

Tiny-Till uses three separate Zustand stores, each optimized for its specific use case and persistence requirements.

#### Store Architecture

| Store | Purpose | Persistence | Storage Backend |
|-------|---------|-------------|-----------------|
| `useCatalogStore` | Product catalog management | Persistent | IndexedDB (via idb-keyval) |
| `useTallyStore` | Current transaction tally | Transient | In-memory only (no persistence) |
| `useSettingsStore` | App configuration | Persistent | localStorage |

#### Catalog Store

**Location**: `src/stores/catalog-store.ts`

**State**:
```typescript
interface CatalogState {
  products: Product[]          // Array of all products
  isLoading: boolean           // Loading state indicator
  error: string | null         // Error message if any
  hasHydrated: boolean         // IndexedDB hydration complete
}
```

**Actions**:
- `addProduct(input: ProductInput)`: Add new product to catalog
- `updateProduct(id: string, updates: ProductUpdate)`: Update existing product
- `deleteProduct(id: string)`: Remove product from catalog
- `getProduct(id: string)`: Retrieve single product by ID
- `clearError()`: Clear error state
- `setLoading(loading: boolean)`: Set loading state

**Persistence Details**:
- Stored in IndexedDB via custom storage adapter
- Uses Zustand's `persist` middleware with `createIndexedDBStorage()`
- Hydration tracked with `hasHydrated` flag
- Automatic serialization/deserialization of products array

**Data Integrity**:
- Products include timestamps (createdAt, updatedAt)
- UUID v4 IDs generated for all products
- Prices stored as integers (cents) to avoid floating-point errors
- Images stored as base64 data URLs (max 128x128px enforced at UI layer)

#### Tally Store

**Location**: `src/stores/tally-store.ts`

**State**:
```typescript
interface TallyStoreState {
  items: Map<string, TallyItem>   // Key: productId, Value: TallyItem
  isActive: boolean                // Has at least one item
  lastModified: number | null      // Unix timestamp of last change
}
```

**Actions**:
- `addItem(productId: string, price: number, quantity?: number)`: Add item with quantity
- `removeItem(productId: string)`: Remove item from tally
- `updateQuantity(productId: string, quantity: number)`: Set quantity (0 removes item)
- `incrementItem(productId: string)`: Add 1 to existing item
- `clearTally()`: Reset tally to empty state
- `getSummary(): TallySummary`: Calculate total and item count
- `hasActiveItems(): boolean`: Check if tally has items

**Key Design Decisions**:

**No Persistence**: Tally is intentionally kept in-memory only
- No localStorage, sessionStorage, or IndexedDB
- Resets completely on page refresh or browser close
- Privacy-first: no transaction history
- Matches "calculator" metaphor - each transaction is independent

**Map Data Structure**: Using Map for O(1) lookups
- Efficient item retrieval by productId
- Automatic deduplication of products
- Preserves insertion order for consistency

**Immutable Updates**: All state updates create new Map instances
- Enables React re-render detection
- Works seamlessly with Zustand's subscription system
- Supports time-travel debugging in devtools

#### Settings Store

**Location**: `src/stores/settings-store.ts`

**State**:
```typescript
interface SettingsState {
  theme: Theme                      // 'light' | 'dark' | 'system'
  gridDensity: GridDensity          // 'normal' | 'compact'
  columnCountOverride: number | undefined  // Manual column override
  backupReminder: number | undefined      // Days since last backup
  hasHydrated: boolean              // localStorage hydration complete
}
```

**Actions**:
- `setTheme(theme: Theme)`: Set theme mode
- `setGridDensity(density: GridDensity)`: Set grid display density
- `setColumnCountOverride(count: number | undefined)`: Set manual column count
- `setBackupReminder(days: number | undefined)`: Update backup reminder
- `resetSettings()`: Reset to default values

**Persistence**:
- Stored in localStorage via Zustand's default persist storage
- Uses default JSON serialization
- Automatic hydration on app load
- Syncs across tabs via storage events

### Storage Layer

The storage layer provides a unified interface for IndexedDB and localStorage operations with robust error handling and quota management.

#### IndexedDB Storage

**Location**: `src/lib/storage.ts`

**Key Features**:

**Wrapper Around idb-keyval**:
- Simplified API for key-value operations
- Custom store name: `tiny-till-db` in `tiny-till-store`
- Type-safe operations with generics

**Error Handling**:
- All operations wrapped in try-catch
- Graceful degradation with error logging
- Returns undefined/null on errors instead of throwing

**Quota Detection**:
- Uses `navigator.storage.estimate()` to check available space
- Warns when approaching 80% quota limit
- Catches `QuotaExceededError` with user-friendly message

**Storage Utilities**:
```typescript
async function safeGet<T>(key: string): Promise<T | undefined>
async function safeSet<T>(key: string, value: T): Promise<boolean>
async function safeDelete(key: string): Promise<boolean>
async function clearAll(): Promise<boolean>
async function getAllKeys(): Promise<string[]>
async function hasKey(key: string): Promise<boolean>
async function getStorageInfo(): Promise<StorageInfo | null>
```

**Storage Info Interface**:
```typescript
interface StorageInfo {
  quotaUsed: number          // Bytes used
  quotaLimit: number         // Bytes available
  percentage: number         // Percentage used (0-100)
  isNearLimit: boolean       // True if >80% used
}
```

#### Persist Middleware

**Location**: `src/lib/persist-middleware.ts`

**Purpose**: Custom Zustand persistence adapters for IndexedDB

**Key Components**:

**IndexedDB Storage Adapter**:
```typescript
function createIndexedDBStorage<T>(): PersistStorage<T>
```
- Implements StateStorage interface for Zustand
- Uses safeGet/safeSet/safeDelete from storage utilities
- JSON serialization/deserialization
- Type-safe with generics

**Map Serializer**:
```typescript
function mapSerializer<T>() {
  serialize: (state: Map<string, T>): string
  deserialize: (str: string): Map<string, T>
}
```
- Converts Map to/from JSON array format
- Enables persistence of Map-based state
- Not currently used but available for future use

**Hydration Tracking**:
```typescript
function withHydrationTracking<T>(onRehydrate?: () => void)
```
- Sets `hasHydrated: true` after successful rehydration
- Logs completion for debugging
- Optional callback for custom hydration logic

#### Storage Keys

**Location**: `src/lib/storage-keys.ts`

```typescript
export const STORAGE_KEYS = {
  CATALOG: 'tiny-till-catalog',
  TALLY: 'tiny-till-tally',       // Reserved for future use
  SETTINGS: 'tiny-till-settings',
  VERSION: 'tiny-till-version',   // For migration support
} as const
```

### Theme System

Tiny-Till uses next-themes for comprehensive theme management with Shadcn UI integration.

**Location**: `src/components/theme-provider.tsx`

**Features**:

**Theme Modes**:
- **Light**: Explicit light theme
- **Dark**: Explicit dark theme
- **System**: Automatically follows OS preference

**Implementation**:
```typescript
<ThemeProvider
  attribute="class"              // Add class to HTML element
  defaultTheme="dark"            // Default theme
  disableTransitionOnChange     // Prevent flash during theme switch
  storageKey="vite-ui-theme"     // localStorage key
>
  {children}
</ThemeProvider>
```

**CSS Variables**:
- Defined in `index.css` using OKLCH color space
- Separate variable sets for `:root` and `.dark`
- Seamlessly integrated with Tailwind v4
- All shadcn/ui components reference these variables

**Color Palette**:
- Uses OKLCH for perceptually uniform colors
- Custom kawaii-inspired color scheme
- Consistent contrast ratios for accessibility

**Theme Switching**:
- Implemented via `ModeToggle` component
- Uses next-themes `useTheme()` hook
- Rotates through: light → dark → system → light

### Navigation Guards

**Location**: `src/lib/route-guards.ts`

**Purpose**: Prevent accidental navigation away from active tally

**Implementation**:
```typescript
export function useTallyNavigationGuard(
  hasActiveTally: () => boolean,
  clearTally: () => void
): NavigationGuardReturn
```

**Behavior**:

**When Navigating Away from `/`**:
1. Check if tally has active items
2. If yes, store pending navigation in state
3. Show confirmation modal
4. User chooses:
   - **Cancel**: Close modal, stay on current page
   - **Clear & Continue**: Clear tally, execute navigation

**Modal Component**:
**Location**: `src/components/navigation-confirmation-dialog.tsx`

Features:
- Warning icon for visual emphasis
- Clear message: "You have items in your current tally. Clear and continue?"
- Cancel button (outline style)
- Confirm button (destructive style)

**Integration**:
- Used in Header component for navigation clicks
- Combined with browser `beforeunload` event for tab close protection
- State managed in root route component

## Data Flow

### User Interaction Flow

1. **User taps product card** → TallyStore.addItem()
2. **State updates** → React re-renders product grid
3. **Footer recalculates** → TallyStore.getSummary() displays new total
4. **Settings change** → SettingsStore action → localStorage → other tabs sync
5. **Product added to catalog** → CatalogStore.addProduct() → IndexedDB → persisted

### State Update Flow

```
User Action
    ↓
Component Event Handler
    ↓
Store Action (e.g., addItem)
    ↓
State Update (immer/immutable)
    ↓
Zustand Middleware Chain
    ├─ Devtools (logging)
    └─ Persist (storage sync if applicable)
    ↓
Component Re-render (subscription)
    ↓
UI Update
```

### Persistence Flow

**Write Flow**:
```
Store Action → set(new state) → persist middleware
    → serialize state → IndexedDB.setItem(key, value)
    → IndexedDB stores → on success → console log
```

**Read Flow (on app load)**:
```
App mounts → persist middleware hydrate
    → IndexedDB.getItem(key) → deserialize JSON
    → set hydrated state → set hasHydrated = true
    → components render with persisted data
```

**Quota Detection Flow**:
```
Before write → navigator.storage.estimate()
    → check if >80% used → warn if yes
    → attempt write → catch QuotaExceededError
    → show user error message
```

### Route Transition Flow

**Normal Transition**:
```
User clicks nav link → navigate(to)
    → location changes → router matches route
    → component mounts → render
```

**Protected Transition (with active tally)**:
```
User clicks nav link → navigateWithCheck(to)
    → check hasActiveItems() → if true
    → store pending navigation → open modal
    → user confirms → clearTally() → navigate(to)
    → user cancels → close modal → stay on page
```

## Type System

### Shared Types Package

**Location**: `packages/types/src/`

The types package exports all shared TypeScript interfaces, types, and utilities used across the application.

#### Core Entities

**Base Entity**: `src/entities/base.ts`
```typescript
interface BaseEntity {
  id: string                // UUID v4
  createdAt: number         // Unix timestamp
  updatedAt: number         // Unix timestamp
}
```

**Product**: `src/entities/product.ts`
```typescript
interface Product extends BaseEntity {
  name: string              // Required, max 50 chars
  price: number             // In cents (integer)
  imageData?: string        // Base64 data URL
}
```

**Tally Item**: `src/entities/tally-item.ts`
```typescript
interface TallyItem {
  productId: string         // Reference to Product.id
  quantity: number          // Positive integer
  price: number             // Snapshot in cents
}
```

**Settings**: `src/entities/settings.ts`
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  gridDensity: 'normal' | 'compact'
  columnCountOverride?: number
  backupReminder?: number
}
```

#### Utilities

**Currency**: `src/utils/currency.ts`
```typescript
function toCents(dollars: number): number
function toDollars(cents: number): number
function formatCurrency(cents: number): string
```

**Grid**: `src/utils/grid.ts`
```typescript
function calculateColumns(
  screenWidth: number,
  density: 'normal' | 'compact',
  override?: number
): number
```

**Timestamps**: `src/utils/timestamps.ts`
```typescript
function formatTimestamp(ts: number): string
function getRelativeTime(ts: number): string
```

**UUID**: `src/utils/uuid.ts`
```typescript
function generateUUID(): string
function isValidUUID(uuid: string): boolean
```

#### Validation

Zod schemas for runtime validation:
- `ProductSchema`: Validates product data
- `TallyItemSchema`: Validates tally items
- `SettingsSchema`: Validates settings

#### Type Guards

Runtime type checking functions:
- `isProduct(value: unknown): value is Product`
- `isTallyItem(value: unknown): value is TallyItem`
- `isSettings(value: unknown): value is AppSettings`

### Type Safety Patterns

**No Any Types**:
- Strict TypeScript mode enabled
- All interfaces explicitly typed
- Use `unknown` for untyped data, then narrow with type guards

**Null Safety**:
- Optional chaining for all object access
- Null checks before using values
- Default values where appropriate

**Generic Types**:
- Storage utilities use generics: `safeGet<T>(key)`
- Stores typed with state/action interfaces
- Component props typed inline or via interfaces

**Discriminated Unions**:
- Error states use discriminated unions
- Loading/Success/Error states clearly separated

## Security Considerations

### Input Validation

**Product Names**:
- Max 50 characters enforced at UI layer
- HTML entities escaped to prevent XSS
- Unique names enforced in catalog

**Prices**:
- Strict numeric validation: `^\d+(\.\d{1,2})?$`
- Stored as integers (cents) to avoid float errors
- Positive values only (≥ 1 cent)

**Images**:
- MIME type validation (PNG, JPEG, WebP only)
- Size limit enforced (128x128px max)
- Base64 encoding handled securely

### Data Isolation

**Local-Only Storage**:
- No network requests for data
- All data stays in browser
- No external API calls

**No Third-Party Tracking**:
- No analytics scripts
- No telemetry
- No cookies for tracking

**Privacy by Design**:
- Tally data is ephemeral (in-memory only)
- No transaction history
- No user accounts or authentication

### XSS Prevention

**Content Security Policy**:
- Plan to configure strict CSP headers in production
- Restrict script sources
- Disable eval() and inline scripts

**Safe Rendering**:
- React's built-in XSS protection
- Escape all user input before rendering
- Use `dangerouslySetInnerHTML` only with sanitized HTML

### Storage Security

**IndexedDB**:
- Origin-bound (cannot be accessed by other domains)
- No exposed via HTTP (HTTPS required)
- Cleared when browser data is cleared

**localStorage**:
- Sensitive data kept minimal
- No credentials or tokens stored
- Subject to same-origin policy

### Future Enhancements

**CSP Headers**:
- Configure in Vite build
- Restrict to same-origin
- Block inline scripts and eval

**Subresource Integrity**:
- Verify integrity of external scripts (if added)
- Prevent CDN compromise

**Service Worker**:
- Cache app shell for offline use
- Implement HSTS for HTTPS
- Add manifest for PWA installation
