# GitHub Pages Deployment and Routing Configuration - Implementation Plan

## Task Overview

Deploy the Tiny Till application to GitHub Pages with proper TanStack Router configuration for static hosting, including SPA routing and 404 handling. Configure custom routing, enforce HTTPS, and set up GitHub Actions for automated deployment on merge to main.

## Prerequisites

- GitHub repository already exists
- Application is fully built and tested locally
- Repository has main branch configured as default
- GitHub repository settings allow GitHub Pages deployment

## Implementation Steps

### Step 1: Configure Vite for GitHub Pages Deployment

**File: `apps/web/vite.config.ts`**

1. Update the `base` configuration to support GitHub Pages:
   - Keep the environment variable approach: `process.env.VITE_BASE_PATH || "/"`
   - This allows flexibility for different deployment scenarios

2. Verify build configuration:
   - Ensure `outDir` is set to `dist` (default)
   - Confirm assets are properly organized
   - Validate chunk splitting and compression plugins are configured

3. Add production-specific configuration:
   - Ensure `sourcemap` is disabled in production (already done)
   - Confirm `minify` is set to `terser`
   - Verify compression plugins are enabled for gzip and Brotli

**Required Changes:**
- Update `apps/web/vite.config.ts` (line 10) - ensure base path configuration is production-ready
- No changes needed - current configuration is correct

### Step 2: Configure TanStack Router for SPA Routing on GitHub Pages

**File: `apps/web/src/main.tsx`**

1. Configure router to work with base path:
   - TanStack Router should automatically respect Vite's `base` configuration
   - Ensure router context is properly initialized
   - Verify route tree generation works correctly

2. Router configuration validation:
   - Ensure `defaultPreload` is set to "intent"
   - Confirm `defaultPendingComponent` is set for loading states
   - Validate router context interface is properly typed

**Required Changes:**
- No changes needed to `apps/web/src/main.tsx` - router is already correctly configured
- TanStack Router will automatically use Vite's base path

### Step 3: Create 404.html for GitHub Pages SPA Routing

**File: `apps/web/404.html` (new file)**

1. Create a 404.html file that redirects to index.html:
   - This is necessary because GitHub Pages doesn't support client-side routing by default
   - The 404.html file will serve as a fallback for all routes
   - It should immediately redirect to the app's entry point

2. Implementation details:
   - Use JavaScript to redirect to index.html
   - Preserve the requested URL hash if present
   - Include a fallback message for users with JavaScript disabled

**Required Changes:**
- Create new file: `apps/web/404.html`
- Copy index.html content and add redirect logic
- Or use a simple redirect approach that loads the app

### Step 4: Update package.json for Deployment Scripts

**File: `apps/web/package.json`**

1. Add deployment script (optional but recommended):
   - Add `"deploy": "npm run build && gh-pages -d dist -b gh-pages"` to scripts section
   - This provides a manual deployment option for testing

2. Verify build script:
   - Ensure `"build": "vite build"` is present
   - Validate build output goes to `dist` directory

**Required Changes:**
- Add deploy script to `apps/web/package.json`
- Install `gh-pages` as dev dependency if using manual deployment

### Step 5: Create GitHub Actions Workflow for Automated Deployment

**File: `.github/workflows/deploy.yml` (new file)**

1. Create GitHub Actions workflow file:
   - Trigger on push to main branch
   - Build the application using `npm run build`
   - Deploy to GitHub Pages using GitHub's built-in Pages action

2. Workflow configuration:
   - Use `actions/checkout@v4` to checkout code
   - Set up Node.js with `actions/setup-node@v4`
   - Install dependencies with `npm ci` or `npm install`
   - Run `npm run build` to create production bundle
   - Deploy using `peaceiris/actions-gh-pages@v3` or GitHub's native Pages deployment

3. Deployment options:
   - Option A: Use `peaceiris/actions-gh-pages@v3` with personal access token
   - Option B: Use GitHub's native Pages deployment with `actions/configure-pages` and `actions/upload-pages-artifact`

4. Recommended approach: Use GitHub's native Pages deployment:
   - More secure (no PAT required)
   - Better integration with GitHub
   - Automatic HTTPS
   - Faster deployments

**Required Changes:**
- Create new file: `.github/workflows/deploy.yml`
- Configure workflow for automated deployment on push to main

### Step 6: Configure GitHub Repository Settings

**Repository Settings to Configure:**

1. Enable GitHub Pages:
   - Navigate to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - This allows the workflow to manage deployment

2. Configure deployment branch (if not using GitHub Actions):
   - Set branch to `gh-pages`
   - Set folder to `/root`

3. Custom domain (optional):
   - Navigate to Settings → Pages → Custom domain
   - Enter custom domain name
   - Configure DNS records (CNAME or A record)
   - Enable HTTPS (automatic after DNS propagation)

4. Enforce HTTPS:
   - GitHub Pages automatically provides HTTPS
   - Ensure "Enforce HTTPS" checkbox is enabled in Pages settings
   - This forces all connections to use HTTPS

**Required Changes:**
- Manual configuration through GitHub web interface
- No code changes needed

### Step 7: Update Environment Variables for Production

**File: `.env.production` (new file in apps/web)**

1. Create production environment file:
   - Set `VITE_BASE_PATH=/` (default) or `/repo-name/` if deploying to a subdirectory
   - Add any production-specific configuration

2. For GitHub Pages:
   - If deploying to user/site: `VITE_BASE_PATH=/`
   - If deploying to project site: `VITE_BASE_PATH=/repo-name/`

**Required Changes:**
- Create new file: `apps/web/.env.production`
- Configure VITE_BASE_PATH based on deployment target

### Step 8: Update Service Worker for GitHub Pages

**File: Ensure service worker works with base path**

1. Verify service worker registration:
   - Ensure service worker respects the base path
   - Update precaching patterns if necessary
   - Confirm offline functionality works on deployed site

2. Update vite-plugin-pwa configuration:
   - The current configuration in vite.config.ts looks correct
   - Verify `base` is properly passed to VitePWA plugin
   - Test that service worker loads correctly

**Required Changes:**
- No changes needed if current configuration works
- May need to adjust service worker scope if deploying to subdirectory

### Step 9: Test Deployment Locally

**Testing Steps:**

1. Build production version:
   - Run `npm run build`
   - Verify no build errors
   - Check output in `dist` directory

2. Test locally with `vite preview`:
   - Run `npm run serve` or `vite preview`
   - Test all routes work correctly
   - Verify SPA navigation functions
   - Test deep linking (direct URL navigation)

3. Test with different base paths:
   - Test with `VITE_BASE_PATH=/` (default)
   - Test with `VITE_BASE_PATH=/tiny-till/` (if deploying to subdirectory)
   - Verify all routes work in both scenarios

**Required Actions:**
- Manual testing before deployment
- Verify all routes load correctly
- Test navigation and deep linking

### Step 10: Deploy and Test Production Build

**Deployment Steps:**

1. Push workflow to GitHub:
   - Commit workflow file to main branch
   - Push to GitHub
   - Monitor GitHub Actions workflow execution

2. Verify deployment:
   - Check GitHub Actions logs for success
   - Wait for deployment to complete (usually 1-3 minutes)
   - Access the deployed URL

3. Test deployed application:
   - Test all routes work correctly
   - Verify SPA navigation functions
   - Test deep linking (refresh on different routes)
   - Verify offline functionality (service worker)
   - Test PWA installation
   - Verify theme persistence
   - Test IndexedDB data persistence
   - Verify all features work as expected

4. Test network conditions:
   - Test with slow 3G network (Chrome DevTools)
   - Test with offline mode
   - Test with intermittent connectivity
   - Verify app loads and functions correctly

**Required Actions:**
- Deploy to GitHub Pages
- Comprehensive testing of deployed site
- Verify all features work correctly

### Step 11: Verify SEO and Performance

**Verification Steps:**

1. Check SEO metadata:
   - Verify page title displays correctly
   - Confirm meta tags are present
   - Check Open Graph tags (if added)
   - Verify canonical URLs

2. Performance testing:
   - Run Lighthouse audit
   - Check Core Web Vitals (LCP, FID, CLS)
   - Verify bundle size is optimized
   - Test loading performance

3. Accessibility testing:
   - Run Lighthouse accessibility audit
   - Verify keyboard navigation works
   - Test screen reader compatibility
   - Check color contrast ratios

**Required Actions:**
- Run performance audits
- Verify SEO configuration
- Test accessibility on deployed site

### Step 12: Create Deployment Documentation

**Documentation to Create:**

1. Update README.md:
   - Add GitHub Pages deployment URL
   - Document deployment process
   - Add troubleshooting section
   - Include custom domain setup instructions (if applicable)

2. Create DEPLOYMENT.md (optional):
   - Detailed deployment guide
   - GitHub Actions workflow explanation
   - Custom domain configuration
   - Common issues and solutions

**Required Actions:**
- Update README.md with deployment information
- Create deployment documentation (optional but recommended)

## File Changes Summary

### Files to Create

1. **`.github/workflows/deploy.yml`** - GitHub Actions workflow for automated deployment
2. **`apps/web/404.html`** - 404 handler for SPA routing on GitHub Pages
3. **`apps/web/.env.production`** - Production environment variables

### Files to Modify

1. **`apps/web/vite.config.ts`** - Verify base path configuration (may not need changes)
2. **`apps/web/package.json`** - Add deployment script (optional)
3. **`README.md`** - Add deployment information and documentation

### Files to Verify (No Changes Expected)

1. **`apps/web/src/main.tsx`** - Router configuration (should work as-is)
2. **`apps/web/index.html`** - Entry point (should work as-is)

## Detailed Implementation

### 1. Create 404.html

Create `apps/web/404.html` with the following content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      sessionStorage.setItem("redirect", location.pathname + location.search + location.hash);
      location.href = "/";
    </script>
    <noscript>
      <meta http-equiv="refresh" content="0;url=/">
      <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; }
        a { color: #0366d6; }
      </style>
      <p>Redirecting to <a href="/">Tiny Till</a>...</p>
    </noscript>
  </head>
  <body></body>
</html>
```

### 2. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./apps/web/dist"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Create Production Environment File

Create `apps/web/.env.production` with the following content:

```bash
# For GitHub Pages user/site deployment
VITE_BASE_PATH=/

# For GitHub Pages project site deployment, uncomment and set repo name:
# VITE_BASE_PATH=/tiny-till/
```

### 4. Add Deployment Script (Optional)

Add to `apps/web/package.json` scripts section:

```json
"deploy:manual": "npm run build && gh-pages -d dist --dotfiles"
```

Install `gh-pages` package:

```bash
npm install --save-dev gh-pages
```

### 5. Update README.md

Add deployment section to README.md:

```markdown
## Deployment

### GitHub Pages

This application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

- **Deployment URL**: [https://username.github.io/tiny-till/](https://username.github.io/tiny-till/)
- **Workflow**: `.github/workflows/deploy.yml`
- **Branch**: `main`

### Manual Deployment

To deploy manually:

```bash
npm run deploy:manual
```

### Custom Domain

To use a custom domain:

1. Navigate to repository Settings → Pages
2. Add your custom domain
3. Configure DNS records
4. Enable HTTPS

### Troubleshooting

- **404 errors on refresh**: Ensure 404.html is properly deployed
- **Broken assets**: Check VITE_BASE_PATH in .env.production
- **Service worker issues**: Clear browser cache and reload
```

## Testing Checklist

### Pre-Deployment Testing

- [ ] Application builds without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run serve` works locally
- [ ] All routes work in development
- [ ] Deep linking works (direct URL navigation)
- [ ] SPA navigation works correctly
- [ ] Theme switching works
- [ ] IndexedDB persistence works
- [ ] Service worker registers correctly
- [ ] Offline functionality works
- [ ] All Playwright tests pass

### Post-Deployment Testing

- [ ] Deployed site loads successfully
- [ ] All routes work on deployed site
- [ ] Deep linking works on deployed site (refresh on routes)
- [ ] SPA navigation works on deployed site
- [ ] Theme persistence works across page reloads
- [ ] IndexedDB data persists across sessions
- [ ] Service worker loads and caches assets
- [ ] Offline functionality works on deployed site
- [ ] PWA install prompt appears
- [ ] All features work correctly
- [ ] Lighthouse performance score > 90
- [ ] Lighthouse accessibility score > 90
- [ ] Lighthouse SEO score > 90
- [ ] HTTPS is enforced
- [ ] No console errors
- [ ] Network throttling test passes (3G, offline)

### Network Conditions Testing

- [ ] Fast 3G network (Chrome DevTools)
- [ ] Slow 3G network (Chrome DevTools)
- [ ] Offline mode
- [ ] Intermittent connectivity
- [ ] Mobile devices (iOS Safari, Chrome Android)
- [ ] Desktop browsers (Chrome, Firefox, Safari, Edge)

## Rollback Plan

If deployment issues occur:

1. **Immediate rollback**: Revert to previous commit on main branch
2. **Workflow disable**: Disable GitHub Actions workflow in repository settings
3. **Manual fix**: Fix issues locally, test thoroughly, then redeploy
4. **Emergency**: Use GitHub Pages 404.html to display maintenance message

## Success Criteria

- Application deploys successfully to GitHub Pages
- All routes work correctly (including deep links)
- SPA navigation functions as expected
- Service worker loads and caches properly
- Offline functionality works
- HTTPS is enforced
- All tests pass in production environment
- Lighthouse scores meet thresholds (> 90)
- Network condition tests pass
- No console errors
- PWA install prompt appears

## Notes and Considerations

1. **Base Path Configuration**: Ensure `VITE_BASE_PATH` matches your GitHub Pages URL structure
2. **Service Worker Scope**: May need adjustment if deploying to subdirectory
3. **Custom Domain**: Requires DNS configuration and HTTPS certificate setup
4. **Caching**: GitHub Pages may cache content; use cache-busting for updates
5. **Deployment Time**: Initial deployment may take 2-3 minutes
6. **Rollback Time**: Rollback takes effect within 1-2 minutes after push
7. **Build Artifacts**: GitHub Actions stores build logs for troubleshooting
8. **Environment Variables**: Don't commit secrets; use GitHub Secrets if needed

## Timeline Estimate

- Configuration setup: 30 minutes
- Create workflow files: 30 minutes
- Test deployment locally: 30 minutes
- Deploy to GitHub Pages: 5 minutes
- Post-deployment testing: 60 minutes
- Documentation updates: 30 minutes

**Total Estimated Time**: ~3 hours

## References

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [TanStack Router Deployment Guide](https://tanstack.com/router/latest/docs/framework/react/guide/deployment)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)
