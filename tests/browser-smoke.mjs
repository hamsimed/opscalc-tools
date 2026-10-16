#!/usr/bin/env node
// Real-browser smoke test (Playwright + Chromium). Not part of `npm test` because it needs a browser.
// Usage: node tests/browser-smoke.mjs   (optional: AXE_PATH=/path/to/axe.min.js for accessibility audit)
// Checks, for every calculator: example loads and renders a result, empty submit shows a field error,
// no console errors, no horizontal scroll at 375 px, shared-link prefill works.
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { start } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')); }
const Core = require('../assets/js/calc-core.js');
const AXE = process.env.AXE_PATH && existsSync(process.env.AXE_PATH) ? readFileSync(process.env.AXE_PATH, 'utf8') : null;

const PORT = 8765, BASE = `http://localhost:${PORT}`;
const server = await start(PORT);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [], a11y = [];
let checks = 0;
const check = (cond, msg) => { checks++; if (!cond) failures.push(msg); };

async function audit(page, label) {
  if (!AXE) return;
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`));
  res.forEach((v) => a11y.push(`${label}: ${v}`));
}

for (const [vpName, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 375, height: 740 }]]) {
  const ctx = await browser.newContext({ viewport });
  for (const id of Object.keys(Core.registry)) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    const resp = await page.goto(`${BASE}/calculators/${id}`);
    check(resp.status() === 200, `${id}: HTTP ${resp.status()}`);

    // empty submit -> error
    await page.click('button[type=submit]');
    check(await page.locator('#result.is-error').count() === 1, `${vpName} ${id}: empty submit did not show error`);
    check(await page.locator('[aria-invalid=true]').count() >= 1, `${vpName} ${id}: no aria-invalid field`);

    // example -> result matches core
    await page.click('#load-example');
    const shown = (await page.locator('.result-value').textContent())?.trim();
    const r = Core.run(id, Core.exampleRaw(id));
    const primary = r.output.results.find((x) => x.primary) || r.output.results[0];
    check(shown === Core.formatResult(primary), `${vpName} ${id}: shown "${shown}" != expected "${Core.formatResult(primary)}"`);

    // no horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(overflow <= 0, `${vpName} ${id}: horizontal overflow ${overflow}px`);

    if (vpName === 'desktop') {
      // prefill from link
      const qs = new URLSearchParams(Core.exampleRaw(id)).toString();
      await page.goto(`${BASE}/calculators/${id}?${qs}`);
      const shown2 = (await page.locator('.result-value').textContent())?.trim();
      check(shown2 === Core.formatResult(primary), `${id}: link prefill shows "${shown2}"`);
      await audit(page, id);
    }
    check(errors.length === 0, `${vpName} ${id}: console errors: ${errors.join(' | ')}`);
    await page.close();
  }
  for (const p of ['/', '/about', '/contact', '/privacy-policy', '/terms']) {
    const page = await ctx.newPage();
    const resp = await page.goto(BASE + p);
    check(resp.status() === 200, `${p}: HTTP ${resp.status()}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(overflow <= 0, `${vpName} ${p}: horizontal overflow ${overflow}px`);
    if (vpName === 'desktop') await audit(page, p);
    await page.close();
  }
  const page = await ctx.newPage();
  const nf = await page.goto(BASE + '/does-not-exist');
  check(nf.status() === 404, `unknown URL returned ${nf.status()} instead of 404`);
  await page.close();
  await ctx.close();
}

await browser.close();
server.close();
console.log(`Browser checks: ${checks - failures.length}/${checks} passed`);
failures.forEach((f) => console.log('FAIL', f));
if (AXE) { console.log(`Accessibility (axe WCAG 2 A/AA): ${a11y.length} violation group(s)`); a11y.forEach((v) => console.log('  A11Y', v)); }
process.exit(failures.length ? 1 : 0);
