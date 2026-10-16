// Calculation tests: reference values are computed by hand (or from textbook tables),
// independently of calc-core.js, and compared with tolerance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const C = createRequire(import.meta.url)('../assets/js/calc-core.js');

const get = (r, key) => r.output.results.find((x) => x.key === key);
function ok(id, raw) { const r = C.run(id, raw); assert.ok(r.ok, `${id} should succeed: ${r.message}`); return r; }
function bad(id, raw, field) { const r = C.run(id, raw); assert.equal(r.ok, false, `${id} should fail for ${JSON.stringify(raw)}`); if (field !== undefined) assert.equal(r.field, field); return r; }
function near(actual, expected, tol = 1e-6, msg = '') { assert.ok(Math.abs(actual - expected) <= tol, `${msg} expected ${expected}, got ${actual}`); }

test('every calculator has a valid worked example', () => {
  for (const id of Object.keys(C.registry)) ok(id, C.exampleRaw(id));
});

test('normInv matches standard z tables', () => {
  near(C.normInv(0.5), 0, 1e-9);
  near(C.normInv(0.95), 1.644854, 1e-5);
  near(C.normInv(0.975), 1.959964, 1e-5);
  near(C.normInv(0.99), 2.326348, 1e-5);
  near(C.normInv(0.01), -2.326348, 1e-5);
  near(C.normInv(1 - 3.4e-6), 4.5, 0.01); // 3.4 DPMO ≈ 4.5σ unshifted
});

test('OEE factors mode: 90 × 85 × 98 = 74.97%', () => {
  const r = ok('oee', { mode: 'factors', a: '90', p: '85', q: '98' });
  near(get(r, 'oee').value, 74.97, 1e-9);
});
test('OEE raw mode by hand', () => {
  // run = 480-47 = 433 min; A = 433/480; P = 1*19271/(433*60); Q = 18848/19271
  const r = ok('oee', { mode: 'raw', planned: '480', downtime: '47', idealCycle: '1', total: '19271', good: '18848' });
  const A = 433 / 480, P = 19271 / 25980, Q = 18848 / 19271;
  near(get(r, 'a').value, A * 100, 1e-9); near(get(r, 'p').value, P * 100, 1e-9); near(get(r, 'q').value, Q * 100, 1e-9);
  near(get(r, 'oee').value, A * P * Q * 100, 1e-9);
  assert.match(r.output.notes[0], /Performance/);
});
test('OEE validation', () => {
  bad('oee', { mode: 'raw', planned: '480', downtime: '480', idealCycle: '1', total: '10', good: '10' }, 'downtime');
  bad('oee', { mode: 'raw', planned: '480', downtime: '0', idealCycle: '1', total: '10', good: '11' }, 'good');
  bad('oee', { mode: 'raw', planned: '0', downtime: '0', idealCycle: '1', total: '10', good: '10' }, 'planned');
  bad('oee', { mode: 'factors', a: '101', p: '50', q: '50' }, 'a');
  bad('oee', { mode: 'factors', a: '', p: '50', q: '50' }, 'a');
  bad('oee', { mode: 'factors', a: 'abc', p: '50', q: '50' }, 'a');
  bad('oee', { mode: 'raw', planned: '480', downtime: '0', idealCycle: '1', total: '10.5', good: '10' }, 'total');
  bad('oee', { mode: 'hack' }, 'mode');
});
test('OEE flags performance above 100%', () => {
  const r = ok('oee', { mode: 'raw', planned: '60', downtime: '0', idealCycle: '2', total: '2000', good: '2000' });
  assert.ok(get(r, 'p').value > 100);
  assert.ok(r.output.notes.some((n) => /above 100%/.test(n)));
});

test('Takt time: (480-60)*2 min / 840 = 60 s', () => {
  const r = ok('takt-time', { shift: '480', breaks: '60', shifts: '2', demand: '840' });
  near(get(r, 'takt').value, 60); near(get(r, 'avail').value, 840);
  assert.equal(get(r, 'load'), undefined);
  const r2 = ok('takt-time', { shift: '480', breaks: '60', shifts: '2', demand: '840', cycle: '66' });
  near(get(r2, 'load').value, 110, 1e-9);
  assert.match(r2.output.notes[0], /cannot meet demand/);
  bad('takt-time', { shift: '480', breaks: '480', shifts: '1', demand: '10' }, 'breaks');
  bad('takt-time', { shift: '480', breaks: '0', shifts: '1', demand: '0' }, 'demand');
});

test('Cycle time: 420 min / 380 = 66.315… s', () => {
  const r = ok('cycle-time', { elapsed: '420', units: '380' });
  near(get(r, 'ct').value, 25200 / 380); near(get(r, 'rate').value, 380 / 7);
  bad('cycle-time', { elapsed: '420', units: '0' }, 'units');
});

test('Production rate uses the target (regression: production bug)', () => {
  const r = ok('production-rate', { units: '900', hours: '6', target: '160' });
  near(get(r, 'rate').value, 150); near(get(r, 'att').value, 93.75, 1e-9); near(get(r, 'gap').value, 60);
  bad('production-rate', { units: '900', hours: '0' }, 'hours');
});

test('Capacity utilization and efficiency', () => {
  const r = ok('capacity-utilization', { actual: '7200', design: '10000', effective: '8500' });
  near(get(r, 'util').value, 72); near(get(r, 'eff').value, 7200 / 85, 1e-9);
  bad('capacity-utilization', { actual: '1', design: '100', effective: '120' }, 'effective');
});

test('First pass yield', () => {
  const r = ok('first-pass-yield', { started: '2000', passed: '1820', scrap: '60' });
  near(get(r, 'fpy').value, 91); near(get(r, 'scrapRate').value, 3); near(get(r, 'reworkRate').value, 6); near(get(r, 'final').value, 97);
  bad('first-pass-yield', { started: '100', passed: '90', scrap: '20' }, 'scrap');
  bad('first-pass-yield', { started: '100', passed: '101', scrap: '0' }, 'passed');
});

test('DPMO and sigma level', () => {
  // textbook: 66,807 DPMO ≈ 3.0σ (shifted); 6,210 ≈ 4.0σ; 233 ≈ 5.0σ
  let r = ok('dpmo', { defects: '66807', units: '1000000', opps: '1' }); near(get(r, 'sigma').value, 3.0, 0.005);
  r = ok('dpmo', { defects: '6210', units: '1000000', opps: '1' }); near(get(r, 'sigma').value, 4.0, 0.005);
  r = ok('dpmo', { defects: '233', units: '1000000', opps: '1' }); near(get(r, 'sigma').value, 5.0, 0.005);
  r = ok('dpmo', { defects: '34', units: '1500', opps: '8' }); near(get(r, 'dpmo').value, 34e6 / 12000, 1e-6);
  r = ok('dpmo', { defects: '0', units: '100', opps: '1' }); assert.match(get(r, 'sigma').text, /Not estimable/);
  bad('dpmo', { defects: '9', units: '2', opps: '4' }, 'defects');
});

test("Little's law and PCE", () => {
  const r = ok('littles-law', { wip: '1200', throughput: '300', va: '45', hpd: '16' });
  near(get(r, 'lt').value, 4); near(get(r, 'pce').value, 45 / 3840 * 100, 1e-9);
  const r2 = ok('littles-law', { wip: '100', throughput: '50' }); near(get(r2, 'ltH').value, 16); // default 8 h/day
  bad('littles-law', { wip: '1', throughput: '100', va: '600', hpd: '8' }, 'va');
});

test('Labor productivity', () => {
  const r = ok('labor-productivity', { output: '5400', workers: '12', hours: '40', baseline: '10' });
  near(get(r, 'p').value, 11.25); near(get(r, 'chg').value, 12.5, 1e-9);
});

test('MTBF, failure rate and reliability', () => {
  const r = ok('mtbf', { uptime: '2160', failures: '9', mission: '100' });
  near(get(r, 'mtbf').value, 240); near(get(r, 'lambda').value, 1 / 240); near(get(r, 'rel').value, Math.exp(-100 / 240) * 100, 1e-9);
  bad('mtbf', { uptime: '100', failures: '0' }, 'failures');
  bad('mtbf', { uptime: '100', failures: '1.5' }, 'failures');
});

test('MTTR and availability', () => {
  const r = ok('mttr', { repair: '27', repairs: '9', mtbf: '240' });
  near(get(r, 'mttr').value, 3); near(get(r, 'avail').value, 24000 / 243, 1e-9);
  const a = ok('availability', { mode: 'time', up: '700', down: '20' });
  near(get(a, 'a').value, 70000 / 720, 1e-9);
  bad('availability', { mode: 'time', up: '0', down: '0' }, 'up');
  const b = ok('availability', { mode: 'mtbf', mtbf: '99', mttr: '1' }); near(get(b, 'downYear').value, 87.6, 1e-9);
});

test('Downtime cost', () => {
  const r = ok('downtime-cost', { hours: '3.5', rate: '120', margin: '18', workers: '8', wage: '32', other: '1500' });
  near(get(r, 'lost').value, 7560); near(get(r, 'labor').value, 896); near(get(r, 'total').value, 9956);
  const r2 = ok('downtime-cost', { hours: '2', rate: '10', margin: '5' }); near(get(r2, 'total').value, 100);
});

test('Energy cost with load and efficiency', () => {
  // 75 kW × 0.8 / 0.94 = 63.8298 kW; ×16 h ×300 d = 306,383 kWh; × 0.12
  const r = ok('energy-cost', { power: '75', load: '80', eff: '94', hpd: '16', days: '300', price: '0.12' });
  near(get(r, 'eYear').value, 75 * 0.8 / 0.94 * 4800, 1e-6);
  near(get(r, 'costYear').value, 75 * 0.8 / 0.94 * 4800 * 0.12, 1e-6);
  const r2 = ok('energy-cost', { power: '5', hpd: '8', days: '1', price: '0.15' }); near(get(r2, 'costDay').value, 6); // legacy example
  bad('energy-cost', { power: '5', hpd: '25', days: '1', price: '0.15' }, 'hpd');
});

test('Specific energy consumption vs baseline', () => {
  const r = ok('specific-energy-consumption', { energy: '1840000', output: '920000', baseline: '2.15' });
  near(get(r, 'sec').value, 2); near(get(r, 'saved').value, 0.15 * 920000, 1e-6); near(get(r, 'chg').value, (2 / 2.15 - 1) * 100, 1e-9);
});

test('Electrical power three- and single-phase', () => {
  const r = ok('electrical-power', { phase: '3', volts: '400', amps: '100', pf: '0.8' });
  near(get(r, 'kva').value, Math.sqrt(3) * 40, 1e-9); near(get(r, 'kw').value, Math.sqrt(3) * 32, 1e-9); near(get(r, 'kvar').value, Math.sqrt(3) * 24, 1e-9);
  const s = ok('electrical-power', { phase: '1', volts: '230', amps: '10', pf: '1' });
  near(get(s, 'kw').value, 2.3); near(get(s, 'kvar').value, 0, 1e-9);
  bad('electrical-power', { phase: '3', volts: '400', amps: '10', pf: '1.2' }, 'pf');
});

test('Power factor correction: 500 kW 0.78→0.95', () => {
  const r = ok('power-factor-correction', { kw: '500', pf1: '0.78', pf2: '0.95' });
  // tan(acos .78)=0.802305, tan(acos .95)=0.328684
  near(get(r, 'kvar').value, 500 * (0.802282 - 0.328684), 0.01);
  near(get(r, 'iRed').value, (1 - 0.78 / 0.95) * 100, 1e-9);
  bad('power-factor-correction', { kw: '500', pf1: '0.9', pf2: '0.85' }, 'pf2');
});

test('Motor efficiency savings', () => {
  const r = ok('motor-efficiency-savings', { kw: '45', load: '75', hours: '6000', eff1: '91', eff2: '94.6', price: '0.12', cost: '4200' });
  const save = 33.75 * (1 / 0.91 - 1 / 0.946);
  near(get(r, 'kwSave').value, save, 1e-9); near(get(r, 'money').value, save * 6000 * 0.12, 1e-6); near(get(r, 'payback').value, 4200 / (save * 720), 1e-9);
  bad('motor-efficiency-savings', { kw: '45', load: '75', hours: '6000', eff1: '95', eff2: '94', price: '0.12' }, 'eff2');
});

test('Belt conveyor capacity', () => {
  const a = ok('belt-conveyor-capacity', { mode: 'area', area: '0.12', density: '1.4', speed: '4.2' });
  near(get(a, 'tph').value, 3600 * 0.12 * 4.2 * 1.4, 1e-9);
  const b = ok('belt-conveyor-capacity', { mode: 'load', q: '160', speed: '4.2' });
  near(get(b, 'tph').value, 3.6 * 160 * 4.2, 1e-9);
  const c = ok('belt-conveyor-capacity', { mode: 'area', area: '0.1', density: '1', fill: '50', speed: '1' });
  near(get(c, 'tph').value, 180, 1e-9);
});

test('Reorder point', () => {
  const r = ok('reorder-point', { demand: '40', lead: '5', ss: '60' }); near(get(r, 'rop').value, 260); // legacy example
  const r2 = ok('reorder-point', { demand: '40', lead: '7', ss: '85', onhand: '520' });
  near(get(r2, 'days').value, (520 - 365) / 40); assert.match(r2.output.notes[0], /above/);
});

test('Safety stock: combined formula', () => {
  const r = ok('safety-stock', { sl: '95', d: '40', sd: '12', lt: '7', sdlt: '1.5' });
  near(get(r, 'sigma').value, Math.sqrt(4608), 1e-9);
  assert.equal(get(r, 'ss').value, Math.ceil(1.644854 * Math.sqrt(4608)));
  const r2 = ok('safety-stock', { sl: '99', d: '10', sd: '5', lt: '4' }); // constant LT: z σd √LT = 2.3263*10
  assert.equal(get(r2, 'ss').value, 24);
  bad('safety-stock', { sl: '100', d: '1', sd: '1', lt: '1' }, 'sl');
  bad('safety-stock', { sl: '40', d: '1', sd: '1', lt: '1' }, 'sl');
});

test('EOQ', () => {
  const r = ok('eoq', { D: '12000', S: '75', H: '2.4' });
  near(get(r, 'q').value, Math.sqrt(750000)); near(get(r, 'oc').value, get(r, 'hc').value, 1e-9);
  bad('eoq', { D: '12000', S: '75', H: '0' }, 'H');
});

test('Inventory turnover and DIO', () => {
  const r = ok('inventory-turnover', { cogs: '2400000', begin: '380000', end: '420000' });
  near(get(r, 't').value, 6); near(get(r, 'dio').value, 365 / 6);
  bad('inventory-turnover', { cogs: '100', begin: '0', end: '0' }, 'end');
});

test('ROI and annualized ROI', () => {
  const r = ok('roi', { cost: '10000', ret: '12000' }); near(get(r, 'roi').value, 20); // legacy example: 2,000 gain on 10,000
  const r2 = ok('roi', { cost: '100', ret: '121', years: '2' }); near(get(r2, 'ann').value, 10, 1e-9);
  const r3 = ok('roi', { cost: '100', ret: '0', years: '2' }); near(get(r3, 'roi').value, -100); assert.ok(get(r3, 'ann').text);
  bad('roi', { cost: '0', ret: '10' }, 'cost');
});

test('Payback period', () => {
  const r = ok('payback-period', { inv: '85000', cf: '31000', life: '8' });
  near(get(r, 'pb').value, 85000 / 31000); near(get(r, 'net').value, 163000);
  const r2 = ok('payback-period', { inv: '100', cf: '40' }); assert.equal(get(r2, 'ym').text, '2 years 6 months');
});

test('Break-even', () => {
  const r = ok('break-even', { fixed: '120000', price: '45', vc: '27', profit: '30000' });
  assert.equal(get(r, 'units').value, 6667); assert.equal(get(r, 'target').value, 8334); near(get(r, 'cmr').value, 40);
  bad('break-even', { fixed: '1', price: '10', vc: '10' }, 'vc');
});

test('Working hours incl. overnight', () => {
  let r = ok('working-hours', { start: '09:00', end: '17:30', brk: '30' }); near(get(r, 'dec').value, 8); // legacy example
  r = ok('working-hours', { start: '22:00', end: '06:00', brk: '30', days: '5' }); near(get(r, 'dec').value, 7.5); near(get(r, 'week').value, 37.5);
  assert.equal(C.formatResult(get(r, 'net')), '7 h 30 min');
  bad('working-hours', { start: '08:00', end: '08:00' }, 'end');
  bad('working-hours', { start: '08:00', end: '09:00', brk: '60' }, 'brk');
  bad('working-hours', { start: '25:00', end: '09:00' }, 'start');
});

test('generic: commas accepted, negatives and Infinity rejected', () => {
  ok('eoq', { D: '12,000', S: '75', H: '2.4' });
  bad('eoq', { D: '-5', S: '75', H: '2.4' }, 'D');
  bad('eoq', { D: 'Infinity', S: '75', H: '2.4' }, 'D');
  bad('eoq', { D: '1e400', S: '75', H: '2.4' }, 'D');
  assert.equal(C.run('nope', {}).ok, false);
});
