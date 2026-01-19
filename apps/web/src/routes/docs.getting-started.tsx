import { createFileRoute } from "@tanstack/react-router"
import DocsContent from "@/components/docs/docs-content"

export const Route = createFileRoute("/docs/getting-started")({
  component: GettingStarted,
})

function GettingStarted() {
  const markdown = `# Getting Started

## Introduction to Tiny-Till

**Tiny-Till** is a lightweight, local-first Progressive Web Application designed for on-the-go sellers like bakers on delivery routes, farmers' market stall vendors, and anyone who needs to quickly tally sales without complex POS systems.

### What Makes Tiny-Till Different?

- 🚀 **Lightning Fast** - Tap-to-add interface lets you tally items in seconds
- 💾 **Offline-First** - Works perfectly without internet connection
- 🔒 **Privacy-First** - No accounts, no cloud storage, no transaction history
- 📱 **Mobile Optimized** - Designed for one-handed operation on smartphones
- ✨ **Simple Setup** - No installation required, just open and start using

### Who Is It For?

- **Delivery Bakers** - Move house to house and tally orders quickly
- **Market Stall Holders** - Handle long queues with rapid item selection
- **Casual Sellers** - Perfect for garage sales, pop-ups, and occasional sales
- **Small Business Owners** - Anyone who needs a simple calculation tool

## Installation & Access

### Opening the App

Tiny-Till is a web application - no installation needed! Simply:

1. Open your web browser
2. Navigate to the Tiny-Till URL
3. Start tallying immediately

### PWA Installation (Add to Home Screen)

For the best experience, install Tiny-Till as a Progressive Web App:

**On Android (Chrome):**
1. Tap the menu icon (three dots)
2. Select "Install app" or "Add to Home screen"
3. Follow the prompts to install

**On iOS (Safari):**
1. Tap the Share button
2. Scroll down and tap "Add to Home Screen"
3. Confirm by tapping "Add"

### Browser Requirements

Tiny-Till works on all modern browsers:
- ✅ Chrome/Edge 100+ (recommended)
- ✅ Safari 15+ (iOS and macOS)
- ✅ Firefox 100+
- ❌ Internet Explorer (not supported)

## First-Time Setup

### Initial App Load

When you first open Tiny-Till, you'll see:
- An empty tally grid on the main page
- Navigation links at the top (Tally, Settings)
- A theme toggle in the top-right corner

### Understanding the Interface Layout

**Main Navigation (Top):**
- **Tally** - Your main workspace for adding items
- **Settings** - Configuration and catalog management
- **Theme Toggle** - Switch between light, dark, and system themes

**Tally Page Features:**
- Responsive grid layout - auto-adjusts to your screen size
- Large touch targets - easy tapping on mobile devices
- Sticky footer - shows running total at all times
- Clear cart button - resets tally for next customer

### Navigation Basics

1. **Tap "Tally"** to go to the main tallying page
2. **Tap "Settings"** to manage your catalog and preferences
3. **Tap the theme icon** to switch visual appearance

## Your First Tally

### Step 1: Add Products to Catalog (Quick Start)

Before you can tally, you need products in your catalog:

1. Navigate to **Settings**
2. Scroll to the "Catalog" section
3. Click **"Add Product"**
4. Enter a product name (e.g., "Sourdough Bread")
5. Enter the price in dollars (e.g., "5.00")
6. (Optional) Upload a small thumbnail image (128×128px or smaller)
7. Click **"Save"**

**Pro Tip:** Start with 3-5 commonly sold items to get familiar with the interface.

### Step 2: Start a Tally

1. Navigate to the **Tally** page
2. You'll see your products displayed in a grid
3. The footer shows "Total: $0.00 (0 items)"

### Step 3: Adding Items to Tally

**Quick Add (Tap Method):**
- Simply **tap any product card** to add one item
- Watch the quantity badge appear on the card
- The total updates instantly in the footer

**Manual Quantity (Long Press):**
- Tap the **quantity badge** on a product card
- A numeric keypad overlay appears
- Enter the exact quantity you need
- Tap **"Confirm"** to add

**Remove Items:**
- Tap the quantity badge
- Enter **0** to remove the item from tally
- Or tap the **trash icon** in the overlay

### Step 4: Viewing Totals

The **sticky footer** at the bottom always displays:
- **Grand Total** - Sum of all items (e.g., "$45.50")
- **Item Count** - Total number of items (e.g., "(12 items)")

The total updates in real-time as you add or remove items.

### Step 5: Clearing the Tally

For the next customer, you need a fresh tally:

1. Tap the **"Clear"** button in the footer
2. A confirmation dialog appears
3. Confirm to clear all items

**Important:** Tallies are **ephemeral** - they reset automatically when you refresh the page. This is by design for privacy.

## Next Steps

### Learn More Features

- 📖 [Features Documentation](/docs/features) - Explore all available features
- 💾 [Backup & Restore Guide](/docs/backup-restore) - Protect your catalog
- 🔧 [Troubleshooting](/docs/troubleshooting) - Get help with issues

### Essential Tips

1. **Backup Regularly** - Export your catalog often (Settings > Export Catalog)
2. **Use Compact View** - Switch to compact density for more items on screen
3. **Keyboard Support** - Use Tab, Enter, and arrow keys for faster navigation
4. **Offline Mode** - Tiny-Till works perfectly without internet - ideal for markets

### Keyboard Shortcuts

- **Tab** - Navigate between elements
- **Enter/Space** - Activate buttons and links
- **Escape** - Close modals and overlays
- **Arrow Keys** - Navigate through the product grid

---

**Ready to start using Tiny-Till?** [Jump to Features](/docs/features) to learn about advanced functionality!
`

  return <DocsContent markdown={markdown} />
}
