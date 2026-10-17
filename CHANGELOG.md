# Changelog

## [4.0.0] — 2026-10-17 (branch `v4-design-growth`, not deployed)

### Added
- V4 design system ("instrument panel"): sticky navy header, header search combobox (keyboard, "/" shortcut), mobile menu, two-column calculator layout, sticky result readout with 0–100 % meters, Copy result / Copy link with inputs / Clear inputs, table of contents, related-tool cards, 4-column footer.
- Homepage: hero with search and OEE example readout, topic cards, featured tools, filterable list (category chips + text filter synced to `?q=&cat=`, empty state).
- 7 category landing pages `/categories/<id>` (guide content, CollectionPage + BreadcrumbList JSON-LD), included in sitemap.
- 8 calculators: TEEP, Pump Power, Pump Affinity Laws, Compressed Air Leak Cost, CO₂ Emissions, NPV/IRR, Inventory Carrying Cost, Unit Cost (unit tests with hand-checked values).
- "Common mistakes" and "Where it's used" sections on all 35 calculator pages; extra internal links.
- `/assets/search-index.json`; `_redirects` for `/favicon.ico`.

### Changed
- Link teal darkened to #097068 for WCAG AA contrast.
- Browser smoke test covers search, filters, mobile nav, combobox, category pages.

### Unchanged
- The 27 existing formulas (`calc-core.js` additions only).

## [3.0.0] — 2026-10-16 (branch `dev`, not deployed)

### Added
- Shared calculation core (`assets/js/calc-core.js`) with generic validation (required, numeric, ranges, integers, cross-field rules) and 27 calculators:
  - Production & Lean: OEE (shop-floor data or A/P/Q), Takt Time, Cycle Time, Production Rate, Capacity Utilization, Little's Law / Lead Time
  - Quality: First Pass Yield & Scrap, DPMO & Sigma Level
  - Maintenance: MTBF (with reliability), MTTR, Availability, Downtime Cost
  - Energy: Energy Cost, Specific Energy Consumption, Electrical Power (kW/kVA/kvar), Power Factor Correction, Motor Efficiency Savings
  - Inventory & Logistics: Reorder Point, Safety Stock, EOQ, Inventory Turnover, Belt Conveyor Capacity
  - Finance: ROI (with annualized), Payback Period, Break-Even
  - Workforce: Working Hours (clock times, overnight), Labor Productivity
- Static site generator (`scripts/build.mjs`): formula block, variables table, worked example computed from the core, practitioner sections, FAQ, related links, breadcrumbs.
- JSON-LD: WebApplication + BreadcrumbList on calculators; WebSite + ItemList on home.
- Extensionless canonical URLs, generated sitemap with `lastmod`, `404.html`, `_headers` (security headers, sitemap content type).
- Consent-gated GA4 loader (disabled; no ID configured). Events carry only calculator id, never input values.
- "Load example", "Reset", "Copy link with these inputs" and link prefill.
- Test suites: 32 formula tests, 10 site-integrity tests, browser smoke test (Playwright, desktop + mobile, axe-core).

### Fixed
- Production Rate: target rate was collected but ignored. Attainment and gap are now calculated.
- Working Hours: decimal clock input (e.g. 17.5) replaced by HH:MM time fields; identical start/end and break ≥ shift rejected with clear messages.
- Energy Cost: added load factor and motor efficiency (nameplate kW is output power for motors).
- Unknown URLs returned the homepage with HTTP 200 (no 404.html). Now return HTTP 404.
- Internal links pointed at `.html` URLs while the sitemap listed extensionless URLs.

### Changed
- New responsive stylesheet with dark mode, visible focus, unit suffixes on inputs, field-level error messages.
- Privacy policy, terms and about pages rewritten. Contact page waits for an owner-provided address.

## [2.0.0] — archive `opscalc-tools-v2-ready.zip` (never deployed)
- Proposed 5 extra calculators (takt time, cycle time, MTBF, MTTR, ROI) as simple divisions. Superseded by 3.0.0. Canonicals pointed at `.html` URLs (inconsistent with the production sitemap).

## [1.0.0] — 2026-10-12 (production `main`)
- 5 calculators, static pages, sitemap.xml, robots.txt, Search Console verification file.
