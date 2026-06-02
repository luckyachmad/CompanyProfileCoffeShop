# Lighthouse Performance Reports

This directory contains Lighthouse performance audit reports for the CompanyProfileCoffeeShop application.

## Reports Organization

Reports are organized by:
- **Device type:** Mobile vs Desktop
- **Page audited:** Landing page vs Admin pages
- **Date/Time:** Timestamp in filename

## Naming Convention

```
{device}-{page}-{YYYYMMDD-HHMMSS}.html
```

Examples:
- `mobile-landing-20240601-120000.html`
- `desktop-landing-20240601-120100.html`
- `mobile-admin-20240601-120200.html`

## Running Audits

### Quick Commands

```bash
# Mobile audit (default)
npm run lighthouse

# Desktop audit
npm run lighthouse:desktop

# Full audit (all categories)
npm run lighthouse:full

# Automated CI audit
npm run lighthouse:ci
```

### Prerequisites

1. Build production bundle: `npm run build`
2. Start production server: `npm run start`
3. Run audit command in a separate terminal

## Performance Targets

| Metric | Mobile Target | Desktop Target |
|--------|---------------|----------------|
| Performance Score | ≥ 85 | ≥ 90 |
| First Contentful Paint | ≤ 2.0s | ≤ 1.0s |
| Largest Contentful Paint | ≤ 2.5s | ≤ 1.5s |
| Total Blocking Time | ≤ 300ms | ≤ 150ms |
| Cumulative Layout Shift | ≤ 0.1 | ≤ 0.1 |
| Speed Index | ≤ 3.0s | ≤ 1.5s |

## Report Contents

Each report includes:
- **Performance score** (0-100)
- **Core Web Vitals** (LCP, TBT, CLS)
- **Opportunities** - Actionable suggestions with time savings
- **Diagnostics** - Additional performance information
- **Passed audits** - Optimizations working correctly

## Interpreting Results

### Score Ranges

- **90-100:** Excellent (Green)
- **50-89:** Needs Improvement (Orange)
- **0-49:** Poor (Red)

### Priority Actions

1. Focus on metrics with highest weight:
   - Total Blocking Time (30%)
   - Largest Contentful Paint (25%)
   - Cumulative Layout Shift (25%)

2. Address opportunities with largest time savings first

3. Fix any red (poor) metrics before optimizing orange (needs improvement) metrics

## Version Control

- ✅ **DO:** Commit baseline reports (first audit of each major release)
- ✅ **DO:** Commit reports showing significant improvements
- ❌ **DON'T:** Commit every audit report (adds unnecessary git history)
- ✅ **DO:** Reference reports in pull request descriptions

## Additional Resources

- **Comprehensive Guide:** `../LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md`
- **Quick Checklist:** `../PERFORMANCE_AUDIT_CHECKLIST.md`
- **Lighthouse CI Config:** `../.lighthouserc.json`
- **Web Vitals:** https://web.dev/vitals/
- **Lighthouse Docs:** https://developers.google.com/web/tools/lighthouse

## Troubleshooting

### Audit Fails to Run

- Ensure production server is running: `npm run start`
- Check port 3000 is accessible
- Try running in incognito mode
- Close other browser instances

### Inconsistent Scores

- Run multiple audits (3-5) and average results
- Use `lighthouse:ci` for automated averaging
- Ensure stable network connection
- Close unnecessary applications

### Score Below Target

1. Review "Opportunities" section in report
2. Implement suggested optimizations
3. Re-run audit to measure impact
4. Refer to `LIGHTHOUSE_PERFORMANCE_AUDIT_GUIDE.md` for solutions

## Contact

For questions about performance audits, refer to the main documentation or contact the development team.

---

**Last Updated:** Generated during Task 15.5  
**Requirements:** 16.1 (Performance ≥ 85), 16.4 (WebP delivery)
