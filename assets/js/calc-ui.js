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
  function meterFor(r) {
    if (r.format !== 'percent' || r.text != null || !(r.value >= 0 && r.value <= 100)) return null;
    var m = el('div', 'meter'); m.setAttribute('aria-hidden', 'true');
    var s = el('span'); s.style.width = r.value + '%'; m.appendChild(s);
    return m;
  }
  function render(out) {
    lastOutput = out;
    box.innerHTML = '';
    var primary = out.results.filter(function (r) { return r.primary; })[0] || out.results[0];
    box.appendChild(el('span', 'ro-primary-label', primary.label));
    box.appendChild(el('strong', 'ro-primary', C.formatResult(primary)));
    var pm = meterFor(primary); if (pm) box.appendChild(pm);
    var rest = out.results.filter(function (r) { return r !== primary; });
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
