# Product Requirements Document (PRD)  
**Project:** **tiny‑till** – a local‑first, offline‑friendly web POS till for on‑the‑go sellers (farmers‑market stalls, pop‑up shops, delivery bakers, etc.)  

---

## 1. Overview  

| Item | Description |
|------|-------------|
| **Executive Summary** | *tiny‑till* is a minimalist, offline‑first web application that acts as a digital cash register for small vendors. It lets users create a product catalog, select items on a grid, and instantly see price tallies and quantities. No data persistence or accounting features – it is purely a calculation aid for transactions. |
| **Problem Statement** | Vendors (e.g., a baker who delivers twice a week) currently rely on manual calculators or paper notes to keep track of item quantities while serving customers at a stall. This leads to errors, slower service, and frustration, especially when internet connectivity is spotty. |
| **Value Proposition** | - **Local‑first**: All data lives in the browser, works offline, and syncs only when the user explicitly chooses to import/export.<br>- **Speed & Simplicity**: Immediate product selection on a responsive grid; one‑tap addition; minimal UI clutter.<br>- **Customizable UI**: Theme and layout switching, inline editing of product details, and granular control over grid density.<br>- **Tech‑fit**: Built with the existing stack – React‑based, using **TanStack Router**, **TypeScript**, **TailwindCSS**, and **shadcn UI** – requiring no new server or database. |

---

## 2. Objectives  

| Objective | Category | Success Metrics (KPIs) |
|-----------|----------|------------------------|
| **Core MVP Launch** | Business | • 0 critical bugs in production<br>• 90%+ of pilot users rate usability ≥ 4/5 in post‑survey |
| **Offline‑first reliability** | Technical | • 100% functional on Chrome/Firefox when offline (no network request required) |
| **Fast onboarding** | Business | • New users can create a product catalog and start tallying within 2 minutes of first launch |
| **Accessibility** | Technical | • WCAG AA compliance for all interactive elements |
| **Future‑proof extensibility** | Technical | • Codebase coverage ≥ 80 % unit test and ≥ 60 % integration test |
| **Community adoption** | Business | • 50+ GitHub stars within 3 months of public release<br>• At least 5 external contributors |

---

## 3. Target Audience  

### 3.1 User Personas  

| Persona | Description | Primary Needs |
|---------|-------------|---------------|
| **Pop‑up Vendor** | 20‑40 y/o, runs a weekly market stall, sells 5‑15 SKUs, limited tech experience, often offline. | Quick item selection with one‑tap, clear price total, no learning curve. |
| **Mobile Food Truck Owner** | 30‑55 y/o, sells multiple food items, needs to take cash payments on the go, wants to switch between compact and spacious UI depending on device. | Adjustable grid density, persistent theme, easy addition of new items. |
| **Home Baker / Delivery Person** | 25‑45 y/o, delivers baked goods twice a week, uses a tablet on a tablet stand. | Simple tally with quantity input, inline edit of product name/price, optional photo support. |

### 3.2 User Stories  

| ID | As a … | I want … | So that … |
|----|--------|----------|-----------|
| US‑01 | Vendor | to add a new product (name, price, optional image) directly from the product list. | I can build my catalog without leaving the app. |
| US‑02 | Vendor | to edit product details inline (name or price) without opening a separate modal. | I can correct mistakes instantly. |
| US‑03 | Vendor | to view a product grid that auto‑adjusts to screen size (2‑3 items per row on mobile, 4‑6 on larger devices). | I can find items quickly on any device. |
| US‑04 | Vendor | to tap a product card to open a quantity entry field, increase/decrease quantity, and confirm with a checkmark. | I can instantly see how many units I’m charging for. |
| US‑05 | Vendor | to reset the tally with one click. | I can start a fresh transaction quickly. |
| US‑06 | Vendor | to import/export a JSON catalog from my device storage. | I can back up my product list before switching devices. |
| US‑07 | Vendor | to switch between light, dark, and system‑theme via the settings page. | I can match my environment or personal preference. |
| US‑08 | Vendor | to see a compact “minimum UI” mode that hides the grid header and reduces padding. | I can fit more items on a small tablet screen. |
| US‑09 | Future User | to add a receipt export (PDF) for basic record‑keeping. | I can optionally keep a transaction history without complicating the core flow. |

---

## 4. Features  

### 4.1 Core Features (MVP)  

| Feature | Description | Acceptance Criteria |
|---------|-------------|----------------------|
| **Product Management** | • List of products displayed with “Add New” button at the top.<br>• Inline editing of **name** and **price** on double‑click or tap‑hold.<br>• Optional upload of a square image thumbnail (max 300 KB). | - Adding a product opens a small modal with fields pre‑filled with current values.<br>- Changes are persisted in **localStorage** instantly.<br>- Save button is disabled until both fields contain valid input (non‑empty name, numeric price ≥ 0). |
| **Tally Page** | • Responsive grid of product cards (2‑3 per row on ≥ 320 px width, up to 6 per row on ≥ 1024 px).<br>• Tap a card → overlay with numeric input field for quantity and a **‑ / +** stepper, plus a **Remove** (trash) button.<br>• Real‑time total sum displayed at the bottom (currency‑formatted). | - Quantity input accepts only positive integers; decrement button disables at 0.<br>- Selecting **Check** (or pressing **Enter**) adds the quantity to the tally and closes the overlay.<br>- Tapped product card updates the quantity field with the previously entered value (or 1 if none). |
| **Tally Result** | • Shows **subtotal**, optionally **tax** toggle, and **grand total**.<br>• “Clear All” button to reset count to zero. | - Subtotal updates instantly as items are added/removed.<br>- Tax toggle (0‑% vs 7‑% or custom) instantly recalculates grand total. |
| **Settings Page** | • Theme selector: *Light / Dark / System*.<br>• Grid density control: **Compact / Normal / Spacious**.<br>• Import / Export of product catalog (JSON). | - Theme change reflects instantly across the app (CSS variables update).<br>- Density toggle updates grid gap and row count within 300 ms.<br>- Export downloads a `.json` file named `tiny-till-catalog-<timestamp>.json`; Import reads a selected file and merges items into local catalog without duplicates. |
| **Offline Persistence** | All catalog data lives in **IndexedDB** via `idb-keyval` (or localStorage fallback). | - On app restart, previously added products are loaded.<br>- No server calls are made during normal operation. |

### 4.2 Future Features (Post‑MVP)  

| Feature | Rationale | Target Release |
|---------|-----------|----------------|
| **Receipt Export (PDF / CSV)** | Enable users to generate a printable receipt for cash‑box entry. | Q3 2025 |
| **Multi‑Currency Support** | Allow vendors operating in neighboring regions with different currencies. | Q4 2025 |
| **Barcode/QR Scanner Integration** | Scan product tags to auto‑populate catalog entries. | Q1 2026 |
| **Sync Across Devices** | Cloud‑based sync (optional) for users with multiple phones/tablets. | Q2 2026 |
| **Advanced Tax Rules Engine** | Configurable tax rates per product category. | Q3 2026 |
| **Analytics Dashboard** | Show daily/weekly volume, most‑sold items. | Q4 2026 |

---

## 5. Technical Requirements  

### 5.1 Stack Recommendation  

| Layer | Technology | Version (as of PRD) |
|-------|------------|----------------------|
| **Frontend Framework** | React 18 (via Create‑React‑App or Vite) | 18.3.x |
| **Routing** | TanStack Router v1 | 1.92.x |
| **State Management** | Redux Toolkit (or Zustand if preferred) – only for UI state, not for persistence | 2.2.x |
| **Styling** | TailwindCSS v3 (JIT mode) | 3.4.x |
| **Component Library** | shadcn/ui (built on Headless UI + Tailwind) | 2.0.x |
| **TypeScript** | 5.4.x | 5.4.2 |
| **Persisted Storage** | `idb-keyval` for IndexedDB + fallback to `localStorage` | 6.2.x |
| **Testing** | Vitest + React Testing Library | 1.5.x |
| **Build & Dev** | Vite (fast dev server) | 5.2.x |
| **Lint/Format** | ESLint (airbnb config) + Prettier | 9.x / 3.3.x |

### 5.2 System Architecture Overview  

```
+-------------------+       +-------------------+       +-------------------+
|   Browser (SPA)   | <---> | TanStack Router   | <---> |   UI Components   |
|  (React + TS)     |       |   (RouteTree)     |       | (shadcn/ui)       |
+-------------------+       +-------------------+       +-------------------+
        ^      ^                           ^                     ^
        |      |                           |                     |
        |      |   localStorage / IndexedDB|                     |
        |      +-------------------->   Persistence Layer      |
        |                                          (catalog data)
        |
+-------------------+
|  Offline Service  |
|  (Workbox optional)|
+-------------------+

```

- **Routing**: Pages are rendered via lazy‑loaded routes: `/products`, `/tally`, `/settings`. Each route uses `React.lazy` + `Suspense` for code‑splitting.
- **State**: Only UI‑related temporary state (tally count, selected quantity) lives in a **global store**; catalog data lives in IndexedDB and is loaded on app start.
- **Offline**: All network requests are stubbed with a Service Worker (Workbox) that caches the static assets; no API calls are required for normal operation.
- **Accessibility**: All interactive elements are focusable, have ARIA labels, and follow WCAG AA contrast ratios.

### 5.3 Security & Performance  

| Concern | Requirement | Implementation |
|---------|-------------|----------------|
| **Data Sensitivity** | No personal or payment data stored; only product name, price, optional image URL. | Serve images via local URL or base64 data‑URI limited to 300 KB. |
| **XSS** | Prevent injection via user‑provided text (name) or image URLs. | Escape strings before rendering; enforce max length (e.g., 100 characters) on name. |
| **CSRF** | Not applicable (no external stateful server). | N/A |
| **Performance** | Grid rendering of up to 100 products at 60 fps on mobile. | Virtualized list for >30 items; lazy‑load images; use `React.memo` for pure components. |
| **Bundle Size** | < 200 KB gzipped JS for core features. | Tree‑shake unused Tailwind utilities, use dynamic imports for optional modules. |
| **Responsive Design** | Works on devices from 320 px width upwards. | Tailwind breakpoint utilities; CSS media queries fallback. |

---

## 6. Timeline & Milestones  

| Phase | Duration | Milestones / Deliverables |
|-------|----------|---------------------------|
| **0️⃣ Sprint 0 – Foundations** | 1 wk | • Repo setup with Vite + TypeScript + Tailwind<br>• Add TanStack Router skeleton<br>• shadcn UI component library bootstrap |
| **1️⃣ Core MVP – Product Management** | 2 wks | • Catalog list UI with Add/Edit inline<br>• Local storage (IndexedDB) persistence<br>• Unit tests for catalog actions |
| **2️⃣ Core MVP – Tally Page** | 2 wks | • Responsive grid implementation<br>• Quantity overlay with stepper & remove<br>• Real‑time subtotal/gross total<br>• Manual test plan & bug‑fix |
| **3️⃣ Core MVP – Settings & Offline** | 1 wk | • Theme toggle (system, light, dark)<br>• Grid density selector<br>• Import/Export JSON catalog<br>• Service‑worker caching (offline toggle) |
| **4️⃣ QA & Polish** | 1 wk | • Accessibility audit (axe, manual)<br>• Performance profiling (Lighthouse ≥ 90)<br>• Bug‑fix sprint |
| **5️⃣ Release & Documentation** | 1 wk | • Build production bundle, generate deployable `dist/`<br>• Create README, quick‑start guide, and user guide (PDF)<br>• Publish to npm (optional) & GitHub Pages |
| ** ⬆️ Buffer / Contingency** | 1 wk | • Allows for unforeseen bugs or scope adjustments |
| **Total** | **~8‑9 weeks** |  |

> **Note:** Each sprint is 5 working days (including a buffer day for review). The timeline assumes a single full‑time developer; parallel QA/testing can reduce calendar time.

---

## 7. Open Questions / Risks  

| Question | Impact | Proposed Mitigation |
|----------|--------|---------------------|
| **Maximum catalog size** – Should we impose a limit on the number of products (e.g., 500) to keep IndexedDB performance stable? | Too many entries may degrade adding/editing speed on low‑end devices. | Implement pagination or virtualization once catalog exceeds 200 items; store metadata only until that point. |
| **Image handling** – Will vendors want to upload photos from their device? How to handle storage limits? | Large images can bloat IndexedDB and affect load times. | Enforce size/resolution caps (max 300 KB, 400 × 400 px) and store images as Base64 strings only on user confirmation. |
| **Currency & locale** – Currently only one currency (presumably USD). | Vendors in other regions may need other symbols or formatting. | Abstract price formatting via `Intl.NumberFormat`; allow optional currency selector in settings (future feature). |
| **Testing coverage on low‑end browsers** – Target browsers include older Android WebViews. | May lead to CSS or JS compatibility issues. | Use PostCSS with autoprefixer; test on BrowserStack for Android 8‑10. |
| **User onboarding flow** – How to guide first‑time users to add their first product? | Could cause confusion if UI seems empty. | Inline welcome tooltip that auto‑opens “Add Product” modal on first launch. |
| **Future sync across devices** – If we later enable cloud sync, how to keep local‑first guarantee? | May introduce conflict resolution complexity. | Design data model around **CRDT** or **operational transformation** concepts early; keep sync as optional module. |
| **Internationalization** – Is there a need for multi‑language UI? | Affects copy length and layout. | Build strings via i18n (react‑i18next) from the start; keep UI directionality neutral. |

---

### Closing Statement  

*tiny‑till* aims to deliver a **lightweight, zero‑server, offline‑first cash register** that empowers small vendors to complete transactions quickly and with confidence. By adhering to the outlined MVP scope, clear success metrics, and a well‑structured tech stack, the project can be shipped within a realistic 8‑week window while leaving a solid foundation for future extensions.  

--- 

*Prepared by:* **[Your Name]**, Product Manager & Technical Architect  
*Date:* 2025‑11‑03  

--- 

**Next Steps:**  

1. Review the PRD with stakeholders (baker, market vendors).  
2. Confirm any additional constraints (e.g., max product count, image size).  
3. Break the MVP tasks into Jira/Trello tickets and assign estimates.  



---