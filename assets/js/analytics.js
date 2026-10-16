/*! OpsCalc Tools — consent-gated GA4 loader.
 * - Does nothing unless OPSCALC_CONFIG.ga4MeasurementId is set.
 * - Google Consent Mode v2: all storage denied by default; GA loads in cookieless mode
 *   and switches to full measurement only after the visitor accepts.
 * - Never sends calculator input values or results: only calculator id and event type.
 */
(function () {
  'use strict';
  var cfg = window.OPSCALC_CONFIG || {};
  var gaId = cfg.ga4MeasurementId;
  if (!gaId || !/^G-[A-Z0-9]{4,}$/.test(gaId)) return;

  var KEY = cfg.consentStorageKey || 'opscalc_consent_v1';
  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', wait_for_update: 500
  });
  var choice = getChoice();
  if (choice === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', gaId, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });

  document.addEventListener('opscalc:calculate', function (e) {
    gtag('event', 'calculator_calculate', { calculator_id: e.detail.calculator, trigger: e.detail.source });
  });
  document.addEventListener('opscalc:error', function (e) {
    gtag('event', 'calculator_validation_error', { calculator_id: e.detail.calculator, field_name: e.detail.field });
  });

  function banner() {
    if (getChoice()) return;
    var b = document.createElement('div');
    b.className = 'consent';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML = '<p>We use optional analytics cookies to understand which calculators are useful. Calculator inputs are never collected. <a href="/privacy-policy">Privacy policy</a></p>' +
      '<div><button type="button" class="button" data-c="granted">Accept analytics</button> <button type="button" class="button button-secondary" data-c="denied">Decline</button></div>';
    b.addEventListener('click', function (e) {
      var c = e.target.getAttribute('data-c');
      if (!c) return;
      setChoice(c);
      gtag('consent', 'update', { analytics_storage: c });
      b.remove();
    });
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner); else banner();

  // Allow visitors to reopen the choice from the privacy page.
  window.OpsCalcResetConsent = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
})();
