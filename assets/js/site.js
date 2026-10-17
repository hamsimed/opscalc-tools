/*! OpsCalc Tools — site interactions: mobile nav, calculator search (combobox), home filters, meters.
 * No dependencies. Search index is a small static JSON generated at build time. */
(function () {
  'use strict';
  var INDEX_URL = '/assets/search-index.json';
  var indexPromise = null;
  function loadIndex() {
    if (!indexPromise) indexPromise = fetch(INDEX_URL).then(function (r) { return r.json(); }).catch(function () { return []; });
    return indexPromise;
  }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function score(item, q) {
    var t = norm(item.t), terms = norm(q).split(/\s+/).filter(Boolean), s = 0;
    for (var i = 0; i < terms.length; i++) {
      var w = terms[i];
      if (t.indexOf(w) === 0) s += 6; else if (t.indexOf(' ' + w) !== -1) s += 5; else if (t.indexOf(w) !== -1) s += 3;
      else if (norm(item.k).indexOf(w) !== -1) s += 2; else if (norm(item.d).indexOf(w) !== -1) s += 1; else return 0;
    }
    return s;
  }
  function search(index, q) {
    return index.map(function (it) { return [score(it, q), it]; }).filter(function (x) { return x[0] > 0; })
      .sort(function (a, b) { return b[0] - a[0] || a[1].t.localeCompare(b[1].t); }).map(function (x) { return x[1]; });
  }

  /* ---- mobile navigation ---- */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { header.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
    });
  }

  /* ---- combobox search (header) ---- */
  function bindCombobox(root) {
    var input = root.querySelector('input'), list = root.querySelector('.search-list');
    if (!input || !list) return;
    var active = -1, items = [];
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
    function setActive(i) {
      var opts = list.querySelectorAll('[role=option]');
      opts.forEach(function (o, k) { o.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      active = i;
      if (opts[i]) { input.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView({ block: 'nearest' }); }
    }
    function render(q) {
      if (!q.trim()) { close(); return; }
      loadIndex().then(function (index) {
        items = search(index, q).slice(0, 8);
        list.innerHTML = '';
        if (!items.length) {
          var li = document.createElement('li'); li.className = 'search-empty'; li.textContent = 'No calculator matches “' + q + '”.';
          list.appendChild(li);
        } else items.forEach(function (it, i) {
          var li = document.createElement('li'); li.id = input.id + '-opt-' + i; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false');
          var a = document.createElement('a'); a.href = it.u; a.tabIndex = -1;
          a.textContent = it.t; var sm = document.createElement('small'); sm.textContent = it.c; a.appendChild(sm);
          li.appendChild(a); list.appendChild(li);
        });
        list.hidden = false; input.setAttribute('aria-expanded', 'true'); active = -1;
      });
    }
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('focus', function () { loadIndex(); if (input.value) render(input.value); });
    input.addEventListener('keydown', function (e) {
      var n = list.querySelectorAll('[role=option]').length;
      if (e.key === 'ArrowDown' && n) { e.preventDefault(); setActive((active + 1) % n); }
      else if (e.key === 'ArrowUp' && n) { e.preventDefault(); setActive((active - 1 + n) % n); }
      else if (e.key === 'Enter') {
        if (active >= 0 && items[active]) { e.preventDefault(); location.href = items[active].u; }
        else if (items[0]) { e.preventDefault(); location.href = items[0].u; }
      } else if (e.key === 'Escape') { close(); }
    });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  }
  document.querySelectorAll('[data-combobox]').forEach(bindCombobox);

  // "/" focuses the search, unless typing in a field
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    var s = document.getElementById('home-search') || document.getElementById('hdr-search-input');
    if (s && s.offsetParent !== null) { e.preventDefault(); s.focus(); }
  });

  /* ---- home: live filter by text + category ---- */
  var homeInput = document.getElementById('home-search');
  var toolList = document.getElementById('tool-list');
  if (homeInput && toolList) {
    var chips = document.querySelectorAll('[data-cat-filter]');
    var status = document.getElementById('filter-status');
    var empty = document.getElementById('filter-empty');
    var rows = Array.prototype.slice.call(toolList.querySelectorAll('li'));
    var cat = 'all';
    function apply(pushState) {
      var q = homeInput.value.trim(), shown = 0;
      rows.forEach(function (li) {
        var it = { t: li.dataset.t, k: li.dataset.k, d: li.dataset.d };
        var okCat = cat === 'all' || li.dataset.cat === cat;
        var okQ = !q || score(it, q) > 0;
        li.hidden = !(okCat && okQ);
        if (!li.hidden) shown++;
      });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.catFilter === cat ? 'true' : 'false'); });
      status.textContent = shown + ' of ' + rows.length + ' calculators' + (q ? ' matching “' + q + '”' : '') + (cat !== 'all' ? ' in ' + document.querySelector('[data-cat-filter="' + cat + '"]').dataset.name : '');
      empty.hidden = shown !== 0;
      if (pushState) {
        try {
          var p = new URLSearchParams(); if (q) p.set('q', q); if (cat !== 'all') p.set('cat', cat);
          history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + '#calculators');
        } catch (e) { /* ignore */ }
      }
    }
    homeInput.addEventListener('input', function () { apply(true); });
    homeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('calculators').scrollIntoView({ behavior: 'smooth' }); }
    });
    chips.forEach(function (c) { c.addEventListener('click', function () { cat = c.dataset.catFilter; apply(true); }); });
    try {
      var p = new URLSearchParams(location.search);
      if (p.get('q')) homeInput.value = p.get('q').slice(0, 60);
      if (p.get('cat') && document.querySelector('[data-cat-filter="' + p.get('cat') + '"]')) cat = p.get('cat');
    } catch (e) { /* ignore */ }
    apply(false);
  }

  /* ---- static meters (CSP-safe: width set through CSSOM) ---- */
  document.querySelectorAll('.meter[data-pct] > span').forEach(function (s) {
    var v = Math.max(0, Math.min(100, Number(s.parentNode.dataset.pct) || 0)); s.style.width = v + '%';
  });
})();

/* Cloudflare Web Analytics (cookieless). Loaded only on the production host, so previews and local tests are not counted. */
(function () {
  if (location.hostname !== 'tools.saharienne.org') return;
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', '{"token": "430c6b9fea2c4da4a2ca0789a7167aa0"}');
  document.body.appendChild(s);
})();
