# Task 6.2 Implementation Plan: Configure PWA Manifest and Generate App Icons

## Overview
Configure PWA manifest file with comprehensive app metadata and generate multiple icon sizes for proper Add to Home Screen support, including splash screens, maskable icons, and install prompt optimization.

## Project Context
- **Target**: Static web application using React 19 + Vite + Tailwind CSS v4
- **Hosting**: GitHub Pages (static hosting)
- **Theme**: Light/dark mode with OKLCH color space
- **Color System**:
  - Primary (light): `oklch(0.205 0 0)` (#343a40)
  - Primary (dark): `oklch(0.87 0 0)` (#dedede)
  - Background (light): `oklch(1 0 0)` (#ffffff)
  - Background (dark): `oklch(0.145 0 0)` (#25252b)
  - Accent: Chart colors range from `oklch(0.809 0.105 251.813)` to `oklch(0.424 0.199 265.638)` (blue/purple spectrum)

## Implementation Steps

### Step 1: Create PWA Manifest File
**Location**: `apps/web/public/manifest.json`

**Required Properties**:
- `name`: "Tiny Till - Simple Inventory Counter"
- `short_name`: "Tiny Till"
- `description`: "Simple, fast inventory counting app for small businesses"
- `start_url`: "/" (root path for TanStack Router)
- `display`: "standalone"
- `display_override`: ["window-controls-overlay", "standalone", "minimal-ui"]
- `orientation`: "any" (support both portrait and landscape)
- `scope`: "/"
- `background_color`: "#ffffff" (light mode default)
- `theme_color`: "#343a40" (light mode primary color)
- `categories`: ["business", "productivity", "finance", "utilities"]
- `lang`: "en-US"
- `dir`: "ltr"
- `icons`: Array of icon objects (defined in Step 2)
- `screenshots`: Array of screenshots for install prompt (optional, can be added later)
- `shortcuts`: Array of quick action shortcuts (optional, for task 6.2)

### Step 2: Generate App Icons
**Requirements**: Create icon assets in multiple sizes for different platforms

**Icon Sizes** (standard PWA requirements):
- 48x48px - Favicon / toolbar icon
- 96x96px - Shortcut icon
- 128x128px - Windows Metro tile (small)
- 144x144px - Windows Metro tile (medium)
- 152x152px - iOS touch icon
- 192x192px - Android homescreen
- 256x256px - Windows Metro tile (large)
- 512x512px - Chrome Web Store / App Store
- 1024x1024px - High-res icon / Apple Touch

**Icon Properties**:
- Type: PNG format
- Background: Use app's primary color with subtle gradient
- Purpose: ["any", "maskable"] for adaptive icons
- Design: Simple, distinctive logo/initial "TT" or minimalist tally counter icon

**Maskable Icons** (Android adaptive icons):
- 512x512px with safe zone (40% padding from edges)
- Same design as regular icons but with center-focused content
- Purpose: "maskable"

**Icon Storage Location**: `apps/web/public/icons/`

### Step 3: Create Icon Generation Script
**Location**: `apps/web/scripts/generate-icons.ts`

**Requirements**:
- Use sharp library for image processing (add to devDependencies)
- Create SVG template for icon generation
- Generate all icon sizes from source SVG
- Apply proper padding for maskable icons
- Optimize PNG compression for web
- Output icons to `public/icons/` directory

**Dependencies to add**:
- `sharp`: ^0.33.0 (for image processing)
- `@types/sharp`: ^0.33.0

**Script Steps**:
1. Define icon source (SVG or high-res base image)
2. Create maskable variant with safe zone
3. Resize and generate all required sizes
4. Optimize PNG quality for web (85-90%)
5. Save to output directory with proper naming

### Step 4: Link Manifest in HTML
**File**: `apps/web/index.html`

**Changes Required**:
- Add `<link rel="manifest" href="/manifest.json">` in `<head>`
- Add theme color meta tags:
  - `<meta name="theme-color" content="#343a40">`
  - `<meta name="theme-color" content="#dedede" media="(prefers-color-scheme: dark)">`
- Add apple-touch-icon links:
  - `<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">`
  - `<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png">`
- Add favicon links:
  - `<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png">`
  - `<link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png">`
  - `<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">`

### Step 5: Add Icon Generation Script to package.json
**File**: `apps/web/package.json`

**Changes Required**:
- Add script to scripts section:
  ```json
  "generate-icons": "tsx scripts/generate-icons.ts"
  ```
- Add devDependencies if not already present:
  ```json
  "devDependencies": {
    "sharp": "^0.33.0",
    "@types/sharp": "^0.33.0",
    "tsx": "^4.19.0"
  }
  ```

### Step 6: Create Icon Source Design
**Approach**: Create a simple, clean icon design using:

**Design Elements**:
- Simple geometric shape representing a counter/tally
- Could use: "+" symbol, checkmark, or abstract tally box
- Use monochrome design that works on any background
- Consider using "TT" initials for "Tiny Till"
- Ensure readability at small sizes (48x48px)

**Color Scheme**:
- Primary color: `#343a40` (dark gray for light mode)
- High contrast for visibility
- No gradients for simplicity (optional)

### Step 7: Install Required Dependencies
**Command to run**:
```bash
cd apps/web
npm install --save-dev sharp @types/sharp tsx
```

### Step 8: Test Manifest Configuration
**Verification Steps**:
1. Run `npm run build` to ensure build works
2. Run `npm run serve` to preview the built app
3. Open Chrome DevTools > Application > Manifest
4. Verify manifest loads correctly
5. Check all icon sizes are accessible
6. Test "Add to Home Screen" on mobile device (simulator or real device)
7. Verify theme color updates correctly in both light and dark modes
8. Check install prompt appears on eligible browsers

### Step 9: Update vite.config.ts for PWA Assets
**File**: `apps/web/vite.config.ts`

**Changes Required**:
- Ensure public assets are copied to build output (Vite does this by default)
- No additional configuration needed for manifest and icons
- Verify build output includes manifest.json and icons in dist/

### Step 10: Create Install Prompt Hook (Optional but Recommended)
**Location**: `apps/web/src/hooks/usePWAInstall.ts`

**Purpose**: Handle PWA install prompt for better user experience

**Implementation**:
```typescript
- Listen for `beforeinstallprompt` event
- Prevent default browser install prompt
- Save prompt event for custom install button
- Provide hook exposing install capability
- Handle install success/cancel
- Track install state in localStorage
```

### Step 11: Documentation and Maintenance
**Create README**: `apps/web/public/icons/README.md`

**Content**:
- Icon sizes and purposes
- How to regenerate icons (run `npm run generate-icons`)
- Design guidelines for icon source
- Contact for updates

## File Changes Summary

### New Files
1. `apps/web/public/manifest.json` - PWA manifest configuration
2. `apps/web/public/icons/icon-48x48.png` - Favicon
3. `apps/web/public/icons/icon-96x96.png` - Shortcut icon
4. `apps/web/public/icons/icon-128x128.png` - Windows small
5. `apps/web/public/icons/icon-144x144.png` - Windows medium
6. `apps/web/public/icons/icon-152x152.png` - iOS touch icon
7. `apps/web/public/icons/icon-192x192.png` - Android home
8. `apps/web/public/icons/icon-256x256.png` - Windows large
9. `apps/web/public/icons/icon-512x512.png` - App store
10. `apps/web/public/icons/icon-512x512-maskable.png` - Android adaptive
11. `apps/web/public/icons/icon-1024x1024.png` - High-res
12. `apps/web/scripts/generate-icons.ts` - Icon generation script
13. `apps/web/public/icons/README.md` - Icon documentation
14. `apps/web/src/hooks/usePWAInstall.ts` - Install prompt hook (optional)

### Modified Files
1. `apps/web/index.html` - Add manifest and icon links
2. `apps/web/package.json` - Add script and devDependencies

### Design Asset (Source)
1. SVG source file for icon generation (either created inline or as separate file)

## Dependencies to Add
- `sharp`: ^0.33.0 (for image processing)
- `@types/sharp`: ^0.33.0 (TypeScript types)
- `tsx`: ^4.19.0 (for running TypeScript scripts)

## Validation Checklist
- [ ] Manifest file created with all required properties
- [ ] All icon sizes generated (48, 96, 128, 144, 152, 192, 256, 512, 1024)
- [ ] Maskable icon created for adaptive display
- [ ] Manifest linked in HTML head
- [ ] Theme color meta tags added (light and dark)
- [ ] Apple touch icon links added
- [ ] Favicon links added
- [ ] Icon generation script created and tested
- [ ] Dependencies installed
- [ ] Build succeeds with all assets
- [ ] Manifest loads correctly in Chrome DevTools
- [ ] Icons are accessible and properly sized
- [ ] Install prompt works on eligible browsers
- [ ] Theme color responds to dark mode preference
- [ ] Documentation created for icon maintenance

## Notes
- This task does NOT include service worker implementation (task 6.3)
- This task does NOT include install prompt UI (task 6.3+)
- Keep icon design simple and distinctive
- Test on multiple devices/browsers during task 7.1 (cross-browser testing)
- Consider adding screenshots to manifest later (not required for 6.2)
- Consider adding shortcuts to manifest later (not required for 6.2)
