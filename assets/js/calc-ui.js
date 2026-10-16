/*! OpsCalc Tools — calculator UI binding. Requires calc-core.js. */
(function () {
  'use strict';
  var C = window.OpsCalc;
  var form = document.querySelector('form[data-calc]');
  if (!C || !form) return;
  var id = form.getAttribute('data-calc');
  var calc = C.registry[id];
  var box = document.getElementById('result');
  var calculated = false;

  function emit(name, detail) {
    try { document.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { /* old browsers */ }
  }

  function field(name) { return form.elements[name]; }

  function rawValues() {
    var raw = {};
    calc.inputs.forEach(function (i) { var el = field(i.name); if (el) raw[i.name] = el.value; });
    return raw;
  }

  function selectValues() {
    var v = {};
    calc.inputs.forEach(function (i) { if (i.type === 'select') v[i.name] = field(i.name).value; });
    return v;
  }

  function updateVisibility() {
    var sv = selectValues();
    calc.inputs.forEach(function (i) {
      if (!i.showIf) return;
      var wrap = document.getElementById('f-' + i.name);
      var show = C.isVisible(i, sv);
      wrap.hidden = !show;
      field(i.name).disabled = !show;
    });
  }

  function clearErrors() {
    calc.inputs.forEach(function (i) {
      var el = field(i.name), err = document.getElementById('err-' + i.name);
      if (el) el.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render(out) {
    box.innerHTML = '';
    box.classList.remove('is-error');
    var primary = out.results.filter(function (r) { return r.primary; })[0] || out.results[0];
    var p = el('div', 'result-primary');
    p.appendChild(el('span', 'result-label', primary.label));
    p.appendChild(el('strong', 'result-value', C.formatResult(primary)));
    box.appendChild(p);
    var rest = out.results.filter(function (r) { return r !== primary; });
    if (rest.length) {
      var dl = el('dl', 'result-list');
      rest.forEach(function (r) { dl.appendChild(el('dt', null, r.label)); dl.appendChild(el('dd', null, C.formatResult(r))); });
      box.appendChild(dl);
    }
    if (out.notes && out.notes.length) {
      var ul = el('ul', 'result-notes');
      out.notes.forEach(function (n) { ul.appendChild(el('li', null, n)); });
      box.appendChild(ul);
    }
  }

  function calculate(source) {
    clearErrors();
    var r = C.run(id, rawValues());
    calculated = true;
    if (!r.ok) {
      box.innerHTML = '';
      box.classList.add('is-error');
      box.appendChild(el('p', 'error', r.message));
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
    emit('opscalc:calculate', { calculator: id, source: source });
  }

  function fill(raw) {
    calc.inputs.forEach(function (i) { if (raw[i.name] != null && field(i.name)) field(i.name).value = raw[i.name]; });
    updateVisibility();
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); calculate('submit'); });
  form.addEventListener('change', function (e) {
    if (e.target.tagName === 'SELECT') updateVisibility();
    if (calculated) calculate('change');
  });

  var ex = document.getElementById('load-example');
  if (ex) ex.addEventListener('click', function () { fill(C.exampleRaw(id)); calculate('example'); });
  var ex2 = document.getElementById('load-example-2');
  if (ex2 && ex) ex2.addEventListener('click', function () {
    ex.click();
    var t = document.getElementById('calc-title');
    if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  var reset = document.getElementById('reset');
  if (reset) reset.addEventListener('click', function () {
    form.reset(); calculated = false; clearErrors(); updateVisibility();
    box.classList.remove('is-error');
    box.innerHTML = '<p class="hint">Enter your values and press Calculate.</p>';
  });

  var share = document.getElementById('share-link');
  if (share) share.addEventListener('click', function () {
    var params = new URLSearchParams();
    var raw = rawValues();
    Object.keys(raw).forEach(function (k) { if (raw[k] !== '' && !field(k).disabled) params.set(k, raw[k]); });
    var url = location.origin + location.pathname + '?' + params.toString();
    var done = function () { share.textContent = 'Link copied'; setTimeout(function () { share.textContent = 'Copy link with these inputs'; }, 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link:', url); });
    else window.prompt('Copy this link:', url);
  });

  // Prefill from a shared link (?name=value). Values are only read locally.
  try {
    var q = new URLSearchParams(location.search), any = false, pre = {};
    calc.inputs.forEach(function (i) { if (q.has(i.name)) { pre[i.name] = q.get(i.name).slice(0, 40); any = true; } });
    if (any) { fill(pre); calculate('link'); }
  } catch (e) { /* URLSearchParams unsupported */ }

  updateVisibility();
})();
