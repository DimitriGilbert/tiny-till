# Product Requirements Document (PRD)  
**Project:** **TinyTill** – A lightweight, offline‑first web POS for market stalls and on‑the‑go sellers  

---  

## 1. Overview  

**Executive Summary**  
TinyTill is a small, self‑contained web application that acts as a digital price‑calculator/till for sellers who operate in environments with intermittent or no internet connectivity (farmers‑market stalls, delivery drivers, pop‑up shops, etc.). The app runs entirely in the browser, stores all data locally, and provides three core screens:

1. **Product Management** – add, edit, remove products (name, price, optional image).  
2. **Tally Page** – a grid of product “cards” that can be tapped to increment a running total for that item.  
3. **Settings** – theme selection, display mode (compact / normal), and catalog import/export.

The goal is to eliminate the need for manual calculators or paper tally sheets, giving sellers a fast, tactile, and reliable way to ring up purchases while keeping the UI ultra‑simple.

**Problem Statement**  
- Vendors currently rely on handheld calculators or paper‑based tallies, which are error‑prone and slow.  
- Existing POS solutions require constant internet, heavy setup, and are overkill for low‑volume transactions.  
- Lack of a portable, offline‑first tool forces sellers to carry multiple devices or perform mental arithmetic.

**Value Proposition**  
- **Offline‑First**: All data persisted in the browser’s IndexedDB; works with spotty or no internet.  
- **Minimalist UI**: Only three screens; each interaction is a single tap or inline edit.  
- **Lightweight Stack**: Built with React‑like TanStack Router, TypeScript, Tailwind CSS, and Shadcn UI – all already in the starter repo.  
- **Fast Tallying**: Grid of product cards with inline quantity input; instant price summation.  
- **Portable Catalog**: Import/export lets sellers back up or share product lists via JSON files.

---  

## 2. Objectives  

| Category | Goal | Success Metric |
|----------|------|----------------|
| **Business** | Provide a tool that lets market sellers complete a transaction in ≤ 5 seconds per item. | 80 % of test users can complete a mock checkout within 5 s/item after 1 week of use. |
| **Technical** | Deliver a production‑ready MVP with < 1 k lines of core code (excluding UI library). | Bundle size ≤ 250 KB gzipped; startup time < 1 s on a low‑end device. |
| **User Experience** | Ensure the tally operation can be performed with one hand on a mobile screen. | 90 % of participants rate the “one‑hand tally” flow ≥ 4/5 on SUS (System Usability Scale). |
| **Reliability** | Zero data loss on refresh/crash (use atomic IndexedDB writes). | 99.9 % success rate on simulated power‑loss tests. |

---  

## 3. Target Audience  

### Personas  

| Persona | Role | Pain Points | Desired Outcome |
|---------|------|-------------|-----------------|
| **Maria – Weekend Baker** | Mobile vendor, delivers twice a week | Uses a handheld calculator; frequently mis‑adds quantities; no easy way to backup product list. | Quick add‑tap UI; automatic tally total; ability to restore product catalog on a new phone. |
| **Jamal – Farmer’s Market Stall Owner** | Small‑scale producer, sells 10–30 items per day | Limited internet; needs to switch between cash and card receipts quickly. | Offline operation; simple “cash‑only” mode; theme that matches market branding. |
| **Leila – Pop‑up Shop Manager** | Organizes temporary stalls at events | Needs to re‑configure product list often for different events. | Easy import/export of catalog; ability to toggle display density (compact vs normal). |

### User Stories  

1. **Add a product** – *As a seller, I want to tap “+” and fill a modal with name, price, and optional image so I can start selling instantly.*  
2. **Edit a product inline** – *When I long‑press a product card, I want the fields to become editable directly in the list without leaving the screen.*  
3. **Add quantity** – *On the tally page, I want to tap a product card to open a numeric input where I can type how many units I’m charging; pressing “✓” updates the total.*  
4. **Remove a line item** – *If I add the wrong quantity, I need a “✖” button to delete that entry before finalizing the total.*  
5. **Switch theme** – *I want to choose a light/dark theme so the UI matches my booth’s lighting.*  
6. **Backup catalog** – *I want to export my product list to a JSON file and later import it on another device.*  

---  

## 4. Features  

### 4.1 Core Features (MVP)  

| Feature | Description | Acceptance Criteria |
|---------|-------------|----------------------|
| **Product Management** | • Global product list stored in IndexedDB.<br>• “+” button opens a modal with fields: `name`, `price` (currency input), optional `imageUrl`.<br>• List displays each product with **Edit** (pen icon) and **Delete** (trash icon) actions.<br>• Inline edit mode: clicking the pen swaps the row into an input state; pressing **Save** persists changes. | 1. New product appears in the list immediately.<br>2. Editing a field updates the stored record on **Save**.<br>3. Deleting removes the product after a confirmation dialog.<br>4. Images are displayed as thumbnails (150 × 150) with fallback icon. |
| **Tally Page** | • Grid layout (dynamic).<br>• Each product card shows name, price, thumbnail, and a counter badge.<br>• Tap a card → opens a numeric input with “+”/“‑” stepper and a **Confirm** button.<br>• Input accepts integer ≥ 1; pressing **Confirm** adds `price × quantity` to a running **subtotal**.<br>• Sub‑total is displayed at the top, with a **Print/Reset** button that clears all counters. | 1. Tapping a card opens the quantity modal without navigation.<br>2. Quantity modifies the product’s counter badge in real time.<br>3. Sub‑total updates instantly and matches manual calculation (price × qty).<br>4. “Print/Reset” clears all counters and resets subtotal to $0. |
| **Settings Page** | • Theme toggle (light / dark).<br>• Display mode toggle: **Compact** (show only name & price badge) vs **Normal** (full card with image).<br>• Import/Export catalog: upload/download a `catalog.json` containing an array of product objects (`id`, `name`, `price`, `imageUrl`). | 1. Theme change persists across sessions via `localStorage` and updates instantly.<br>2. Toggle between compact/normal recomputes grid columns (`auto-cols-2`, `auto-cols-3`, `auto-cols-4`).<br>3. Import validates JSON schema; on success, replaces current catalog and shows a toast “Catalog imported”.<br>4. Export downloads a file with correct MIME type and filename (`tiny-till-catalog.json`). |

### 4.2 Future Features (Post‑MVP)  

| Feature | Rationale |
|---------|-----------|
| **Multiple Checkouts** – ability to keep several separate tallies open (e.g., for cash vs credit). | Some sellers need to split payments. |
| **QR/Barcode Scan** – integrate a camera scanner to add products by barcode. | Reduces typing for large catalogs. |
| **Export to PDF / Print** – generate a receipt PDF to email or print locally. | Formal record for customers. |
| **Multi‑Currency Support** – allow switching between currencies (e.g., USD/EUR). | Expands market reach. |
| **User Authentication** – optional cloud‑sync encrypted with a password. | For vendors who manage multiple stalls. |

---  

## 5. Technical Requirements  

### 5.1 Tech Stack  

| Layer | Recommended Technology |
|-------|------------------------|
| **Frontend Framework** | React 18 (via Vite) with **TanStack Router** for routing. |
| **Styling** | **Tailwind CSS** (v3) – utility‑first classes; custom variants for grid density. |
| **UI Components** | **shadcn/ui** – pre‑built, accessible components (Button, Card, Dialog, Input, etc.). |
| **State Management** | **Zustand** or **Jotai** (lightweight) – store product list & tally state. |
| **Persistence** | **IndexedDB** via **idb** library; atomic writes with `await` to guarantee crash‑safety. |
| **Type Safety** | **TypeScript 5.x** – strict mode (`noImplicitAny`, `strictNullChecks`). |
| **Build & Lint** | Vite + ESLint + Prettier. |
| **Testing** | Vitest for unit tests; React Testing Library for component tests. |
| **Integrations** | `expo-camera` (if mobile PWA later) for barcode scanning; `file-saver` for export. |

### 5.2 System Architecture Overview  

```
+---------------------------------------------------+
|                     Browser                        |
|  +----------------+   +-------------------+     |
|  |  UI Layer      |   |  State Layer      |     |
|  | (React + Tailwind + shadcn)   |             |
|  +----------------+   +-------------------+     |
|          |                       |                |
|          v                       v                |
|  +----------------+   +-------------------+    |
|  |  Router (TanStack)        |  IndexedDB       |
|  +----------------+   +-------------------+    |
|          |                       |                |
|          v                       v                |
|  +----------------+   +-------------------+    |
|  |  Services      |   |  Utils (idb, JSON) |    |
|  +----------------+   +-------------------+    |
+---------------------------------------------------+
```

- **Router**: `/product-management`, `/tally`, `/settings` paths.  
- **State**: Global store holds `catalog` (array of products) and `tally` (running subtotal + per‑product counters).  
- **Persistence**: On every change, write a JSON blob to IndexedDB; on app start, load and hydrate the store.  
- **Offline Guarantee**: All UI actions are local‑only; no network calls.  

### 5.3 Functional Requirements  

| Requirement | Detail |
|-------------|--------|
| **Responsive Grid** | Use CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));` with breakpoints for mobile (≥ 320 px), tablet (≥ 640 px). |
| **Keyboard‑First** | All actions reachable via Tab/Enter; counter input supports numeric keypad on mobile keyboards. |
| **Accessibility** | ARIA labels on buttons, focus trapping in modals, contrast ratio ≥ 4.5:1 for text/background. |
| **Security** | No external API keys; any file upload validated with MIME type & size (< 5 MB). |
| **Internationalization (i18n)** | Wrap UI strings with `react-i18next`; default `en-US`. |
| **Performance** | Lazy‑load images; debounce UI updates when bulk editing. |
| **Error Handling** | Show toast notifications for validation errors; modal dialogs for destructive actions. |

### 5.4 Non‑Functional Requirements  

| Requirement | Target |
|-------------|--------|
| **Bundle Size** | ≤ 250 KB gzipped (excluding Tailwind utilities). |
| **Startup Time** | < 1 s on low‑end Android 5 (Chrome). |
| **Offline Persistence** | 99.9 % write success on simulated power loss (tested with `idb` `onversionchange`). |
| **Maintainability** | Code coverage ≥ 80 % unit tests; lint rule violations < 5 per PR. |
| **Scalability** | Architecture should allow adding up to 500 products without UI lag. |

---  

## 6. Timeline & Milestones  

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **0 – Kick‑off & Setup** | 1 day | Repo initialization, CI pipeline (lint, test), design system review. |
| **1 – Core UI Scaffold** | 3 days | Routing skeleton (`/product-management`, `/tally`, `/settings`); Tailwind config; shadcn component library wired. |
| **2 – Product Management** | 5 days | Modal form, inline edit, IndexedDB CRUD, image upload preview, tests. |
| **3 – Tally Engine** | 4 days | Grid component, tap‑to‑quantity flow, subtotal calculator, reset/print button. |
| **4 – Settings & Extras** | 3 days | Theme toggle, display‑mode switch, import/export JSON functions, persistence on reload. |
| **5 – QA & Polish** | 2 days | Accessibility audit, performance profiling, bug‑fix sprint. |
| **6 – Release Candidate** | 1 day | Build optimization, generate `index.html` with offline manifest, upload to Netlify/Vercel preview. |
| **7 – Post‑Launch** | Ongoing | Collect feedback, plan post‑MVP features. |

**Total Estimated Time:** ~19 working days (≈ 4 weeks) assuming 1–2 developers.

---  

## 7. Open Questions / Risks  

| Question | Impact | Mitigation |
|----------|--------|------------|
| **Image Storage** – How will users capture or provide product images without internet? | May limit visual catalog richness. | Allow image URLs from public hosts; fallback to a generic product icon; store base64 only for small icons (< 100 KB). |
| **IndexedDB Schema Evolution** – Adding fields later (e.g., tax rate) could break existing data. | Potential data loss on major version bump. | Version the DB schema; on upgrade, migrate records gracefully and prompt user if migration needed. |
| **Browser Compatibility** – Some low‑end browsers lack full IndexedDB support. | App may fail to save data. | Detect support on load; if unavailable, fallback to `localStorage` with a warning; recommend modern browsers. |
| **User Data Backup** – Export flow creates a file; how will users transfer it to another device? | Adoption barrier for non‑technical users. | Provide a QR‑code that encodes the file URL for sharing via Bluetooth or email; add a “copy to clipboard” fallback. |
| **Performance with Large Catalogs** – Rendering > 200 items in grid could lag. | UI becomes unresponsive on older phones. | Implement virtualized list (e.g., `react-window`) once catalog exceeds 100 items. |
| **Testing on Real Devices** – Simulators may not replicate slow network/CPU. | Late‑stage performance surprises. | Set up a device‑farm (BrowserStack / local Android devices) for weekly smoke tests. |

---  

### Next Steps  

1. **Confirm Scope** – Prioritize features (must‑have vs nice‑to‑have).  
2. **Create UI Mockups** – Quick Figma/Adobe XD prototypes for each screen.  
3. **Sprint Planning** – Break down tasks into JIRA/Trello tickets.  
4. **Set Up CI** – Add lint, test, and build steps to GitHub Actions.  

*Prepared by:*  
**[Your Name]** – Product Manager / Technical Architect  
*Date:* 2025‑11‑03  

---  

*All specifications are subject to refinement after stakeholder review.*