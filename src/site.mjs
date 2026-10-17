// Site-wide settings used by the build. Edit here, then run `npm run build`.
export const site = {
  name: 'OpsCalc Tools',
  origin: 'https://tools.saharienne.org', // custom domain (Cloudflare Pages); pages.dev 301-redirects here
  tagline: 'Free calculators for operations, maintenance, energy and inventory',
  // OWNER ACTION: set a monitored address before applying to AdSense. Left empty = not published.
  contactEmail: 'contact@saharienne.org',
  lastReviewed: '2026-10-17',
  // Date of the last real revision of calculator page content (shown on each page and in dateModified).
  // 2026-10-17 = V4: "Common mistakes" and "Where it's used" added to all 35 pages, 8 new pages written.
  // Change it only when page content is actually revised; a page can override it with its own `reviewed` field.
  contentReviewed: '2026-10-17',
  year: 2026
};
