import { createFileRoute } from "@tanstack/react-router"
import DocsContent from "@/components/docs/docs-content"

export const Route = createFileRoute("/docs/backup-restore")({
  component: BackupRestore,
})

function BackupRestore() {
  const markdown = `# Backup and Restore

Protect your product catalog with regular backups and learn how to restore it if needed.

## Why Backup Your Catalog?

### Data Loss Prevention

Accidents happen. Protect your hard work by:
- **Device failure** - Phone lost, stolen, or damaged
- **Browser data cleared** - Accidentally cleared site data
- **Software updates** - Rare bugs during updates
- **Migration** - Moving to a new device or browser

### Device Migration

Easily transfer your catalog between devices:

1. Export catalog on old device
2. Transfer JSON file (email, cloud storage, USB)
3. Import on new device
4. Your catalog is ready in seconds

### Version Compatibility

Maintain compatibility across app versions:

- Export files include version information
- Import validates version compatibility
- Warnings for incompatible files
- Migration guides for breaking changes

### Recovery from Errors

If data becomes corrupted:

- Use last known good backup
- Restore to previous working state
- Minimize downtime and lost sales

## Exporting Your Catalog

### Step-by-Step Export

1. Navigate to **Settings** → **Catalog**
2. Locate the "Data Management" section
3. Click **"Export Catalog"** button
4. JSON file automatically downloads to your device
5. File is named with timestamp: \`tiny-till-catalog-YYYY-MM-DD.json\`

### Export File Format

Your export file contains all catalog data:

\`\`\`json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sourdough Bread",
      "price": 500,
      "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "createdAt": 1705300200000,
      "updatedAt": 1705300200000
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Croissant",
      "price": 350,
      "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "createdAt": 1705300300000,
      "updatedAt": 1705300300000
    }
  ],
  "metadata": {
    "productCount": 2,
    "totalValue": 850,
    "appVersion": "1.0.0"
  }
}
\`\`\`

**File Structure Explained:**

- **version** - App version that created the export
- **exportedAt** - ISO 8601 timestamp of export
- **products** - Array of all products in catalog
  - **id** - Unique identifier (UUID v4)
  - **name** - Product name
  - **price** - Price in cents (500 = $5.00)
  - **imageData** - Base64-encoded image (if present)
  - **createdAt** - Unix timestamp of creation
  - **updatedAt** - Unix timestamp of last modification
- **metadata** - Summary statistics
  - **productCount** - Total number of products
  - **totalValue** - Sum of all prices (in cents)
  - **appVersion** - Version of app used

### Export Best Practices

**Frequency Recommendations:**
- **Daily** - After adding/editing products
- **Weekly** - Routine backup schedule
- **Before major events** - Markets, festivals, big sales

**Storage Recommendations:**
- Keep multiple backup versions
- Store backups in safe location:
  - Cloud storage (Google Drive, Dropbox)
  - Email to yourself
  - USB drive for offline storage
- Label backups clearly: \`Backup - 2024-01-15.json\`

**Quality Checks:**
1. Open exported file in text editor
2. Verify JSON is valid
3. Check product count matches catalog
4. Confirm version is correct

## Importing Your Catalog

### Step-by-Step Import

1. Navigate to **Settings** → **Catalog**
2. Locate the "Data Management" section
3. Click **"Import Catalog"** button
4. File picker opens - select your JSON file
5. Preview modal shows what will change
6. Review changes:
   - Products to add
   - Products to update
   - Conflicts detected
7. Click **"Confirm Import"** to apply changes

### Import Preview

Before importing, you'll see a preview:

**Preview Information:**
- **Number of products to add** - New items not in your catalog
- **Number of products to update** - Existing items that will be overwritten
- **Side-by-side comparison** - Old vs new values
- **Conflict resolution options** - How to handle mismatches

**Preview Table Example:**

| Product | Action | Old Price | New Price |
|----------|---------|-----------|-----------|
| Sourdough | Update | $5.00 | $5.50 |
| Croissant | Add | - | $3.50 |
| Baguette | Skip | $4.00 | $4.00 |

### Import Options

Choose how imports affect your existing catalog:

**Merge (Default):**
- New products are added
- Existing products with matching IDs are updated
- Products only in local catalog are preserved

**Replace All:**
- Entire catalog is replaced with import
- All local products are deleted
- Only imported products remain

**Skip Conflicts:**
- New products are added
- Existing products with conflicts are not updated
- Local catalog takes priority

**Overwrite Strategy Details:**

When merging, products are matched by their \`id\` field (UUID):

1. **ID exists locally**: Replace all fields (name, price, image, etc.)
2. **ID is new**: Add to catalog with \`createdAt\` = current timestamp
3. **ID only locally**: Preserved (not deleted during import)

### Import Validation

Tiny-Till validates imports thoroughly:

**Schema Validation:**
- Required fields present (\`version\`, \`products\`)
- Correct data types for all fields
- Valid UUID format for IDs
- Positive price values

**Data Integrity:**
- JSON is parseable and well-formed
- Image data is valid base64 format
- Timestamps are valid numbers
- No duplicate product IDs

**Version Compatibility:**
- Import version matches or is compatible
- Warnings for newer versions
- Error for incompatible formats

**Error Handling:**

| Error Type | Message |
|------------|---------|
| Invalid JSON | "Invalid JSON file. Please check the file format." |
| Missing Fields | "File is missing required fields: [list]" |
| Version Mismatch | "This catalog was exported from a newer version. Please update Tiny-Till." |
| Corrupt Data | "File contains corrupted data. Some products may be missing." |

## Troubleshooting Backup/Restore

### Common Issues

#### File Not Found

**Symptoms:**
- Cannot locate backup file
- File picker shows empty folder
- File name doesn't match expected format

**Solutions:**
1. Check Downloads folder (default location)
2. Search by date: \`tiny-till-catalog-*.json\`
3. Check cloud storage if you uploaded there
4. Look in email attachments if you sent to yourself

#### Invalid Format Error

**Symptoms:**
- "Invalid file format" error
- "Validation failed" message
- Import preview doesn't show products

**Solutions:**

1. **Verify JSON is valid:**
   \`\`\`bash
   # Check if JSON is valid
   cat catalog-export.json | jq .
   \`\`\`

2. **Check file structure:**
   - Must start with \`{\`
   - Must contain \`"version"\` and \`"products"\`
   - All brackets must be closed

3. **Check version field:**
   \`\`\`json
   {
     "version": "1.0.0",
     "exportedAt": "...",
     "products": [...]
   }
   \`\`\`

#### Version Mismatch

**Symptoms:**
- "Version mismatch" error
- Import fails with version warning
- Incompatible format message

**Solutions:**
1. Check app version in Settings
2. Verify export file version
3. Update Tiny-Till if export is from newer version
4. Contact support if issue persists

#### Quota Exceeded

**Symptoms:**
- Import fails partway through
- "Storage quota exceeded" error
- Some products import, others don't

**Solutions:**
1. **Check available storage:**
   - Go to Settings
   - View storage usage display
   - Identify space-consuming items

2. **Clean up catalog:**
   - Remove unused products
   - Delete or reduce image sizes
   - Export and reimport with compression

3. **Increase browser quota:**
   - Clear other sites' data
   - Check browser storage settings
   - Use different browser if needed

## Recovery from Corrupt Data

If your catalog becomes corrupted:

### Data Recovery Dialog

Tiny-Till may detect corruption automatically:

1. Automatic check on app load
2. Warning dialog: "Catalog appears corrupted"
3. Options:
   - **Recover from backup** - Prompts for JSON file
   - **Clear catalog** - Start fresh
   - **Continue anyway** - Risky, may cause errors

### Using Browser DevTools (Advanced)

1. Open Developer Tools (F12 or Cmd+Opt+I)
2. Go to **Application** → **IndexedDB**
3. Find \`tiny-till-catalog\` database
4. Export raw data:
   - Right-click on object store
   - Select "Export to JSON"
5. Parse and repair JSON:
   - Use JSON validator tool
   - Fix syntax errors
   - Remove invalid entries
6. Import via standard import flow

## Backup Automation (Future)

Planned features for easier backup management:

- **Scheduled backups** - Automatic daily/weekly exports
- **Cloud backup** - Optional sync with user's cloud storage
- **Email notifications** - Backup reminders sent via email
- **Version history** - Keep multiple backup versions
- **Auto-recovery** - Restore from last good backup automatically

**Stay tuned** for these enhancements in future updates!

---

**Having issues?** [Visit Troubleshooting](/docs/troubleshooting) for more help.
`

  return <DocsContent markdown={markdown} />
}
