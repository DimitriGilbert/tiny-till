# Product Requirements Document: Tiny-Till

## 1. Overview

### Executive Summary
**Tiny-Till** is a lightweight, mobile-first web application designed to serve as a portable digital calculator and tally sheet for small-scale vendors. Unlike complex Point-of-Sale (POS) systems, it focuses strictly on speed, ease of use, and offline capability (local-first) to help sellers calculate transaction totals quickly without the overhead of cloud synchronization or accounting features.

### Problem Statement
Sellers at farmers' markets or conducting delivery routes (e.g., the target persona: a baker on a delivery tour) currently rely on physical calculators, pen and paper, or mental math to tally orders. This process is error-prone, slow, and difficult to manage when handling variable quantities of different items simultaneously.

### Value Proposition
*   **Speed:** "Tap-to-add" interface designed for high-volume interactions.
*   **Resilience:** Works offline (Local-First) without internet dependency.
*   **Simplicity:** Zero setup; no logins, no servers, no cloud databases.
*   **Portability:** Installable as a PWA (Progressive Web App) on mobile devices.

---

## 2. Objectives

### Key Goals
1.  **Performance:** Achieve sub-100ms interaction response times for all taps/clicks.
2.  **Usability:** Ensure 90% of users can perform a full transaction (Add 5 items -> Calculate Total) within 30 seconds of opening the app.
3.  **Data Sovereignty:** All data resides in the user's browser (Local Storage/IndexedDB). No data is ever sent to a remote server.
4.  **Visual Clarity:** High-contrast, large-touch-target UI suitable for use in bright sunlight or dark delivery trucks.

### Success Metrics (KPIs)
*   **Time to First Tally:** Time elapsed from opening the app to adding the first product.
*   **Error Rate:** Frequency of accidental inputs (measured via "Undo" or "Clear" usage).
*   **Task Completion:** Successful calculation of a transaction without manual transcription.

---

## 3. Target Audience & Personas

### Primary Persona: "The Delivery Baker"
*   **Context:** Standing in a delivery truck or at a stall.
*   **Device:** Smartphone (Portrait mode).
*   **Needs:** Large buttons, fast input, quick total calculation, ability to correct mistakes easily.
*   **Pain Points:** Small calculator screens, messy paper notes, input errors due to movement.

### Secondary Persona: "The Weekend Farmer"
*   **Context:** Stationary stall, tablet/iPad available.
*   **Needs:** Grid density adjustment (more items visible at once), bulk item management.
*   **Pain Points:** Heavy POS systems that require training or wifi.

### User Stories
*   As a user, I want to add a product called "Sourdough" with a price of "5.50" so I can sell it.
*   As a user, I want to tap "Sourdough" 3 times and see the subtotal update instantly.
*   As a user, I want to enter a custom number (e.g., 50 loaves) for a bulk order without tapping 50 times.
*   As a user, I want to export my product list to transfer it to my tablet.

---

## 4. Features

### 4.1 Core Features (MVP)

#### 4.1.1 Product Management (Catalog)
*   **Description:** Interface to manage the inventory of sellable items.
*   **UI Requirements:**
    *   List view of existing products.
    *   **Inline Creation:** A "+" button at the top of the list that expands an inline form to add a product (Name, Price, optional Image URL/Icon).
    *   **Actions:** Edit (inline), Delete (with confirmation).
*   **Data Structure:**
    *   `Product`: `{ id: string, name: string, price: number, image?: string }`
*   **Persistence:** Saved to `localStorage`.

#### 4.1.2 The Tally Page (Main Interface)
*   **Description:** The active transaction workspace.
*   **UI Requirements:**
    *   **Header:** Sticky header displaying "Current Total" and a "Clear/Reset" button.
    *   **Grid Layout:** Dynamic grid based on screen width.
        *   *Mobile:* 2 or 3 columns.
        *   *Tablet/Desktop:* 4 to 6 columns.
        *   *Setting:* User-adjustable density (Compact vs. Normal).
    *   **Product Cards:** Large, touch-friendly cards displaying Name, Price, and Quantity.
*   **Interaction Logic:**
    1.  **State: Empty:** Card shows Name/Price. Tap -> Adds 1 to quantity. Visual feedback (scale/pulse).
    2.  **State: Quantity > 0:** Card shows Quantity count. Tap -> Opens an overlay or inline input field.
        *   *Input:* User types custom number (e.g., 12).
        *   *Remove:* A dedicated "Trash/X" button on the card resets the quantity to 0 (removes from tally).
*   **Calculation:** Real-time updates of the `Total` based on `Quantity * Price`.

#### 4.1.3 Settings Page
*   **Description:** App configuration and data portability.
*   **Features:**
    *   **Theme:** Toggle between Light/Dark/System.
    *   **Display:** Slider or toggle for Grid Density (Compact vs. Spacious).
    *   **Catalog Management:**
        *   *Export:* Download current product list as a `.json` file.
        *   *Import:* Upload a `.json` file to replace/merge the current catalog.

---

### 4.2 Future Features (Post-MVP)
*   **Receipt View:** A simple summary view of the current transaction to show the customer.
*   **History (Session Only):** Ability to "Save" the current tally to a list below the grid (ephemeral) to start a new one while keeping a running total.
*   **Tax/VAT Support:** Optional toggle to add a percentage on top of the final total.

---

## 5. Technical Requirements

### 5.1 Tech Stack
*   **Framework:** React (Vite recommended for speed).
*   **Routing:** TanStack Router (Mandatory).
*   **Styling:** Tailwind CSS.
*   **UI Components:** Shadcn UI (Radix Primitives).
*   **State Management:**
    *   *Recommendation:* React Context or Zustand for managing the "Tally State" (cart).
    *   *Persistence:* `localStorage` for the Product Catalog. Session state for the active Tally.
*   **Language:** TypeScript.

### 5.2 System Architecture
Since this is a Client-Side Only (CSO) application:
1.  **Load:** App loads entirely into memory.
2.  **Data Fetching:** None (Data is static after load).
3.  **Data Mutation:** Updates occur directly to browser Local Storage.
4.  **Offline Strategy:** Service Worker (Vite PWA plugin) to cache assets for offline access.

### 5.3 Security
*   **Input Sanitization:** All price inputs must be parsed as floats to prevent script injection in UI.
*   **XSS Prevention:** React handles text escaping by default, but be careful with `dangerouslySetInnerHTML` if used for images.

### 5.4 Performance
*   **Image Optimization:** Since images are optional, use lazy loading or placeholders to ensure the grid renders instantly.
*   **State Rendering:** Use `React.memo` on the Product Grid items to prevent re-rendering the entire grid when only one item's quantity changes.

---

## 6. Timeline & Milestones

*   **Phase 1: Foundation & Routing (Week 1)**
    *   Setup TanStack Router routes (`/`, `/settings`, `/products`).
    *   Initialize Tailwind and Shadcn UI theme.
*   **Phase 2: Product Management (Week 2)**
    *   CRUD operations for products.
    *   Local Storage persistence logic.
    *   JSON Export/Import logic.
*   **Phase 3: The Tally Engine (Week 3)**
    *   Grid layout implementation (responsive logic).
    *   State logic (Adding items, calculating total).
    *   Inline input interaction design.
*   **Phase 4: PWA & Polish (Week 4)**
    *   Add PWA manifest.
    *   Dark mode testing.
    *   Mobile responsiveness stress testing.

---

## 7. Open Questions / Risks

| Item | Risk & Mitigation |
| :--- | :--- |
| **Data Persistence (The Tally)** | **Question:** The prompt says "No saving." If the user accidentally refreshes the browser during a transaction, should the current tally be lost?<br><br>**Recommendation:** Implement a "Session Persistence" (saved in memory but wiped on close) or a very basic "Save Current Tally" button, but strictly clarify this is **not** accounting data. |
| **Image Storage** | **Question:** If users add image URLs, are they safe to store in LocalStorage (string length limits)?<br><br>**Mitigation:** Limit images to small icons or advise users to use hosted URLs. Store only URLs, not base64 blobs. |
| **Decimal Handling** | **Question:** How to handle currencies with 3 decimal places or complex rounding?<br><br>**Mitigation:** Use a strict utility function for money math (e.g., `cents` as integers or `Intl.NumberFormat`) to avoid `0.1 + 0.2 = 0.3000000004` errors. |