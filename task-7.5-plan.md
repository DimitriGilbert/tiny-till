# Task 7.5: Comprehensive User Documentation Portal - Implementation Plan

## Overview

Create a complete user documentation system including a documentation portal with search functionality, comprehensive documentation content covering all features, backup/restore instructions, and troubleshooting guides.

## Project Context Analysis

**Application**: Tiny-Till - A lightweight, local-first PWA for quick tallying
**Current Stack**: React 19, TanStack Router, Tailwind CSS v4, Shadcn UI
**Deployment**: GitHub Pages (static hosting)
**Key Features**: Product catalog management, tally system, settings, offline support

## Implementation Strategy

### Phase 1: Documentation Portal Infrastructure

#### 1.1 Create Documentation Route Structure

**Files to Create:**
- `apps/web/src/routes/docs.index.tsx` - Documentation hub/index page
- `apps/web/src/routes/docs._layout.tsx` - Documentation layout with sidebar navigation
- `apps/web/src/routes/docs.getting-started.tsx` - Getting started guide
- `apps/web/src/routes/docs.features.tsx` - Feature explanations
- `apps/web/src/routes/docs.backup-restore.tsx` - Backup and restore guide
- `apps/web/src/routes/docs.troubleshooting.tsx` - Troubleshooting section

**Components to Create:**
- `apps/web/src/components/docs/docs-layout.tsx` - Main layout wrapper
- `apps/web/src/components/docs/docs-sidebar.tsx` - Navigation sidebar with accordion
- `apps/web/src/components/docs/docs-content.tsx` - Content renderer with markdown support
- `apps/web/src/components/docs/docs-search.tsx` - Search input and results display
- `apps/web/src/components/docs/docs-breadcrumbs.tsx` - Breadcrumb navigation
- `apps/web/src/components/docs/version-badge.tsx` - Version indicator component

**Implementation Details:**

```typescript
// docs._layout.tsx structure
export const Route = createFileRoute('/docs/_layout')({
  component: DocsLayout,
})

function DocsLayout() {
  return (
    <div className="flex min-h-screen">
      <DocsSidebar />
      <div className="flex-1">
        <DocsSearch />
        <Breadcrumbs />
        <Outlet />
      </div>
    </div>
  )
}
```

#### 1.2 Documentation Content Management

**Files to Create:**
- `apps/web/docs/content/getting-started.md` - Getting started markdown
- `apps/web/docs/content/features.md` - Feature documentation
- `apps/web/docs/content/backup-restore.md` - Backup instructions
- `apps/web/docs/content/troubleshooting.md` - Troubleshooting guide

**Content Structure for Getting Started:**
- What is Tiny-Till?
- Installation and setup
- First-time use walkthrough
- Basic usage (tallying, managing catalog)
- Understanding the interface

**Content Structure for Features:**
- Product Catalog Management
- Tally System
- Settings & Customization
- Offline Support
- Mobile Optimization
- Keyboard Navigation

**Content Structure for Backup/Restore:**
- Exporting catalog (JSON)
- Importing catalog
- Backup best practices
- Data integrity verification
- Version compatibility

**Content Structure for Troubleshooting:**
- Storage quota exceeded
- Import/export errors
- Display issues
- Browser compatibility
- Network/offline issues
- Performance problems
- Data recovery

#### 1.3 Search Functionality

**Files to Create:**
- `apps/web/src/lib/docs-search.ts` - Search utilities and indexing
- `apps/web/src/hooks/use-docs-search.ts` - Search hook

**Implementation Approach:**

```typescript
// docs-search.ts utilities
interface DocSearchResult {
  id: string
  title: string
  excerpt: string
  path: string
  relevance: number
}

function indexDocuments(): DocumentIndex
function searchDocuments(query: string): DocSearchResult[]
function highlightMatch(text: string, query: string): string
```

**Search Features:**
- Fuzzy search with relevance scoring
- Real-time search results
- Keyboard navigation through results
- Search result highlighting
- Search history (optional)

#### 1.4 Version Management

**Files to Create:**
- `apps/web/src/lib/docs-version.ts` - Version utilities
- `apps/web/src/lib/docs-config.ts` - Configuration and version mapping

**Implementation Details:**

```typescript
// docs-config.ts structure
export const DOCS_CONFIG = {
  currentVersion: '1.0.0',
  supportedVersions: ['1.0.0', '0.9.0'],
  versionPaths: {
    '1.0.0': '/docs/v1',
    '0.9.0': '/docs/v0.9',
  },
} as const

// Version selector in sidebar
<VersionSelector
  currentVersion="1.0.0"
  onSelectVersion={(version) => navigateToVersion(version)}
/>
```

**Version Features:**
- Version selector dropdown in sidebar
- Version badge on documentation pages
- Version-aware search results
- Deprecated version warnings

#### 1.5 Mobile-Responsive Layout

**Responsive Design Breakpoints:**
- Mobile (< 640px): Collapsible sidebar, hamburger menu
- Tablet (640px - 1024px): Collapsible sidebar, icon-only navigation
- Desktop (> 1024px): Fixed sidebar, full content width

**Components:**
- `apps/web/src/components/docs/docs-mobile-nav.tsx` - Mobile navigation toggle
- `apps/web/src/components/docs/docs-drawer.tsx` - Mobile sidebar drawer

### Phase 2: Documentation Content Creation

#### 2.1 Getting Started Guide

**Content Sections:**

```markdown
# Getting Started

## Introduction to Tiny-Till
- What is Tiny-Till?
- Who is it for?
- Key benefits
- Privacy and offline-first approach

## Installation & Access
- Opening the app (GitHub Pages link)
- No installation required (web app)
- PWA installation (Add to Home Screen)
- Browser requirements

## First-Time Setup
1. Initial app load
2. Theme selection (light/dark/system)
3. Understanding the interface layout
4. Navigation basics

## Your First Tally
1. Adding products to catalog (quick start)
2. Starting a tally
3. Adding items to tally
4. Viewing totals
5. Clearing the tally

## Next Steps
- Link to full features documentation
- Link to backup instructions
- Link to troubleshooting
```

**Visual Elements:**
- Screenshots of each step
- Animated GIFs for key interactions
- Short video tutorial (embedded)
- Code snippets where relevant

#### 2.2 Features Documentation

**Content Structure:**

```markdown
# Features

## Product Catalog Management
### Adding Products
- Inline add button
- Product name input
- Price input with currency formatting
- Image upload (128x128px limit)
- Save and cancel actions

### Editing Products
- Edit button on product cards
- Modify name, price, image
- Save changes
- Validation feedback

### Deleting Products
- Delete confirmation
- Impact on tallies (warning)

### Export/Import Catalog
- Export as JSON
- Import from JSON file
- Version compatibility
- Backup recommendations

## Tally System
### Adding Items to Tally
- Tap to add (increment)
- Long press for manual quantity
- Numeric keypad overlay
- Quantity validation

### Viewing Totals
- Sticky footer display
- Grand total calculation
- Item count
- Currency formatting

### Managing Tally
- Clear cart functionality
- Confirmation dialog
- Navigation protection

## Settings & Customization
### Theme Selection
- Light mode
- Dark mode
- System mode (auto-detect)
- Instant switching

### Grid Density
- Normal density
- Compact density
- Live preview
- Column count override

### Backup Reminders
- Last backup date display
- Warning indicators
- Manual backup reminder frequency

## Offline Support
### Service Worker
- Offline app shell
- Automatic caching
- Update notifications

### Local Storage
- IndexedDB for catalog
- localStorage for settings
- Storage quota monitoring

## Mobile Optimization
### Touch Targets
- Large tap zones (80x80px)
- One-handed operation
- Gesture support

### Responsive Design
- Auto-adjusting columns
- Touch-friendly inputs
- Mobile-first UI

## Keyboard Navigation
### Keyboard Shortcuts
- Tab navigation
- Enter/Space for actions
- Arrow keys for grid
- Escape to close modals

### Accessibility
- Screen reader support
- ARIA labels
- Focus indicators
```

**Visual Elements:**
- Feature comparison tables
- Screenshots of each feature
- Video demonstrations
- Interactive code examples

#### 2.3 Backup and Restore Guide

**Content Structure:**

```markdown
# Backup and Restore

## Why Backup Your Catalog?
- Data loss prevention
- Device migration
- Version compatibility
- Recovery from errors

## Exporting Your Catalog

### Step-by-Step Export
1. Navigate to Settings > Catalog
2. Click "Export Catalog"
3. JSON file downloads automatically
4. File naming convention (timestamped)
5. Verify file contents

### Export File Format
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "products": [
    {
      "id": "uuid-here",
      "name": "Product Name",
      "price": 1050,
      "imageData": "base64-string...",
      "createdAt": 1705300200000,
      "updatedAt": 1705300200000
    }
  ]
}
```

### Export Best Practices
- Export regularly
- Keep multiple versions
- Store backups in safe location
- Label backups clearly
- Verify export integrity

## Importing Your Catalog

### Step-by-Step Import
1. Navigate to Settings > Catalog
2. Click "Import Catalog"
3. Select JSON file from device
4. Preview import changes
5. Confirm or cancel import

### Import Preview
- Number of products to add
- Number of products to update
- Side-by-side comparison
- Conflict resolution options

### Import Options
- **Merge**: Add new products, update existing
- **Replace**: Replace entire catalog
- **Skip**: Keep existing, only add new

### Import Validation
- JSON schema validation
- Version compatibility check
- Data integrity verification
- Error reporting

## Troubleshooting Backup/Restore

### Common Issues
- File not found
- Invalid format error
- Version mismatch
- Quota exceeded

### Solutions
- Check file location
- Verify file integrity
- Use compatible version
- Clear storage space

## Recovery from Corrupt Data

### Data Recovery Dialog
- Automatic detection
- Backup restoration prompt
- Manual recovery option

### Using Browser DevTools
1. Open DevTools (F12)
2. Go to Application > IndexedDB
3. Export raw data
4. Parse and repair JSON
5. Import via API

## Backup Automation (Future)

### Planned Features
- Scheduled backups
- Cloud backup option
- Email notifications
- Version history
```

**Visual Elements:**
- Screenshots of export/import flow
- Diagram of JSON structure
- Flowcharts for conflict resolution
- Error message examples

#### 2.4 Troubleshooting Guide

**Content Structure:**

```markdown
# Troubleshooting

## Common Issues and Solutions

### Storage Quota Exceeded

**Symptoms:**
- Error: "QuotaExceededError"
- Cannot add products or images
- Import fails

**Causes:**
- Large catalog with many images
- Browser storage limit reached
- Corrupted data consuming space

**Solutions:**
1. **Check Storage Usage**
   - Go to Settings
   - View storage usage display
   - Identify space-consuming items

2. **Cleanup Catalog**
   - Remove unused products
   - Reduce image sizes
   - Export and reimport with compression

3. **Clear Browser Storage** (Last Resort)
   - Browser Settings > Privacy
   - Clear site data
   - Reimport from backup

**Prevention:**
- Regular exports
- Image optimization
- Clean up unused items

### Import/Export Errors

**Symptoms:**
- "Invalid file format"
- "Version mismatch"
- "Validation failed"

**Causes:**
- Corrupt JSON file
- Incompatible version
- Modified export file

**Solutions:**
1. **Verify File Format**
   ```bash
   # Check if JSON is valid
   cat catalog-export.json | jq .
   ```

2. **Check Version Compatibility**
   ```json
   {
     "version": "1.0.0",  // Must match app version
     "exportedAt": "...",
     "products": [...]
   }
   ```

3. **Repair Corrupt JSON**
   - Use online JSON validator
   - Fix syntax errors
   - Remove invalid characters
   - Re-validate structure

4. **Use Backup**
   - Import earlier backup
   - Manually recreate missing items

### Display Issues

**Symptoms:**
- UI looks broken
- Missing styles
- Incorrect colors

**Causes:**
- Cache issue
- Browser compatibility
- Failed CSS load

**Solutions:**
1. **Clear Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Disable service worker temporarily

2. **Check Browser Compatibility**
   - Supported: Chrome 90+, Firefox 88+, Safari 14+
   - Update browser if needed
   - Try different browser

3. **Verify Service Worker**
   - Check Application > Service Workers
   - Unregister and reload
   - Check console for errors

### Network/Offline Issues

**Symptoms:**
- Offline banner stuck
- Service worker errors
- Cannot access app offline

**Causes:**
- Service worker not installed
- Failed cache update
- Network restrictions

**Solutions:**
1. **Install App Properly**
   - Go online first
   - Allow app to load fully
   - Wait for service worker registration

2. **Clear Service Worker Cache**
   ```
   Application > Service Workers > Unregister
   Application > Clear Storage > Clear site data
   Reload app
   ```

3. **Check Network Policies**
   - VPN/Proxy interference
   - Browser extensions blocking
   - Corporate firewall

### Performance Issues

**Symptoms:**
- Slow app startup
- Laggy scrolling
- Stuttering animations

**Causes:**
- Large catalog (100+ products)
- Heavy images
- Browser memory limits

**Solutions:**
1. **Optimize Catalog**
   - Reduce image sizes
   - Remove unused products
   - Use compact density

2. **Enable Virtual Scrolling** (if available)
   - Reduces DOM nodes
   - Improves render performance
   - Maintains smooth scrolling

3. **Browser Optimizations**
   - Close other tabs
   - Disable heavy extensions
   - Check available memory

### Data Loss

**Symptoms:**
- Catalog missing products
- Settings reset to defaults
- Tally disappeared on refresh

**Causes:**
- Browser data cleared
- Incognito/private mode
- IndexedDB corruption

**Solutions:**
1. **Check Normal Mode**
   - Incognito doesn't persist
   - Use regular browser window
   - Data remains across sessions

2. **Recover from Backup**
   - Import last exported catalog
   - Reconfigure settings
   - Tally is ephemeral by design

3. **Check IndexedDB**
   ```
   Application > IndexedDB > tiny-till-db
   Verify data exists
   Export for recovery if needed
   ```

### Browser-Specific Issues

**Safari (iOS/macOS)**
- Issue: Service worker limitations
- Solution: Use HTTPS, ensure proper manifest

**Firefox**
- Issue: IndexedDB quota
- Solution: Check site data settings

**Chrome**
- Issue: Strict storage policies
- Solution: Allow site storage in settings

## Getting Additional Help

### Community Support
- GitHub Issues: [repository-url]/issues
- Documentation: [docs-url]
- FAQ: [faq-url]

### Reporting Bugs
1. Check existing issues
2. Create new issue with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Console errors

### Feature Requests
1. Check roadmap
2. Submit feature request
3. Provide use case
4. Explain value proposition
```

**Visual Elements:**
- Error message screenshots
- Console error examples
- Step-by-step flowcharts
- Browser DevTools screenshots
- Troubleshooting decision trees

### Phase 3: Visual Assets and Tutorials

#### 3.1 Screenshots and Screenscasts

**Screenshot Checklist:**

**Getting Started:**
- [ ] App home screen (light mode)
- [ ] App home screen (dark mode)
- [ ] Settings page with theme toggle
- [ ] Empty catalog view
- [ ] First product added
- [ ] First tally session

**Features:**
- [ ] Product catalog grid (normal density)
- [ ] Product catalog grid (compact density)
- [ ] Add product modal
- [ ] Edit product modal
- [ ] Product with image
- [ ] Tally grid interface
- [ ] Tally with items
- [ ] Sticky footer with totals
- [ ] Numeric keypad overlay
- [ ] Navigation confirmation dialog
- [ ] Settings page
- [ ] Theme toggle (light/dark/system)
- [ ] Grid density toggle
- [ ] Column count slider with preview
- [ ] Backup reminder card

**Backup/Restore:**
- [ ] Export catalog button
- [ ] Exported JSON file
- [ ] Import file picker
- [ ] Import preview modal
- [ ] Import progress
- [ ] Import success message
- [ ] Storage usage display
- [ ] Storage warning alert

**Troubleshooting:**
- [ ] Error message examples
- [ ] Offline banner
- [ ] Storage quota warning
- [ ] Import error dialog
- [ ] Validation error display

**Screenscast List:**
- [ ] Quick start walkthrough (2-3 min)
- [ ] Adding/editing products (1-2 min)
- [ ] Using tally system (1-2 min)
- [ ] Export/import catalog (1-2 min)
- [ ] Configuring settings (1-2 min)

**Storage Location:**
- `apps/web/public/docs/screenshots/` - All screenshots
- `apps/web/public/docs/videos/` - All video content

**Naming Convention:**
```
screenshots/
  ├── getting-started/
  │   ├── 01-home-screen-light.png
  │   ├── 02-home-screen-dark.png
  │   └── 03-settings-page.png
  ├── features/
  │   ├── 01-catalog-grid-normal.png
  │   ├── 02-catalog-grid-compact.png
  │   └── ...
  ├── backup-restore/
  │   └── ...
  └── troubleshooting/
      └── ...
```

#### 3.2 Video Tutorials

**Video Recording Guidelines:**
- Resolution: 1080p minimum
- Format: MP4 (H.264)
- Duration: Under 3 minutes per video
- Subtitles: Enabled
- Thumbnail: First frame or custom

**Video Content Scripts:**

**Video 1: Quick Start (2:30)**
```
00:00 - Introduction to Tiny-Till
00:15 - Opening the app
00:30 - Adding first product
00:50 - Starting a tally
01:10 - Viewing totals
01:30 - Clearing tally
01:45 - Navigating to settings
02:00 - Exporting catalog
02:15 - Where to find help
```

**Video 2: Product Catalog (2:00)**
```
00:00 - Catalog overview
00:20 - Adding a product
00:45 - Uploading images
01:00 - Editing products
01:20 - Deleting products
01:40 - Export/Import
01:50 - Summary
```

**Video 3: Tally System (1:45)**
```
00:00 - Tally interface overview
00:20 - Tap to add items
00:40 - Manual quantity input
01:00 - Viewing totals
01:20 - Clearing cart
01:35 - Navigation protection
```

#### 3.3 Code Examples

**Code Example Format:**
```typescript
// Example: Programmatically adding a product
const product: ProductInput = {
  name: "Artisan Bread",
  price: 500, // $5.00 in cents
  imageData: "data:image/png;base64,..."
}

// Add via store
useCatalogStore.getState().addProduct(product)
```

**Examples to Include:**
- Export file format with comments
- Custom catalog import script
- Storage quota calculation
- Theme switching programmatically
- Keyboard shortcut handlers

### Phase 4: Integration and Links

#### 4.1 Navigation Integration

**Files to Modify:**
- `apps/web/src/components/header.tsx` - Add "Docs" link to header navigation

**Implementation:**
```typescript
// Add to Header component
<Link to="/docs" className={navLinkClass}>
  <BookOpen className="w-4 h-4" />
  <span>Docs</span>
</Link>
```

#### 4.2 Repository Links

**Add to README.md:**
```markdown
## 📚 User Documentation

- [Getting Started](/docs/getting-started) - Quick start guide
- [Features](/docs/features) - Feature documentation
- [Backup & Restore](/docs/backup-restore) - Data management
- [Troubleshooting](/docs/troubleshooting) - Common issues
```

#### 4.3 In-App Links

**Context-Sensitive Help Links:**
- Settings page → Link to relevant docs sections
- Catalog page → Link to backup/restore guide
- Error dialogs → Link to troubleshooting

**Implementation:**
```typescript
// Example in settings page
<a href="/docs/features/settings" target="_blank" rel="noopener">
  Learn about settings <ExternalLink className="w-3 h-3" />
</a>
```

#### 4.4 Footer Links

**Add to Footer (if exists):**
```typescript
<div className="text-sm">
  <Link to="/docs">Documentation</Link>
  <Link to="/docs/troubleshooting">Help</Link>
  <a href="https://github.com/..." target="_blank">
    GitHub
  </a>
</div>
```

### Phase 5: Search and Navigation Implementation

#### 5.1 Search Implementation

**File: `apps/web/src/lib/docs-search.ts`**

```typescript
import { create } from 'zustand'

interface DocsIndexEntry {
  id: string
  title: string
  content: string
  path: string
  tags: string[]
}

interface SearchState {
  index: DocsIndexEntry[]
  query: string
  results: DocsIndexEntry[]
  setQuery: (query: string) => void
  performSearch: () => void
}

// Fuzzy search implementation
function fuzzySearch(query: string, index: DocsIndexEntry[]): DocsIndexEntry[] {
  // Implementation details
}

// Highlight matching text
function highlightMatch(text: string, query: string): string {
  // Implementation details
}
```

#### 5.2 Sidebar Navigation

**File: `apps/web/src/components/docs/docs-sidebar.tsx`**

```typescript
interface DocSection {
  title: string
  path: string
  children?: DocSection[]
}

const NAVIGATION: DocSection[] = [
  {
    title: 'Getting Started',
    path: '/docs/getting-started',
  },
  {
    title: 'Features',
    path: '/docs/features',
    children: [
      { title: 'Catalog', path: '/docs/features#catalog' },
      { title: 'Tally', path: '/docs/features#tally' },
      { title: 'Settings', path: '/docs/features#settings' },
    ],
  },
  // ... more sections
]

export function DocsSidebar() {
  // Accordion-style navigation
  // Active state highlighting
  // Responsive behavior
}
```

#### 5.3 Breadcrumb Navigation

**File: `apps/web/src/components/docs/docs-breadcrumbs.tsx`**

```typescript
export function DocsBreadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          <Link to={crumb.href}>{crumb.label}</Link>
          {index < breadcrumbs.length - 1 && <ChevronRight />}
        </React.Fragment>
      ))}
    </nav>
  )
}
```

### Phase 6: Markdown Rendering and Styling

#### 6.1 Markdown Processing

**Dependencies to Add:**
```json
{
  "dependencies": {
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "rehype-raw": "^7.0.0"
  }
}
```

**File: `apps/web/src/components/docs/docs-content.tsx`**

```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

export function DocsContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold">{children}</h2>,
          // ... more custom components
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-md my-4"
            />
          ),
          code: ({ inline, className, children }) => {
            // Inline code vs code block handling
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
```

#### 6.2 Documentation Styling

**CSS: `apps/web/src/styles/docs.css`**

```css
.docs-layout {
  @apply min-h-screen bg-background;
}

.docs-sidebar {
  @apply w-64 border-r bg-muted/10;
}

.docs-content {
  @apply max-w-4xl mx-auto px-6 py-8;
}

/* Search styling */
.docs-search {
  @apply sticky top-0 z-10 bg-background border-b p-4;
}

.docs-search-input {
  @apply w-full px-4 py-2 border rounded-md;
}

/* Prose customization */
.prose {
  @apply text-foreground;
}

.prose h2 {
  @apply mt-8 mb-4 text-2xl font-semibold scroll-mt-20;
}

.prose pre {
  @apply bg-muted rounded-lg p-4 overflow-x-auto;
}

.prose img {
  @apply rounded-lg shadow-md my-4;
}

/* Custom code highlighting */
.hljs {
  @apply text-sm;
}
```

### Phase 7: Testing and Validation

#### 7.1 Content Validation Checklist

**Getting Started Guide:**
- [ ] All steps clear and accurate
- [ ] Screenshots match current UI
- [ ] Links work correctly
- [ ] Code examples error-free
- [ ] Video tutorials play
- [ ] Mobile layout tested

**Features Documentation:**
- [ ] All features documented
- [ ] Screenshots for each feature
- [ ] Keyboard shortcuts listed
- [ ] Accessibility features noted
- [ ] Cross-browser notes included

**Backup/Restore Guide:**
- [ ] Export/Import steps verified
- [ ] JSON format correct
- [ ] Error scenarios covered
- [ ] Recovery methods tested

**Troubleshooting Guide:**
- [ ] Common issues addressed
- [ ] Solutions verified
- [ ] Error messages match
- [ ] Recovery steps work
- [ ] Help links accurate

#### 7.2 Navigation Testing

- [ ] All links in sidebar work
- [ ] Breadcrumbs display correctly
- [ ] Search returns relevant results
- [ ] Keyboard navigation works
- [ ] Back/forward browser buttons
- [ ] Mobile drawer toggle
- [ ] Version selector functions

#### 7.3 Cross-Device Testing

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Dark mode
- [ ] Light mode
- [ ] System theme
- [ ] Touch interactions

#### 7.4 Accessibility Testing

- [ ] Screen reader compatible
- [ ] Keyboard navigable
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast compliant
- [ ] Reduced motion respected

### Phase 8: Deployment and Final Integration

#### 8.1 Build Configuration

**Modify `apps/web/vite.config.ts`:**

```typescript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Existing plugins...
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
```

#### 8.2 GitHub Pages Integration

**Verify `.github/workflows/deploy.yml`:**
- Ensures docs folder included in build
- Proper asset path handling
- Version path routing

#### 8.3 Link Verification

**Test all links:**
- [ ] Homepage → Docs
- [ ] Header → Docs
- [ ] In-app help links
- [ ] README links
- [ ] GitHub repo links

#### 8.4 Search Performance

**Optimize search:**
- Lazy load search index
- Debounce search input
- Limit result display
- Cache search results

### Phase 9: Documentation Maintenance

#### 9.1 Documentation Updates

**When to Update:**
- New features added
- UI changes
- Bug fixes affecting user
- Version releases

**Update Workflow:**
1. Modify markdown content
2. Update screenshots if needed
3. Record new videos if applicable
4. Test all links
5. Update version in config
6. Deploy

#### 9.2 Versioning Strategy

**Semantic Versioning:**
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

**Version Documentation:**
- Maintain previous versions
- Migration guides for breaking changes
- Changelog in docs

## File Structure Overview

```
apps/web/
├── docs/
│   ├── content/
│   │   ├── getting-started.md
│   │   ├── features.md
│   │   ├── backup-restore.md
│   │   └── troubleshooting.md
│   ├── config/
│   │   └── docs-config.ts
│   └── public/
│       ├── screenshots/
│       │   ├── getting-started/
│       │   ├── features/
│       │   ├── backup-restore/
│       │   └── troubleshooting/
│       └── videos/
│           ├── quick-start.mp4
│           ├── catalog-management.mp4
│           └── tally-system.mp4
├── src/
│   ├── routes/
│   │   ├── docs.index.tsx
│   │   ├── docs._layout.tsx
│   │   ├── docs.getting-started.tsx
│   │   ├── docs.features.tsx
│   │   ├── docs.backup-restore.tsx
│   │   └── docs.troubleshooting.tsx
│   ├── components/
│   │   └── docs/
│   │       ├── docs-layout.tsx
│   │       ├── docs-sidebar.tsx
│   │       ├── docs-content.tsx
│   │       ├── docs-search.tsx
│   │       ├── docs-breadcrumbs.tsx
│   │       ├── docs-mobile-nav.tsx
│   │       └── version-badge.tsx
│   ├── lib/
│   │   ├── docs-search.ts
│   │   └── docs-config.ts
│   ├── hooks/
│   │   └── use-docs-search.ts
│   └── styles/
│       └── docs.css
└── package.json (add dependencies)
```

## Dependencies to Install

```bash
# Markdown processing
npm install react-markdown remark-gfm rehype-highlight rehype-raw

# Syntax highlighting (optional)
npm install highlight.js

# If using icons not already present
npm install lucide-react
```

## Implementation Order

1. **Infrastructure First** (Phase 1)
   - Create route structure
   - Build layout components
   - Set up sidebar navigation

2. **Content Creation** (Phase 2)
   - Write markdown content
   - Create code examples
   - Structure all documentation

3. **Search and Navigation** (Phase 5)
   - Implement search functionality
   - Build breadcrumb system
   - Add keyboard navigation

4. **Visual Assets** (Phase 3)
   - Take screenshots
   - Record video tutorials
   - Organize assets

5. **Styling and Rendering** (Phase 6)
   - Implement markdown rendering
   - Apply styling
   - Ensure responsive design

6. **Integration** (Phase 4)
   - Add navigation links
   - Update README
   - Connect in-app help

7. **Testing** (Phase 7)
   - Validate content
   - Test navigation
   - Check accessibility

8. **Final Deployment** (Phase 8)
   - Build configuration
   - Deploy to GitHub Pages
   - Verify all links

## Success Criteria

- ✅ All documentation pages accessible via `/docs` route
- ✅ Search functionality works with fuzzy matching
- ✅ Mobile-responsive layout (mobile, tablet, desktop)
- ✅ All screenshots and videos display correctly
- ✅ Version management system functional
- ✅ Keyboard navigation supported
- ✅ Dark/light mode styling works
- ✅ Links from README and app to docs working
- ✅ Content covers all features
- ✅ Troubleshooting guide comprehensive
- ✅ No console errors on documentation pages
- ✅ Build succeeds without issues

## Notes and Considerations

1. **Static Generation**: Since this is a static site, consider using a static site generator like VitePress for docs in the future if complexity increases
2. **Performance**: Lazy load markdown content and heavy images
3. **Offline Support**: Docs should be cached by service worker
4. **SEO**: Add proper meta tags for search engine optimization
5. **Analytics**: Consider adding simple analytics to understand which docs are most accessed
6. **Feedback Loop**: Add feedback mechanism (thumbs up/down) on docs pages
7. **Translation**: Structure content for potential localization in the future
8. **Print-Friendly**: Ensure docs can be printed nicely (CSS print media query)

## Future Enhancements (Not in Scope)

- [ ] Interactive code playgrounds
- [ ] Video embedded in docs pages
- [ ] Dark/light mode toggle in docs
- [ ] PDF export of documentation
- [ ] User comments/discussion on docs
- [ ] Version comparison tool
- [ ] Changelog with version history
- [ ] API reference section
- [ ] Developer guide separate from user docs
- [ ] Interactive demos of features
