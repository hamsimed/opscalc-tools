/*! OpsCalc Tools — site configuration.
 * Analytics stays fully disabled while ga4MeasurementId is empty.
 * To enable: create a GA4 property, paste its real ID (format G-XXXXXXXXXX),
 * update privacy-policy content, rebuild and test the consent banner. See 04_ANALYTICS docs.
 */
window.OPSCALC_CONFIG = {
  ga4MeasurementId: '',
  consentStorageKey: 'opscalc_consent_v1'
};
