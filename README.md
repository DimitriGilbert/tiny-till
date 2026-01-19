# Tiny-Till

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1-FF4154?logo=tanstack&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**A lightweight, local-first Progressive Web Application for quick tallying**

[Features](#-features) &nbsp;•&nbsp; [Tech Stack](#-tech-stack) &nbsp;•&nbsp; [Quick Start](#-quick-start) &nbsp;•&nbsp; [Documentation](#-documentation)

</div>

---

## 📖 Overview

**Tiny-Till** is a lightweight, local-first Progressive Web Application (PWA) designed for on-the-go sellers (bakers on delivery routes, farmers' market stall vendors) to replace physical calculators and manual tallying. It provides a fast, reliable, and offline-capable interface to calculate sales totals without the overhead of cloud-based POS systems.

### ✨ Key Features

- **🚀 Lightning Fast**: Tap-to-add grid interface for rapid tallying
- **📴 100% Offline**: Local-first architecture with no internet dependency
- **🎨 Beautiful UI**: Kawaii-inspired design with Shadcn UI components
- **🔒 Privacy First**: Ephemeral tally data - no transaction history stored
- **📱 Mobile Optimized**: Large touch targets, one-handed operation support
- **💾 Persistent Catalog**: Product catalog saved to IndexedDB
- **🌙 Dark Mode**: Light, dark, and system theme support
- **⚡ Type Safe**: Full TypeScript coverage with strict mode

### 🎯 Use Cases

- **Delivery Route**: Bakers making house-to-house deliveries in areas with poor reception
- **Market Stall**: Farmers managing high-volume queues at farmers' markets
- **Casual Selling**: Garage sales, pop-up shops, and occasional sellers
- **Quick Tally**: Any scenario requiring fast, manual tallying of items and prices

---

## 🚀 Features

### Core Features

- **📦 Product Catalog Management**
  - Inline add/edit/delete products
  - Product images (128x128px thumbnails)
  - JSON export/import for backup
  - Persisted in IndexedDB

- **🧮 Tally System**
  - Tap product cards to add quantities
  - Manual quantity input overlay
  - Real-time total calculation
  - Transient state (resets on refresh)

- **⚙️ Settings**
  - Theme management (light/dark/system)
  - Grid density (normal/compact)
  - Column count override
  - Backup reminders

- **🔐 Navigation Guards**
  - Prevents accidental navigation with active tally
  - Browser beforeunload protection
  - Clear confirmation dialogs

### Technical Highlights

- **File-Based Routing**: TanStack Router with type-safe navigation
- **State Management**: Zustand with persist middleware
- **Storage Layer**: IndexedDB for catalog, localStorage for settings
- **UI Components**: Shadcn UI with Tailwind CSS v4
- **Type Safety**: Strict TypeScript with shared types package
- **Monorepo**: Turborepo for optimized builds

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Library | 19 |
| **TypeScript** | Type Safety | 5 |
| **TanStack Router** | Routing | 1 |
| **Zustand** | State Management | 4 |
| **Tailwind CSS** | Styling | 4 |
| **Shadcn UI** | Component Library | Latest |
| **idb-keyval** | IndexedDB Wrapper | 7 |
| **Turborepo** | Monorepo | 2.7 |
| **Vite** | Build Tool | 6 |

### Architecture

```
┌─────────────────────────────────────────┐
│           React 19 Components          │
├─────────────────────────────────────────┤
│        TanStack Router v1              │
├─────────────────────────────────────────┤
│    ┌────────────┐  ┌────────────┐   │
│    │ Catalog    │  │   Tally    │   │
│    │  Store     │  │   Store    │   │
│    │(IndexedDB) │  │ (Memory)   │   │
│    └────────────┘  └────────────┘   │
│    ┌────────────┐                   │
│    │ Settings   │                   │
│    │  Store     │                   │
│    │(localStor) │                   │
│    └────────────┘                   │
├─────────────────────────────────────────┤
│         Tailwind CSS v4 + Shadcn UI  │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tiny-till

# Install dependencies
npm install

# Verify installation
npm run check-types
npm run build
```

### Build & Preview

```bash
# Build for production
npm run build

# Preview the build (using serve)
cd apps/web
npx serve dist

# Or use any static file server
# The app will be available at http://localhost:3000
```

### Development

⚠️ **Note**: This is a static web application. The dev server is not intended for production use. Build and preview instead.

```bash
# Type check
npm run check-types

# Build
npm run build
```

---

## 🚀 Deployment

### GitHub Pages

This application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Output**: `apps/web/dist/`

#### Manual Deployment

To deploy manually (for testing or alternative workflows):

```bash
cd apps/web
npm run deploy:manual
```

#### Configuration

The GitHub Pages deployment is configured via:

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Triggers on push to `main`
   - Builds the application using `npm run build`
   - Deploys to GitHub Pages using the official Pages action

2. **404 Handler** (`apps/web/404.html`)
   - Enables SPA routing on GitHub Pages
   - Redirects all routes to the app's entry point

3. **Environment Variables** (`apps/web/.env.production`)
   - `VITE_BASE_PATH`: Set to `/` for user/site deployment
   - Set to `/repo-name/` for project site deployment

#### Setup Instructions

1. **Enable GitHub Pages in Repository Settings**
   - Navigate to `Settings` → `Pages`
   - Set Source to `GitHub Actions`

2. **Verify GitHub Actions Permissions**
   - Navigate to `Settings` → `Actions` → `General`
   - Ensure "Read and write permissions" is enabled under Workflow permissions

3. **Push to Main**
   - The workflow will automatically build and deploy on the next push

#### Custom Domain

To use a custom domain:

1. Navigate to repository `Settings` → `Pages`
2. Add your custom domain
3. Configure DNS records (CNAME or A record)
4. Enable HTTPS (automatic after DNS propagation)

#### Troubleshooting

- **404 errors on refresh**: Ensure `404.html` is properly deployed
- **Broken assets**: Check `VITE_BASE_PATH` in `.env.production`
- **Service worker issues**: Clear browser cache and reload
- **Deployment failures**: Check GitHub Actions logs for detailed error messages

---

## 📚 Documentation

### Developer Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE)** - Comprehensive system architecture, data flow, and technical design
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Setup instructions, workflows, and troubleshooting guide

### Quick Links

- [Project Structure](./DEVELOPMENT.md#project-structure)
- [Common Tasks](./DEVELOPMENT.md#common-tasks)
- [Testing Guide](./DEVELOPMENT.md#testing)
- [Troubleshooting](./DEVELOPMENT.md#troubleshooting)
- [Deployment](./DEVELOPMENT.md#build--deployment)

---

## 📂 Project Structure

```
tiny-till/
├── apps/
│   └── web/                    # Frontend React application
│       ├── src/
│       │   ├── components/      # React components
│       │   │   ├── ui/          # shadcn/ui components
│       │   │   ├── header.tsx
│       │   │   ├── theme-provider.tsx
│       │   │   └── ...
│       │   ├── lib/             # Utilities & helpers
│       │   │   ├── storage.ts
│       │   │   ├── persist-middleware.ts
│       │   │   ├── route-guards.ts
│       │   │   └── ...
│       │   ├── routes/          # TanStack Router routes
│       │   │   ├── __root.tsx
│       │   │   ├── index.tsx
│       │   │   ├── settings.tsx
│       │   │   └── settings.catalog.tsx
│       │   ├── stores/          # Zustand state management
│       │   │   ├── catalog-store.ts
│       │   │   ├── tally-store.ts
│       │   │   └── settings-store.ts
│       │   ├── main.tsx
│       │   └── index.css
│       └── package.json
├── packages/
│   ├── config/                 # Shared TypeScript config
│   ├── env/                    # Environment validation
│   └── types/                  # Shared TypeScript types
│       ├── src/
│       │   ├── entities/        # Data models
│       │   ├── guards/          # Type guards
│       │   ├── utils/           # Utility functions
│       │   └── validation/      # Zod schemas
│       └── package.json
├── ARCHITECTURE.md             # Architecture documentation
├── DEVELOPMENT.md              # Development guide
├── turbo.json                 # Turborepo config
├── package.json               # Root workspace
└── tsconfig.json              # TypeScript config
```

---

## 🎯 Available Scripts

```bash
# Type checking
npm run check-types          # Check TypeScript types across all packages

# Building
npm run build                # Build all packages for production

# Development (not for production use)
npm run dev                 # Start all apps in dev mode
npm run dev:web             # Start only web app in dev mode
```

---

## 🌟 Current Status

### Completed ✅

- [x] Turborepo monorepo structure with TypeScript
- [x] Tailwind CSS v4 with Shadcn UI theme system
- [x] TypeScript interfaces for Product, Tally, Settings
- [x] Zustand stores with proper typing
- [x] IndexedDB persistence layer (catalog store)
- [x] TanStack Router with file-based routing
- [x] Navigation guards (active tally protection)
- [x] Theme system (light/dark/system modes)
- [x] Integration testing and validation
- [x] Comprehensive documentation

### In Progress 🚧

- [ ] Product catalog UI with CRUD operations
- [ ] Tally grid interface with tap-to-add
- [ ] Quantity input overlay
- [ ] Live total calculation footer
- [ ] Settings page with all options
- [ ] Catalog export/import functionality
- [ ] Image upload with size validation

### Planned 📋

- [ ] PWA support (service worker, manifest)
- [ ] Tax calculation option
- [ ] Receipt view mode
- [ ] Catalog categorization
- [ ] Image optimization (client-side resize)
- [ ] Offline analytics (local only)

---

## 🔧 Configuration

### Environment Variables

Currently, no environment variables are required. All configuration is handled client-side.

### Storage

- **Catalog**: IndexedDB (`tiny-till-db`)
- **Settings**: localStorage (`tiny-till-settings`)
- **Tally**: In-memory only (no persistence)

### Build Configuration

- **Build Tool**: Vite 6
- **Output**: `apps/web/dist/`
- **Target**: ESNext
- **Mode**: Production (optimized)

---

## 🤝 Contributing

This is a personal project. Contributions are welcome but please open an issue first to discuss any changes.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) - Project scaffolding
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [TanStack](https://tanstack.com/) - Router and tools
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

---

<div align="center">

Made with ❤️ for on-the-go sellers

[⬆ Back to Top](#tiny-till)

</div>
