import { createFileRoute } from "@tanstack/react-router"
import DocsContent from "@/components/docs/docs-content"

export const Route = createFileRoute("/docs/features")({
  component: Features,
})

function Features() {
  const markdown = `# Features

Tiny-Till is packed with powerful features designed to make tallying fast, accurate, and hassle-free. Learn about each feature and how to make the most of it.

## Product Catalog Management

The product catalog is your inventory management system where you define all the items you sell.

### Adding Products

Add new products to your catalog with these steps:

1. Navigate to **Settings** → **Catalog**
2. Click the **"Add Product"** button
3. Fill in the product details:
   - **Name** (required, max 50 characters)
   - **Price** (required, in dollars and cents)
   - **Image** (optional, 128×128px or smaller)
4. Click **"Save"** to add the product

**Tips for Adding Products:**
- Use short, descriptive names (e.g., "Sourdough" instead of "Artisan Sourdough Bread")
- Enter prices without currency symbols (e.g., "5.00" for $5.00)
- Upload small thumbnail images to help identify products quickly
- Product names must be unique within your catalog

### Editing Products

Update product information at any time:

1. Navigate to **Settings** → **Catalog**
2. Find the product you want to edit
3. Click the **Edit** button on the product card
4. Modify the name, price, or image
5. Click **"Save"** to apply changes

**Note:** Price changes only affect future tallies. Current tally items keep their original price.

### Deleting Products

Remove products you no longer sell:

1. Navigate to **Settings** → **Catalog**
2. Find the product you want to delete
3. Click the **Delete** button (trash icon)
4. Confirm the deletion in the dialog

**⚠️ Warning:** Deleting a product removes it from your catalog entirely. Any tallies containing this product are unaffected during the current session.

### Exporting/Importing Catalog

Move your catalog between devices or create backups:

**Exporting:**
1. Go to **Settings** → **Catalog**
2. Click **"Export Catalog"**
3. A JSON file automatically downloads with timestamp
4. File format: \`tiny-till-catalog-YYYY-MM-DD.json\`

**Importing:**
1. Go to **Settings** → **Catalog**
2. Click **"Import Catalog"**
3. Select a previously exported JSON file
4. Preview the changes
5. Confirm to import

Learn more: [Backup & Restore Guide](/docs/backup-restore)

## Tally System

The tally system is your main workspace for calculating sales totals.

### Adding Items to Tally

Two methods for adding items:

**Quick Add (Tap):**
1. Navigate to the **Tally** page
2. Simply **tap any product card** to add one item
3. The quantity badge appears with count "1"
4. Tap again to increment the quantity

**Manual Quantity (Long Press):**
1. Tap the **quantity badge** on a product card
2. A numeric keypad overlay appears
3. Enter the exact quantity you need
4. Tap **"Confirm"** to add

**Quantity Input Validation:**
- Must be a non-negative integer (0, 1, 2, 3, ...)
- Decimal numbers are rounded down (5.9 becomes 5)
- Negative numbers are rejected
- Entering **0** removes the item from tally

### Viewing Totals

The **sticky footer** at the bottom always shows:

\`\`\`
Total: $45.50 (12 items)
\`\`\`

- **Grand Total** - Sum of all item prices in USD
- **Item Count** - Total number of items in tally
- Updates instantly as you add or remove items

**Currency Formatting:**
- All prices displayed with proper currency formatting
- Uses \`Intl.NumberFormat\` for locale-aware display
- Stored internally as cents (integers) for accuracy

### Managing Tally

**Clear Cart:**
1. Click the **"Clear"** button in the footer
2. Confirmation dialog: "Start new tally? Current items will be cleared."
3. Confirm to reset all quantities to zero

**Navigation Protection:**
- If you attempt to navigate away from Tally with active items
- A confirmation dialog appears
- You can choose to:
  - **Continue** (clear tally and navigate)
  - **Cancel** (stay on Tally page)

**Privacy Design:**
- Tally data is **ephemeral** (stored in memory only)
- **No persistence** - resets on page refresh
- No transaction history is stored
- Perfect for customer privacy

## Settings & Customization

Personalize Tiny-Till to match your preferences.

### Theme Selection

Choose between three theme options:

1. Navigate to **Settings**
2. Find the "Appearance" section
3. Select your preferred theme:
   - **Light** - Always light mode
   - **Dark** - Always dark mode
   - **System** - Follows your device preference (default)

**Theme Persistence:** Your choice is saved and persists across sessions.

### Grid Density

Adjust how many items fit on your screen:

1. Navigate to **Settings**
2. Find the "Display" section
3. Toggle between:
   - **Normal** - Larger touch targets, fewer items per screen
   - **Compact** - Smaller targets, more items per screen

**Density Effects:**
- Normal: Designed for comfort and accessibility
- Compact: Maximizes screen real estate
- Auto-adjusts column count based on density
- Preview changes in real-time

### Column Count Override

Fine-tune grid layout manually:

1. Navigate to **Settings**
2. Find the "Display" section
3. Use the **Column Count Slider** (2-8 columns)
4. Preview shows live grid of items

**Override Options:**
- Leave undefined for automatic calculation
- Set specific number for consistent layout
- Useful for tablets and desktop screens

**Responsive Behavior:**
- Mobile (< 640px): 2-3 columns (auto)
- Tablet (640px - 1024px): 3-4 columns (auto)
- Desktop (> 1024px): 4-6 columns (auto)

### Backup Reminders

Keep track of your catalog backups:

1. Navigate to **Settings**
2. Find the "Backup" section
3. View:
   - **Last backup date**
   - **Days since last backup**
   - Warning indicators for old backups

**Backup Recommendations:**
- Export weekly for regular users
- Export daily after major catalog changes
- Keep multiple versions for safety

## Offline Support

Tiny-Till is designed to work perfectly without internet.

### Service Worker

The service worker handles offline functionality:

- **Caches app shell** - Core files for instant loading
- **Automatic caching** - Downloads resources on first visit
- **Update notifications** - Alerts when new version is available
- **Offline detection** - Shows banner when offline

**Install Service Worker:**
1. Open Tiny-Till online first
2. Wait for full page load
3. Service worker registers automatically
4. App works offline from then on

### Local Storage

Two storage systems work together:

**IndexedDB (Catalog):**
- Stores product catalog
- Handles image data efficiently
- Persists across sessions
- ~50-100MB typical quota

**localStorage (Settings):**
- Stores theme preference
- Stores display settings
- Persists across sessions
- ~5-10MB typical quota

**Storage Quota Monitoring:**
- Settings show storage usage
- Warnings appear at 80% capacity
- Alerts when quota is exceeded

## Mobile Optimization

Tiny-Till is built from the ground up for mobile devices.

### Touch Targets

Large, easy-to-tap buttons:

- **Minimum size**: 80×80px for product cards
- **Tap feedback**: Visual pulse on interaction
- **Gesture support**: Works with taps, not swipes
- **One-handed operation**: Optimized for thumb reach

**Why Large Targets?**
- Reduces mis-taps during busy periods
- Improves accuracy under pressure
- Accessible to users with motor impairments

### Responsive Design

Adapts to any screen size:

| Screen Width | Columns | Card Size |
|-------------|----------|-----------|
| < 640px (Mobile) | 2-3 | Larger cards |
| 640px - 1024px (Tablet) | 4-6 | Medium cards |
| > 1024px (Desktop) | 6-8 | Smaller cards |

**Density Interaction:**
- Normal view: Fewer columns, larger cards
- Compact view: More columns, smaller cards
- Automatic adjustment for each screen size

### Touch-Friendly Inputs

Optimized input controls:

- **Numeric keypad overlay** - Large buttons for quantities
- **Inline product forms** - Easy editing on small screens
- **Swipe gestures** - Quick actions (delete, edit)
- **Thumb-friendly layout** - Controls within easy reach

## Keyboard Navigation

Full keyboard support for power users.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate to next element |
| Shift + Tab | Navigate to previous element |
| Enter / Space | Activate buttons and links |
| Escape | Close modals and overlays |
| Arrow Keys | Navigate product grid |

### Accessibility

Screen reader support:

- **ARIA labels** on all interactive elements
- **Semantic HTML** for proper structure
- **Focus indicators** visible on navigation
- **Skip links** for keyboard users
- **Descriptive alt text** on product images

**WCAG 2.1 Level AA Compliance:**
- Color contrast ratios meet standards
- Minimum 4.5:1 for text
- Minimum 3:1 for large text
- Focus indicators on all interactive elements

---

**Ready to protect your data?** [Learn about Backup & Restore](/docs/backup-restore)
`

  return <DocsContent markdown={markdown} />
}
