/*! OpsCalc Tools — calculator UI binding (v4). Requires calc-core.js. */
(function () {
  'use strict';
  var C = window.OpsCalc;
  var form = document.querySelector('form[data-calc]');
  if (!C || !form) return;
  var id = form.getAttribute('data-calc');
  var calc = C.registry[id];
  var box = document.getElementById('result');
  var statusEl = document.getElementById('ro-status');
  var title = document.querySelector('h1') ? document.querySelector('h1').textContent : id;
  var calculated = false, lastOutput = null;

  function emit(name, detail) { try { document.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { /* old browsers */ } }
  function field(name) { return form.elements[name]; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function say(msg) { if (statusEl) { statusEl.textContent = msg; setTimeout(function () { if (statusEl.textContent === msg) statusEl.textContent = ''; }, 2500); } }

  function rawValues() {
    var raw = {};
    calc.inputs.forEach(function (i) { var f = field(i.name); if (f) raw[i.name] = f.value; });
    return raw;
  }
  function updateVisibility() {
    var sv = {};
    calc.inputs.forEach(function (i) { if (i.type === 'select') sv[i.name] = field(i.name).value; });
    calc.inputs.forEach(function (i) {
      if (!i.showIf) return;
      var show = C.isVisible(i, sv);
      document.getElementById('f-' + i.name).hidden = !show;
      field(i.name).disabled = !show;
    });
  }
  function clearErrors() {
    calc.inputs.forEach(function (i) {
      var f = field(i.name), err = document.getElementById('err-' + i.name);
      if (f) f.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    });
  }
  // Gauges only for true shares of a whole (yield, availability, utilization…), not for rates or returns.
  var NO_METER = { chg: 1, roi: 1, ann: 1, irr: 1, rate: 1, marginPct: 1, iRed: 1, lossRed: 1 };
  function meterFor(r) {
    if (r.format !== 'percent' || r.text != null || NO_METER[r.key] || !(r.value >= 0 && r.value <= 100)) return null;
    var m = el('div', 'meter'); m.setAttribute('aria-hidden', 'true');
    var s = el('span'); s.style.width = '0%'; m.appendChild(s);
    later(function () { s.style.width = r.value + '%'; });
    return m;
  }
  // Set a width on the next frame (so it animates) and again shortly after, because
  // requestAnimationFrame does not run in background tabs.
  function later(fn) { if (window.requestAnimationFrame) requestAnimationFrame(fn); setTimeout(fn, 60); }
  function byKey(out, k) { return out.results.filter(function (r) { return r.key === k; })[0]; }
  function pctFmt(v) { return (Math.round(v * 10) / 10).toFixed(1) + '%'; }
  // OEE: show OEE = A × P × Q and how planned time splits into good output and the three losses.
  // Display only: values come from the engine's results, no recalculation of OEE itself.
  function renderOeeBreakdown(out) {
    var f = ['a', 'p', 'q'].map(function (k) { return byKey(out, k); });
    if (f.some(function (r) { return !r || !(r.value >= 0 && r.value <= 100); })) return false;
    var weakest = f.reduce(function (m, r) { return r.value < m.value ? r : m; });
    var eq = el('ul', 'oee-eq'); eq.setAttribute('aria-label', 'OEE equals availability times performance times quality');
    f.forEach(function (r, i) {
      if (i) { var x = el('li', 'oee-x', '×'); x.setAttribute('aria-hidden', 'true'); eq.appendChild(x); }
      var li = el('li', 'oee-f' + (r === weakest ? ' is-weak' : ''));
      li.appendChild(el('span', 'l', r.label)); li.appendChild(el('span', 'v', C.formatResult(r)));
      var m = meterFor(r); if (m) li.appendChild(m);
      if (r === weakest) li.appendChild(el('span', 'tag', 'Largest loss'));
      eq.appendChild(li);
    });
    box.appendChild(eq);
    var A = f[0].value / 100, P = f[1].value / 100, Q = f[2].value / 100;
    var seg = [
      ['lb-good', 'Good output (OEE)', A * P * Q * 100],
      ['lb-q', 'Quality loss', A * P * (1 - Q) * 100],
      ['lb-p', 'Performance loss', A * (1 - P) * 100],
      ['lb-a', 'Availability loss', (1 - A) * 100]
    ];
    box.appendChild(el('p', 'lb-title', 'Where planned production time goes'));
    var bar = el('div', 'lossbar'); bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', seg.map(function (s) { return s[1] + ' ' + pctFmt(s[2]); }).join(', '));
    var legend = el('ul', 'lb-legend');
    seg.forEach(function (s) {
      var span = el('span', s[0]); span.style.width = '0%'; bar.appendChild(span);
      later(function () { span.style.width = Math.max(0, s[2]) + '%'; });
      var li = el('li'); var sw = el('i', s[0]); sw.setAttribute('aria-hidden', 'true');
      li.appendChild(sw); li.appendChild(el('span', null, s[1])); li.appendChild(el('b', null, pctFmt(s[2])));
      legend.appendChild(li);
    });
    box.appendChild(bar); box.appendChild(legend);
    return true;
  }
  function render(out) {
    lastOutput = out;
    box.innerHTML = '';
    var primary = out.results.filter(function (r) { return r.primary; })[0] || out.results[0];
    box.appendChild(el('span', 'ro-primary-label', primary.label));
    box.appendChild(el('strong', 'ro-primary', C.formatResult(primary)));
    var special = id === 'oee' && renderOeeBreakdown(out);
    var pm = !special && meterFor(primary); if (pm) box.appendChild(pm);
    var rest = special ? [] : out.results.filter(function (r) { return r !== primary; });
    if (rest.length) {
      var dl = el('dl', 'ro-list');
      rest.forEach(function (r) {
        var row = el('div', 'ro-item');
        row.appendChild(el('dt', null, r.label)); row.appendChild(el('dd', null, C.formatResult(r)));
        var m = meterFor(r); if (m) row.appendChild(m);
        dl.appendChild(row);
      });
      box.appendChild(dl);
    }
    if (out.notes && out.notes.length) {
      var ul = el('ul', 'ro-notes');
      out.notes.forEach(function (n) { ul.appendChild(el('li', null, n)); });
      box.appendChild(ul);
    }
    document.querySelectorAll('[data-needs-result]').forEach(function (b) { b.disabled = false; });
  }
  function calculate(source) {
    clearErrors();
    var r = C.run(id, rawValues());
    calculated = true;
    if (!r.ok) {
      lastOutput = null;
      box.innerHTML = '';
      box.appendChild(el('p', 'ro-error', r.message));
      document.querySelectorAll('[data-needs-result]').forEach(function (b) { b.disabled = true; });
      if (r.field && field(r.field)) {
        field(r.field).setAttribute('aria-invalid', 'true');
        var err = document.getElementById('err-' + r.field);
        if (err) err.textContent = r.message;
        if (source === 'submit') field(r.field).focus();
      }
      emit('opscalc:error', { calculator: id, field: r.field || 'general' });
      return;
    }
    render(r.output);
    if ((source === 'submit' || source === 'example') && window.matchMedia && window.matchMedia('(max-width: 899px)').matches) {
      var ro = box.closest('.readout'); if (ro && ro.scrollIntoView) ro.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    emit('opscalc:calculate', { calculator: id, source: source });
  }
  function fill(raw) {
    calc.inputs.forEach(function (i) { if (raw[i.name] != null && field(i.name)) field(i.name).value = raw[i.name]; });
    updateVisibility();
  }
  function shareUrl() {
    var p = new URLSearchParams(), raw = rawValues();
    Object.keys(raw).forEach(function (k) { if (raw[k] !== '' && !field(k).disabled) p.set(k, raw[k]); });
    return location.origin + location.pathname + '?' + p.toString();
  }
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy:', text); });
    else window.prompt('Copy:', text);
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); calculate('submit'); });
  form.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') updateVisibility(); if (calculated) calculate('change'); });

  var ex = document.getElementById('load-example');
  if (ex) ex.addEventListener('click', function () { fill(C.exampleRaw(id)); calculate('example'); });
  var ex2 = document.getElementById('load-example-2');
  if (ex2 && ex) ex2.addEventListener('click', function () {
    ex.click();
    var t = document.getElementById('calc-title'); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var reset = document.getElementById('reset');
  if (reset) reset.addEventListener('click', function () {
    form.reset(); calculated = false; lastOutput = null; clearErrors(); updateVisibility();
    box.innerHTML = '<p class="ro-empty">Enter your values and press Calculate, or load the worked example.</p>';
    document.querySelectorAll('[data-needs-result]').forEach(function (b) { b.disabled = true; });
    var first = form.querySelector('input:not([disabled]),select'); if (first) first.focus();
    say('Inputs cleared');
  });
  var copyBtn = document.getElementById('copy-result');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    if (!lastOutput) return;
    var lines = [title];
    lastOutput.results.forEach(function (r) { lines.push(r.label + ': ' + C.formatResult(r)); });
    lines.push(shareUrl());
    copy(lines.join('\n'), function () { say('Result copied'); });
    emit('opscalc:copy', { calculator: id });
  });
  var share = document.getElementById('share-link');
  if (share) share.addEventListener('click', function () { copy(shareUrl(), function () { say('Link copied'); }); });

  try {
    var q = new URLSearchParams(location.search), any = false, pre = {};
    calc.inputs.forEach(function (i) { if (q.has(i.name)) { pre[i.name] = q.get(i.name).slice(0, 40); any = true; } });
    if (any) { fill(pre); calculate('link'); }
  } catch (e) { /* URLSearchParams unsupported */ }
  updateVisibility();
})();
