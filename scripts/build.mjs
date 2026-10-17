#!/usr/bin/env node
// Static site generator for OpsCalc Tools. No dependencies.
// Output is written to the repository root so Cloudflare Pages settings stay unchanged
// (framework: none, build command: none, output directory: /).
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/site.mjs';
import { pages, categories } from '../src/content.mjs';
import { categoryPages, featured } from '../src/content-v4.mjs';
import { ICON_PATHS } from '../src/icons.mjs';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const Core = require('../assets/js/calc-core.js');
// Cache-busting version = hash of the shared assets, so any change (even the same day) gets a new URL.
const ASSET_V = createHash('sha256')
  .update(['assets/style.css', 'assets/js/calc-core.js', 'assets/js/calc-ui.js', 'assets/js/site.js', 'assets/js/analytics.js', 'assets/js/site-config.js']
    .map((f) => readFileSync(join(ROOT, f), 'utf8')).join('\n'))
  .digest('hex').slice(0, 10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (path) => site.origin + path;
const calcPath = (id) => `/calculators/${id}`;
const byId = Object.fromEntries(pages.map((p) => [p.id, p]));

function out(rel, html) {
  const f = join(ROOT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, html);
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

const catPath = (id) => `/categories/${id}`;
const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
const ICON_SEARCH = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const LOGO = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#12305A"/><path d="M7 21a9 9 0 0 1 18 0" fill="none" stroke="#5FD9CF" stroke-width="2.4" stroke-linecap="round"/><path d="M16 21l5-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="21" r="2" fill="#fff"/></svg>';

function searchBox({ id, label, placeholder, big = false }) {
  return `<div class="search" data-combobox>
<label class="sr-only" for="${id}">${esc(label)}</label>
${ICON_SEARCH}<input id="${id}" class="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="${esc(placeholder)}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list"${big ? '' : ''}>
<ul id="${id}-list" class="search-list" role="listbox" aria-label="Matching calculators" hidden></ul>
</div>`;
}

const OG = { w: 1200, h: 630 };
const ogImage = (name) => url(`/assets/og/${name}.png`);
const reviewedOn = (p) => p.reviewed || site.contentReviewed;
const longDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function layout({ title, description, path, body, ld = [], scripts = [], noindex = false, home = false, active = '', image = 'default', imageAlt = '' }) {
  const navLink = (href, label, key) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url(path)}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${noindex ? '' : `<meta property="og:url" content="${url(path)}">`}
<meta property="og:image" content="${ogImage(image)}">
<meta property="og:image:width" content="${OG.w}">
<meta property="og:image:height" content="${OG.h}">
<meta property="og:image:alt" content="${esc(imageAlt || `${site.name}: engineering-grade calculators for operations`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ogImage(image)}">
<meta name="theme-color" content="#0B1F3A">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css?v=${ASSET_V}">
${ld.map(jsonLd).join('\n')}
<script src="/assets/js/site-config.js?v=${ASSET_V}" defer></script>
<script src="/assets/js/analytics.js?v=${ASSET_V}" defer></script>
<script src="/assets/js/site.js?v=${ASSET_V}" defer></script>
${scripts.map((s) => `<script src="${s}?v=${ASSET_V}" defer></script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap hdr">
<a class="brand" href="/">${LOGO}<span>OpsCalc <b>Tools</b></span></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
<nav class="nav" id="site-nav" aria-label="Main">${navLink('/#calculators', 'Calculators', 'calc')}${navLink('/#categories', 'Topics', 'topics')}${navLink('/about', 'About', 'about')}${navLink('/contact', 'Contact', 'contact')}</nav>
${home ? '' : `<div class="hdr-search">${searchBox({ id: 'hdr-search-input', label: 'Search calculators', placeholder: 'Search calculators' })}</div>`}
</div></header>
<main id="main">
${body}
</main>
<footer class="site-footer"><div class="wrap">
<div class="ftr">
<div><a class="brand" href="/">${LOGO}<span>OpsCalc <b>Tools</b></span></a><p class="muted">${esc(site.tagline)}. Formulas, units and worked examples on every page.</p></div>
<nav aria-labelledby="f-topics"><h2 id="f-topics">Topics</h2><ul>${categories.map((c) => `<li><a href="${catPath(c.id)}">${esc(c.name)}</a></li>`).join('')}</ul></nav>
<nav aria-labelledby="f-start"><h2 id="f-start">Start here</h2><ul>${featured.map((f) => `<li><a href="${calcPath(f)}">${esc(byId[f].title)}</a></li>`).join('')}</ul></nav>
<nav aria-labelledby="f-site"><h2 id="f-site">Site</h2><ul><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li><li><a href="/privacy-policy">Privacy</a></li><li><a href="/terms">Terms</a></li></ul></nav>
</div>
<p class="ftr-base">© ${site.year} ${esc(site.name)}. Results are estimates for planning and learning; verify them before critical decisions.</p>
</div></footer>
</body>
</html>
`;
}
function fieldHtml(inp) {
  const id = inp.name;
  const showAttr = inp.showIf ? ` data-showif="${esc(inp.showIf.name)}"` : '';
  const helpId = inp.help ? `help-${id}` : '';
  const describedBy = [helpId, `err-${id}`].filter(Boolean).join(' ');
  let control;
  if (inp.type === 'select') {
    control = `<select id="${id}" name="${id}" aria-describedby="${describedBy}">${inp.options.map((o) => `<option value="${esc(o.value)}"${o.value === inp.default ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  } else if (inp.type === 'time') {
    control = `<input id="${id}" name="${id}" type="time" required aria-describedby="${describedBy}">`;
  } else {
    const attrs = [`id="${id}"`, `name="${id}"`, 'type="text"', 'inputmode="decimal"', 'autocomplete="off"', `aria-describedby="${describedBy}"`];
    if (!inp.optional) attrs.push('required');
    if (inp.example != null) attrs.push(`placeholder="e.g. ${esc(Core.fmtNumber(inp.example, 6))}"`);
    control = `<div class="input-unit"><input ${attrs.join(' ')}>${inp.unit ? `<span class="unit" aria-hidden="true">${esc(inp.unit)}</span>` : ''}</div>`;
  }
  const labelUnit = inp.unit && inp.type === 'number' ? ` <span class="sr-only">(${esc(inp.unit)})</span>` : '';
  return `<div class="field" id="f-${id}"${showAttr}${inp.showIf ? ' hidden' : ''}>
<label for="${id}">${esc(inp.label)}${labelUnit}</label>
${control}
${inp.help ? `<p class="field-help" id="${helpId}">${esc(inp.help)}</p>` : ''}
<p class="field-error" id="err-${id}" aria-live="polite"></p>
</div>`;
}

function exampleTable(p) {
  const calc = Core.registry[p.id];
  const raw = Core.exampleRaw(p.id);
  const r = Core.run(p.id, raw);
  if (!r.ok) throw new Error(`Example for ${p.id} is invalid: ${r.message}`);
  const sv = {};
  calc.inputs.filter((i) => i.type === 'select').forEach((i) => (sv[i.name] = raw[i.name] ?? i.default));
  const rows = calc.inputs.filter((i) => i.example != null && Core.isVisible(i, sv)).map((i) => {
    let val = i.type === 'select' ? i.options.find((o) => o.value === raw[i.name]).label : i.type === 'time' ? raw[i.name] : `${Core.fmtNumber(i.example, 6)}${i.unit ? ' ' + i.unit : ''}`;
    return `<tr><th scope="row">${esc(i.label)}</th><td>${esc(val)}</td></tr>`;
  }).join('');
  const results = r.output.results.map((x) => `<tr><th scope="row">${esc(x.label)}</th><td><strong>${esc(Core.formatResult(x))}</strong></td></tr>`).join('');
  return `<p>${esc(p.exampleContext)}</p>
<div class="table-scroll"><table class="data"><caption>Inputs</caption><tbody>${rows}</tbody></table></div>
<div class="table-scroll"><table class="data"><caption>Results</caption><tbody>${results}</tbody></table></div>
${r.output.notes.length ? `<p class="hint">${r.output.notes.map(esc).join(' ')}</p>` : ''}
<p><button type="button" class="btn btn-secondary" id="load-example-2">Load this example into the calculator</button></p>`;
}


const TRUST_ICONS = ['<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/>', '<path d="M9 3h6M10 3v6.5L4.8 18.2A1.9 1.9 0 0 0 6.4 21h11.2a1.9 1.9 0 0 0 1.6-2.8L14 9.5V3"/><path d="M7.5 15h9"/>', '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>', '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>'];
const svgIcon = (paths, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
const catIcon = (id) => `<span class="ico-tile hue c-${id}">${svgIcon(ICON_PATHS[id])}</span>`;
const SYMBOL = { oee: 'OEE', mtbf: 'MTBF', 'energy-cost': 'kWh', 'safety-stock': 'SS', npv: 'NPV', 'takt-time': 'TAKT' };
// First sentence of a description; abbreviations such as "e.g." and "i.e." do not end a sentence.
const firstSentence = (s) => {
  const safe = s.replace(/\b(e\.g|i\.e|etc|vs|approx)\. /g, '$1\u0000 ');
  return safe.split('. ')[0].replace(/\.$/, '').replace(/\u0000/g, '.') + '.';
};
const listHtml = (items, cls) => `<ul class="list-check${cls ? ' ' + cls : ''}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

function calcPage(p) {
  const calc = Core.registry[p.id];
  if (!calc) throw new Error(`No core definition for ${p.id}`);
  const cat = catById[p.category];
  const path = calcPath(p.id);
  const related = p.related.map((id) => {
    const r = byId[id];
    if (!r) throw new Error(`${p.id}: related id ${id} not found`);
    return `<a class="rel-card" href="${calcPath(id)}"><strong>${esc(r.title)}</strong><span>${esc(firstSentence(r.description))}</span></a>`;
  }).join('');
  const toc = [['formula', 'Formula'], ['example', 'Worked example'], ...p.sections.map((s, i) => [`s${i}`, s.h])];
  if (p.mistakes) toc.push(['mistakes', 'Common mistakes']);
  if (p.applications) toc.push(['uses', 'Where it’s used']);
  toc.push(['faq', 'Questions'], ['related', 'Related calculators']);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: p.title, url: url(path), description: p.description, applicationCategory: 'BusinessApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, dateModified: reviewedOn(p), image: ogImage(p.category), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: site.name, url: url('/') } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: url('/') }, { '@type': 'ListItem', position: 2, name: cat.name, item: url(catPath(cat.id)) }, { '@type': 'ListItem', position: 3, name: p.title, item: url(path) }] }
  ];
  const body = `<div class="wrap">
<div class="page-head">
<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="${catPath(cat.id)}">${esc(cat.name)}</a></li><li aria-current="page">${esc(p.title)}</li></ol></nav>
<h1>${esc(p.title)}</h1>
<p class="lead">${esc(p.intro)}</p>
<p class="reviewed">Last reviewed <time datetime="${reviewedOn(p)}">${longDate(reviewedOn(p))}</time></p>
</div>
<div class="calc-layout">
<section class="panel" aria-labelledby="calc-title">
<h2 id="calc-title" class="panel-title">Your inputs</h2>
<form id="calc-form" data-calc="${p.id}" novalidate>
<div class="form-grid">
${calc.inputs.map(fieldHtml).join('\n')}
</div>
<div class="actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="button" id="load-example">Load example</button><button class="btn btn-ghost" type="button" id="reset">Clear inputs</button></div>
</form>
<p class="privacy-note">Calculations run in your browser. Your inputs are not sent to any server.</p>
<noscript><p class="field-error">This calculator needs JavaScript. The formula below lets you calculate by hand.</p></noscript>
</section>
<aside class="readout" aria-labelledby="ro-title">
<h2 id="ro-title">Result</h2>
<div id="result" role="status" aria-live="polite"><p class="ro-empty">Enter your values and press Calculate, or load the worked example.</p></div>
<div class="ro-actions"><button class="btn btn-on-dark" type="button" id="copy-result" data-needs-result disabled>Copy result</button><button class="btn btn-on-dark" type="button" id="share-link">Copy link with inputs</button></div>
<p class="ro-status" id="ro-status" aria-live="polite"></p>
</aside>
</div>
<div class="content-layout">
<nav class="toc" aria-label="On this page"><p>On this page</p><ol>${toc.map(([a, l]) => `<li><a href="#${a}">${esc(l)}</a></li>`).join('')}</ol></nav>
<article class="content">
<h2 id="formula">Formula</h2>
<div class="formula">${p.formulas.map((f) => `<code>${esc(f)}</code>`).join('')}</div>
<div class="table-scroll"><table class="data"><caption>Variables and units</caption><thead><tr><th scope="col">Term</th><th scope="col">Meaning</th><th scope="col">Unit</th></tr></thead><tbody>${p.vars.map((v) => `<tr><td>${esc(v[0])}</td><td>${esc(v[1])}</td><td>${esc(v[2])}</td></tr>`).join('')}</tbody></table></div>
<h2 id="example">Worked example</h2>
${exampleTable(p)}
${p.sections.map((s, i) => `<h2 id="s${i}">${esc(s.h)}</h2>\n${s.html}`).join('\n')}
${p.mistakes ? `<h2 id="mistakes">Common mistakes</h2>${listHtml(p.mistakes, 'list-warn')}` : ''}
${p.applications ? `<h2 id="uses">Where it’s used</h2>${listHtml(p.applications)}` : ''}
<h2 id="faq">Questions</h2>
<div class="faq">${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
<section class="related"><h2 id="related">Related calculators</h2><div class="related-grid">${related}</div>
<p class="muted">More in <a href="${catPath(cat.id)}">${esc(cat.name)}</a>.</p></section>
<p class="meta">Formula and example reviewed ${longDate(reviewedOn(p))}. Found an error? <a href="/contact">Tell us</a>.</p>
</article>
</div>
</div>`;
  return layout({ title: withBrand(p.seoTitle), description: p.description, path, body, ld, image: p.category, imageAlt: `${catById[p.category].name} calculators on ${site.name}`, scripts: ['/assets/js/calc-core.js', '/assets/js/calc-ui.js'] });
}

// Brand suffix only when the full title stays within ~60 characters (Google truncates longer titles).
function withBrand(t) { const b = `${t} | ${site.name}`; return b.length <= 60 ? b : t; }

function toolRow(p) {
  const cat = catById[p.category];
  const kw = `${p.seoTitle} ${p.formulas.join(' ')}`;
  return `<li data-cat="${p.category}" data-t="${esc(p.title)}" data-d="${esc(p.description)}" data-k="${esc(kw)}"><a class="tool-row" href="${calcPath(p.id)}">${catIcon(p.category)}<span class="tr-body"><strong>${esc(p.title)}</strong><span class="tr-desc">${esc(firstSentence(p.description))}</span><em class="hue c-${p.category}">${esc(cat.name)}</em></span></a></li>`;
}

function homePage() {
  const demo = Core.run('oee', Core.exampleRaw('oee')).output.results;
  const g = (k) => demo.find((r) => r.key === k);
  const counts = Object.fromEntries(categories.map((c) => [c.id, pages.filter((p) => p.category === c.id).length]));
  const sorted = [...pages].sort((a, b) => a.title.localeCompare(b.title));
  const body = `<section class="hero"><div class="wrap hero-inner">
<div>
<h1>Engineering-grade calculators for operations</h1>
<p class="hero-lead">${pages.length} free tools for production, maintenance, energy, inventory and finance decisions. Every result comes with its formula, units and a worked example you can check.</p>
${searchBox({ id: 'home-search', label: 'Search calculators', placeholder: 'Search: OEE, MTBF, NPV…', big: true })}
<p class="hero-meta"><span>Try</span> <a href="/calculators/oee">OEE</a> <a href="/calculators/mtbf">MTBF</a> <a href="/calculators/takt-time">Takt time</a> <a href="/calculators/safety-stock">Safety stock</a> <a href="/calculators/npv">NPV</a></p>
</div>
<aside class="readout-demo" aria-labelledby="demo-h">
<h2 id="demo-h">Example result: packaging line OEE</h2>
<div class="rd-big">${esc(Core.formatResult(g('oee')))}</div>
<p class="rd-sub">Largest loss: performance. Start the loss analysis there.</p>
${['a', 'p', 'q'].map((k) => `<div class="rd-row"><span>${esc(g(k).label)}</span><div class="meter" data-pct="${g(k).value.toFixed(1)}"><span></span></div><span class="v">${esc(Core.formatResult(g(k)))}</span></div>`).join('')}
<p class="rd-foot">From the worked example in the <a href="/calculators/oee">OEE calculator</a>.</p>
</aside>
</div></section>

<div class="wrap">
<section class="section" id="categories" aria-labelledby="cat-h">
<div class="section-head"><h2 id="cat-h">Browse by topic</h2><p>Seven areas of plant and business performance.</p></div>
<div class="cat-grid">${categories.map((c) => {
    const ex = pages.filter((p) => p.category === c.id).slice(0, 3).map((p) => p.title.replace(/ Calculator.*$/, '')).join(', ');
    return `<a class="cat-card hue c-${c.id}" href="${catPath(c.id)}"><span class="cc-top">${catIcon(c.id)}<span class="count">${counts[c.id]} tools</span></span><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p><span class="examples">${esc(ex)}</span></a>`;
  }).join('')}<a class="cat-card cat-all" href="#calculators"><span class="cc-top"><span class="ico-tile">${svgIcon('<path d="M4 6h16M4 12h16M4 18h10"/>')}</span><span class="count">${pages.length} tools</span></span><h3>All calculators</h3><p>See the full list, filter by topic or search by name.</p><span class="examples">Browse the list</span></a></div>
</section>

<section class="section" aria-labelledby="start-h">
<div class="section-head"><h2 id="start-h">Start here</h2><p>Six core tools, one from each main area.</p></div>
<div class="feat-grid">${featured.map((id) => { const p = byId[id]; return `<a class="feat-card" href="${calcPath(id)}"><span class="sym hue c-${p.category}" aria-hidden="true">${SYMBOL[id]}</span><span><h3>${esc(p.title)}</h3><p>${esc(firstSentence(p.description))}</p></span></a>`; }).join('')}</div>
</section>

<section class="section" id="calculators" aria-labelledby="all-h">
<div class="section-head"><h2 id="all-h">All calculators</h2><p>Filter by topic, or type in the search box above.</p></div>
<div class="chips" role="group" aria-label="Filter by topic"><button type="button" class="chip" data-cat-filter="all" data-name="all topics" aria-pressed="true">All<span class="count">${pages.length}</span></button>${categories.map((c) => `<button type="button" class="chip" data-cat-filter="${c.id}" data-name="${esc(c.name)}" aria-pressed="false">${esc(c.name)}<span class="count">${counts[c.id]}</span></button>`).join('')}</div>
<p class="filter-status" id="filter-status" aria-live="polite">${pages.length} of ${pages.length} calculators</p>
<ul class="tool-list" id="tool-list">${sorted.map(toolRow).join('')}</ul>
<p class="empty" id="filter-empty" hidden>No calculator matches. Try a shorter term such as “energy” or “stock”, or <a href="/contact">suggest a calculator</a>.</p>
</section>

<section class="section" aria-labelledby="how-h">
<h2 id="how-h">Why these calculators can be trusted</h2>
<div class="split">
<div class="note-card">${svgIcon(TRUST_ICONS[0], 'ico note-ico')}<h3>Formulas you can check</h3><p>Each page shows the formula, a table of variables and units, and a worked example computed by the same engine as the calculator.</p></div>
<div class="note-card">${svgIcon(TRUST_ICONS[1], 'ico note-ico')}<h3>Tested before publication</h3><p>Every formula is covered by automated tests against hand-calculated reference values. Impossible inputs are rejected with a clear message.</p></div>
<div class="note-card">${svgIcon(TRUST_ICONS[2], 'ico note-ico')}<h3>Written by a practitioner</h3><p>Built by an industrial production manager. Pages explain how to interpret results, the common mistakes and where each method stops being valid.</p></div>
<div class="note-card">${svgIcon(TRUST_ICONS[3], 'ico note-ico')}<h3>Private by design</h3><p>Calculations run in your browser. The values you type are never sent to a server. <a href="/privacy-policy">Privacy policy</a>.</p></div>
</div>
</section>
</div>`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: url('/') },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: url(calcPath(p.id)), name: p.title })) }
  ];
  return layout({ title: `Free Operations & Energy Calculators | ${site.name}`, description: `${pages.length} free calculators for OEE, takt time, MTBF, MTTR, energy cost, safety stock, EOQ, NPV and more. Formulas, worked examples and clear assumptions.`, path: '/', body, ld, home: true, active: 'calc' });
}

function categoryPage(c) {
  const cp = categoryPages[c.id];
  const items = pages.filter((p) => p.category === c.id).sort((a, b) => a.title.localeCompare(b.title));
  const others = categories.filter((x) => x.id !== c.id);
  const path = catPath(c.id);
  const body = `<div class="wrap">
<div class="page-head">
<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/#categories">Topics</a></li><li aria-current="page">${esc(c.name)}</li></ol></nav>
<h1>${esc(cp.h1)}</h1>
<div class="lead prose">${cp.intro}</div>
</div>
<section aria-labelledby="list-h"><div class="section-head"><h2 id="list-h">${items.length} calculators</h2></div>
<ul class="tool-list">${items.map(toolRow).join('')}</ul></section>
<section class="prose section">${cp.guide}</section>
<section class="section" aria-labelledby="other-h"><h2 id="other-h">Other topics</h2><div class="related-grid">${others.map((o) => `<a class="rel-card" href="${catPath(o.id)}"><strong>${esc(o.name)}</strong><span>${esc(o.blurb)}</span></a>`).join('')}</div></section>
</div>`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: cp.h1, url: url(path), description: cp.description, hasPart: items.map((p) => ({ '@type': 'WebApplication', name: p.title, url: url(calcPath(p.id)) })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: url('/') }, { '@type': 'ListItem', position: 2, name: c.name, item: url(path) }] }
  ];
  return layout({ title: withBrand(cp.seoTitle), description: cp.description, path, body, ld, active: 'topics', image: c.id, imageAlt: `${c.name} calculators on ${site.name}` });
}

function searchIndex() {
  return JSON.stringify(pages.map((p) => ({ t: p.title, d: p.description, c: catById[p.category].name, u: calcPath(p.id), k: `${p.seoTitle} ${p.formulas.join(' ')}` })));
}
function simplePage(path, title, description, inner) {
  return layout({ title: `${title} | ${site.name}`, description, path, body: `<div class="wrap"><article class="prose page-head"><h1>${esc(title)}</h1>${inner}</article></div>` });
}

const contactBlock = site.contactEmail
  ? `<p>Email: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p><p>We aim to reply within a few working days. Please include the calculator name and the inputs you used if you are reporting a calculation issue.</p>`
  : `<p class="notice">A monitored contact address is being set up and will be published on this page.</p>`;

const staticPages = {
  'about.html': simplePage('/about', 'About OpsCalc Tools', 'Who builds OpsCalc Tools, how the calculators are checked, and how to report an error.', `
<p>OpsCalc Tools is an independent collection of free, browser-based calculators for operations, maintenance, energy, inventory and business questions.</p>
<p>The site is built and maintained by an industrial production manager with hands-on experience in operations, maintenance and electrical supervision, continuous improvement and energy management in heavy industry. The calculators reflect the questions that come up daily on the shop floor and in management reviews: how much availability a repair-time reduction buys, what a stop really costs, whether a motor upgrade pays back.</p>
<h2>How the calculators are checked</h2>
<ul><li>Every formula lives in one shared library and is covered by automated tests with hand-calculated reference values.</li><li>Inputs are validated. Impossible combinations (more good parts than total parts, breaks longer than the shift) are rejected with a clear message.</li><li>Each page states the formula, units, a worked example and the main limitations of the method.</li></ul>
<h2>Limits</h2>
<p>Results are estimates based on your inputs. They support planning and learning and do not replace professional engineering, financial or legal advice. See the <a href="/terms">terms of use</a>.</p>
<p>Spotted an error or want a calculator added? Use the <a href="/contact">contact page</a>.</p>`),
  'contact.html': simplePage('/contact', 'Contact', 'How to contact OpsCalc Tools to report a calculation issue, suggest a calculator or make a privacy request.', `
<p>We welcome corrections, suggestions for new calculators and privacy requests.</p>${contactBlock}`),
  'privacy-policy.html': simplePage('/privacy-policy', 'Privacy Policy', 'How OpsCalc Tools handles data: calculator inputs stay in your browser; cookieless page-view statistics; optional analytics only with consent.', `
<p><strong>Last updated: ${site.lastReviewed}</strong></p>
<h2>Calculator inputs</h2><p>All calculations run locally in your browser. The values you type are not transmitted to us or stored on any server. If you use “Copy link with these inputs”, the values are placed in the link you copy and are visible to anyone you share it with.</p>
<h2>Hosting</h2><p>The site is hosted on Cloudflare Pages. Like any web host, Cloudflare processes technical connection data (such as IP address and browser type) to deliver pages and protect the service. See Cloudflare’s own privacy policy for details.</p>
<h2>Analytics</h2><p>We use Cloudflare Web Analytics to count page views and measure page speed. It does not use cookies, does not store data in your browser and does not identify individual visitors; it records the page visited, the referrer, the browser type, the country and load-time metrics. Calculator values are never sent. See Cloudflare’s privacy policy for details.</p><p>This site does not use advertising cookies. If we enable Google Analytics 4 in the future, it will run only after you give consent through a banner, with Google signals and ad personalisation disabled, and it will record only which calculators are used. Calculator values will never be sent. This policy will be updated before any such change.</p>
<h2>Advertising</h2><p>This site does not currently show advertising. If advertising is introduced, this policy will be updated first to name the provider, describe its cookies and explain your choices, including consent where the law requires it.</p>
<h2>Local storage</h2><p>If analytics is enabled, your consent choice will be stored in your browser’s local storage so the banner is not shown again.</p>
<h2>Your rights and contact</h2><p>Depending on where you live, you may have rights to access, correct or delete personal data. Because we do not collect calculator data, there is usually nothing to retrieve. For any privacy question, use the <a href="/contact">contact page</a>.</p>`),
  'terms.html': simplePage('/terms', 'Terms of Use', 'Terms of use for the free OpsCalc Tools calculators: estimates for planning and learning, your responsibility to verify results.', `
<p><strong>Last updated: ${site.lastReviewed}</strong></p>
<p>The calculators on this site are provided free of charge for general educational and planning purposes. Results are estimates that depend on your inputs and on the assumptions stated on each page.</p>
<p>We work to keep formulas correct and test them, but we do not guarantee that results are accurate, complete or fit for a particular purpose. You are responsible for checking results before relying on them for operational, financial, legal or safety-critical decisions.</p>
<p>The site is provided “as is”. To the extent permitted by law, we are not liable for losses arising from the use of these calculators.</p>
<p>Content on this site, including text and code, may not be republished in bulk without permission. Linking to any page is welcome.</p>`)
};

function notFound() {
  return layout({ title: `Page not found | ${site.name}`, description: 'The requested page does not exist.', path: '/404', noindex: true, body: `<div class="wrap"><article class="prose page-head"><h1>Page not found</h1><p>Try the search above, or browse by topic.</p><p>The page you requested does not exist or has moved.</p><p><a class="btn btn-primary" href="/">Browse all calculators</a></p></article></div>` });
}

function sitemap() {
  const paths = ['/', ...categories.map((c) => catPath(c.id)), ...pages.map((p) => calcPath(p.id)), '/about', '/contact', '/privacy-policy', '/terms'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${url(p)}</loc><lastmod>${site.lastReviewed}</lastmod></url>`).join('\n')}
</urlset>
`;
}

// ---- write everything ----
for (const p of pages) out(`calculators/${p.id}.html`, calcPage(p));
for (const c of categories) {
  if (!categoryPages[c.id]) throw new Error('Missing category content: ' + c.id);
  out(`categories/${c.id}.html`, categoryPage(c));
}
out('index.html', homePage());
for (const [f, html] of Object.entries(staticPages)) out(f, html);
out('404.html', notFound());
out('sitemap.xml', sitemap());
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);
out('assets/search-index.json', searchIndex());
for (const f of featured) if (!byId[f]) throw new Error('Featured id not found: ' + f);

const missing = Object.keys(Core.registry).filter((id) => !byId[id]);
if (missing.length) throw new Error('Calculators without content: ' + missing.join(', '));
console.log(`Built ${pages.length} calculator pages, ${categories.length} category pages, home, 4 static pages, 404, sitemap, robots, search index.`);
