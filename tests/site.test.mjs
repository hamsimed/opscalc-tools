// Site integrity tests on the built HTML: SEO metadata, canonicals, sitemap, internal links, structure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { site } from '../src/site.mjs';
import { pages } from '../src/content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = createRequire(import.meta.url)('../assets/js/calc-core.js');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const htmlFiles = ['index.html', 'about.html', 'contact.html', 'privacy-policy.html', 'terms.html', ...readdirSync(join(ROOT, 'calculators')).map((f) => 'calculators/' + f), ...readdirSync(join(ROOT, 'categories')).map((f) => 'categories/' + f)];
const m1 = (h, re) => (re.exec(h) || [])[1];
const pathOf = (f) => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));

function resolveLocal(href) {
  const p = href.split('#')[0].split('?')[0];
  if (p === '' || p === '/') return 'index.html';
  const rel = p.replace(/^\//, '');
  for (const c of [rel, rel + '.html', rel + '/index.html']) if (existsSync(join(ROOT, c))) return c;
  return null;
}

test('every registered calculator has a page and vice versa', () => {
  const ids = Object.keys(C.registry).sort();
  assert.deepEqual(pages.map((p) => p.id).sort(), ids);
  for (const id of ids) assert.ok(existsSync(join(ROOT, `calculators/${id}.html`)), id);
});

test('legacy production URLs still exist', () => {
  for (const id of ['oee', 'energy-cost', 'production-rate', 'working-hours', 'reorder-point']) assert.ok(existsSync(join(ROOT, `calculators/${id}.html`)));
  assert.ok(existsSync(join(ROOT, 'google21e1d3b118076e1a.html')), 'Search Console verification file must be kept');
});

test('titles, descriptions, canonicals, h1 on every page', () => {
  const titles = new Set(), descs = new Set();
  for (const f of htmlFiles) {
    const h = read(f);
    const title = m1(h, /<title>([^<]+)<\/title>/)?.replace(/&amp;/g, '&'), desc = m1(h, /<meta name="description" content="([^"]+)"/), canon = m1(h, /<link rel="canonical" href="([^"]+)"/);
    assert.ok(title && title.length <= 66, `${f}: title length ${title?.length}`);
    assert.ok(desc && desc.length >= 70 && desc.length <= 160, `${f}: description length ${desc?.length}`);
    assert.equal(canon, site.origin + pathOf(f), `${f}: canonical`);
    assert.ok(!/\.html$/.test(canon), `${f}: canonical must be extensionless`);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, `${f}: exactly one h1`);
    assert.ok(!titles.has(title), `duplicate title ${title}`); titles.add(title);
    assert.ok(!descs.has(desc), `duplicate description ${f}`); descs.add(desc);
    assert.match(h, /<html lang="en">/);
    assert.match(h, /name="viewport"/);
  }
});

test('JSON-LD blocks parse', () => {
  for (const f of htmlFiles) {
    const blocks = [...read(f).matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);
    for (const b of blocks) assert.doesNotThrow(() => JSON.parse(b), f);
    if (f.startsWith('calculators/')) assert.equal(blocks.length, 2, f);
  }
});

test('sitemap lists exactly the indexable pages, extensionless, with matching canonicals', () => {
  const sm = read('sitemap.xml');
  assert.match(sm, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(new Set(locs).size, locs.length, 'no duplicates');
  assert.deepEqual(locs.slice().sort(), htmlFiles.map((f) => site.origin + pathOf(f)).sort());
  for (const l of locs) assert.ok(!l.endsWith('.html'), l);
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${site.origin}/sitemap.xml`));
});

test('all internal links and assets resolve; no internal links use .html', () => {
  for (const f of [...htmlFiles, '404.html']) {
    const h = read(f);
    for (const [, href] of h.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      assert.ok(resolveLocal(href), `${f}: broken link ${href}`);
      if (/^\/(?!assets)/.test(href)) assert.ok(!/\.html(\?|#|$)/.test(href), `${f}: link with .html ${href}`);
    }
  }
});

test('calculator pages: form fields match core spec, labels bound, content depth', () => {
  for (const p of pages) {
    const h = read(`calculators/${p.id}.html`);
    assert.match(h, new RegExp(`data-calc="${p.id}"`));
    for (const i of C.registry[p.id].inputs) {
      assert.match(h, new RegExp(`<label for="${i.name}">`), `${p.id}: label for ${i.name}`);
      assert.match(h, new RegExp(`id="${i.name}" name="${i.name}"`), `${p.id}: input ${i.name}`);
      assert.match(h, new RegExp(`id="err-${i.name}"`));
    }
    assert.ok(h.indexOf('calc-core.js') < h.indexOf('calc-ui.js'), 'core loads before ui');
    const text = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const words = text.split(' ').length;
    assert.ok(words >= 480, `${p.id}: only ${words} words — thin content`);
    assert.ok(p.related.length >= 2, `${p.id}: needs internal links`);
    assert.ok(!p.related.includes(p.id));
  }
});

test('404 page is noindex and not in sitemap', () => {
  const h = read('404.html');
  assert.match(h, /<meta name="robots" content="noindex">/);
  assert.ok(!/rel="canonical"/.test(h));
});

test('no analytics or ad code is active by default', () => {
  assert.match(read('assets/js/site-config.js'), /ga4MeasurementId: ''/);
  for (const f of htmlFiles) {
    const h = read(f);
    assert.ok(!/adsbygoogle|pagead2\.googlesyndication/.test(h), `${f}: ad code present`);
    assert.ok(!/G-[A-Z0-9]{6,}/.test(h), `${f}: hard-coded GA id`);
  }
});

test('_headers sets sitemap content type and security headers', () => {
  const h = read('_headers');
  assert.match(h, /\/sitemap\.xml\n\s+Content-Type: application\/xml/);
  assert.match(h, /X-Content-Type-Options: nosniff/);
  assert.match(h, /Content-Security-Policy:/);
});

test('domain migration: no reference to the old pages.dev host in indexable output', () => {
  assert.equal(site.origin, 'https://tools.saharienne.org');
  for (const f of [...htmlFiles, 'sitemap.xml', 'robots.txt']) assert.ok(!read(f).includes('pages.dev'), `${f} still references pages.dev`);
});

test('v4: category pages, search index and shared UI hooks', () => {
  const idx = JSON.parse(read('assets/search-index.json'));
  assert.equal(idx.length, pages.length);
  for (const it of idx) assert.ok(resolveLocal(it.u), it.u);
  for (const f of readdirSync(join(ROOT, 'categories'))) {
    const h = read('categories/' + f);
    const words = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).length;
    assert.ok(words >= 300, `${f}: ${words} words`);
  }
  const home = read('index.html');
  assert.match(home, /id="home-search"/); assert.match(home, /data-cat-filter="energy"/);
  assert.equal((home.match(/<li data-cat=/g) || []).length, pages.length, 'every calculator listed on home');
  for (const p of pages) {
    const h = read(`calculators/${p.id}.html`);
    assert.match(h, /id="copy-result"/); assert.match(h, /id="reset"/); assert.match(h, /aria-controls="site-nav"/);
    assert.match(h, /href="\/categories\//, `${p.id}: breadcrumb links to category`);
    assert.match(h, /id="mistakes"|Common mistakes/, `${p.id}: common mistakes`);
    assert.match(h, /id="uses"/, `${p.id}: applications`);
  }
});

test('SEO lot 1: titles, descriptions, share images, review dates', () => {
  for (const f of htmlFiles) {
    const h = read(f);
    const title = m1(h, /<title>([^<]*)<\/title>/).replace(/&amp;/g, '&');
    assert.ok(title.length <= 60, `${f}: title ${title.length} chars "${title}"`);
    const img = m1(h, /<meta property="og:image" content="([^"]+)"/);
    assert.ok(img && img.startsWith(site.origin + '/assets/og/'), `${f}: og:image`);
    assert.ok(existsSync(join(ROOT, img.slice(site.origin.length + 1))), `${f}: og:image file missing ${img}`);
    assert.equal(m1(h, /<meta name="twitter:image" content="([^"]+)"/), img, `${f}: twitter:image`);
    assert.match(h, /<meta name="twitter:card" content="summary_large_image">/, f);
    if (f.startsWith('calculators/')) {
      const d = m1(h, /<meta name="description" content="([^"]*)"/).replace(/&amp;/g, '&');
      assert.ok(d.length >= 120 && d.length <= 160, `${f}: description ${d.length} chars`);
      const shown = m1(h, /<p class="reviewed">Last reviewed <time datetime="([\d-]+)">/);
      const app = JSON.parse(m1(h, /<script type="application\/ld\+json">(\{"@context":"https:\/\/schema.org","@type":"WebApplication".*?)<\/script>/));
      assert.ok(shown, `${f}: visible review date`);
      assert.equal(app.dateModified, shown, `${f}: dateModified must equal the visible review date`);
      assert.ok(shown <= new Date().toISOString().slice(0, 10), `${f}: review date in the future`);
    }
  }
});

test('SEO lot 1: structured data parses and breadcrumbs match the visible navigation', () => {
  for (const f of htmlFiles) {
    const h = read(f);
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
    if (/^(index|calculators\/|categories\/)/.test(f)) assert.ok(blocks.length >= 1, `${f}: no JSON-LD`); // static pages carry none, by design
    const canon = m1(h, /<link rel="canonical" href="([^"]+)"/);
    assert.equal(canon, site.origin + pathOf(f), `${f}: canonical`);
    for (const b of blocks) if (b.url) assert.ok(b.url.startsWith(site.origin), `${f}: ${b['@type']} url`);
    const bc = blocks.find((b) => b['@type'] === 'BreadcrumbList');
    const crumbs = [...(m1(h, /<nav class="crumbs"[^>]*>(.*?)<\/nav>/s) || '').matchAll(/<li[^>]*>(?:<a href="([^"]+)">)?([^<]+)/g)].map((m) => ({ href: m[1], name: m[2].replace(/&amp;/g, '&') }));
    if (!bc) { assert.equal(crumbs.length, 0, `${f}: visible breadcrumb without BreadcrumbList`); continue; }
    const items = bc.itemListElement;
    assert.equal(items[items.length - 1].item, canon, `${f}: last breadcrumb item must be the canonical URL`);
    if (f.startsWith('calculators/')) {
      assert.equal(items.length, crumbs.length, `${f}: breadcrumb depth`);
      items.forEach((it, i) => { assert.equal(it.name, crumbs[i].name, `${f}: crumb ${i} name`); if (crumbs[i].href) assert.equal(it.item, site.origin + crumbs[i].href, `${f}: crumb ${i} url`); });
    }
  }
});

test('SEO lot 1: industrial priority tools are linked from at least 7 pages; max 6 related per page', () => {
  const priority = ['teep', 'compressed-air-leak-cost', 'belt-conveyor-capacity', 'pump-power', 'power-factor-correction', 'affinity-laws', 'specific-energy-consumption'];
  for (const id of priority) {
    const from = htmlFiles.filter((f) => f !== `calculators/${id}.html` && read(f).includes(`href="/calculators/${id}"`));
    assert.ok(from.length >= 7, `${id}: linked from ${from.length} pages`);
  }
  for (const p of pages) assert.ok(p.related.length <= 6, p.id);
});
