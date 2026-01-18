# App Icons

This directory contains the application icons for Tiny Till PWA.

## Icon Sizes

| Size | Purpose | Filename |
|------|---------|----------|
| 48x48 | Favicon / toolbar icon | `icon-48x48.png` |
| 96x96 | Shortcut icon | `icon-96x96.png` |
| 128x128 | Windows Metro tile (small) | `icon-128x128.png` |
| 144x144 | Windows Metro tile (medium) | `icon-144x144.png` |
| 152x152 | iOS touch icon | `icon-152x152.png` |
| 192x192 | Android homescreen | `icon-192x192.png` |
| 256x256 | Windows Metro tile (large) | `icon-256x256.png` |
| 512x512 | Chrome Web Store / App Store | `icon-512x512.png` |
| 512x512 (maskable) | Android adaptive icon | `icon-512x512-maskable.png` |
| 1024x1024 | High-res / Apple Touch | `icon-1024x1024.png` |

## Regenerating Icons

To regenerate all icons with updated design:

```bash
npm run generate-icons
```

This script uses Sharp to generate all icon sizes from an SVG template.

## Design Guidelines

- **Primary Color**: `#343a40` (dark gray)
- **Text**: "TT" initials for "Tiny Till"
- **Style**: Simple, clean, monochromatic
- **Maskable Icons**: Center-focused content with 40% padding for adaptive display

## Icon Source

Icons are generated from an SVG template defined in `scripts/generate-icons.ts`.
The design uses:
- Dark gray background
- White circle
- Bold "TT" text in dark gray
- Sufficient padding for readability at all sizes
