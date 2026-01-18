# Master Product Requirements Document

## 1. Overview

### Executive Summary
**Tiny-Till** is a lightweight, local-first web application designed for on-the-go sellers (e.g., bakers on delivery routes, farmers' market stall vendors) to replace physical calculators and manual tallying. It provides a fast, reliable, and offline-capable interface to calculate sales totals without the overhead of cloud-based Point of Sale (POS) systems or accounting features.

### Problem Statement
Small-scale vendors operating in environments with spotty or non-existent internet connectivity currently rely on manual calculators, mental math, or paper notes. These methods are error-prone, slow during peak service hours, and lack data portability. Existing POS solutions are often too complex, require constant connectivity, and involve unnecessary accounting workflows.

### Value Proposition
*   **Speed & Efficiency:** "Tap-to-add" grid interface allows for rapid tallying of items, significantly reducing transaction time.
*   **Resilience:** A local-first architecture ensures 100% functionality offline without internet dependency.
*   **Simplicity:** Zero-friction setup with no logins, no databases, and no accounting features—purely a calculation tool.
*   **Portability:** Responsive design optimized for smartphones (mobile) and tablets, with PWA capabilities for installation.

## 2. Objectives

### Key Goals
*   **Business:** Reduce the time spent per customer transaction by at least 50% compared to manual calculators.
*   **Technical:** Ensure 100% offline functionality with <100ms latency on user interactions (taps, inputs).
*   **User Experience:** Provide an intuitive, large-touch-target interface that can be operated one-handed in high-pressure environments.

### Success Metrics (KPIs)
*   **Time to First Tally:** Ability to load the app and add the first item within 5 seconds.
*   **Offline Reliability:** 100% success rate in maintaining product catalog state across page refreshes and browser restarts.
*   **User Error Rate:** Minimize "Undo/Clear" actions, indicating accurate inputs on the first try.
*   **Adoption:** Qualitative feedback rating ease-of-use ≥ 4/5 from pilot users.

## 3. Target Audience

### User Personas
*   **The Delivery Baker (Primary):** Moves from house to house, often in areas with poor reception. Needs to quickly sum various bread types and pastries while holding items. Values speed and large buttons.
*   **The Market Stall Holder:** Stationary but busy, handling long queues. Needs a "quick-key" interface to manage high volume and prefers a grid view to see many options at once.
*   **The Casual Seller:** Sells occasionally (garage sales, pop-ups). Needs a "pick up and go" tool with no learning curve.

### User Stories
*   As a baker, I want to tap a product card to increment the count so I can tally orders quickly without typing.
*   As a seller, I want to tap the quantity number on a card to manually enter a specific amount (e.g., "50") for bulk orders.
*   As a user, I want to manage my product list (add/edit/remove) inline so I can update prices on the fly.
*   As a user, I want to export my product catalog to a file so I can back it up or transfer it to another device.
*   As a user, I want to switch between "Normal" and "Compact" views to fit more items on my tablet screen.

## 4. Features

### 4.1 Core Features (MVP)

#### A. Product Management (The Catalog)
*   **Description:** A streamlined list view to manage sellable inventory.
*   **Functionality:**
    *   **Inline Add:** A persistent "+" row at the top of the list allowing input for Product Name and Price.
    *   **Inline Edit/Edit Mode:** Action buttons on list items to edit Name, Price, or Delete.
    *   **Optional Media:** Support for optional product images (stored locally).
*   **Persistence:** The product catalog is saved to the browser's local storage (IndexedDB/LocalStorage) and persists across sessions.

#### B. The Tally Page (Grid Interface)
*   **Description:** The primary workspace for calculating sales.
*   **Layout & Display:**
    *   **Responsive Grid:** Automatically adjusts columns based on screen width and user preference (Mobile: 2-3 cols, Tablet: 4-6 cols).
    *   **Density Toggle:** Settings allow switching between "Normal" (detailed card) and "Compact" (smaller footprint) views.
    *   **Visual Feedback:** Product cards display Name, Price, and a Quantity Badge (hidden if 0).
*   **Interaction Logic:**
    *   **Tap Card:** Adds 1 to the quantity. Visual "pulse" feedback confirms action.
    *   **Tap Badge:** Clicking the quantity number opens an overlay/input field allowing manual entry of a specific number (e.g., 10).
    *   **Remove:** Inside the quantity overlay, a "Remove" or "Trash" button resets the count to 0.
    *   **Live Total:** A sticky footer displays the Grand Total of the current transaction in real-time.
    *   **Reset:** A "Clear Cart" button resets all quantities to 0 for the next customer.
*   **Data Behavior:** The tally (cart) is **transient**. It is held in memory and reset upon refresh/close to maintain privacy and simplicity (not an accounting ledger).

#### C. Settings Page
*   **Description:** Configuration for appearance and data management.
*   **Functionality:**
    *   **Theme:** Toggle between Light, Dark, and System themes.
    *   **Display:** Control grid density (Compact vs. Normal) and column count.
    *   **Data Portability:**
        *   **Import:** Upload a JSON file to restore or merge a product catalog.
        *   **Export:** Download the current catalog as a JSON file for backup.

### 4.2 Future Features (Post-MVP)
*   **PWA Support:** Service Worker and manifest file for "Add to Home Screen" installation.
*   **Tax Calculation:** Simple global tax toggle or percentage input.
*   **Receipt View:** A simplified, full-screen summary to show the customer (handshake mode).
*   **Catalog Categorization:** Tabs or filters to group products (e.g., "Breads," "Pastries").

## 5. Technical Requirements

### Tech Stack
*   **Framework:** React (Vite)
*   **Routing:** TanStack Router (File-based, type-safe)
*   **Styling:** Tailwind CSS (Utility-first)
*   **UI Components:** Shadcn UI (Radix UI primitives + Tailwind)
*   **Language:** TypeScript (Strict mode)
*   **State Management:** **Zustand** (Lightweight, robust state management with persist middleware)
*   **Storage:** **IndexedDB** (via `idb` or `dexie`) for the Catalog to handle potential images safely; `sessionStorage` for transient tally state.

### System Architecture
*   **Local-First Pattern:** The application is a Single Page Application (SPA) with zero backend dependencies. All logic executes client-side.
*   **Data Flow:**
    *   **Catalog:** `Zustand Store` <-> `IndexedDB`.
    *   **Tally:** `Zustand Store` (In-memory/Session only).
*   **Responsive Logic:** Tailwind CSS breakpoints control the grid layout (`grid-cols-2` to `grid-cols-6`).

### Security & Performance
*   **Security:** Input sanitization to prevent XSS. No sensitive data is transmitted or stored externally.
*   **Performance:**
    *   **Touch Optimization:** Use `touch-action: manipulation` to eliminate 300ms tap delays.
    *   **Rendering:** `React.memo` for grid cards to prevent unnecessary re-renders when only one item updates.
    *   **Math:** Handle currency calculations using integer arithmetic (cents) or a dedicated utility library to avoid floating-point errors (e.g., `0.1 + 0.2`).

## 6. Timeline & Milestones

*   **Phase 1: Foundation (Days 1-3):** Setup TanStack Router, Shadcn UI theme, and Zustand stores. Define TypeScript interfaces.
*   **Phase 2: Product Management (Days 4-6):** Implement CRUD logic for the Catalog, connect to IndexedDB, and build the Settings page (Import/Export).
*   **Phase 3: Tally Engine (Days 7-10):** Build the responsive Grid, implement Tap-to-Add logic, Quantity Overlay, and Sticky Footer totals.
*   **Phase 4: Polish & QA (Days 11-13):** Theming (Dark/Light), density toggles, mobile touch testing, and performance profiling.
*   **Phase 5: Deployment (Day 14):** Build production bundle and deploy to static hosting.

**Total Estimated Time:** ~2 Weeks (assuming one full-time developer).

## 7. Open Questions / Risks

| Risk / Question | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Storage Quota** | If users upload high-res images to IndexedDB, they may hit storage limits (browser dependent). | Enforce strict image resizing/compression on upload (e.g., max 300px width). Recommend using external URLs or no images for MVP. |
| **Data Loss (Catalog)** | If a user clears browser cache, the local catalog is deleted permanently. | Prominently feature the "Export Catalog" button in settings and add a "Backup" reminder prompt. |
| **Tally Persistence** | If the user accidentally refreshes during a transaction, the current sale is lost. | Clearly communicate that the app is a "calculator," not a register. Consider adding a "Save Draft" to session storage as a low-risk enhancement if testing reveals frustration. |
| **Math Accuracy** | Floating point math errors in JavaScript. | Use a utility function (e.g., `Intl.NumberFormat` or integer-based math) for all price calculations. |
| **Browser Compatibility** | Older mobile browsers may struggle with modern Grid or IndexedDB features. | Set target browsers to modern Chrome/Safari/Firefox (versions < 2 years old). Avoid experimental features. |
