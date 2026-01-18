# Product Requirements Document: Tiny-Till

## 1. Overview
### Executive Summary
Tiny-Till is a lightweight, mobile-first web application designed for on-the-go sellers (e.g., bakers, farmers market stalls) who need a fast, reliable way to calculate customer totals without the friction of a manual calculator. The app prioritizes speed, offline reliability (Local-First), and a tactile user interface optimized for high-pressure service environments.

### Problem Statement
Sellers in mobile or outdoor environments often rely on mental math or standard calculator apps. This is error-prone, slow, and frustrating during peak hours. Existing POS (Point of Sale) systems are often too heavy, require a constant internet connection, or involve complex accounting features that are overkill for a simple tally.

### Value Proposition
- **Speed:** One-tap item addition.
- **Reliability:** Works offline via local storage; no internet required for the core tallying function.
- **Simplicity:** No login, no database synchronization, and no accounting overhead. It is a "smart digital tally sheet."

---

## 2. Objectives
### Key Goals
- **Business:** Reduce the time spent per customer transaction for the seller.
- **Technical:** Ensure 100% functionality in "Airplane Mode" and provide a fluid, responsive UI that feels like a native app.

### Success Metrics (KPIs)
- **Time to Tally:** Ability to sum 5 different items in under 10 seconds.
- **Offline Persistence:** Product catalog and current tally persist through page refreshes and browser closures.
- **Zero Data Loss:** 100% success rate in catalog import/export functionality.

---

## 3. Target Audience
### User Personas
- **The Delivery Baker (Primary):** Moves from house to house, needs to quickly sum bread types and pastries while holding items, often in areas with poor cellular reception.
- **The Market Stall Holder:** Needs a "quick-key" interface to handle long queues at a weekend market.

### User Stories
- As a baker, I want to tap on "Croissant" three times and see the total immediately.
- As a seller, I want to edit my product list on the fly if I run out of an item or change a price.
- As a user with a weak signal, I want the app to load instantly regardless of my connection.

---

## 4. Features

### 4.1 Core Features (MVP)
#### A. Product Management (The Catalog)
- **Description:** A simple list view to manage the sale items.
- **Functionality:** 
  - Inline "+" row at the top to add Name and Price.
  - List of existing products with "Edit" and "Delete" icons.
  - Optional image placeholder/upload (stored as Base64 in LocalStorage).
- **Acceptance Criteria:**
  - Users can add a product without leaving the page.
  - Price inputs must support two decimal places.

#### B. The Tally Page (The Grid)
- **Description:** The primary interface for sales.
- **Functionality:**
  - **Grid Layout:** Configurable columns (2–3 for mobile, 4–6 for tablet).
  - **Product Cards:** Large tap targets. Tapping adds +1 to the count.
  - **Quantity Badge:** Displays current count on the card.
  - **Quantity Overflow:** Clicking the badge opens a small popover/input to manually type a large number or remove the item.
  - **Live Total:** A prominent, sticky footer showing the "Grand Total."
  - **Reset Button:** One-tap to clear the current tally for the next customer.
- **Acceptance Criteria:**
  - The UI must not lag when tapping rapidly.
  - Total must update in real-time (<100ms).

#### C. Settings & Local-First Logic
- **Description:** Configuration and data persistence.
- **Functionality:**
  - **Persistence:** App state (Catalog) saved to `localStorage` or `IndexedDB`.
  - **Display Settings:** Toggle between "Normal" and "Compact" views.
  - **Import/Export:** Export Catalog as a JSON file; Import JSON to overwrite/update the catalog.
- **Acceptance Criteria:**
  - Closing the browser tab does not delete the product catalog.

### 4.2 Future Features (Post-MVP)
- **Daily Summary:** A simple "Total for the day" log (non-accounting, just a sum of resets).
- **PWA Support:** Service Workers for full offline "App" installation on iOS/Android.
- **Tax Toggle:** Ability to add a global tax percentage to the total.

---

## 5. Technical Requirements

### Tech Stack
- **Framework:** React (Vite)
- **Routing:** TanStack Router (Type-safe navigation)
- **Styling:** Tailwind CSS + ShadcnUI (Radix UI primitives)
- **State Management:** 
    - *Catalog/Tally:* `Zustand` with `persist` middleware (simplifies LocalStorage sync).
- **Language:** TypeScript (Strict mode)

### System Architecture Overview
- **Local-First Pattern:** The app will use a "Single Source of Truth" in a client-side store. No external API calls are required for core features.
- **Responsive Logic:** Use Tailwind's grid system combined with a user-defined "columns" state to dynamically adjust the Tally Grid.

### Security and Performance
- **Security:** Since there is no backend, security is limited to preventing XSS via sanitized inputs in the product name.
- **Performance:** Ensure "Tap" events use `touch-action: manipulation` to prevent the 300ms mobile tap delay.

---

## 6. Timeline & Milestones
- **Phase 1: Foundation (1-2 Days):** Setup TanStack Router, basic Layout, and Zustand store with persistence.
- **Phase 2: Product Management (2-3 Days):** CRUD operations for products using ShadcnUI forms/tables.
- **Phase 3: Tally Engine (3-4 Days):** Core Grid UI, calculation logic, and responsiveness tuning.
- **Phase 4: Settings & Data (1-2 Days):** JSON Import/Export and Theme switching.
- **Phase 5: Polish & PWA (2 Days):** Adding Manifest files for "Add to Home Screen" capability.

---

## 7. Open Questions / Risks
- **Storage Limits:** `localStorage` is capped at ~5MB. If users upload many high-res images for products, the app will crash. 
    - *Mitigation:* Recommend using `IndexedDB` for images or enforcing a strict resize on image upload.
- **Data Safety:** Since there is no cloud backup, if the baker loses their phone or clears browser cache, the catalog is gone.
    - *Mitigation:* Explicitly prompt the user to "Export Backup" in the settings occasionally.
- **Negative Quantities:** Should the app allow a "negative" count (for returns)? 
    - *Decision:* Keep it simple for MVP; only positive increments and a "Remove/Clear" button.