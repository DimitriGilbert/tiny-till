import { createFileRoute } from "@tanstack/react-router"
import DocsContent from "@/components/docs/docs-content"

export const Route = createFileRoute("/docs/troubleshooting")({
  component: Troubleshooting,
})

function Troubleshooting() {
  const markdown = `# Troubleshooting

Find solutions to common issues and get help when you need it.

## Common Issues and Solutions

### Storage Quota Exceeded

**Symptoms:**
- Error: "QuotaExceededError" or "Storage quota exceeded"
- Cannot add new products or upload images
- Import fails partway through

**Causes:**
- Large catalog with many images
- Browser storage limit reached (typically 50-100MB for IndexedDB)
- Corrupted data consuming space
- Too many images without optimization

**Solutions:**

1. **Check Storage Usage**
   - Navigate to Settings
   - Scroll to "Storage" section
   - View storage usage display
   - Identify which items are consuming space

2. **Cleanup Catalog**
   - Remove unused products
   - Delete images from products you don't need
   - Reduce image sizes before uploading
   - Consider using text-only products

3. **Clear Browser Storage** (Last Resort)
   - Open browser Settings
   - Go to Privacy/Security
   - Find "Site Data" or "Cookies"
   - Search for "tiny-till"
   - Click "Clear Data"
   - Reimport from your last backup

**Prevention:**
- Export catalog regularly
- Optimize images before upload (128×128px max)
- Remove unused products periodically
- Monitor storage usage in Settings

### Import/Export Errors

**Symptoms:**
- "Invalid file format" message
- "Validation failed" or "Parse error"
- "Version mismatch" warning

**Causes:**
- Corrupt or modified JSON file
- Incompatible app version
- Missing required fields
- Incorrect data types

**Solutions:**

1. **Verify File Format**
   \`\`\`bash
   # Check if JSON is valid
   cat catalog-export.json | jq .
   \`\`\`

   Or use an online JSON validator like:
   - https://jsonlint.com/
   - https://jsonvalidator.com/

2. **Check Version Compatibility**
   \`\`\`json
   {
     "version": "1.0.0",  // Must match or be compatible
     "exportedAt": "2024-01-15T10:30:00.000Z",
     "products": [...]
   }
   \`\`\`

3. **Repair Corrupt JSON**
   - Open file in text editor
   - Look for syntax errors (missing commas, unclosed brackets)
   - Remove invalid characters
   - Validate structure against expected format
   - Re-validate with JSON checker

4. **Use Backup**
   - Import earlier backup that's known to work
   - Manually recreate missing products if needed
   - Export new backup after fixing issues

**Common JSON Errors:**
- Missing closing brace \`}\`
- Missing comma between array items
- Trailing comma (not allowed in strict JSON)
- Invalid Unicode characters
- Incorrect field names (case-sensitive)

### Display Issues

**Symptoms:**
- UI looks broken or misaligned
- Missing styles or incorrect colors
- Elements overlapping or cut off
- Icons not loading

**Causes:**
- Cache issue (old CSS cached)
- Browser compatibility problem
- Failed CSS file load
- Theme not applying correctly

**Solutions:**

1. **Clear Cache**
   - **Hard Refresh:** \`Ctrl+Shift+R\` (Windows) or \`Cmd+Shift+R\` (Mac)
   - **Clear Browser Cache:**
     - Chrome: Settings > Privacy > Clear browsing data > Cached images
     - Firefox: Options > Privacy > Clear data > Cache
     - Safari: Develop > Empty Caches

2. **Check Browser Compatibility**
   - Supported browsers:
     - Chrome/Edge 100+ (recommended)
     - Safari 15+ (iOS and macOS)
     - Firefox 100+
   - Update browser if using older version
   - Try different browser if issue persists

3. **Verify Service Worker**
   - Open Developer Tools (F12)
   - Go to Application > Service Workers
   - Check if service worker is registered
   - Click "Unregister" if showing errors
   - Reload the page
   - Service worker will re-register

4. **Reset Theme**
   - Go to Settings
   - Switch theme to "System"
   - Reload page
   - Switch back to preferred theme

### Network/Offline Issues

**Symptoms:**
- Offline banner stuck showing
- Service worker errors in console
- Cannot access app while offline
- Slow loading or timeout

**Causes:**
- Service worker not installed properly
- Failed cache update
- Network restrictions (firewall, VPN)
- Browser extensions blocking

**Solutions:**

1. **Install App Properly**
   - Make sure you're online first
   - Allow app to load completely
   - Wait 10-30 seconds for service worker registration
   - Check for "offline ready" indicator

2. **Clear Service Worker Cache**
   - Open Developer Tools (F12)
   - Go to Application > Service Workers
   - Click "Unregister" for Tiny-Till
   - Go to Application > Clear Storage
   - Click "Clear site data"
   - Reload the app
   - Wait for fresh service worker to install

3. **Check Network Policies**
   - Disable VPN temporarily
   - Check corporate firewall settings
   - Disable ad blockers or privacy extensions
   - Try different network (mobile hotspot)

4. **Force Service Worker Update**
   - Open Developer Tools > Application > Service Workers
   - Check "Update on reload"
   - Click "Update" button
   - Reload the page

### Performance Issues

**Symptoms:**
- Slow app startup (> 5 seconds)
- Laggy scrolling or tapping
- Stuttering animations
- Delay in adding items to tally

**Causes:**
- Very large catalog (100+ products)
- Heavy or uncompressed images
- Browser memory limits
- Device performance (old phone)

**Solutions:**

1. **Optimize Catalog**
   - Reduce image sizes (128×128px max)
   - Remove unused products
   - Delete old products you no longer sell
   - Use compact density mode

2. **Enable Virtual Scrolling**
   - Virtual scrolling is automatically enabled for catalogs
   - Renders only visible items
   - Reduces DOM nodes
   - Maintains smooth scrolling

3. **Browser Optimizations**
   - Close other browser tabs
   - Disable heavy browser extensions
   - Check available RAM in Task Manager
   - Restart browser if memory is high

4. **Device Performance**
   - Restart your device
   - Close other apps
   - Free up storage space
   - Update device OS

**Performance Targets:**
- App load: < 3 seconds
- First tally: < 5 seconds
- Add to tally: < 100ms
- Scroll: 60fps (smooth)

### Data Loss

**Symptoms:**
- Catalog missing products
- Settings reset to defaults
- Tally disappeared on refresh
- Images no longer show

**Causes:**
- Browser data cleared by user or system
- Using incognito/private mode
- IndexedDB corruption
- Browser crash or system failure

**Solutions:**

1. **Check Normal Mode**
   - **Incognito/Private Mode** does not persist data
   - Use regular browser window
   - Data will remain across sessions
   - Tallies always reset on refresh (by design)

2. **Recover from Backup**
   - Import your last exported catalog
   - Reconfigure settings (theme, density)
   - Tally is ephemeral - expected to clear on refresh
   - Export regularly to minimize data loss

3. **Check IndexedDB**
   - Open Developer Tools (F12)
   - Go to Application > IndexedDB
   - Find \`tiny-till-catalog\` database
   - Expand and verify data exists
   - Export for recovery if data is present but not showing

4. **Check localStorage**
   - Open Developer Tools (F12)
   - Go to Application > Local Storage
   - Find \`tiny-till-settings\`
   - Verify settings data is present
   - If missing, data was cleared

**Data Persistence Rules:**
- **Catalog:** Persists in IndexedDB (survives refresh/restart)
- **Settings:** Persists in localStorage (survives refresh/restart)
- **Tally:** In-memory only (clears on refresh - by design)

### Browser-Specific Issues

#### Safari (iOS/macOS)

**Issue:** Service worker limitations

**Symptoms:**
- Offline mode not working
- Service worker not registering
- Update notifications not appearing

**Solution:**
- Must use HTTPS (not HTTP)
- Ensure proper manifest file
- Clear website data and reload
- Update Safari to latest version

**Issue:** IndexedDB quota

**Symptoms:**
- "Quota exceeded" errors
- Cannot add more products

**Solution:**
- Go to Settings > Safari
- Find "Advanced" > "Website Data"
- Search for tiny-till
- View or clear data

#### Firefox

**Issue:** IndexedDB quota

**Symptoms:**
- Low storage limits
- Frequent quota errors

**Solution:**
- Go to about:preferences#privacy
- Find "Cookies and Site Data"
- Click "Manage Data"
- Find tiny-till and view quota

**Issue:** Service worker not updating

**Symptoms:**
- Old version persists
- Cache not updating

**Solution:**
- Open Developer Tools > Application > Service Workers
- Click "Unregister" and reload
- Hold Shift while clicking "Reload"

#### Chrome

**Issue:** Strict storage policies

**Symptoms:**
- Data not persisting
- Cookies blocked

**Solution:**
- Go to Settings > Privacy and security
- Find "Site Settings"
- Search for tiny-till
- Allow storage and cookies

## Getting Additional Help

### Community Support

- **GitHub Issues:** [repository-url]/issues
  - Search existing issues first
  - Create new issue with detailed description
  - Include screenshots and error messages

- **Documentation:** [docs-url]
  - Browse all documentation
  - Search for specific topics
  - Follow step-by-step guides

- **FAQ:** [faq-url]
  - Quick answers to common questions
  - Troubleshooting shortcuts
  - Tips and best practices

### Reporting Bugs

When reporting a bug, include:

1. **Browser and Version**
   - Name: Chrome/Firefox/Safari/Edge
   - Version: 120.0.6099.109 (example)

2. **Steps to Reproduce**
   - Step 1: Go to Settings
   - Step 2: Click "Add Product"
   - Step 3: Enter name "Test"
   - Step 4: Click Save
   - Result: Error appears

3. **Expected vs Actual Behavior**
   - Expected: Product is added to catalog
   - Actual: Error message shows "Invalid input"

4. **Screenshots (if applicable)**
   - Capture error message
   - Show the state before error
   - Include console output if available

5. **Console Errors**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Copy error messages
   - Include in bug report

### Feature Requests

Want a new feature? Submit a request:

1. **Check Roadmap**
   - Review planned features
   - See if already in development
   - Avoid duplicate requests

2. **Submit Feature Request**
   - Title: Clear and descriptive
   - Description: Explain the feature
   - Use Case: When would this help?
   - Value: Why is this important?
   - Examples: Mockups or descriptions

3. **Vote on Existing Requests**
   - Find similar feature requests
   - Upvote if you need it too
   - Add comments with additional use cases

## Debugging Tips

### Enable Debug Mode

1. Open Developer Tools (F12)
2. Go to Console tab
3. Type \`localStorage.setItem('debug', 'true')\`
4. Reload page
5. Detailed logs will appear in console

### Check Network Requests

1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform action that's failing
4. Check for failed requests (red)
5. Click failed request to see details

### Monitor Storage

1. Open Developer Tools (F12)
2. Go to Application tab
3. Find IndexedDB or Local Storage
4. Watch data change in real-time
5. Export data for analysis

---

**Still having issues?** [Return to Documentation Home](/docs) or check [Features](/docs/features) for more information.
`

  return <DocsContent markdown={markdown} />
}
