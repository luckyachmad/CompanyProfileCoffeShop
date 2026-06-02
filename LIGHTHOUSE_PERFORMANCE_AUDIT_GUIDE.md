# Lighthouse Performance Audit Guide

**Task:** 15.5 Run Lighthouse performance audit  
**Requirements:** 16.1, 16.4  
**Target Score:** ≥ 85

---

## Overview

This guide provides comprehensive instructions for running Lighthouse performance audits on the CompanyProfileCoffeeShop application. The application leverages Next.js Image optimization, WebP conversion, and lazy loading to achieve high performance scores.

### Performance Optimizations Already Implemented

✅ **Next.js Image Component** - Automatic WebP delivery and lazy loading  
✅ **Server-Side WebP Conversion** - All uploads converted via Sharp  
✅ **Responsive Images** - Proper `sizes` attributes for all images  
✅ **Priority Loading** - Above-the-fold images marked with `priority`  
✅ **Code Splitting** - Next.js automatic route-based splitting  
✅ **Server-Side Rendering** - Initial page load optimized with SSR  

---

## Prerequisites

### 1. Install Lighthouse

**Option A: Chrome DevTools (Built-in)**
- Lighthouse is included in Chrome DevTools
- No installation required
- Navigate to DevTools → Lighthouse tab

**Option B: Lighthouse CLI (Recommended for CI/CD)**

```bash
npm install -g lighthouse
# or use npx without global install
npx lighthouse --version
```

**Option C: Lighthouse CI**

```bash
npm install -g @lhci/cli
# or add to project devDependencies
npm install --save-dev @lhci/cli
```

### 2. Build Production Bundle

Lighthouse audits must run against production builds, not development mode.

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

The production server will start at `http://localhost:3000`

### 3. Ensure Environment Variables Are Set

```bash
# Required for production build
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_min_32_chars
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffeeshop
DB_USER=coffeeshop_user
DB_PASSWORD=your_password
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./public/uploads
```

---

## Running Lighthouse Audits

### Method 1: Chrome DevTools (Quick Audit)

1. **Open Chrome DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Navigate to Lighthouse Tab**
   - Click the "Lighthouse" tab in DevTools
   - If not visible, click the `»` icon and select "Lighthouse"

3. **Configure Audit Settings**
   - **Mode:** Desktop or Mobile (test both)
   - **Categories:** Check "Performance" (minimum)
   - **Optional:** Check "Accessibility", "Best Practices", "SEO"
   - **Device:** Choose "Desktop" or "Mobile"

4. **Run Audit**
   - Click "Analyze page load"
   - Wait 30-60 seconds for completion
   - Review the report

5. **Save Report**
   - Click the "Save report" icon (floppy disk)
   - Choose format: HTML or JSON
   - Recommended: Save as HTML for easy viewing

### Method 2: Lighthouse CLI (Detailed Audit)

#### Basic Performance Audit

```bash
# Audit landing page (mobile)
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-reports/report-mobile.html

# Audit landing page (desktop)
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --preset=desktop \
  --output=html \
  --output-path=./lighthouse-reports/report-desktop.html
```

#### Comprehensive Audit (All Categories)

```bash
# Full audit with all categories
npx lighthouse http://localhost:3000 \
  --output=html \
  --output=json \
  --output-path=./lighthouse-reports/full-audit

# This creates:
# - full-audit.report.html (visual report)
# - full-audit.report.json (machine-readable data)
```

#### Multiple Pages Audit

```bash
# Create reports directory
mkdir -p lighthouse-reports

# Audit landing page
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-reports/landing-page.html

# Audit admin dashboard (requires authentication)
# Note: Admin pages require session cookies
npx lighthouse http://localhost:3000/admin/menu \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-reports/admin-menu.html \
  --extra-headers='{"Cookie":"next-auth.session-token=your_token_here"}'
```

#### Advanced CLI Options

```bash
# Throttling settings for realistic network conditions
npx lighthouse http://localhost:3000 \
  --throttling.cpuSlowdownMultiplier=4 \
  --throttling-method=simulate \
  --only-categories=performance \
  --output=html

# Multiple runs for averaged results
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=json \
  --runs=5 \
  --output-path=./lighthouse-reports/avg-report.json
```

### Method 3: Lighthouse CI (Automated Testing)

#### Setup Lighthouse CI Configuration

Create `.lighthouserc.json` in project root:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance"]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "first-contentful-paint": ["warn", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["warn", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["warn", {"maxNumericValue": 300}],
        "speed-index": ["warn", {"maxNumericValue": 3000}]
      }
    },
    "upload": {
      "target": "filesystem",
      "outputDir": "./lighthouse-reports"
    }
  }
}
```

#### Run Lighthouse CI

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Ensure production server is running
npm run start

# In a separate terminal, run LHCI
lhci autorun

# Or run steps individually
lhci collect --url=http://localhost:3000
lhci assert
lhci upload
```

---

## Expected Performance Characteristics

### Target Metrics (Mobile - 4G Network Simulation)

| Metric | Target | Excellent | Good | Needs Improvement |
|--------|--------|-----------|------|-------------------|
| **Performance Score** | **≥ 85** | 90-100 | 50-89 | 0-49 |
| First Contentful Paint (FCP) | ≤ 2.0s | ≤ 1.8s | 1.8-3.0s | > 3.0s |
| Largest Contentful Paint (LCP) | ≤ 2.5s | ≤ 2.5s | 2.5-4.0s | > 4.0s |
| Total Blocking Time (TBT) | ≤ 300ms | ≤ 200ms | 200-600ms | > 600ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | ≤ 0.1 | 0.1-0.25 | > 0.25 |
| Speed Index | ≤ 3.0s | ≤ 3.4s | 3.4-5.8s | > 5.8s |

### Target Metrics (Desktop - Fast Network)

| Metric | Target | Excellent | Good | Needs Improvement |
|--------|--------|-----------|------|-------------------|
| **Performance Score** | **≥ 90** | 90-100 | 50-89 | 0-49 |
| First Contentful Paint (FCP) | ≤ 1.0s | ≤ 0.9s | 0.9-1.6s | > 1.6s |
| Largest Contentful Paint (LCP) | ≤ 1.5s | ≤ 1.2s | 1.2-2.4s | > 2.4s |
| Total Blocking Time (TBT) | ≤ 150ms | ≤ 150ms | 150-350ms | > 350ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | ≤ 0.1 | 0.1-0.25 | > 0.25 |
| Speed Index | ≤ 1.5s | ≤ 1.3s | 1.3-2.3s | > 2.3s |

### Expected Optimizations in Reports

✅ **Image Optimizations**
- Properly sized images
- Modern image formats (WebP)
- Lazy-loaded images below the fold
- Responsive images with correct `sizes` attributes
- Priority loading for hero image

✅ **JavaScript Optimizations**
- Minified JavaScript bundles
- Code splitting per route
- Tree-shaking for unused code
- No unused JavaScript

✅ **CSS Optimizations**
- Critical CSS inlined
- Unused CSS removed
- Tailwind JIT compilation

✅ **Caching Strategy**
- Static assets cached with immutable headers
- Efficient cache policy on all static resources
- Service worker (if implemented)

---

## Verification Checklist

### ✅ Requirement 16.1: Performance Score ≥ 85

**Test Command:**
```bash
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=json \
  | jq '.categories.performance.score * 100'
```

**Expected Output:** `≥ 85`

**Verification Steps:**
1. Build production bundle: `npm run build`
2. Start production server: `npm run start`
3. Run Lighthouse audit (mobile preset)
4. Check performance score in report
5. Verify score is 85 or higher

**If Score < 85:**
- Review "Opportunities" section in report
- Check "Diagnostics" for specific issues
- Focus on:
  - Largest Contentful Paint (LCP) < 2.5s
  - Total Blocking Time (TBT) < 300ms
  - Cumulative Layout Shift (CLS) < 0.1

### ✅ Requirement 16.4: WebP Image Delivery

**Test Command:**
```bash
# Check that Next.js serves images as WebP
curl -s http://localhost:3000/api/menu | jq '.[].image_url' | head -5
```

**Manual Verification:**
1. Open landing page in Chrome DevTools
2. Navigate to Network tab
3. Filter by "Img"
4. Reload page
5. Check that images are served with `image/webp` Content-Type
6. Verify `_next/image` URL optimization for remote images

**Expected Behavior:**
- All images served through Next.js Image optimization
- WebP format detected in Network tab
- Automatic format selection based on browser support
- Fallback to original format for browsers without WebP support

**Lighthouse Report Check:**
- Should NOT see "Serve images in next-gen formats" warning
- Should see "Properly size images" as passing
- Should see "Defer offscreen images" as passing

### ✅ Lazy Loading Verification

**Manual Verification:**
1. Open DevTools → Network tab → Img filter
2. Load landing page
3. Observe initial images loaded (Hero, About - marked with `priority`)
4. Scroll down slowly
5. Observe Menu, Gallery images load as they enter viewport

**Expected Behavior:**
- Hero image loads immediately (has `priority` prop)
- About section image loads immediately (above the fold)
- Menu images load when scrolling to Menu section
- Gallery images load when scrolling to Gallery section

**Lighthouse Report Check:**
- "Defer offscreen images" should be passing
- "Lazy load third-party resources" should be passing
- No warnings about loading offscreen images eagerly

---

## Common Performance Issues and Solutions

### Issue 1: Large Largest Contentful Paint (LCP > 2.5s)

**Causes:**
- Hero background image too large
- Missing `priority` attribute on hero image
- Slow server response time

**Solutions:**
```typescript
// Ensure hero image has priority attribute
<Image
  src="/images/hero-background.webp"
  alt="Coffee shop interior"
  fill
  className="object-cover"
  priority // ← Critical for LCP
  sizes="100vw"
/>
```

**Optimize image file size:**
```bash
# Compress hero background to ~200KB
npx sharp-cli -i public/images/hero-background.webp \
  -o public/images/hero-background-optimized.webp \
  --quality 85 \
  --width 1920
```

### Issue 2: High Cumulative Layout Shift (CLS > 0.1)

**Causes:**
- Images without explicit width/height
- Content loading above existing content
- Web fonts causing text reflow

**Solutions:**
```typescript
// Always specify dimensions or use fill + container aspect ratio
<Image
  src={item.image_url}
  alt={item.title}
  width={400}
  height={300}
  className="object-cover"
/>

// Or use fill with container aspect ratio
<div className="relative aspect-[4/3]">
  <Image
    src={item.image_url}
    alt={item.title}
    fill
    className="object-cover"
  />
</div>
```

**Font Loading Strategy** (already implemented):
```typescript
// In src/app/layout.tsx
import { Poppins, Inter } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap', // ← Prevents invisible text
  variable: '--font-poppins'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap', // ← Prevents invisible text
  variable: '--font-inter'
});
```

### Issue 3: Total Blocking Time (TBT > 300ms)

**Causes:**
- Large JavaScript bundles
- Heavy client-side processing
- Blocking third-party scripts

**Solutions:**
```typescript
// Use dynamic imports for heavy components
const Lightbox = dynamic(() => import('@/components/ui/Lightbox'), {
  ssr: false, // Don't render on server
  loading: () => <div>Loading...</div>
});

// Defer non-critical scripts
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive" // Load after page is interactive
/>
```

### Issue 4: Slow Server Response Time (TTFB > 600ms)

**Causes:**
- Cold start (first request to serverless function)
- Slow database queries
- No caching strategy

**Solutions:**
```typescript
// Implement ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds

// Use SWR for client-side caching
import useSWR from 'swr';

const { data: menuItems } = useSWR('/api/menu', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000 // Dedupe requests for 60s
});
```

**Database query optimization:**
```typescript
// Add indexes to frequently queried columns
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_best_seller ON menu_items(is_best_seller) 
  WHERE is_best_seller = TRUE;
```

### Issue 5: Unused JavaScript

**Causes:**
- Importing entire libraries instead of specific functions
- Including development-only code in production

**Solutions:**
```typescript
// Bad - imports entire library
import _ from 'lodash';

// Good - import only what you need
import { debounce } from 'lodash-es';

// Tree-shaking friendly imports
import Button from '@/components/ui/Button';
// instead of
import { Button } from '@/components/ui';
```

---

## Lighthouse Report Interpretation

### Performance Score Breakdown

The Lighthouse performance score is a weighted average of metric scores:

| Metric | Weight |
|--------|--------|
| First Contentful Paint (FCP) | 10% |
| Speed Index | 10% |
| Largest Contentful Paint (LCP) | 25% |
| Total Blocking Time (TBT) | 30% |
| Cumulative Layout Shift (CLS) | 25% |

**Focus Areas for Maximum Impact:**
1. **Total Blocking Time (30%)** - Reduce JavaScript execution time
2. **Largest Contentful Paint (25%)** - Optimize hero image loading
3. **Cumulative Layout Shift (25%)** - Prevent layout shifts

### Report Sections

#### 1. Metrics
- **Actual metric values** measured during audit
- **Color-coded indicators**: Green (good), Orange (needs improvement), Red (poor)
- Compare against target values listed above

#### 2. Opportunities
- **Actionable suggestions** with estimated time savings
- Prioritize by "Estimated Savings" column
- Focus on items saving > 0.5s first

#### 3. Diagnostics
- **Additional information** about page performance
- May not have direct time savings but indicate issues
- Review for best practices compliance

#### 4. Passed Audits
- **Optimizations already implemented**
- Confirms what's working well
- Use to verify requirements compliance

---

## Automated Performance Testing (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/lighthouse-ci.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: coffeeshop
          POSTGRES_USER: coffeeshop_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        env:
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: test_secret_key_min_32_characters
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: coffeeshop
          DB_USER: coffeeshop_user
          DB_PASSWORD: test_password
          NEXT_PUBLIC_WHATSAPP_NUMBER: 628123456789
          STORAGE_DRIVER: local
          STORAGE_LOCAL_PATH: ./public/uploads
        run: npm run build
      
      - name: Run database migrations
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: coffeeshop
          DB_USER: coffeeshop_user
          DB_PASSWORD: test_password
        run: |
          psql -h localhost -U coffeeshop_user -d coffeeshop \
            -f db/migrations/001_init_schema.sql
      
      - name: Start production server
        env:
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: test_secret_key_min_32_characters
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: coffeeshop
          DB_USER: coffeeshop_user
          DB_PASSWORD: test_password
          NEXT_PUBLIC_WHATSAPP_NUMBER: 628123456789
          STORAGE_DRIVER: local
          STORAGE_LOCAL_PATH: ./public/uploads
        run: |
          npm run start &
          npx wait-on http://localhost:3000
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
      
      - name: Upload Lighthouse reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: lighthouse-reports
          path: .lighthouseci/
```

### Package.json Script

Add to `package.json`:

```json
{
  "scripts": {
    "lighthouse": "npm run build && npm run start & npx wait-on http://localhost:3000 && npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-reports/report.html && pkill -f 'next start'",
    "lighthouse:ci": "lhci autorun"
  }
}
```

**Run audit:**
```bash
npm run lighthouse
```

---

## Performance Monitoring Best Practices

### 1. Regular Audit Schedule

- **Weekly:** Run Lighthouse during development
- **Pre-deployment:** Required before production releases
- **Post-deployment:** Verify performance in production
- **Continuous:** Automated CI/CD checks on every PR

### 2. Test Multiple Scenarios

- **Different Pages:** Landing page, admin dashboard
- **Different Devices:** Mobile, tablet, desktop
- **Different Network Conditions:** 4G, 3G, slow 3G
- **Different Data States:** Empty menu, full menu, many gallery images

### 3. Track Metrics Over Time

Create a performance budget and track trends:

```json
{
  "budget": {
    "performance": 85,
    "fcp": 2000,
    "lcp": 2500,
    "tbt": 300,
    "cls": 0.1
  }
}
```

### 4. Monitor Real User Metrics (RUM)

Consider implementing Web Vitals tracking:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### Lighthouse Not Running

**Issue:** Lighthouse fails to start or times out

**Solutions:**
1. Ensure production server is running: `npm run start`
2. Verify port 3000 is not blocked by firewall
3. Close other Chrome instances
4. Clear Chrome cache and restart browser
5. Use incognito mode to avoid extension interference

### Inconsistent Scores

**Issue:** Performance scores vary significantly between runs

**Solutions:**
1. Run multiple audits (3-5) and average results
2. Close unnecessary applications
3. Ensure stable network connection
4. Use throttling settings for consistent results
5. Run audits in Docker for isolated environment

### Low Performance Score Despite Optimizations

**Issue:** Score is below 85 despite following best practices

**Solutions:**
1. Review Opportunities section for specific issues
2. Check if images are being served as WebP
3. Verify Next.js Image optimization is working
4. Test on actual device (mobile phone) not just simulated
5. Profile with Chrome DevTools Performance tab
6. Check for blocking third-party scripts

---

## Summary

This guide provides complete instructions for:
✅ Installing and configuring Lighthouse  
✅ Running audits via DevTools, CLI, and CI/CD  
✅ Understanding expected performance characteristics  
✅ Verifying Requirements 16.1 (score ≥ 85) and 16.4 (WebP delivery)  
✅ Troubleshooting common performance issues  
✅ Implementing automated performance testing  

### Quick Start Commands

```bash
# 1. Build production bundle
npm run build

# 2. Start production server
npm run start

# 3. Run Lighthouse audit (in another terminal)
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-report.html

# 4. Open report
open lighthouse-report.html  # macOS
start lighthouse-report.html  # Windows
xdg-open lighthouse-report.html  # Linux
```

### Next Steps

1. Run initial baseline audit
2. Document current performance scores
3. Implement any suggested optimizations
4. Re-run audit to verify improvements
5. Set up automated CI/CD performance testing
6. Monitor real user metrics in production

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Requirements Covered:** 16.1 (Performance score ≥ 85), 16.4 (WebP delivery and lazy loading)
