#!/usr/bin/env node
// Static site generator for OpsCalc Tools. No dependencies.
// Output is written to the repository root so Cloudflare Pages settings stay unchanged
// (framework: none, build command: none, output directory: /).
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/site.mjs';
import { pages, categories } from '../src/content.mjs';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const Core = require('../assets/js/calc-core.js');
const ASSET_V = site.lastReviewed.replace(/-/g, '');

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

function layout({ title, description, path, body, ld = [], scripts = [], noindex = false }) {
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
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#101d38">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css?v=${ASSET_V}">
${ld.map(jsonLd).join('\n')}
<script src="/assets/js/site-config.js?v=${ASSET_V}" defer></script>
<script src="/assets/js/analytics.js?v=${ASSET_V}" defer></script>
${scripts.map((s) => `<script src="${s}?v=${ASSET_V}" defer></script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><nav class="nav" aria-label="Main">
<a class="brand" href="/">OpsCalc<span>Tools</span></a>
<div class="nav-links"><a href="/#calculators">Calculators</a><a href="/about">About</a><a href="/contact">Contact</a></div>
</nav></header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-footer"><div class="footer-inner">
<div><strong>${esc(site.name)}</strong><br><span>${esc(site.tagline)}.</span></div>
<nav aria-label="Footer"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy-policy">Privacy</a><a href="/terms">Terms</a></nav>
<div class="small">© ${site.year} ${esc(site.name)}. Results are estimates for planning and learning; verify before critical decisions.</div>
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
<p><button type="button" class="button button-secondary" id="load-example-2">Load this example into the calculator</button></p>`;
}

function calcPage(p) {
  const calc = Core.registry[p.id];
  if (!calc) throw new Error(`No core definition for ${p.id}`);
  const cat = categories.find((c) => c.id === p.category);
  const path = calcPath(p.id);
  const related = p.related.map((id) => {
    const r = byId[id];
    if (!r) throw new Error(`${p.id}: related id ${id} not found`);
    return `<li><a href="${calcPath(id)}">${esc(r.title)}</a></li>`;
  }).join('');
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: p.title, url: url(path), description: p.description, applicationCategory: 'BusinessApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: site.name, url: url('/') } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: url('/') }, { '@type': 'ListItem', position: 2, name: cat.name, item: url('/#' + cat.id) }, { '@type': 'ListItem', position: 3, name: p.title, item: url(path) }] }
  ];
  // 'scripts' load in order with defer: core before ui.
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/#${cat.id}">${esc(cat.name)}</a></li><li aria-current="page">${esc(p.title)}</li></ol></nav>
<article class="calc-page">
<header class="page-head"><p class="eyebrow">${esc(cat.name)}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.intro)}</p></header>
<section class="panel calculator" aria-labelledby="calc-title">
<h2 id="calc-title" class="panel-title">Calculator</h2>
<form id="calc-form" data-calc="${p.id}" novalidate>
<div class="form-grid">
${calc.inputs.map(fieldHtml).join('\n')}
</div>
<div class="actions"><button class="button" type="submit">Calculate</button><button class="button button-secondary" type="button" id="load-example">Load example</button><button class="button button-ghost" type="button" id="reset">Reset</button></div>
</form>
<div id="result" class="result" role="status" aria-live="polite"><p class="hint">Enter your values and press Calculate, or load the worked example.</p></div>
<p class="privacy-note">Calculations run in your browser. Your inputs are not sent to any server. <button type="button" class="linklike" id="share-link">Copy link with these inputs</button></p>
<noscript><p class="error">This calculator needs JavaScript. The formulas below let you calculate by hand.</p></noscript>
</section>
<section class="content">
<h2>Formula</h2>
<div class="formula">${p.formulas.map((f) => `<code>${esc(f)}</code>`).join('')}</div>
<div class="table-scroll"><table class="data"><caption>Variables and units</caption><thead><tr><th scope="col">Term</th><th scope="col">Meaning</th><th scope="col">Unit</th></tr></thead><tbody>${p.vars.map((v) => `<tr><td>${esc(v[0])}</td><td>${esc(v[1])}</td><td>${esc(v[2])}</td></tr>`).join('')}</tbody></table></div>
<h2>Worked example</h2>
${exampleTable(p)}
${p.sections.map((s) => `<h2>${esc(s.h)}</h2>\n${s.html}`).join('\n')}
<h2>Frequently asked questions</h2>
<div class="faq">${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
<aside class="related" aria-labelledby="rel-title"><h2 id="rel-title">Related calculators</h2><ul>${related}</ul></aside>
<p class="meta">Formula and example reviewed ${site.lastReviewed}. Found an error? <a href="/contact">Tell us</a>.</p>
</section>
</article>`;
  return layout({ title: p.seoTitle.length > 48 ? p.seoTitle : `${p.seoTitle} | ${site.name}`, description: p.description, path, body, ld, scripts: ['/assets/js/calc-core.js', '/assets/js/calc-ui.js'] });
}

function homePage() {
  const sections = categories.map((c) => {
    const items = pages.filter((p) => p.category === c.id);
    return `<section class="cat" id="${c.id}" aria-labelledby="h-${c.id}"><h3 id="h-${c.id}">${esc(c.name)}</h3><p class="hint">${esc(c.blurb)}</p>
<div class="grid">${items.map((p) => `<a class="card" href="${calcPath(p.id)}"><strong>${esc(p.title)}</strong><span>${esc(p.description.split('. ')[0])}.</span></a>`).join('')}</div></section>`;
  }).join('\n');
  const body = `<section class="hero"><p class="eyebrow">${pages.length} free calculators</p><h1>Practical calculators for operations, maintenance and energy</h1><p>Every tool shows its formula, units, a worked example and the assumptions behind the result. No sign-up, and your inputs stay in your browser.</p><p><a class="button button-light" href="#calculators">Browse calculators</a></p></section>
<h2 id="calculators" class="section-title">Calculators by topic</h2>
${sections}
<section class="panel section-title"><h2>How these tools are built</h2><p>Each formula is written once in a shared calculation library and checked by automated tests against hand-calculated reference values before publication. Inputs are validated (no silent division by zero or impossible values), units are stated next to every field, and each page explains the limits of the method.</p><p>The calculators are written for practitioners: production and maintenance managers, engineers, planners and continuous-improvement teams. They support decisions but do not replace professional judgement or site-specific data.</p></section>`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: url('/') },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: url(calcPath(p.id)), name: p.title })) }
  ];
  return layout({ title: `Free Operations, Maintenance & Energy Calculators | ${site.name}`, description: `${pages.length} free calculators for OEE, takt time, MTBF, MTTR, energy cost, safety stock, EOQ, ROI and more. Formulas, worked examples and clear assumptions.`, path: '/', body, ld });
}

function simplePage(path, title, description, inner) {
  return layout({ title: `${title} | ${site.name}`, description, path, body: `<article class="prose"><h1>${esc(title)}</h1>${inner}</article>` });
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
  'privacy-policy.html': simplePage('/privacy-policy', 'Privacy Policy', 'How OpsCalc Tools handles data: calculator inputs stay in your browser; optional analytics only with consent.', `
<p><strong>Last updated: ${site.lastReviewed}</strong></p>
<h2>Calculator inputs</h2><p>All calculations run locally in your browser. The values you type are not transmitted to us or stored on any server. If you use “Copy link with these inputs”, the values are placed in the link you copy and are visible to anyone you share it with.</p>
<h2>Hosting</h2><p>The site is hosted on Cloudflare Pages. Like any web host, Cloudflare processes technical connection data (such as IP address and browser type) to deliver pages and protect the service. See Cloudflare’s own privacy policy for details.</p>
<h2>Analytics</h2><p>At present this site does not use analytics or advertising cookies. If we enable Google Analytics 4 in the future, it will run only after you give consent through a banner, with Google signals and ad personalisation disabled, and it will record only which calculators are used. Calculator values will never be sent. This policy will be updated before any such change.</p>
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
  return layout({ title: `Page not found | ${site.name}`, description: 'The requested page does not exist.', path: '/404', noindex: true, body: `<article class="prose"><h1>Page not found</h1><p>The page you requested does not exist or has moved.</p><p><a class="button" href="/">Go to all calculators</a></p></article>` });
}

function sitemap() {
  const paths = ['/', ...pages.map((p) => calcPath(p.id)), '/about', '/contact', '/privacy-policy', '/terms'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${url(p)}</loc><lastmod>${site.lastReviewed}</lastmod></url>`).join('\n')}
</urlset>
`;
}

// ---- write everything ----
for (const p of pages) out(`calculators/${p.id}.html`, calcPage(p));
out('index.html', homePage());
for (const [f, html] of Object.entries(staticPages)) out(f, html);
out('404.html', notFound());
out('sitemap.xml', sitemap());
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);

const missing = Object.keys(Core.registry).filter((id) => !byId[id]);
if (missing.length) throw new Error('Calculators without content: ' + missing.join(', '));
console.log(`Built ${pages.length} calculator pages + home, 4 static pages, 404, sitemap, robots.`);
