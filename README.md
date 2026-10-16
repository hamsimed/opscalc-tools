# OpsCalc Tools

Free, browser-based calculators for operations, maintenance, energy, inventory and business finance.
Static site hosted on Cloudflare Pages: no framework, no runtime dependencies, no server-side code.

Production: https://opscalc-tools.pages.dev/

## Architecture

```
assets/js/calc-core.js   Single source of truth: inputs, validation and math for every calculator
                         (UMD: runs in the browser as window.OpsCalc and in Node for build/tests)
assets/js/calc-ui.js     Generic form binding: validation messages, results, example, share link
assets/js/analytics.js   Consent-gated GA4 loader — inactive until an ID is set in site-config.js
assets/js/site-config.js Site runtime settings (GA4 ID, empty by default)
assets/style.css         Single stylesheet (light/dark, responsive)
src/content.mjs          Page content: intro, formulas, variables, worked example context, sections, FAQ, related links
src/site.mjs             Site settings: origin, contact email, review date
scripts/build.mjs        Generates calculators/*.html, index, static pages, 404, sitemap.xml, robots.txt
scripts/serve.mjs        Local server mimicking Cloudflare Pages (extensionless URLs, real 404)
tests/                   Formula tests, site integrity tests, browser smoke test
_headers                 Cloudflare Pages headers (security, sitemap content type)
google21e1d3b118076e1a.html  Search Console ownership file — do not delete
```

Generated HTML is committed, so Cloudflare Pages needs **no build step** (framework: None, build command: empty, output directory: `/`).

## Workflow

```bash
npm run build     # regenerate HTML, sitemap, robots
npm test          # formula + site integrity tests (no dependencies)
npm run serve     # http://localhost:8080
# Optional real-browser test (needs Playwright + Chromium; axe-core optional):
node tests/browser-smoke.mjs
```

## Adding a calculator

1. Add a `define('<id>', { inputs, compute })` block in `assets/js/calc-core.js`. Each input needs an `example` value.
2. Add hand-calculated reference tests in `tests/formulas.test.mjs`.
3. Add a content entry with the same `id` in `src/content.mjs` (≥ 2 related links, formulas, variables, sections, FAQ).
4. `npm run build && npm test`, then review the page locally.

The build fails if a calculator has no content, a related link is broken, or a worked example is invalid.

## URL and SEO conventions

- Canonical URLs are extensionless (`/calculators/oee`), matching Cloudflare Pages' pretty-URL behaviour. Legacy `.html` files are kept so old links keep working.
- Internal links never use `.html`.
- `sitemap.xml` is generated and lists exactly the canonical URLs.
- `404.html` exists so unknown URLs return HTTP 404 (without it, Cloudflare Pages serves the homepage with HTTP 200).

## Deployment

Work on `dev`. Cloudflare Pages builds a preview for non-production branches (if previews are enabled).
Merging `dev` into `main` deploys to production. **Production deploys require owner approval.**
