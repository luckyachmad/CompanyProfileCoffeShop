# Performance Audit Quick Reference Checklist

**Related:** `LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md` (comprehensive guide)

---

## Pre-Audit Setup

- [ ] Build production bundle: `npm run build`
- [ ] Start production server: `npm run start`
- [ ] Verify server running at http://localhost:3000
- [ ] Close unnecessary browser tabs and applications
- [ ] Ensure stable network connection

---

## Run Lighthouse Audit

### Option 1: Chrome DevTools (Quick)

- [ ] Open Chrome DevTools (F12)
- [ ] Navigate to Lighthouse tab
- [ ] Select "Performance" category
- [ ] Choose Device: Mobile or Desktop
- [ ] Click "Analyze page load"
- [ ] Save report as HTML

### Option 2: CLI (Recommended)

```bash
# Create reports directory
mkdir -p lighthouse-reports

# Run mobile audit
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-reports/mobile-$(date +%Y%m%d-%H%M%S).html

# Run desktop audit
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --preset=desktop \
  --output=html \
  --output-path=./lighthouse-reports/desktop-$(date +%Y%m%d-%H%M%S).html
```

---

## Performance Score Verification

### Requirements Compliance

- [ ] **Requirement 16.1:** Performance score ≥ 85 (mobile)
- [ ] **Requirement 16.1:** Performance score ≥ 90 (desktop)
- [ ] **Requirement 16.4:** Images served as WebP format
- [ ] **Requirement 16.4:** Lazy loading working for below-fold images

### Core Web Vitals

- [ ] **LCP** (Largest Contentful Paint) ≤ 2.5s (mobile)
- [ ] **LCP** (Largest Contentful Paint) ≤ 1.5s (desktop)
- [ ] **TBT** (Total Blocking Time) ≤ 300ms (mobile)
- [ ] **TBT** (Total Blocking Time) ≤ 150ms (desktop)
- [ ] **CLS** (Cumulative Layout Shift) ≤ 0.1 (both)

### Additional Metrics

- [ ] **FCP** (First Contentful Paint) ≤ 2.0s (mobile)
- [ ] **FCP** (First Contentful Paint) ≤ 1.0s (desktop)
- [ ] **Speed Index** ≤ 3.0s (mobile)
- [ ] **Speed Index** ≤ 1.5s (desktop)

---

## WebP Image Delivery Verification

### Manual Network Tab Check

- [ ] Open Chrome DevTools → Network tab
- [ ] Filter by "Img"
- [ ] Clear network log and reload page
- [ ] Verify images show Content-Type: `image/webp`
- [ ] Check that images use `/_next/image` optimization URLs

### Expected Image Sources

- [ ] Hero background: `/images/hero-background.webp`
- [ ] About section image: `/images/about-coffee-shop.webp`
- [ ] Menu item images: Served through Next.js Image optimization
- [ ] Gallery photos: Served through Next.js Image optimization

### Lighthouse Report Verification

- [ ] No warning: "Serve images in next-gen formats"
- [ ] Passing: "Properly size images"
- [ ] Passing: "Defer offscreen images"
- [ ] Passing: "Use video formats for animated content"

---

## Lazy Loading Verification

### Visual Scroll Test

- [ ] Open DevTools → Network → Img filter
- [ ] Load page (don't scroll)
- [ ] Observe: Hero + About images load immediately
- [ ] Scroll to Menu section
- [ ] Observe: Menu images load as section enters viewport
- [ ] Scroll to Gallery section
- [ ] Observe: Gallery images load as section enters viewport

### Priority Loading Check

```typescript
// Verify these components have priority attribute:
- [ ] Hero background image has `priority` prop
- [ ] About section image (above fold) has `priority` prop
```

### Lighthouse Report Verification

- [ ] Passing: "Defer offscreen images"
- [ ] No red flags in "Opportunities" section
- [ ] "Lazy load third-party resources" passing

---

## Common Issues Quick Fix

### If Score < 85

1. **Check LCP (Largest Contentful Paint)**
   - [ ] Hero image has `priority` attribute?
   - [ ] Hero image size < 200KB?
   - [ ] Server response time < 600ms?

2. **Check TBT (Total Blocking Time)**
   - [ ] JavaScript bundles minified?
   - [ ] No blocking third-party scripts?
   - [ ] Code splitting working?

3. **Check CLS (Cumulative Layout Shift)**
   - [ ] All images have explicit dimensions?
   - [ ] Font loading uses `display: 'swap'`?
   - [ ] No content inserted above existing content?

### If WebP Not Working

- [ ] Check `next.config.ts` has `remotePatterns` for storage
- [ ] Verify Sharp is installed: `npm list sharp`
- [ ] Check browser supports WebP (all modern browsers do)
- [ ] Review storage adapter returning correct URLs

### If Lazy Loading Not Working

- [ ] Verify Next.js Image component used (not `<img>`)
- [ ] Check images don't all have `priority` attribute
- [ ] Ensure `loading="lazy"` not explicitly set to `"eager"`

---

## Report Actions

### After Audit Completion

- [ ] Save report HTML file
- [ ] Document performance score in project records
- [ ] Review "Opportunities" section for improvements
- [ ] Review "Diagnostics" for additional insights
- [ ] Take screenshot of metrics summary

### If Score ≥ 85

- [ ] ✅ Mark task 15.5 as complete
- [ ] Archive report in `lighthouse-reports/` directory
- [ ] Update project documentation with score
- [ ] Set up automated CI/CD performance testing

### If Score < 85

- [ ] Identify top 3 opportunities (highest estimated savings)
- [ ] Create action items for each optimization
- [ ] Implement fixes one at a time
- [ ] Re-run audit after each fix to measure impact
- [ ] Repeat until score ≥ 85

---

## Automated Testing Setup (Optional)

### Lighthouse CI Configuration

- [ ] Create `.lighthouserc.json` configuration
- [ ] Set performance score threshold to 85
- [ ] Configure 3 runs for averaged results
- [ ] Set up GitHub Actions workflow
- [ ] Test CI pipeline with pull request

### Commands

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun

# View reports
open .lighthouseci/
```

---

## Documentation

### Files to Update

- [ ] Add report to `lighthouse-reports/` directory
- [ ] Update `README.md` with performance scores
- [ ] Document any optimizations implemented
- [ ] Update `CHANGELOG.md` with performance improvements

### Recommended Report Naming

```
lighthouse-reports/
  ├── mobile-landing-20240101-120000.html
  ├── desktop-landing-20240101-120030.html
  ├── mobile-admin-20240101-120100.html
  └── desktop-admin-20240101-120130.html
```

---

## Emergency Troubleshooting

### Lighthouse Not Starting

```bash
# Kill any hung Chrome processes
pkill -9 chrome

# Clear Chrome cache
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache/*

# Run in incognito mode
npx lighthouse http://localhost:3000 \
  --chrome-flags="--incognito" \
  --only-categories=performance
```

### Server Not Responding

```bash
# Check if server is running
curl http://localhost:3000

# Check for port conflicts
lsof -i :3000

# Restart server
pkill -f "next start"
npm run start
```

### Inconsistent Scores

```bash
# Run 5 audits and average results
for i in {1..5}; do
  npx lighthouse http://localhost:3000 \
    --only-categories=performance \
    --output=json \
    --output-path=./lighthouse-reports/run-$i.json
done

# Calculate average (requires jq)
jq -s 'map(.categories.performance.score) | add / length * 100' \
  ./lighthouse-reports/run-*.json
```

---

## Quick Commands Reference

```bash
# Build and start production server
npm run build && npm run start

# Run basic mobile audit
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=html

# Run desktop audit
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --preset=desktop \
  --output=html

# Run full audit (all categories)
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./full-report.html

# Run multiple audits with averaging
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --runs=5 \
  --output=json

# Check WebP delivery
curl -s http://localhost:3000 | grep 'webp'

# Kill server
pkill -f "next start"
```

---

## Sign-Off Checklist

- [ ] Performance score ≥ 85 achieved
- [ ] WebP delivery verified
- [ ] Lazy loading verified
- [ ] Report saved to `lighthouse-reports/`
- [ ] Documentation updated
- [ ] Task 15.5 marked complete

**Auditor:** _________________  
**Date:** _________________  
**Score (Mobile):** _________________  
**Score (Desktop):** _________________  

---

**For detailed explanations and troubleshooting, refer to:**  
`LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md`
