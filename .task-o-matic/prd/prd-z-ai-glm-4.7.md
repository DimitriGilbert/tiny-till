# Product Requirements Document: tiny-till

## 1. Overview

### Executive Summary
**tiny-till** is a lightweight, local-first web application designed for mobile vendors (e.g., farmers markets, delivery routes) to quickly calculate sales totals. It serves as a digital replacement for physical calculators, offering a faster, more visual way to tally items without relying on internet connectivity or complex accounting software.

### Problem Statement
Small-scale sellers operating in mobile environments often face poor or non-existent internet connectivity. Existing Point of Sale (POS) systems are typically cloud-dependent, overly complex, or require expensive hardware. Consequently, many sellers resort to manual calculators or paper, which are prone to errors, slow to use, and difficult to track for inventory consistency.

### Value Proposition
*   **Offline Reliability:** 100% local-first architecture ensures functionality in dead zones.
*   **Speed:** Grid-based interface allows for rapid, single-tap entry of items.
*   **Simplicity:** Zero setup latency and a clutter-free UI focused solely on tallying, not accounting.
*   **Portability:** Responsive design optimized for smartphones and tablets.

## 2. Objectives

### Key Goals
*   **Business Goal:** Reduce the time a seller spends calculating an order by 50% compared to a standard calculator.
*   **Technical Goal:** Achieve <100ms latency on all user interactions (taps, inputs) using local state management.
*   **User Goal:** Provide an error-proof calculation method that visualizes the quantity of every item added.

### Success Metrics (KPIs)
*   **Session Success Rate:** Percentage of sessions where the total is successfully calculated and displayed without app crashes.
*   **Setup Efficiency:** Time taken to add 10 standard products to the catalog (< 2 minutes target).
*   **User Retention (Qualitative):** Feedback on ease of use regarding the "Tally" grid vs. manual calculation.

## 3. Target Audience

### User Personas
*   **The Mobile Vendor (Primary):** Sells goods at markets, pop-ups, or via delivery trucks. Uses a smartphone or tablet. Needs big buttons, high contrast, and zero friction.
*   **The Casual Seller:** Sells items occasionally (garage sales, bake sales). Needs a "pick up and go" tool with no login requirement.

### User Stories
1.  **Catalog Management:** As a seller, I want to input my product names and prices once so that I don't have to re-type prices for every customer.
2.  **Quick Tallying:** As a seller, I want to tap a large button representing a product to add it to the total immediately.
3.  **Error Correction:** As a seller, I want to easily adjust the quantity of an item if I accidentally tap it too many times or need to remove an item.
4.  **Offline Access:** As a seller, I want the app to work perfectly even if my market stall has no cellular signal.
5.  **Data Portability:** As a seller, I want to export my product list so I can back it up or share it with a colleague.

## 4. Features

### 4.1 Core Features (MVP)

#### A. Product Management (Catalog)
**Description:** A CRUD interface to manage the list of sellable items. Data is stored locally in the browser.
*   **UI Layout:** List view.
*   **Add Product:** An input field at the top of the list to add Name and Price. "Add" button saves to local state.
*   **Edit/Delete:** Action buttons on each list item to Edit details or Remove from catalog.
*   **Image Support:** Optional URL or file input for product images (stored as Base64 or Blob references).
*   **Acceptance Criteria:**
    *   User can add a product with a name (string) and price (number).
    *   Prices support up to 2 decimal places.
    *   List persists after page refresh (using `localStorage` or `IndexedDB`).
    *   User can delete a product.

#### B. The Tally Page (POS Interface)
**Description:** The primary interface for calculating sales during a transaction.
*   **Responsive Grid:**
    *   Mobile: 2-3 items per row.
    *   Tablet: 4-6 items per row.
    *   User can toggle between "Normal" and "Compact" view in settings.
*   **Interaction:**
    *   **Tap Card:** Adds 1 to the quantity of that product. Updates the running total immediately.
    *   **Visual Feedback:** The quantity badge appears on the card when count > 0.
    *   **Edit Quantity:** Clicking the *quantity badge* triggers an inline input modal/popover allowing manual entry of numbers.
    *   **Remove:** Inside the quantity edit view, a "Remove" or "Clear" button resets count to 0.
*   **Total Display:** A sticky footer or header showing the grand total of the current tally.
*   **Reset:** A "Clear Cart" button to reset all quantities to zero for the next customer.
*   **Acceptance Criteria:**
    *   Tapping a product increases the count and total price instantly.
    *   Grid layout adjusts correctly based on screen width and settings.
    *   Manual quantity entry works (e.g., typing "12" sets count to 12).

#### C. Settings Page
**Description:** Configuration for the app's behavior and look.
*   **Theme:** Toggle between Light/Dark mode.
*   **Display Density:** Toggle grid density (Normal vs. Compact).
*   **Data Management:**
    *   **Export:** Download current catalog as a JSON file.
    *   **Import:** Upload a JSON file to overwrite/merge current catalog.
*   **Acceptance Criteria:**
    *   Changing the theme updates UI immediately.
    *   Export generates a valid JSON file of the product array.
    *   Import parses JSON and updates the product list.

### 4.2 Future Features (Post-MVP)
*   **Currency Formatting:** Settings to change currency symbol ($, €, £) and localization.
*   **Quick Categories:** Tabs to filter products by category (e.g., "Bread," "Pastries").
*   **PWA Support:** "Add to Home Screen" capability for a native-app-like experience.
*   **Receipt Generation:** A simplified view to hand the phone to the customer showing the itemized list.

## 5. Technical Requirements

### Tech Stack (Constrained)
*   **Framework/Core:** React (implied by TanStack Router/Shadcn context).
*   **Routing:** TanStack Router (File-based routing).
*   **Styling:** Tailwind CSS (Utility-first).
*   **UI Components:** Shadcn UI (Radix UI primitives + Tailwind).
*   **Language:** TypeScript.
*   **State Management:** React Context API or Zustand (for global catalog/cart state).
*   **Icons:** Lucide React (standard for Shadcn).

### System Architecture
*   **Local First Architecture:**
    *   The app will have **no backend**.
    *   All data (Product Catalog) persists in the browser using `localStorage` (for text data) and `IndexedDB` (if storing large images). Given the "tiny" scope, `localStorage` for a JSON object is sufficient for MVP.
    *   The "Cart" (Current Tally) is held in memory (React State) and is reset on refresh unless explicitly persisted (Session Storage).

### Data Model (TypeScript Interface)
```typescript
interface Product {
  id: string; // UUID
  name: string;
  price: number;
  imageUrl?: string; // Optional base64 or URL
}

interface CartItem {
  productId: string;
  quantity: number;
}
```

### Security and Performance
*   **Performance:** Ensure images are resized/compressed before saving to `localStorage` to prevent quota limits (typically 5MB). Lazy load images in the grid.
*   **Security:** Since this is local-only and input-only, the risk is low. However, sanitize inputs to prevent XSS if rendering user-provided HTML/names. No sensitive data is transmitted.

## 6. Timeline & Milestones

*   **Phase 1: Setup & Core Logic (Week 1)**
    *   Initialize TanStack Router + Shadcn.
    *   Define Data Models.
    *   Implement `localStorage` hooks for CRUD operations on Products.
*   **Phase 2: Tally UI Implementation (Week 1-2)**
    *   Build responsive Grid component.
    *   Implement Add-to-cart logic and Total calculation.
    *   Implement "Edit Quantity" modal.
*   **Phase 3: Settings & Polish (Week 2)**
    *   Implement Settings page (Theme/Import/Export).
    *   Responsive tweaks for mobile vs tablet.
    *   Accessibility check (ARIA labels).
*   **Phase 4: Testing & Deployment (Week 3)**
    *   Manual testing on mobile devices (iOS/Android).
    *   Deploy to static hosting (Vercel/Netlify/GitHub Pages).

## 7. Open Questions / Risks

*   **Storage Limits:** `localStorage` has a limit of ~5MB. If the user adds high-resolution images for products, this quota will be hit quickly.
    *   *Mitigation:* Enforce image compression or limit image size/quality upon upload. For MVP, rely on text-only or external URLs.
*   **State Hydration:** If the user accidentally closes the browser tab during a sale, the current tally (cart) is lost.
    *   *Risk:* Low/Medium.
    *   *Mitigation:* Use `sessionStorage` or a simple "Save Draft" toast, though the prompt implies ephemeral state ("purely to calculate price"). We will stick to ephemeral for simplicity unless testing shows otherwise.
*   **Browser Compatibility:** TanStack Router requires modern browsers. Ensure target users (potentially older devices on markets) have updated browsers.