# Tiny-Till Documentation Portal

A comprehensive documentation portal for the Tiny-Till application, built with React, TanStack Router, and Tailwind CSS.

## Features

- **Complete Documentation Coverage** - Getting Started, Features, Backup & Restore, and Troubleshooting guides
- **Search Functionality** - Real-time search across all documentation with fuzzy matching and relevance scoring
- **Responsive Design** - Mobile-first approach with collapsible sidebar navigation
- **Markdown Rendering** - Beautiful prose rendering with syntax highlighting for code blocks
- **Breadcrumb Navigation** - Easy navigation and location awareness
- **Accessible** - Full keyboard navigation, ARIA labels, and screen reader support

## File Structure

```
apps/web/
├── src/
│   ├── routes/
│   │   ├── docs.index.tsx              # Documentation home page
│   │   ├── docs._layout.tsx            # Docs layout wrapper
│   │   ├── docs.getting-started.tsx     # Getting started guide
│   │   ├── docs.features.tsx             # Feature documentation
│   │   ├── docs.backup-restore.tsx       # Backup & restore guide
│   │   └── docs.troubleshooting.tsx     # Troubleshooting guide
│   └── components/
│       └── docs/
│           ├── docs-layout.tsx            # Main layout component
│           ├── docs-sidebar.tsx            # Navigation sidebar
│           ├── docs-breadcrumbs.tsx         # Breadcrumb navigation
│           ├── docs-content.tsx            # Markdown renderer
│           └── docs-search.tsx             # Search component
├── public/
│   └── docs/
│       ├── screenshots/                   # Screenshot assets
│       │   ├── getting-started/
│       │   ├── features/
│       │   ├── backup-restore/
│       │   └── troubleshooting/
│       └── videos/                      # Video tutorials
└── package.json                        # Dependencies
```

## Components

### DocsLayout
Main layout wrapper for documentation pages with responsive sidebar.

**Features:**
- Sticky sidebar on desktop (lg breakpoint)
- Collapsible sidebar on mobile
- Breadcrumb navigation
- Search functionality

### DocsSidebar
Navigation sidebar with accordion-style section expansion.

**Features:**
- Hierarchical navigation structure
- Active route highlighting
- Keyboard navigation
- Quick links to settings

### DocsBreadcrumbs
Breadcrumb navigation showing current page location.

**Features:**
- Auto-generated from current path
- Clickable navigation
- Home icon for quick return

### DocsContent
Markdown renderer with custom component mapping.

**Features:**
- ReactMarkdown with GFM support
- Syntax highlighting (highlight.js)
- Copy-to-clipboard for code blocks
- Custom styling for headings, tables, lists, etc.
- External link indicators

### DocsSearch
Search input with real-time results.

**Features:**
- Fuzzy search with relevance scoring
- Keyboard navigation (arrows, Enter, Escape)
- Real-time results
- Maximum 10 results displayed
- Highlights matching sections

## Documentation Content

### Getting Started (`/docs/getting-started`)
- Introduction to Tiny-Till
- Installation & PWA setup
- First-time setup walkthrough
- Your first tally guide
- Next steps and keyboard shortcuts

### Features (`/docs/features`)
- Product Catalog Management
  - Adding, editing, and deleting products
  - Image upload and validation
  - Export/Import catalog
- Tally System
  - Quick add and manual quantity
  - Viewing totals and managing tally
- Settings & Customization
  - Theme selection
  - Grid density
  - Column count override
  - Backup reminders
- Offline Support
  - Service worker
  - Local storage
- Mobile Optimization
  - Touch targets
  - Responsive design
- Keyboard Navigation
  - Shortcuts
  - Accessibility

### Backup & Restore (`/docs/backup-restore`)
- Why backup your catalog
- Exporting catalog (step-by-step)
- Export file format specification
- Export best practices
- Importing catalog (step-by-step)
- Import preview and options
- Import validation
- Troubleshooting backup/restore
- Recovery from corrupt data

### Troubleshooting (`/docs/troubleshooting`)
- Storage quota exceeded
- Import/Export errors
- Display issues
- Network/Offline issues
- Performance issues
- Data loss
- Browser-specific issues (Safari, Firefox, Chrome)
- Getting additional help
- Reporting bugs
- Feature requests
- Debugging tips

## Technical Implementation

### Dependencies

```json
{
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0",
  "rehype-highlight": "^7.0.0",
  "rehype-raw": "^7.0.0",
  "highlight.js": "^11.9.0"
}
```

### Search Algorithm

The search uses a fuzzy matching approach with relevance scoring:

1. **Exact Match (100 points)**: Query matches entire string
2. **Prefix Match (80 points)**: Query matches start of string
3. **Contains Match (60 points)**: Query is found anywhere in string
4. **Word Match (40 points)**: Each word in query found in string
5. **Section Bonus (-10%)**: Section results get slight penalty vs page-level results

Results are sorted by relevance and limited to top 10.

### Markdown Processing

- **ReactMarkdown**: Core markdown renderer
- **remarkGfm**: GitHub Flavored Markdown support (tables, task lists, etc.)
- **rehypeHighlight**: Syntax highlighting for code blocks
- **rehypeRaw**: Allow raw HTML in markdown

### Custom Components

The `DocsContent` component maps markdown elements to custom React components:

- `h1`, `h2`, `h3`, `h4` - Styled headings with scroll-margin for anchor links
- `p` - Paragraphs with muted-foreground color
- `a` - External links with icon indicators
- `ul`, `ol`, `li` - Lists with custom markers
- `strong` - Bold text with foreground color
- `code` - Inline and block code with styling
- `pre` - Code block wrapper
- `blockquote` - Styled quote blocks
- `table`, `thead`, `th`, `td` - Tables with borders and styling
- `img` - Images with rounded corners and shadows
- `details`, `summary` - Expandable sections

### Accessibility

- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Focus Styles**: `focusVisibleStyles` utility for keyboard users
- **Screen Reader**: Semantic HTML and proper heading hierarchy
- **Color Contrast**: WCAG 2.1 Level AA compliant
- **Skip Links**: `skip-link.tsx` component for keyboard users

### Responsive Design

- **Mobile (< 640px)**: Collapsible sidebar, hamburger menu, 2-3 grid columns
- **Tablet (640px - 1024px)**: Icon-only navigation, 3-4 grid columns
- **Desktop (> 1024px)**: Fixed sidebar, 4-6 grid columns

### Styling

Documentation uses Tailwind CSS v4 with custom prose styling:

- **Gradient Background**: Subtle gradient from background to muted/20
- **Card Styling**: Rounded corners, shadows, hover effects
- **Code Blocks**: Dark background, language indicator, copy button
- **Tables**: Borders, striped rows (via CSS), responsive overflow
- **Scroll Margin**: `scroll-mt-24` for anchor link visibility
- **Prose Typography**: Readable line height, letter spacing, and font size

## Usage

### Adding New Documentation

1. Create a new route file: `docs.new-topic.tsx`
2. Export the route with `createFileRoute`
3. Add to navigation structure in `docs-sidebar.tsx`
4. Write markdown content in the route component
5. Update `docs-search.tsx` with searchable content

### Adding Images/Assets

1. Place images in `apps/web/public/docs/screenshots/[category]/`
2. Reference in markdown: `![Description](/docs/screenshots/category/image.png)`
3. Videos in `apps/web/public/docs/videos/`
4. Reference in markdown: `<video src="/docs/videos/tutorial.mp4" controls></video>`

### Updating Search Content

To make new documentation searchable, add to `DOCS_CONTENT` array in `docs-search.tsx`:

```typescript
{
  title: "New Topic",
  path: "/docs/new-topic",
  content: "Brief content summary for search...",
  sections: [
    { title: "Section 1", id: "section-1", content: "Section content..." },
    { title: "Section 2", id: "section-2", content: "Section content..." },
  ],
}
```

## Testing

All documentation pages are tested for:

- ✅ TypeScript type safety (no `any` types)
- ✅ Build succeeds without errors
- ✅ Accessibility (keyboard navigation, screen readers)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/light mode styling
- ✅ Markdown rendering accuracy
- ✅ Search functionality
- ✅ Link validity (all links work)

## Future Enhancements

- [ ] Version selector dropdown in sidebar
- [ ] Version-aware search results
- [ ] Deprecated version warnings
- [ ] Interactive code playgrounds
- [ ] Video embedded in docs pages
- [ ] Print-friendly CSS media query
- [ ] PDF export of documentation
- [ ] User comments/discussion on docs
- [ ] Changelog with version history
- [ ] API reference section

## Contributing

When contributing to the documentation:

1. Follow existing code style and patterns
2. Use proper TypeScript types (no `any`)
3. Ensure accessibility (ARIA labels, keyboard navigation)
4. Test on mobile and desktop
5. Run `npm run check-types` and `npm run build`
6. Verify all links work

---

**Documentation Version:** 1.0.0
**Last Updated:** January 19, 2026
