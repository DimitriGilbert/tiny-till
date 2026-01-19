export type HelpCategory = 'getting-started' | 'features' | 'troubleshooting' | 'settings' | 'advanced'

export type HelpDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface HelpContent {
  id: string
  title: string
  content: string
  category: HelpCategory
  difficulty: HelpDifficulty
  relatedIds: string[]
  keywords: string[]
  lastUpdated: string
}

export const helpContentIndex: HelpContent[] = [
  {
    id: 'tally-basics',
    title: 'Using the Tally Page',
    content: 'Tap any product card to add one item to your tally. The quantity badge shows how many of each item you have. Tap the footer total to view your transaction summary. Press the clear button to start a new tally.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['quantity-input', 'clear-tally', 'view-total'],
    keywords: ['tally', 'add', 'tap', 'product', 'card'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'quantity-input',
    title: 'Editing Quantities',
    content: 'Tap the quantity badge on any product card to enter a specific amount. Use the numeric keypad to input the desired quantity. Enter 0 to remove the item from your tally.',
    category: 'features',
    difficulty: 'beginner',
    relatedIds: ['tally-basics', 'clear-tally'],
    keywords: ['quantity', 'edit', 'input', 'number', 'remove'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'clear-tally',
    title: 'Starting a New Tally',
    content: 'Tap the Clear button in the footer to remove all items and start fresh. You will see a confirmation prompt before the tally is cleared.',
    category: 'features',
    difficulty: 'beginner',
    relatedIds: ['tally-basics', 'quantity-input'],
    keywords: ['clear', 'reset', 'new', 'start', 'fresh'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'view-total',
    title: 'Viewing Your Total',
    content: 'The grand total is displayed in the sticky footer at the bottom of the screen. It updates in real-time as you add or modify items. The total shows both the currency amount and item count.',
    category: 'features',
    difficulty: 'beginner',
    relatedIds: ['tally-basics', 'receipt-mode'],
    keywords: ['total', 'amount', 'currency', 'footer', 'summary'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'manage-catalog',
    title: 'Managing Your Product Catalog',
    content: 'Go to Settings to add, edit, or remove products from your catalog. You can set product names, prices, and add thumbnail images. Changes are saved automatically.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['add-product', 'edit-product', 'delete-product'],
    keywords: ['catalog', 'product', 'settings', 'manage', 'inventory'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'add-product',
    title: 'Adding Products',
    content: 'In Settings, use the add form at the top of the catalog list. Enter a product name (max 50 characters) and price (must be positive). Optional: add a thumbnail image up to 128x128 pixels.',
    category: 'features',
    difficulty: 'beginner',
    relatedIds: ['manage-catalog', 'image-upload'],
    keywords: ['add', 'create', 'new', 'product', 'price'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'edit-product',
    title: 'Editing Products',
    content: 'Tap any product row in the catalog to enter edit mode. Modify the name, price, or image as needed. Changes are saved when you tap away or press enter.',
    category: 'features',
    difficulty: 'beginner',
    relatedIds: ['manage-catalog', 'add-product'],
    keywords: ['edit', 'modify', 'change', 'product', 'update'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'delete-product',
    title: 'Deleting Products',
    content: 'Swipe left on a product row or tap the trash icon to delete it. You will see a confirmation prompt before the product is permanently removed.',
    category: 'features',
    difficulty: 'beginner',
    relatedIds: ['manage-catalog', 'edit-product'],
    keywords: ['delete', 'remove', 'trash', 'product'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'image-upload',
    title: 'Uploading Product Images',
    content: 'Add thumbnail images to help identify products. Images must be 128x128 pixels or smaller. Use small, optimized thumbnails to keep your catalog fast.',
    category: 'features',
    difficulty: 'intermediate',
    relatedIds: ['add-product', 'edit-product'],
    keywords: ['image', 'upload', 'thumbnail', 'photo', 'picture'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'export-catalog',
    title: 'Exporting Your Catalog',
    content: 'In Settings, tap Export Catalog to download your products as a JSON file. Use this for backups or to transfer your catalog to another device.',
    category: 'features',
    difficulty: 'intermediate',
    relatedIds: ['import-catalog', 'manage-catalog'],
    keywords: ['export', 'backup', 'download', 'json', 'file'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'import-catalog',
    title: 'Importing a Catalog',
    content: 'In Settings, tap Import Catalog and select a JSON file. You will see a preview of changes before confirming. Products with matching IDs are updated, new products are added.',
    category: 'features',
    difficulty: 'intermediate',
    relatedIds: ['export-catalog', 'manage-catalog'],
    keywords: ['import', 'load', 'json', 'file', 'transfer'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'theme-settings',
    title: 'Changing the Theme',
    content: 'In Settings, choose between Light, Dark, or System theme. System theme automatically follows your device preference. Your choice is saved for future visits.',
    category: 'settings',
    difficulty: 'beginner',
    relatedIds: ['density-settings', 'column-settings'],
    keywords: ['theme', 'light', 'dark', 'appearance', 'color'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'density-settings',
    title: 'Grid Density',
    content: 'Switch between Normal and Compact views in Settings. Normal view shows larger touch targets, while Compact view fits more items on screen.',
    category: 'settings',
    difficulty: 'beginner',
    relatedIds: ['theme-settings', 'column-settings'],
    keywords: ['density', 'grid', 'compact', 'normal', 'view'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'column-settings',
    title: 'Column Count',
    content: 'Adjust the number of product columns shown on screen. Use the slider in Settings, or let it auto-calculate based on your device and density setting.',
    category: 'settings',
    difficulty: 'beginner',
    relatedIds: ['theme-settings', 'density-settings'],
    keywords: ['columns', 'grid', 'layout', 'responsive', 'screen'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'offline-mode',
    title: 'Working Offline',
    content: 'Tiny-Till works completely offline. All data is stored locally on your device. No internet connection is needed to use the app.',
    category: 'troubleshooting',
    difficulty: 'beginner',
    relatedIds: ['data-privacy'],
    keywords: ['offline', 'internet', 'connection', 'network', 'local'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'data-privacy',
    title: 'Data Privacy',
    content: 'Your tally data is never saved or transmitted. All transactions are temporary and cleared on refresh. Only your product catalog is stored locally.',
    category: 'troubleshooting',
    difficulty: 'beginner',
    relatedIds: ['offline-mode', 'storage-limits'],
    keywords: ['privacy', 'data', 'security', 'temporary', 'local'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'storage-limits',
    title: 'Storage Limits',
    content: 'Browser storage has limits. Keep your catalog under 100 products with small images to stay within quota. Export your catalog regularly as a backup.',
    category: 'troubleshooting',
    difficulty: 'intermediate',
    relatedIds: ['export-catalog', 'data-privacy'],
    keywords: ['storage', 'quota', 'limit', 'space', 'memory'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'price-calculations',
    title: 'How Prices Are Calculated',
    content: 'All prices are stored in cents to avoid math errors. The total is calculated by multiplying each product price by its quantity and summing all items.',
    category: 'advanced',
    difficulty: 'intermediate',
    relatedIds: ['tally-basics', 'view-total'],
    keywords: ['price', 'calculation', 'math', 'cents', 'currency'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    content: 'Use keyboard shortcuts for faster navigation: Tab/Shift+Tab to navigate, Enter to submit, Escape to close modals. Press ? to open help.',
    category: 'advanced',
    difficulty: 'intermediate',
    relatedIds: ['accessibility'],
    keywords: ['keyboard', 'shortcut', 'hotkey', 'accessibility', 'fast'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'accessibility',
    title: 'Accessibility Features',
    content: 'Tiny-Till supports keyboard navigation, screen readers, and assistive technologies. All interactive elements have proper labels and focus indicators.',
    category: 'advanced',
    difficulty: 'intermediate',
    relatedIds: ['keyboard-shortcuts', 'data-privacy'],
    keywords: ['accessibility', 'a11y', 'screen reader', 'keyboard', 'assistive'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'troubleshooting-tally',
    title: 'Tally Not Updating',
    content: 'If the total doesn\'t update when tapping products, try refreshing the page. If the problem persists, clear your browser cache and reload.',
    category: 'troubleshooting',
    difficulty: 'beginner',
    relatedIds: ['tally-basics', 'offline-mode'],
    keywords: ['trouble', 'problem', 'issue', 'tally', 'total'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'troubleshooting-catalog',
    title: 'Catalog Not Saving',
    content: 'If your catalog changes aren\'t saved, check that you have storage space available. Try exporting your catalog and importing it again.',
    category: 'troubleshooting',
    difficulty: 'intermediate',
    relatedIds: ['manage-catalog', 'storage-limits', 'export-catalog'],
    keywords: ['trouble', 'save', 'catalog', 'storage', 'import'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'troubleshooting-import',
    title: 'Import Failing',
    content: 'Make sure your import file is a valid JSON format. Check that all required fields are present and data types are correct. View error details for specific issues.',
    category: 'troubleshooting',
    difficulty: 'intermediate',
    relatedIds: ['import-catalog', 'export-catalog'],
    keywords: ['trouble', 'import', 'json', 'error', 'file'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'submit-feedback',
    title: 'Submitting Feedback',
    content: 'Help us improve Tiny-Till by submitting feedback. Report bugs, request features, or share general feedback. Your feedback helps us prioritize improvements.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['bug-report', 'feature-request'],
    keywords: ['feedback', 'report', 'bug', 'feature', 'improve'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'bug-report',
    title: 'Reporting Bugs',
    content: 'Found a bug? Report it with details about what happened, steps to reproduce, and your browser/device info. Include screenshots if possible.',
    category: 'getting-started',
    difficulty: 'intermediate',
    relatedIds: ['submit-feedback', 'environment-capture'],
    keywords: ['bug', 'report', 'issue', 'error', 'problem'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'feature-request',
    title: 'Requesting Features',
    content: 'Have an idea for a new feature? Submit a feature request describing what you want, why it would help, and how you\'d use it.',
    category: 'getting-started',
    difficulty: 'intermediate',
    relatedIds: ['submit-feedback', 'feature-voting'],
    keywords: ['feature', 'request', 'idea', 'suggestion', 'new'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'feature-voting',
    title: 'Voting on Features',
    content: 'Vote on feature requests to help us understand what\'s most important. You have limited votes, so use them on features you care about most.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['feature-request', 'submit-feedback'],
    keywords: ['vote', 'feature', 'request', 'priority', 'important'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'environment-capture',
    title: 'Automatic Environment Data',
    content: 'When you report bugs, Tiny-Till automatically captures information about your browser, device, and settings to help us reproduce and fix issues.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['bug-report', 'data-privacy'],
    keywords: ['environment', 'browser', 'device', 'data', 'capture'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'help-search',
    title: 'Searching for Help',
    content: 'Use the help center search to find articles quickly. Search for keywords, topics, or phrases. Results are filtered by category and relevance.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['help-center'],
    keywords: ['search', 'find', 'help', 'article', 'topic'],
    lastUpdated: '2025-01-19',
  },
  {
    id: 'help-center',
    title: 'Using the Help Center',
    content: 'Access the help center by tapping the help icon or pressing Ctrl/Cmd + ? in your keyboard. Browse articles by category or search for specific topics.',
    category: 'getting-started',
    difficulty: 'beginner',
    relatedIds: ['help-search', 'submit-feedback'],
    keywords: ['help', 'center', 'documentation', 'guide', 'support'],
    lastUpdated: '2025-01-19',
  },
]

export function getHelpContentById(id: string): HelpContent | undefined {
  return helpContentIndex.find((item) => item.id === id)
}

export function getHelpContentByCategory(category: HelpCategory): HelpContent[] {
  return helpContentIndex.filter((item) => item.category === category)
}

export function getRelatedHelpContent(id: string): HelpContent[] {
  const content = getHelpContentById(id)
  if (!content) return []
  return content.relatedIds
    .map((relatedId) => getHelpContentById(relatedId))
    .filter((item): item is HelpContent => item !== undefined)
}

export function searchHelpContent(query: string): HelpContent[] {
  const normalizedQuery = query.toLowerCase()
  return helpContentIndex.filter((item) => {
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.content.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery))
    )
  })
}

export function getAllHelpCategories(): HelpCategory[] {
  return Array.from(new Set(helpContentIndex.map((item) => item.category)))
}

export function getPopularHelpContent(limit: number = 5): HelpContent[] {
  return helpContentIndex
    .filter((item) => item.difficulty === 'beginner')
    .slice(0, limit)
}
