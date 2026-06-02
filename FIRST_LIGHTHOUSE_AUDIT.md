# Your First Lighthouse Audit - Quick Start

**Complete this in 5 minutes** ⏱️

---

## Prerequisites ✓

- [ ] Node.js 20+ installed
- [ ] Chrome browser installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Database running (for production build)

---

## Step 1: Build Production Bundle

```bash
npm run build
```

**Expected output:**
- ✓ Compiled successfully
- ✓ Collecting page data
- ✓ Generating static pages
- ✓ Finalizing page optimization

⏱️ **Takes ~1-2 minutes**

---

## Step 2: Start Production Server

```bash
npm run start
```

**Expected output:**
```
▲ Next.js 16.2.6
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

⏱️ **Server starts in ~3 seconds**

**Important:** Keep this terminal open! Server must stay running during audit.

---

## Step 3: Run Lighthouse Audit

**Option A: Chrome DevTools (Recommended for First Time)**

1. Open Chrome browser
2. Navigate to http://localhost:3000
3. Press `F12` to open DevTools
4. Click the **"Lighthouse"** tab (top menu)
   - If not visible, click `»` and select "Lighthouse"
5. Configure:
   - ✓ Check **"Performance"**
   - Choose **"Mobile"** (default)
   - Click **"Analyze page load"**
6. ⏱️ Wait 30-60 seconds
7. Review results!

**Option B: Command Line (Quick)**

Open a **new terminal** (keep production server running):

```bash
npm run lighthouse
```

⏱️ **Takes ~30-60 seconds**

**Output:**
```
Running Lighthouse audit...
✓ Lighthouse complete!
Report saved to: lighthouse-reports/report-mobile.html
```

---

## Step 4: View Your Report

### If you used DevTools:
- Report displays automatically in DevTools

### If you used CLI:
```bash
# Windows
start lighthouse-reports/report-mobile.html

# macOS
open lighthouse-reports/report-mobile.html

# Linux
xdg-open lighthouse-reports/report-mobile.html
```

---

## Step 5: Check Your Score 🎯

### What to Look For

**Performance Score (Top of Report)**
```
┌──────────────────────┐
│  Performance: 87     │  ← This should be ≥ 85
└──────────────────────┘
```

**Color Coding:**
- 🟢 **Green (90-100):** Excellent!
- 🟠 **Orange (50-89):** Good, but room for improvement
- 🔴 **Red (0-49):** Needs attention

### Core Metrics to Check

| Metric | Your Score | Target | Status |
|--------|------------|--------|--------|
| Performance Score | _____ | ≥ 85 | _____ |
| Largest Contentful Paint (LCP) | _____ | ≤ 2.5s | _____ |
| Total Blocking Time (TBT) | _____ | ≤ 300ms | _____ |
| Cumulative Layout Shift (CLS) | _____ | ≤ 0.1 | _____ |

---

## Step 6: Verify WebP Delivery ✓

### Quick Check in DevTools

1. Open DevTools (F12)
2. Go to **"Network"** tab
3. Filter by **"Img"**
4. Reload page (Ctrl+R / Cmd+R)
5. Click on any image request
6. Check **Headers** → **Response Headers**
7. Look for: `Content-Type: image/webp` ✓

**If you see `image/webp`:** ✅ WebP delivery is working!

---

## Step 7: Verify Lazy Loading ✓

### Quick Visual Test

1. Open DevTools (F12) → **Network** tab → **Img** filter
2. **Clear** network log (🚫 icon)
3. Reload page **but don't scroll**
4. You should see:
   - ✅ Hero image loads (has `priority`)
   - ✅ About image loads (above fold)
   - ❌ Menu images **DO NOT** load yet
   - ❌ Gallery images **DO NOT** load yet

5. Now **scroll down to Menu section**
   - ✅ Menu images start loading as you scroll

**If images load on scroll:** ✅ Lazy loading is working!

---

## ✅ Success Criteria

You've completed your first audit successfully if:

- [x] Performance score ≥ 85
- [x] Build completed without errors
- [x] Production server running
- [x] Lighthouse report generated
- [x] WebP images verified in Network tab
- [x] Lazy loading verified (images load on scroll)

---

## 🎉 Congratulations!

You've successfully run your first Lighthouse performance audit!

### Next Steps

1. **Save your report** for reference
2. **Run desktop audit:** `npm run lighthouse:desktop`
3. **Document your score** in project records
4. **Review full guide** if you want to optimize further: [LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md](./LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md)

---

## ❌ Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill any process using port 3000
pkill -f "next start"  # macOS/Linux
# Or restart your computer
```

### Build fails
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lighthouse won't run
```bash
# Close all Chrome instances and try again
pkill chrome  # macOS/Linux

# Or use incognito mode
npx lighthouse http://localhost:3000 \
  --chrome-flags="--incognito" \
  --only-categories=performance
```

### Score is below 85
This is normal for first audit! Common quick wins:

1. **Optimize hero image size** (<200KB recommended)
2. **Ensure images have `priority` prop** (hero/above-fold)
3. **Check for layout shifts** (all images need dimensions)

Refer to [LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md](./LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md) → "Common Performance Issues and Solutions"

---

## Quick Reference

### Commands Used

```bash
# 1. Build
npm run build

# 2. Start server
npm run start

# 3. Run audit (in new terminal)
npm run lighthouse
```

### File Locations

- **Reports:** `lighthouse-reports/report-mobile.html`
- **Full Guide:** [LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md](./LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md)
- **Checklist:** [PERFORMANCE_AUDIT_CHECKLIST.md](./PERFORMANCE_AUDIT_CHECKLIST.md)
- **All Docs:** [PERFORMANCE_DOCUMENTATION_INDEX.md](./PERFORMANCE_DOCUMENTATION_INDEX.md)

---

## Stop Server

When you're done:

```bash
# In the terminal running the server, press:
Ctrl+C

# Or kill all Next.js processes:
pkill -f "next start"
```

---

**Ready for more?** Check out [PERFORMANCE_DOCUMENTATION_INDEX.md](./PERFORMANCE_DOCUMENTATION_INDEX.md) for the complete documentation suite!
