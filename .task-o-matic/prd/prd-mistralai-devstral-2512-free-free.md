Here’s a comprehensive **Product Requirements Document (PRD)** for **Tiny-Till**, structured to align with your vision while ensuring technical feasibility and clarity.

---

# **Product Requirements Document (PRD) – Tiny-Till**

## **1. Overview**
### **Executive Summary**
Tiny-Till is a **local-first**, lightweight web app designed for on-the-go sellers (e.g., farmers' market vendors, bakers, delivery tours) to simplify tallying sales without relying on internet connectivity. It replaces manual calculator-based tallying with an intuitive, fast, and visually organized interface.

### **Problem Statement**
Small vendors (e.g., bakers, farmers) struggle with:
- Manual tallying errors using calculators.
- Lack of a simple, offline-friendly tool for quick price calculations.
- Overly complex POS systems that don’t fit their needs.

### **Value Proposition**
- **Offline-first**: Works without internet (data stored in browser).
- **Minimalist UI**: Optimized for speed (grid-based product selection).
- **No accounting overhead**: Purely for real-time tallying (no persistent storage).
- **Customizable**: Adjustable grid layouts, themes, and catalog management.

---

## **2. Objectives**
### **Key Goals**
#### **Business Goals**
- Provide a **free, open-source** tool for small vendors.
- Reduce manual errors in tallying sales.
- Improve vendor efficiency during transactions.

#### **Technical Goals**
- **Local-first**: All data stored in `localStorage` (no backend required).
- **Responsive**: Works on mobile (2-3 columns) and tablet (4-6 columns).
- **Fast interactions**: Inline editing, quick product selection.

### **Success Metrics (KPIs)**
- **User Adoption**: # of active installations (if distributed as PWA).
- **Error Reduction**: % decrease in manual tallying mistakes (user-reported).
- **Performance**: <1s load time, <100ms UI response.

---

## **3. Target Audience**
### **User Personas**
| **Persona**       | **Needs**                          | **Pain Points**                     |
|-------------------|------------------------------------|-------------------------------------|
| **Baker (Delivery Tour)** | Quick tallying, minimal setup      | Calculator errors, slow input       |
| **Farmers’ Market Vendor** | Offline use, simple UI           | No internet, complex POS systems    |

### **User Stories**
1. **As a baker**, I want to add products quickly so I can tally sales during my delivery tour.
2. **As a vendor**, I want to see a grid of products to tap and count items faster.
3. **As a user**, I want to export/import my catalog to reuse it across devices.

---

## **4. Features**
### **4.1 Core Features (MVP)**
#### **1. Product Management**
- **Add/Remove Products**:
  - Inline form (name + price, optional image).
  - "+" button at the top; edit via pencil icon.
- **List View**:
  - Sortable (drag-and-drop or alphabetical).
  - Search/filter (if catalog grows).

**Acceptance Criteria**:
- Products persist in `localStorage`.
- Validation: Price must be a number (e.g., `5.99`).

#### **2. Tally Page**
- **Grid Layout**:
  - Mobile: 2-3 columns; Tablet: 4-6 columns (configurable in settings).
  - Compact/normal density toggle.
- **Interactions**:
  - Tap product → increments count (displayed on card).
  - Tap count → opens input to edit quantity (with "Remove" button).
  - **Total Calculation**: Live sum at the bottom.

**Acceptance Criteria**:
- Grid adapts to screen size (CSS Grid/Flexbox).
- Count updates in real-time.

#### **3. Settings Page**
- **Display**:
  - Theme (light/dark/system).
  - Grid density (compact/normal).
- **Data**:
  - Import/export catalog (JSON file).

**Acceptance Criteria**:
- Settings saved to `localStorage`.
- Export generates a downloadable JSON.

### **4.2 Future Features (Post-MVP)**
- **Barcode Scanner**: Quick product lookup.
- **Multi-Currency**: For vendors selling in different regions.
- **PWA Support**: Installable as a mobile app.

---

## **5. Technical Requirements**
### **Tech Stack**
| **Component**   | **Technology**                     |
|-----------------|------------------------------------|
| **Frontend**    | React + TypeScript + TanStack Router |
| **UI**          | Tailwind CSS + shadcnUI            |
| **State**       | Zustand/Jotai (lightweight)        |
| **Storage**     | `localStorage` (no backend)        |
| **Build**       | Vite (fast HMR)                    |

### **System Architecture**
- **Single-Page App (SPA)**:
  - No backend (all logic in frontend).
  - Data flows: `UI → State → localStorage`.
- **Offline-First**:
  - No API calls; all data stored locally.

### **Security & Performance**
- **Security**:
  - No sensitive data (no auth needed).
  - Sanitize JSON imports to prevent XSS.
- **Performance**:
  - Lazy-load images (if added).
  - Optimize re-renders (React.memo).

---

## **6. Timeline & Milestones**
| **Phase**       | **Duration** | **Deliverables**                     |
|-----------------|--------------|--------------------------------------|
| **MVP**         | 2-3 weeks    | Core features (product mgmt + tally) |
| **Polish**      | 1 week       | Settings, responsive tweaks          |
| **Post-MVP**    | Ongoing      | Barcode scanner, PWA                 |

---

## **7. Open Questions / Risks**
### **Risks**
- **Data Loss**: `localStorage` is cleared if browser cache is wiped.
  - *Mitigation*: Add a "Backup Reminder" in settings.
- **Mobile UX**: Fat-finger errors on small screens.
  - *Mitigation*: Test grid sizing on real devices.

### **Open Questions**
- Should we support **bulk product import** (CSV/JSON) in MVP?
- Is **image upload** critical, or can it wait for post-MVP?

---

### **Next Steps**
1. **Prototype**: Build the tally grid with dummy data.
2. **Validate**: Test with your baker for feedback.
3. **Iterate**: Adjust grid sizing based on real-world use.

This PRD ensures Tiny-Till is **focused, feasible, and user-centric**.