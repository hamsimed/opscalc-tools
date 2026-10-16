/*!
 * OpsCalc Tools — calculation core
 * Single source of truth for every calculator's inputs, validation and math.
 * Loaded by the browser (window.OpsCalc) and by Node tests/build (module.exports).
 * No dependencies. No network calls. No personal data.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OpsCalc = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- helpers ---------- */

  function ValidationError(field, message) {
    this.name = 'ValidationError';
    this.field = field || null;
    this.message = message;
  }
  ValidationError.prototype = Object.create(Error.prototype);

  function fail(field, message) { throw new ValidationError(field, message); }

  /** Inverse standard normal CDF (Acklam's rational approximation, |rel err| < 1.15e-9). */
  function normInv(p) {
    if (!(p > 0 && p < 1)) throw new RangeError('p must be in (0,1)');
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var pl = 0.02425, q, r;
    if (p < pl) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > 1 - pl) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  function parseTime(str) {
    var m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(str).trim());
    if (!m) return NaN;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return NaN;
    return h * 60 + mi;
  }

  function fmtNumber(v, dp) {
    if (!isFinite(v)) return '—';
    var d = dp == null ? 2 : dp;
    return Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d });
  }

  function fmtDuration(hours) {
    if (!isFinite(hours)) return '—';
    var totalMin = Math.round(hours * 60);
    var h = Math.floor(totalMin / 60), m = totalMin % 60;
    return h + ' h ' + (m < 10 ? '0' : '') + m + ' min';
  }

  /** Format one result object to a display string. */
  function formatResult(r) {
    if (r.text != null) return r.text;
    var s;
    switch (r.format) {
      case 'percent': s = fmtNumber(r.value, r.dp == null ? 1 : r.dp) + '%'; break;
      case 'duration': s = fmtDuration(r.value); break;
      default: s = fmtNumber(r.value, r.dp);
    }
    return r.unit && r.format !== 'percent' && r.format !== 'duration' ? s + ' ' + r.unit : s;
  }

  /* ---------- generic validation ---------- */

  function isVisible(input, values) {
    if (!input.showIf) return true;
    var cur = values[input.showIf.name];
    var want = input.showIf.value;
    return Array.isArray(want) ? want.indexOf(cur) !== -1 : cur === want;
  }

  /**
   * Coerce and validate raw string values against a calculator's input spec.
   * @returns {Object} parsed values (numbers for number inputs, minutes for time, strings for select)
   */
  function validate(calc, raw) {
    var out = {};
    // selects first, so showIf can be evaluated
    calc.inputs.forEach(function (inp) {
      if (inp.type === 'select') {
        var v = raw[inp.name];
        if (v == null || v === '') v = inp.default != null ? inp.default : inp.options[0].value;
        var ok = inp.options.some(function (o) { return o.value === v; });
        if (!ok) fail(inp.name, inp.label + ': choose one of the listed options.');
        out[inp.name] = v;
      }
    });
    calc.inputs.forEach(function (inp) {
      if (inp.type === 'select') return;
      if (!isVisible(inp, out)) return;
      var s = raw[inp.name];
      s = s == null ? '' : String(s).trim();
      if (s === '') {
        if (inp.optional) { out[inp.name] = inp.default != null ? inp.default : null; return; }
        fail(inp.name, inp.label + ' is required.');
      }
      if (inp.type === 'time') {
        var t = parseTime(s);
        if (!isFinite(t)) fail(inp.name, inp.label + ': enter a valid time (HH:MM).');
        out[inp.name] = t; return;
      }
      var n = Number(s.replace(/,/g, ''));
      if (!isFinite(n)) fail(inp.name, inp.label + ' must be a number.');
      if (inp.integer && Math.floor(n) !== n) fail(inp.name, inp.label + ' must be a whole number.');
      if (inp.min != null) {
        if (inp.minExclusive ? n <= inp.min : n < inp.min) {
          fail(inp.name, inp.label + ' must be ' + (inp.minExclusive ? 'greater than ' : 'at least ') + inp.min + '.');
        }
      }
      if (inp.max != null) {
        if (inp.maxExclusive ? n >= inp.max : n > inp.max) {
          fail(inp.name, inp.label + ' must be ' + (inp.maxExclusive ? 'less than ' : 'at most ') + inp.max + '.');
        }
      }
      out[inp.name] = n;
    });
    return out;
  }

  /** Validate + compute. Returns {ok:true, values, output} or {ok:false, field, message}. */
  function run(id, raw) {
    var calc = registry[id];
    if (!calc) return { ok: false, field: null, message: 'Unknown calculator: ' + id };
    try {
      var values = validate(calc, raw || {});
      var output = calc.compute(values);
      output.results.forEach(function (r) {
        if (r.text == null && !isFinite(r.value)) fail(null, 'The inputs produce an undefined result. Please check the values.');
      });
      return { ok: true, values: values, output: output };
    } catch (e) {
      if (e instanceof ValidationError) return { ok: false, field: e.field, message: e.message };
      throw e;
    }
  }

  function exampleRaw(id) {
    var raw = {};
    registry[id].inputs.forEach(function (i) { if (i.example != null) raw[i.name] = String(i.example); });
    return raw;
  }

  /* ---------- small builders ---------- */
  function num(name, label, unit, o) {
    var x = { name: name, label: label, unit: unit || '', type: 'number' };
    for (var k in o) x[k] = o[k];
    return x;
  }
  function sel(name, label, options, o) {
    var x = { name: name, label: label, type: 'select', options: options };
    for (var k in o) x[k] = o[k];
    return x;
  }
  function res(key, label, value, unit, o) {
    var x = { key: key, label: label, value: value, unit: unit || '' };
    for (var k in o) x[k] = o[k];
    return x;
  }
  function pct(key, label, ratio, o) { return res(key, label, ratio * 100, '', Object.assign({ format: 'percent' }, o || {})); }

  /* ---------- calculators ---------- */
  var registry = {};
  function define(id, spec) { spec.id = id; registry[id] = spec; }

  // ===== Manufacturing / OpEx =====

  define('oee', {
    inputs: [
      sel('mode', 'Input method', [
        { value: 'raw', label: 'Shop-floor data (times, counts)' },
        { value: 'factors', label: 'Known A, P, Q percentages' }
      ], { default: 'raw', example: 'raw' }),
      num('planned', 'Planned production time', 'min', { min: 0, minExclusive: true, example: 480, showIf: { name: 'mode', value: 'raw' }, help: 'Shift time minus planned stops (breaks, planned maintenance).' }),
      num('downtime', 'Unplanned stop time', 'min', { min: 0, example: 47, showIf: { name: 'mode', value: 'raw' }, help: 'Breakdowns, changeovers, waiting for material.' }),
      num('idealCycle', 'Ideal cycle time', 's/unit', { min: 0, minExclusive: true, example: 1.0, showIf: { name: 'mode', value: 'raw' }, help: 'Fastest sustainable time to produce one unit.' }),
      num('total', 'Total units produced', 'units', { min: 0, integer: true, example: 19271, showIf: { name: 'mode', value: 'raw' } }),
      num('good', 'Good units (right first time)', 'units', { min: 0, integer: true, example: 18848, showIf: { name: 'mode', value: 'raw' } }),
      num('a', 'Availability', '%', { min: 0, max: 100, example: 90, showIf: { name: 'mode', value: 'factors' } }),
      num('p', 'Performance', '%', { min: 0, max: 100, example: 85, showIf: { name: 'mode', value: 'factors' } }),
      num('q', 'Quality', '%', { min: 0, max: 100, example: 98, showIf: { name: 'mode', value: 'factors' } })
    ],
    compute: function (v) {
      var A, P, Q, notes = [];
      if (v.mode === 'factors') {
        A = v.a / 100; P = v.p / 100; Q = v.q / 100;
      } else {
        if (v.downtime >= v.planned) fail('downtime', 'Unplanned stop time must be less than planned production time.');
        if (v.good > v.total) fail('good', 'Good units cannot exceed total units produced.');
        var run = v.planned - v.downtime;
        A = run / v.planned;
        P = (v.idealCycle * v.total) / (run * 60);
        Q = v.total > 0 ? v.good / v.total : 0;
        if (P > 1) notes.push('Performance is above 100%. The ideal cycle time is probably set too slow, or counts include units from outside the period. Review it before using this OEE.');
      }
      var oee = A * P * Q;
      var f = [['Availability', A], ['Performance', P], ['Quality', Q]].sort(function (x, y) { return x[1] - y[1]; });
      notes.unshift('Largest loss: ' + f[0][0] + ' (' + fmtNumber(f[0][1] * 100, 1) + '%). Start the loss analysis there.');
      return {
        results: [pct('oee', 'OEE', oee, { primary: true }), pct('a', 'Availability', A), pct('p', 'Performance', P), pct('q', 'Quality', Q)],
        notes: notes
      };
    }
  });

  define('takt-time', {
    inputs: [
      num('shift', 'Shift length', 'min', { min: 0, minExclusive: true, example: 480 }),
      num('breaks', 'Planned breaks per shift', 'min', { min: 0, example: 60, help: 'Breaks, meetings, planned cleaning — time the line does not run.' }),
      num('shifts', 'Shifts per day', '', { min: 0, minExclusive: true, example: 2 }),
      num('demand', 'Customer demand per day', 'units', { min: 0, minExclusive: true, example: 840 }),
      num('cycle', 'Current bottleneck cycle time (optional)', 's/unit', { min: 0, minExclusive: true, optional: true, example: 55 })
    ],
    compute: function (v) {
      if (v.breaks >= v.shift) fail('breaks', 'Planned breaks must be shorter than the shift.');
      var avail = (v.shift - v.breaks) * v.shifts; // min/day
      var taktS = avail * 60 / v.demand;
      var out = [res('takt', 'Takt time', taktS, 's/unit', { primary: true, dp: 1 }), res('taktMin', 'Takt time', taktS / 60, 'min/unit', { dp: 3 }), res('avail', 'Available time per day', avail, 'min', { dp: 0 })];
      var notes = [];
      if (v.cycle != null) {
        var load = v.cycle / taktS;
        out.push(pct('load', 'Bottleneck load vs. takt', load));
        notes.push(load > 1
          ? 'The bottleneck cycle time exceeds takt: the line cannot meet demand in available time without overtime, extra capacity or cycle-time reduction.'
          : load > 0.9 ? 'The bottleneck runs above 90% of takt: little margin for stoppages. Most lines need a buffer for availability losses.'
            : 'The bottleneck is below takt with margin for normal losses.');
      }
      return { results: out, notes: notes };
    }
  });

  define('cycle-time', {
    inputs: [
      num('elapsed', 'Net production time', 'min', { min: 0, minExclusive: true, example: 420 }),
      num('units', 'Units completed', 'units', { min: 0, minExclusive: true, example: 380 }),
      num('takt', 'Takt time (optional)', 's/unit', { min: 0, minExclusive: true, optional: true, example: 70 })
    ],
    compute: function (v) {
      var ctS = v.elapsed * 60 / v.units;
      var out = [res('ct', 'Average cycle time', ctS, 's/unit', { primary: true, dp: 1 }), res('ctMin', 'Average cycle time', ctS / 60, 'min/unit', { dp: 3 }), res('rate', 'Throughput', v.units / (v.elapsed / 60), 'units/h', { dp: 1 })];
      var notes = [];
      if (v.takt != null) {
        out.push(pct('vsTakt', 'Cycle time as % of takt', ctS / v.takt));
        notes.push(ctS > v.takt ? 'Average cycle time is slower than takt: demand will not be met at this pace.' : 'Average cycle time is within takt.');
      }
      return { results: out, notes: notes };
    }
  });

  define('production-rate', {
    inputs: [
      num('units', 'Units produced', 'units', { min: 0, example: 900 }),
      num('hours', 'Operating time', 'h', { min: 0, minExclusive: true, example: 6.5 }),
      num('target', 'Target rate (optional)', 'units/h', { min: 0, minExclusive: true, optional: true, example: 150 })
    ],
    compute: function (v) {
      var rate = v.units / v.hours;
      var out = [res('rate', 'Production rate', rate, 'units/h', { primary: true, dp: 1 }), res('perMin', 'Production rate', rate / 60, 'units/min', { dp: 3 })];
      var notes = [];
      if (v.target != null) {
        var att = rate / v.target, gap = v.target * v.hours - v.units;
        out.push(pct('att', 'Target attainment', att));
        out.push(res('gap', gap >= 0 ? 'Shortfall vs. target' : 'Surplus vs. target', Math.abs(gap), 'units', { dp: 0 }));
        notes.push(att >= 1 ? 'Output meets or exceeds the target rate for this period.' : 'Output is below target. Split the gap into stoppage time and slow running to see which loss dominates.');
      }
      return { results: out, notes: notes };
    }
  });

  define('capacity-utilization', {
    inputs: [
      num('actual', 'Actual output', 'units', { min: 0, example: 7200 }),
      num('design', 'Design capacity (same period)', 'units', { min: 0, minExclusive: true, example: 10000, help: 'Maximum output under ideal conditions.' }),
      num('effective', 'Effective capacity (optional)', 'units', { min: 0, minExclusive: true, optional: true, example: 8500, help: 'Design capacity minus planned allowances (maintenance, changeovers, product mix).' })
    ],
    compute: function (v) {
      var out = [pct('util', 'Capacity utilization', v.actual / v.design, { primary: true }), res('unused', 'Unused design capacity', Math.max(0, v.design - v.actual), 'units', { dp: 0 })];
      var notes = [];
      if (v.effective != null) {
        if (v.effective > v.design) fail('effective', 'Effective capacity cannot exceed design capacity.');
        out.push(pct('eff', 'Efficiency (actual ÷ effective)', v.actual / v.effective));
      }
      if (v.actual > v.design) notes.push('Actual output exceeds design capacity. Check that both figures cover the same period and units, or update the design rating.');
      return { results: out, notes: notes };
    }
  });

  define('first-pass-yield', {
    inputs: [
      num('started', 'Units entering the process', 'units', { min: 0, minExclusive: true, integer: true, example: 2000 }),
      num('passed', 'Units passing first time (no rework)', 'units', { min: 0, integer: true, example: 1820 }),
      num('scrap', 'Units scrapped', 'units', { min: 0, integer: true, example: 60 })
    ],
    compute: function (v) {
      if (v.passed > v.started) fail('passed', 'Units passing first time cannot exceed units entering.');
      if (v.passed + v.scrap > v.started) fail('scrap', 'Passed + scrapped units cannot exceed units entering.');
      var rework = v.started - v.passed - v.scrap;
      return {
        results: [pct('fpy', 'First pass yield', v.passed / v.started, { primary: true }), pct('scrapRate', 'Scrap rate', v.scrap / v.started), pct('reworkRate', 'Rework rate', rework / v.started), pct('final', 'Final yield (after rework)', (v.started - v.scrap) / v.started), res('rework', 'Units reworked', rework, 'units', { dp: 0 })],
        notes: ['Final yield hides the cost of rework; first pass yield exposes it. Track both.']
      };
    }
  });

  define('dpmo', {
    inputs: [
      num('defects', 'Defects found', 'defects', { min: 0, integer: true, example: 34 }),
      num('units', 'Units inspected', 'units', { min: 0, minExclusive: true, integer: true, example: 1500 }),
      num('opps', 'Defect opportunities per unit', '', { min: 0, minExclusive: true, integer: true, example: 8 })
    ],
    compute: function (v) {
      var total = v.units * v.opps;
      if (v.defects > total) fail('defects', 'Defects cannot exceed total opportunities (units × opportunities).');
      var dpo = v.defects / total;
      var out = [res('dpmo', 'DPMO', dpo * 1e6, 'defects per million', { primary: true, dp: 0 }), res('dpu', 'Defects per unit (DPU)', v.defects / v.units, '', { dp: 4 }), pct('yield', 'Process yield (1 − DPO)', 1 - dpo, { dp: 3 })];
      if (dpo === 0) out.push(res('sigma', 'Sigma level (short-term)', null, '', { text: 'Not estimable — no defects observed' }));
      else if (dpo === 1) out.push(res('sigma', 'Sigma level (short-term)', null, '', { text: 'Below 0 — every opportunity is defective' }));
      else out.push(res('sigma', 'Sigma level (short-term, 1.5σ shift)', normInv(1 - dpo) + 1.5, 'σ', { dp: 2 }));
      return { results: out, notes: ['Sigma level uses the conventional 1.5σ long-term shift. Report the convention with the number.'] };
    }
  });

  define('littles-law', {
    inputs: [
      num('wip', 'Work in process (WIP)', 'units', { min: 0, minExclusive: true, example: 1200 }),
      num('throughput', 'Throughput', 'units/day', { min: 0, minExclusive: true, example: 300 }),
      num('va', 'Value-added time per unit (optional)', 'min', { min: 0, minExclusive: true, optional: true, example: 45 }),
      num('hpd', 'Working hours per day', 'h', { min: 0, minExclusive: true, max: 24, optional: true, default: 8, example: 16, showIf: null })
    ],
    compute: function (v) {
      var lt = v.wip / v.throughput;
      var out = [res('lt', 'Lead time', lt, 'days', { primary: true, dp: 2 }), res('ltH', 'Lead time (working hours)', lt * v.hpd, 'h', { dp: 1 })];
      var notes = [];
      if (v.va != null) {
        var pce = v.va / (lt * v.hpd * 60);
        if (pce > 1) fail('va', 'Value-added time cannot exceed the lead time. Check units (minutes) and working hours per day.');
        out.push(pct('pce', 'Process cycle efficiency', pce, { dp: 2 }));
        notes.push('Process cycle efficiency compares value-added time to total lead time. Low values point to waiting and queues, not slow operations.');
      }
      return { results: out, notes: notes };
    }
  });

  define('labor-productivity', {
    inputs: [
      num('output', 'Output', 'units', { min: 0, example: 5400 }),
      num('workers', 'Number of workers', '', { min: 0, minExclusive: true, example: 12 }),
      num('hours', 'Hours worked per worker', 'h', { min: 0, minExclusive: true, example: 40 }),
      num('baseline', 'Baseline productivity (optional)', 'units/labor-h', { min: 0, minExclusive: true, optional: true, example: 10.5 })
    ],
    compute: function (v) {
      var lh = v.workers * v.hours, p = v.output / lh;
      var out = [res('p', 'Labor productivity', p, 'units/labor-hour', { primary: true, dp: 2 }), res('lh', 'Total labor hours', lh, 'h', { dp: 1 }), res('perWorker', 'Output per worker', v.output / v.workers, 'units', { dp: 1 }), res('hpu', 'Labor hours per unit', lh / Math.max(v.output, 1e-12), 'h/unit', { dp: 4 })];
      if (v.output === 0) out.pop();
      if (v.baseline != null) out.push(res('chg', 'Change vs. baseline', (p / v.baseline - 1) * 100, '', { format: 'percent' }));
      return { results: out, notes: [] };
    }
  });

  // ===== Maintenance & reliability =====

  define('mtbf', {
    inputs: [
      num('uptime', 'Total operating time', 'h', { min: 0, minExclusive: true, example: 2160, help: 'Running time only — exclude repair time and idle time.' }),
      num('failures', 'Number of failures', '', { min: 0, minExclusive: true, integer: true, example: 9 }),
      num('mission', 'Mission time for reliability (optional)', 'h', { min: 0, minExclusive: true, optional: true, example: 100 })
    ],
    compute: function (v) {
      var mtbf = v.uptime / v.failures;
      var out = [res('mtbf', 'MTBF', mtbf, 'h', { primary: true, dp: 1 }), res('lambda', 'Failure rate (λ)', 1 / mtbf, 'failures/h', { dp: 6 }), res('perYear', 'Expected failures per 1,000 h', 1000 / mtbf, '', { dp: 2 })];
      var notes = [];
      if (v.mission != null) {
        out.push(pct('rel', 'Reliability over mission time', Math.exp(-v.mission / mtbf), { dp: 2 }));
        notes.push('Reliability assumes a constant failure rate (exponential model). It does not hold for wear-out failures.');
      }
      if (v.failures < 5) notes.push('Fewer than 5 failures gives a statistically weak MTBF estimate. Treat it as indicative.');
      return { results: out, notes: notes };
    }
  });

  define('mttr', {
    inputs: [
      num('repair', 'Total corrective maintenance time', 'h', { min: 0, minExclusive: true, example: 27, help: 'From the stop to the restart, including diagnosis, waiting for parts and testing.' }),
      num('repairs', 'Number of repairs', '', { min: 0, minExclusive: true, integer: true, example: 9 }),
      num('mtbf', 'MTBF (optional)', 'h', { min: 0, minExclusive: true, optional: true, example: 240 })
    ],
    compute: function (v) {
      var mttr = v.repair / v.repairs;
      var out = [res('mttr', 'MTTR', mttr, 'h', { primary: true, dp: 2 }), res('mttrMin', 'MTTR', mttr * 60, 'min', { dp: 0 })];
      if (v.mtbf != null) out.push(pct('avail', 'Inherent availability', v.mtbf / (v.mtbf + mttr), { dp: 2 }));
      return { results: out, notes: [] };
    }
  });

  define('availability', {
    inputs: [
      sel('mode', 'Input method', [
        { value: 'mtbf', label: 'From MTBF and MTTR' },
        { value: 'time', label: 'From uptime and downtime' }
      ], { default: 'mtbf', example: 'mtbf' }),
      num('mtbf', 'MTBF', 'h', { min: 0, minExclusive: true, example: 240, showIf: { name: 'mode', value: 'mtbf' } }),
      num('mttr', 'MTTR', 'h', { min: 0, example: 3, showIf: { name: 'mode', value: 'mtbf' } }),
      num('up', 'Uptime', 'h', { min: 0, example: 700, showIf: { name: 'mode', value: 'time' } }),
      num('down', 'Downtime', 'h', { min: 0, example: 20, showIf: { name: 'mode', value: 'time' } })
    ],
    compute: function (v) {
      var A;
      if (v.mode === 'time') {
        if (v.up + v.down <= 0) fail('up', 'Uptime plus downtime must be greater than zero.');
        A = v.up / (v.up + v.down);
      } else A = v.mtbf / (v.mtbf + v.mttr);
      return {
        results: [pct('a', 'Availability', A, { primary: true, dp: 2 }), res('downYear', 'Equivalent downtime per year (24/7)', (1 - A) * 8760, 'h', { dp: 1 }), res('downMonth', 'Equivalent downtime per 30 days (24/7)', (1 - A) * 720, 'h', { dp: 1 })],
        notes: [v.mode === 'mtbf' ? 'MTBF/MTTR gives inherent availability: corrective repair only, excluding preventive maintenance and logistics delays.' : 'Uptime/downtime gives achieved availability for the period measured. State which stops are included.']
      };
    }
  });

  define('downtime-cost', {
    inputs: [
      num('hours', 'Downtime duration', 'h', { min: 0, minExclusive: true, example: 3.5 }),
      num('rate', 'Lost production rate', 'units/h', { min: 0, example: 120 }),
      num('margin', 'Contribution margin per unit', 'per unit', { min: 0, example: 18, help: 'Selling price minus variable cost. Use 0 if the lost output can be recovered later at no extra cost.' }),
      num('workers', 'Idle workers (optional)', '', { min: 0, optional: true, default: 0, example: 8 }),
      num('wage', 'Loaded labor cost per hour (optional)', 'per h', { min: 0, optional: true, default: 0, example: 32 }),
      num('other', 'Other direct costs (optional)', '', { min: 0, optional: true, default: 0, example: 1500, help: 'Spare parts, contractor call-out, scrap, expediting.' })
    ],
    compute: function (v) {
      var lost = v.hours * v.rate * v.margin, labor = v.hours * v.workers * v.wage, total = lost + labor + v.other;
      return {
        results: [res('total', 'Total downtime cost', total, '', { primary: true, dp: 2 }), res('perHour', 'Cost per downtime hour', total / v.hours, '', { dp: 2 }), res('units', 'Lost output', v.hours * v.rate, 'units', { dp: 0 }), res('lost', 'Lost contribution margin', lost, '', { dp: 2 }), res('labor', 'Idle labor cost', labor, '', { dp: 2 }), res('other', 'Other direct costs', v.other, '', { dp: 2 })],
        notes: ['Costs are in your own currency. Lost margin applies only if the output is truly lost (bottleneck stopped, no recovery capacity).']
      };
    }
  });

  // ===== Energy & electrical =====

  define('energy-cost', {
    inputs: [
      num('power', 'Rated power', 'kW', { min: 0, minExclusive: true, example: 75 }),
      num('load', 'Average load', '% of rated', { min: 0, minExclusive: true, max: 150, optional: true, default: 100, example: 80 }),
      num('eff', 'Motor efficiency (optional)', '%', { min: 0, minExclusive: true, max: 100, optional: true, default: 100, example: 94, help: 'For motors, nameplate kW is shaft output. Enter efficiency to get electrical input. Leave blank for other loads.' }),
      num('hpd', 'Operating hours per day', 'h', { min: 0, minExclusive: true, max: 24, example: 16 }),
      num('days', 'Operating days per year', 'days', { min: 0, minExclusive: true, max: 366, example: 300 }),
      num('price', 'Energy price', 'per kWh', { min: 0, example: 0.12 })
    ],
    compute: function (v) {
      var kw = v.power * (v.load / 100) / (v.eff / 100);
      var eDay = kw * v.hpd, eYear = eDay * v.days;
      return {
        results: [res('costYear', 'Annual energy cost', eYear * v.price, '', { primary: true, dp: 0 }), res('eYear', 'Annual energy use', eYear, 'kWh', { dp: 0 }), res('costMonth', 'Average monthly cost', eYear * v.price / 12, '', { dp: 0 }), res('costDay', 'Cost per operating day', eDay * v.price, '', { dp: 2 }), res('costHour', 'Cost per operating hour', kw * v.price, '', { dp: 2 }), res('kwIn', 'Electrical input power', kw, 'kW', { dp: 2 })],
        notes: ['Energy-only estimate: excludes demand (kW) charges, reactive-energy penalties, taxes and time-of-use tiers.']
      };
    }
  });

  define('specific-energy-consumption', {
    inputs: [
      num('energy', 'Energy consumed', 'kWh', { min: 0, example: 1840000 }),
      num('output', 'Production output', 't (or units)', { min: 0, minExclusive: true, example: 920000 }),
      num('baseline', 'Baseline SEC (optional)', 'kWh/t', { min: 0, minExclusive: true, optional: true, example: 2.15 })
    ],
    compute: function (v) {
      var sec = v.energy / v.output;
      var out = [res('sec', 'Specific energy consumption', sec, 'kWh/t', { primary: true, dp: 3 }), res('perK', 'Energy per 1,000 t', sec * 1000, 'kWh', { dp: 0 })];
      var notes = [];
      if (v.baseline != null) {
        var d = sec / v.baseline - 1, saved = (v.baseline - sec) * v.output;
        out.push(res('chg', 'Change vs. baseline', d * 100, '', { format: 'percent' }));
        out.push(res('saved', saved >= 0 ? 'Energy saved vs. baseline' : 'Over-consumption vs. baseline', Math.abs(saved), 'kWh', { dp: 0 }));
        notes.push('A simple ratio baseline ignores fixed (load-independent) consumption. If output varied a lot, a regression baseline (E = a·output + b) is more reliable.');
      }
      return { results: out, notes: notes };
    }
  });

  define('electrical-power', {
    inputs: [
      sel('phase', 'Supply', [{ value: '3', label: 'Three-phase (line-to-line voltage)' }, { value: '1', label: 'Single-phase' }], { default: '3', example: '3' }),
      num('volts', 'Voltage', 'V', { min: 0, minExclusive: true, example: 400 }),
      num('amps', 'Current', 'A', { min: 0, minExclusive: true, example: 135 }),
      num('pf', 'Power factor', 'cos φ', { min: 0, minExclusive: true, max: 1, example: 0.86 }),
      num('eff', 'Efficiency (optional)', '%', { min: 0, minExclusive: true, max: 100, optional: true, example: 94.5, help: 'Motor efficiency, to estimate shaft output.' })
    ],
    compute: function (v) {
      var k = v.phase === '3' ? Math.sqrt(3) : 1;
      var kva = k * v.volts * v.amps / 1000, kw = kva * v.pf, kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));
      var out = [res('kw', 'Active power (input)', kw, 'kW', { primary: true, dp: 2 }), res('kva', 'Apparent power', kva, 'kVA', { dp: 2 }), res('kvar', 'Reactive power', kvar, 'kvar', { dp: 2 })];
      if (v.eff != null) out.push(res('shaft', 'Estimated shaft output', kw * v.eff / 100, 'kW', { dp: 2 }));
      return { results: out, notes: [] };
    }
  });

  define('power-factor-correction', {
    inputs: [
      num('kw', 'Active power', 'kW', { min: 0, minExclusive: true, example: 500 }),
      num('pf1', 'Current power factor', '', { min: 0, minExclusive: true, max: 1, maxExclusive: true, example: 0.78 }),
      num('pf2', 'Target power factor', '', { min: 0, minExclusive: true, max: 1, example: 0.95 })
    ],
    compute: function (v) {
      if (v.pf2 <= v.pf1) fail('pf2', 'Target power factor must be higher than the current power factor.');
      var t1 = Math.tan(Math.acos(v.pf1)), t2 = Math.tan(Math.acos(v.pf2));
      var kvar = v.kw * (t1 - t2), s1 = v.kw / v.pf1, s2 = v.kw / v.pf2;
      return {
        results: [res('kvar', 'Required capacitor rating', kvar, 'kvar', { primary: true, dp: 1 }), res('s1', 'Apparent power before', s1, 'kVA', { dp: 1 }), res('s2', 'Apparent power after', s2, 'kVA', { dp: 1 }), pct('iRed', 'Line current reduction', 1 - s2 / s1), pct('lossRed', 'Approx. I²R loss reduction', 1 - Math.pow(s2 / s1, 2))],
        notes: ['Select the nearest standard bank size above the result, and check harmonics (VFDs) before installing capacitors — detuned banks may be needed.']
      };
    }
  });

  define('motor-efficiency-savings', {
    inputs: [
      num('kw', 'Motor shaft output', 'kW', { min: 0, minExclusive: true, example: 45 }),
      num('load', 'Average load', '% of rated', { min: 0, minExclusive: true, max: 125, example: 75 }),
      num('hours', 'Operating hours per year', 'h', { min: 0, minExclusive: true, max: 8784, example: 6000 }),
      num('eff1', 'Existing motor efficiency', '%', { min: 0, minExclusive: true, max: 100, maxExclusive: true, example: 91.0 }),
      num('eff2', 'New motor efficiency', '%', { min: 0, minExclusive: true, max: 100, maxExclusive: true, example: 94.6 }),
      num('price', 'Energy price', 'per kWh', { min: 0, example: 0.12 }),
      num('cost', 'Installed cost of new motor (optional)', '', { min: 0, minExclusive: true, optional: true, example: 4200 })
    ],
    compute: function (v) {
      if (v.eff2 <= v.eff1) fail('eff2', 'New motor efficiency must be higher than the existing efficiency.');
      var out_kw = v.kw * v.load / 100;
      var saveKw = out_kw * (100 / v.eff1 - 100 / v.eff2), kwh = saveKw * v.hours, money = kwh * v.price;
      var out = [res('money', 'Annual cost savings', money, '', { primary: true, dp: 0 }), res('kwh', 'Annual energy savings', kwh, 'kWh', { dp: 0 }), res('kwSave', 'Input power reduction', saveKw, 'kW', { dp: 2 })];
      if (v.cost != null) out.push(money > 0 ? res('payback', 'Simple payback', v.cost / money, 'years', { dp: 1 }) : res('payback', 'Simple payback', null, '', { text: 'No payback (zero savings)' }));
      return { results: out, notes: ['Uses efficiency at the stated load. Part-load efficiency can differ from nameplate; use manufacturer data at your load point where available.'] };
    }
  });

  define('belt-conveyor-capacity', {
    inputs: [
      sel('mode', 'Calculation method', [{ value: 'area', label: 'From load cross-section area' }, { value: 'load', label: 'From load per metre of belt' }], { default: 'area', example: 'area' }),
      num('area', 'Load cross-section area', 'm²', { min: 0, minExclusive: true, example: 0.12, showIf: { name: 'mode', value: 'area' }, help: 'From troughing geometry and surcharge angle (CEMA / ISO 5048 / DIN 22101 methods).' }),
      num('density', 'Bulk density', 't/m³', { min: 0, minExclusive: true, example: 1.4, showIf: { name: 'mode', value: 'area' } }),
      num('fill', 'Fill factor', '%', { min: 0, minExclusive: true, max: 100, optional: true, default: 100, example: 100, showIf: { name: 'mode', value: 'area' } }),
      num('q', 'Load per metre', 'kg/m', { min: 0, minExclusive: true, example: 160, showIf: { name: 'mode', value: 'load' } }),
      num('speed', 'Belt speed', 'm/s', { min: 0, minExclusive: true, max: 15, example: 4.2 })
    ],
    compute: function (v) {
      var tph, vol = null;
      if (v.mode === 'load') tph = 3.6 * v.q * v.speed;
      else { vol = 3600 * v.area * (v.fill / 100) * v.speed; tph = vol * v.density; }
      var out = [res('tph', 'Conveying capacity', tph, 't/h', { primary: true, dp: 0 }), res('tday', 'Capacity per 24 h', tph * 24, 't', { dp: 0 })];
      if (vol != null) out.push(res('vol', 'Volumetric capacity', vol, 'm³/h', { dp: 0 }));
      else out.push(res('qChk', 'Load per metre', v.q, 'kg/m', { dp: 1 }));
      return { results: out, notes: ['Theoretical capacity at the stated fill. Inclination, feed irregularity and material lumpiness reduce achievable capacity.'] };
    }
  });

  // ===== Inventory & logistics =====

  define('reorder-point', {
    inputs: [
      num('demand', 'Average daily demand', 'units/day', { min: 0, example: 40 }),
      num('lead', 'Lead time', 'days', { min: 0, example: 7 }),
      num('ss', 'Safety stock', 'units', { min: 0, example: 85 }),
      num('onhand', 'Current inventory position (optional)', 'units', { min: 0, optional: true, example: 520, help: 'On hand + on order − backorders.' })
    ],
    compute: function (v) {
      var ltd = v.demand * v.lead, rop = ltd + v.ss;
      var out = [res('rop', 'Reorder point', rop, 'units', { primary: true, dp: 0 }), res('ltd', 'Demand during lead time', ltd, 'units', { dp: 0 })];
      var notes = [];
      if (v.onhand != null) {
        notes.push(v.onhand <= rop ? 'Inventory position is at or below the reorder point: place an order now.' : 'Inventory position is above the reorder point.');
        if (v.demand > 0) out.push(res('days', 'Days until reorder point', Math.max(0, (v.onhand - rop) / v.demand), 'days', { dp: 1 }));
      }
      return { results: out, notes: notes };
    }
  });

  define('safety-stock', {
    inputs: [
      num('sl', 'Target cycle service level', '%', { min: 50, max: 100, maxExclusive: true, example: 95, help: 'Probability of no stockout during a replenishment cycle.' }),
      num('d', 'Average daily demand', 'units/day', { min: 0, example: 40 }),
      num('sd', 'Std. deviation of daily demand', 'units/day', { min: 0, example: 12 }),
      num('lt', 'Average lead time', 'days', { min: 0, minExclusive: true, example: 7 }),
      num('sdlt', 'Std. deviation of lead time (optional)', 'days', { min: 0, optional: true, default: 0, example: 1.5 })
    ],
    compute: function (v) {
      var z = normInv(v.sl / 100);
      var sigma = Math.sqrt(v.lt * v.sd * v.sd + v.d * v.d * v.sdlt * v.sdlt);
      var ss = z * sigma;
      return {
        results: [res('ss', 'Safety stock', Math.ceil(ss), 'units', { primary: true, dp: 0 }), res('z', 'Service factor (z)', z, '', { dp: 3 }), res('sigma', 'Std. deviation of lead-time demand', sigma, 'units', { dp: 1 }), res('rop', 'Reorder point (d × LT + SS)', v.d * v.lt + Math.ceil(ss), 'units', { dp: 0 })],
        notes: ['Assumes normally distributed, independent demand and lead time. Rounded up to whole units. For intermittent demand, this model understates the stock required.']
      };
    }
  });

  define('eoq', {
    inputs: [
      num('D', 'Annual demand', 'units/year', { min: 0, minExclusive: true, example: 12000 }),
      num('S', 'Cost per order', 'per order', { min: 0, minExclusive: true, example: 75, help: 'Purchasing, receiving and invoice-handling cost of one order.' }),
      num('H', 'Holding cost per unit per year', 'per unit-year', { min: 0, minExclusive: true, example: 2.4, help: 'Often 15–30% of unit cost per year (capital, storage, obsolescence).' })
    ],
    compute: function (v) {
      var q = Math.sqrt(2 * v.D * v.S / v.H), n = v.D / q;
      return {
        results: [res('q', 'Economic order quantity', q, 'units', { primary: true, dp: 0 }), res('n', 'Orders per year', n, '', { dp: 1 }), res('cycle', 'Days between orders (365-day year)', 365 / n, 'days', { dp: 1 }), res('oc', 'Annual ordering cost', n * v.S, '', { dp: 2 }), res('hc', 'Annual holding cost', q / 2 * v.H, '', { dp: 2 }), res('tc', 'Total annual cost (ordering + holding)', n * v.S + q / 2 * v.H, '', { dp: 2 })],
        notes: ['At the EOQ, ordering and holding costs are equal. The total-cost curve is flat near the optimum, so rounding to a pack or pallet size costs little.']
      };
    }
  });

  define('inventory-turnover', {
    inputs: [
      num('cogs', 'Cost of goods sold (period)', '', { min: 0, example: 2400000 }),
      num('begin', 'Beginning inventory value', '', { min: 0, example: 380000 }),
      num('end', 'Ending inventory value', '', { min: 0, example: 420000 }),
      num('days', 'Days in period', 'days', { min: 0, minExclusive: true, optional: true, default: 365, example: 365 })
    ],
    compute: function (v) {
      var avg = (v.begin + v.end) / 2;
      if (avg <= 0) fail('end', 'Average inventory must be greater than zero.');
      var t = v.cogs / avg;
      var out = [res('t', 'Inventory turnover', t, 'turns', { primary: true, dp: 2 }), res('avg', 'Average inventory', avg, '', { dp: 0 })];
      out.push(t > 0 ? res('dio', 'Days inventory outstanding', v.days / t, 'days', { dp: 1 }) : res('dio', 'Days inventory outstanding', null, '', { text: 'Not defined (no COGS)' }));
      return { results: out, notes: ['Compare turnover only between periods of equal length and against peers in the same industry.'] };
    }
  });

  // ===== Business finance =====

  define('roi', {
    inputs: [
      num('cost', 'Total investment cost', '', { min: 0, minExclusive: true, example: 50000 }),
      num('ret', 'Total return (gross benefits)', '', { min: 0, example: 68000, help: 'Total value returned over the period, before subtracting the investment.' }),
      num('years', 'Holding period (optional)', 'years', { min: 0, minExclusive: true, optional: true, example: 3 })
    ],
    compute: function (v) {
      var gain = v.ret - v.cost, roi = gain / v.cost;
      var out = [pct('roi', 'Return on investment', roi, { primary: true }), res('gain', 'Net gain', gain, '', { dp: 2 })];
      if (v.years != null) out.push(v.ret > 0 ? pct('ann', 'Annualized ROI (CAGR)', Math.pow(v.ret / v.cost, 1 / v.years) - 1, { dp: 2 }) : res('ann', 'Annualized ROI', null, '', { text: 'Not defined (total loss)' }));
      return { results: out, notes: ['Simple ROI ignores when cash arrives. For multi-year projects, also check payback and NPV.'] };
    }
  });

  define('payback-period', {
    inputs: [
      num('inv', 'Initial investment', '', { min: 0, minExclusive: true, example: 85000 }),
      num('cf', 'Annual net cash inflow', 'per year', { min: 0, minExclusive: true, example: 31000, help: 'Savings or extra profit per year after operating costs.' }),
      num('life', 'Useful life (optional)', 'years', { min: 0, minExclusive: true, optional: true, example: 8 })
    ],
    compute: function (v) {
      var pb = v.inv / v.cf, yrs = Math.floor(pb), months = (pb - yrs) * 12;
      var out = [res('pb', 'Payback period', pb, 'years', { primary: true, dp: 2 }), res('ym', 'Payback period', null, '', { text: yrs + ' years ' + fmtNumber(months, 1) + ' months' })];
      var notes = [];
      if (v.life != null) {
        out.push(res('net', 'Undiscounted net gain over life', v.cf * v.life - v.inv, '', { dp: 0 }));
        notes.push(pb > v.life ? 'The investment does not pay back within its useful life.' : 'The investment pays back within its useful life.');
      }
      notes.push('Simple payback ignores the time value of money and cash flows after payback.');
      return { results: out, notes: notes };
    }
  });

  define('break-even', {
    inputs: [
      num('fixed', 'Fixed costs (period)', '', { min: 0, example: 120000 }),
      num('price', 'Selling price per unit', '', { min: 0, minExclusive: true, example: 45 }),
      num('vc', 'Variable cost per unit', '', { min: 0, example: 27 }),
      num('profit', 'Target profit (optional)', '', { min: 0, optional: true, example: 30000 })
    ],
    compute: function (v) {
      var cm = v.price - v.vc;
      if (cm <= 0) fail('vc', 'Variable cost must be lower than the selling price, otherwise break-even is never reached.');
      var be = v.fixed / cm;
      var out = [res('units', 'Break-even volume', Math.ceil(be), 'units', { primary: true, dp: 0 }), res('rev', 'Break-even revenue', be * v.price, '', { dp: 2 }), res('cm', 'Contribution margin per unit', cm, '', { dp: 2 }), pct('cmr', 'Contribution margin ratio', cm / v.price)];
      if (v.profit != null) out.push(res('target', 'Volume for target profit', Math.ceil((v.fixed + v.profit) / cm), 'units', { dp: 0 }));
      return { results: out, notes: ['Volumes are rounded up to whole units.'] };
    }
  });

  // ===== Productivity / time =====

  define('working-hours', {
    inputs: [
      { name: 'start', label: 'Start time', type: 'time', example: '07:30' },
      { name: 'end', label: 'End time', type: 'time', example: '16:15' },
      num('brk', 'Unpaid break', 'min', { min: 0, optional: true, default: 0, example: 45 }),
      num('days', 'Days per week (optional)', 'days', { min: 0, minExclusive: true, max: 7, optional: true, example: 5 })
    ],
    compute: function (v) {
      if (v.start === v.end) fail('end', 'Start and end times are identical. For a 24-hour shift, enter 23:59 or split the shift.');
      var span = v.end > v.start ? v.end - v.start : v.end + 1440 - v.start;
      if (v.brk >= span) fail('brk', 'Break must be shorter than the shift.');
      var net = (span - v.brk) / 60;
      var out = [res('net', 'Net working time', net, '', { primary: true, format: 'duration' }), res('dec', 'Net working time (decimal)', net, 'h', { dp: 2 }), res('span', 'Shift span', span / 60, '', { format: 'duration' })];
      var notes = v.end < v.start ? ['Overnight shift detected: end time is on the following day.'] : [];
      if (v.days != null) out.push(res('week', 'Weekly hours', net * v.days, 'h', { dp: 2 }));
      return { results: out, notes: notes };
    }
  });

  return {
    registry: registry,
    run: run,
    validate: validate,
    isVisible: isVisible,
    formatResult: formatResult,
    fmtNumber: fmtNumber,
    exampleRaw: exampleRaw,
    normInv: normInv,
    parseTime: parseTime,
    ValidationError: ValidationError
  };
});
