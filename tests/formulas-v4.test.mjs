// V4 calculators: reference values computed by hand, independent of calc-core.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const C = createRequire(import.meta.url)('../assets/js/calc-core.js');
const get = (r, k) => r.output.results.find((x) => x.key === k);
const ok = (id, raw) => { const r = C.run(id, raw); assert.ok(r.ok, `${id}: ${r.message}`); return r; };
const bad = (id, raw, f) => { const r = C.run(id, raw); assert.equal(r.ok, false); if (f) assert.equal(r.field, f); };
const near = (a, e, t = 1e-6) => assert.ok(Math.abs(a - e) <= t, `expected ${e}, got ${a}`);

test('TEEP = OEE × loading', () => {
  const r = ok('teep', { oee: '65', planned: '120', calendar: '168' });
  near(get(r, 'teep').value, 65 * 120 / 168, 1e-9); near(get(r, 'loading').value, 12000 / 168, 1e-9);
  bad('teep', { oee: '65', planned: '200', calendar: '168' }, 'planned');
});
test('Pump power: ρ g Q H', () => {
  const r = ok('pump-power', { flow: '180', head: '45', pumpEff: '72', motorEff: '94' });
  const hyd = 1000 * 9.80665 * 0.05 * 45 / 1000;
  near(get(r, 'hyd').value, hyd); near(get(r, 'shaft').value, hyd / 0.72); near(get(r, 'input').value, hyd / 0.72 / 0.94);
  near(get(r, 'wire').value, 72 * 0.94, 1e-9);
});
test('Affinity laws: cube law', () => {
  const r = ok('affinity-laws', { power: '55', speed: '80', hours: '5000', price: '0.12' });
  near(get(r, 'p2').value, 28.16); near(get(r, 'kwh').value, 134200, 1e-6); near(get(r, 'money').value, 16104, 1e-6);
  near(get(r, 'head').value, 64, 1e-9);
});
test('Compressed air leaks: load/unload method', () => {
  const r = ok('compressed-air-leak-cost', { load: '18', unload: '42', kw: '75', hours: '8000', price: '0.12' });
  near(get(r, 'leak').value, 30); near(get(r, 'kwh').value, 180000); near(get(r, 'cost').value, 21600);
});
test('CO2 emissions from electricity', () => {
  const r = ok('co2-emissions', { kwh: '1000', factor: '0.45', output: '50' });
  near(get(r, 't').value, 0.45); near(get(r, 'intensity').value, 9);
  bad('co2-emissions', { kwh: '1000', factor: '3' }, 'factor');
});
test('NPV, IRR, profitability index, discounted payback', () => {
  let r = ok('npv', { inv: '100', cf: '50', years: '2', rate: '10' });
  near(get(r, 'npv').value, 50 / 1.1 + 50 / 1.21 - 100, 1e-9);
  near(get(r, 'irr').value, 0, 1e-6); // -100, 50, 50 → IRR = 0
  assert.ok(get(r, 'dpb').text);      // never paid back at 10%
  r = ok('npv', { inv: '100', cf: '60', years: '2', rate: '0' });
  const x = (-1 + Math.sqrt(1 + 20 / 3)) / 2; near(get(r, 'irr').value, (1 / x - 1) * 100, 1e-6);
  near(get(r, 'npv').value, 20, 1e-9); near(get(r, 'dpb').value, 1 + 40 / 60, 1e-9);
  r = ok('npv', { inv: '1000', cf: '100', years: '1', rate: '5', salvage: '1000' });
  near(get(r, 'npv').value, 1100 / 1.05 - 1000, 1e-9);
  bad('npv', { inv: '100', cf: '50', years: '2.5', rate: '10' }, 'years');
});
test('Inventory carrying cost', () => {
  const r = ok('inventory-carrying-cost', { avg: '400000', capital: '10', storage: '6', insurance: '2', risk: '5' });
  near(get(r, 'cost').value, 92000, 1e-6); near(get(r, 'rate').value, 23, 1e-9);
});
test('Unit cost and margin', () => {
  const r = ok('unit-cost', { materials: '18000', labor: '9600', overhead: '7400', units: '2500', price: '17.5' });
  near(get(r, 'unit').value, 14); near(get(r, 'margin').value, 3.5); near(get(r, 'marginPct').value, 20);
  bad('unit-cost', { materials: '1', labor: '1', overhead: '1', units: '0' }, 'units');
});
