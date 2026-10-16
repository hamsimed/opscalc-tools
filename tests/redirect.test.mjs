// Unit tests for the pages.dev -> custom domain redirect middleware.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware.js';

const NEXT = new Response('static', { status: 200 });
const run = (u) => onRequest({ request: new Request(u), next: async () => NEXT });

test('legacy host redirects 301 with path and query preserved', async () => {
  const r = await run('https://opscalc-tools.pages.dev/calculators/oee?planned=480&mode=raw');
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), 'https://tools.saharienne.org/calculators/oee?planned=480&mode=raw');
  const h = await run('http://opscalc-tools.pages.dev/');
  assert.equal(h.headers.get('location'), 'https://tools.saharienne.org/');
});
test('custom domain and preview hosts are not redirected (no loop)', async () => {
  for (const u of ['https://tools.saharienne.org/calculators/oee', 'https://dev.opscalc-tools.pages.dev/', 'https://3375e721.opscalc-tools.pages.dev/x']) {
    assert.equal(await run(u), NEXT, u);
  }
});
test('Search Console verification file stays on the legacy host', async () => {
  assert.equal(await run('https://opscalc-tools.pages.dev/google21e1d3b118076e1a.html'), NEXT);
  assert.equal(await run('https://opscalc-tools.pages.dev/google21e1d3b118076e1a'), NEXT);
});
