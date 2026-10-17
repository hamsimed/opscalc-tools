#!/usr/bin/env node
// Generates the Open Graph share images (1200×630 PNG) into assets/og/.
// Run once after a visual change: PLAYWRIGHT_PATH=/path/to/playwright node scripts/og-images.mjs
// The PNGs are committed; the site itself has no runtime dependency on this script.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, categories } from '../src/content.mjs';
import { ICON_PATHS } from '../src/icons.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')); }
const Core = require('../assets/js/calc-core.js');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/og');
mkdirSync(OUT, { recursive: true });

const HUE = { production: '#5FD9CF', quality: '#B9A9FF', maintenance: '#FF9F8A', energy: '#F5C451', inventory: '#8DB5FF', finance: '#7FD9A6', workforce: '#FF9CC2' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const LOGO = '<svg viewBox="0 0 32 32" width="56" height="56"><rect width="32" height="32" rx="7" fill="#12305A"/><path d="M7 21a9 9 0 0 1 18 0" fill="none" stroke="#5FD9CF" stroke-width="2.4" stroke-linecap="round"/><path d="M16 21l5-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="21" r="2" fill="#fff"/></svg>';

const css = `*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0B1F3A;color:#fff;font-family:Inter,"Segoe UI",system-ui,sans-serif;position:relative}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(95,217,207,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(95,217,207,.07) 1px,transparent 1px);background-size:40px 40px;-webkit-mask-image:radial-gradient(ellipse 80% 90% at 75% 40%,#000 30%,transparent 85%)}
.wrap{position:relative;display:grid;grid-template-columns:1fr 400px;gap:56px;height:100%;padding:64px 72px}
.left{display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;font-size:32px;font-weight:650;letter-spacing:-.01em}.brand b{color:#5FD9CF;font-weight:650}
h1{margin-top:auto;font-size:60px;line-height:1.06;font-weight:750;letter-spacing:-.03em;text-wrap:balance}
.sub{margin-top:22px;font-size:25px;line-height:1.38;color:#B9C8DA;max-width:640px;text-wrap:pretty}
.domain{margin-top:auto;padding-top:28px;font-size:22px;font-weight:600;color:#5FD9CF}
.card{align-self:center;background:#071528;border:1px solid rgba(95,217,207,.28);border-radius:24px;padding:36px;box-shadow:0 30px 60px rgba(0,0,0,.35)}
.lbl{font-size:20px;color:#A9BBD1;font-weight:600}
.big{font-size:84px;font-weight:750;color:#5FD9CF;letter-spacing:-.03em;line-height:1.05;margin:8px 0 22px}
.row{display:grid;grid-template-columns:130px 1fr 74px;gap:14px;align-items:center;font-size:19px;color:#D3DDEA;margin-top:14px}
.row .v{text-align:right;color:#fff;font-weight:650}
.meter{height:10px;border-radius:99px;background:rgba(159,178,202,.25);overflow:hidden}.meter i{display:block;height:100%;border-radius:inherit;background:#5FD9CF}
.tile{width:120px;height:120px;border-radius:24px;display:grid;place-items:center;margin-bottom:26px}
.tile svg{width:64px;height:64px}
.tools{list-style:none;padding:0;margin-top:14px}.tools li{font-size:21px;color:#E3EAF3;padding:10px 0;border-top:1px solid rgba(255,255,255,.1)}`;

function page({ title, sub, card }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="grid"></div><div class="wrap">
<div class="left"><div class="brand">${LOGO}<span>OpsCalc <b>Tools</b></span></div><h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p><p class="domain">tools.saharienne.org</p></div>
<div class="card">${card}</div></div></body></html>`;
}

const demo = Core.run('oee', Core.exampleRaw('oee')).output.results;
const g = (k) => demo.find((r) => r.key === k);
const defaultCard = `<p class="lbl">Example: packaging line OEE</p><p class="big">${Core.formatResult(g('oee'))}</p>` +
  ['a', 'p', 'q'].map((k) => `<div class="row"><span>${g(k).label}</span><div class="meter"><i style="width:${g(k).value}%"></i></div><span class="v">${Core.formatResult(g(k))}</span></div>`).join('');

const PRIORITY = ['oee', 'power-factor-correction', 'compressed-air-leak-cost', 'safety-stock', 'takt-time', 'mtbf', 'pump-power', 'affinity-laws', 'teep', 'specific-energy-consumption', 'belt-conveyor-capacity', 'eoq', 'reorder-point', 'mttr', 'downtime-cost', 'electrical-power', 'npv', 'break-even', 'roi', 'first-pass-yield', 'labor-productivity'];
const rank = (id) => { const i = PRIORITY.indexOf(id); return i < 0 ? 99 : i; };
const jobs = [{ file: 'default.png', html: page({ title: 'Engineering‑grade calculators for operations', sub: `${pages.length} free tools with formulas, units and worked examples.`, card: defaultCard }) }];
for (const c of categories) {
  const items = pages.filter((p) => p.category === c.id);
  // Show the tools the 90-day SEO plan prioritises first (lot A), then the rest in list order.
  const top = [...items].sort((a, b) => rank(a.id) - rank(b.id)).slice(0, 3).map((p) => p.title.replace(/ Calculator.*$/, ''));
  const hue = HUE[c.id];
  const card = `<div class="tile" style="background:${hue}22;color:${hue}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[c.id]}</svg></div>` +
    `<p class="lbl">${items.length} calculators, including</p><ul class="tools">${top.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  jobs.push({ file: `${c.id}.png`, html: page({ title: `${c.name} calculators`, sub: c.blurb + ' Free, with formulas and worked examples.', card }) });
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const j of jobs) {
  await pg.setContent(j.html, { waitUntil: 'load' });
  await pg.screenshot({ path: join(OUT, j.file), type: 'png' });
}
await browser.close();
console.log(`Open Graph images: ${jobs.map((j) => j.file).join(', ')}`);
