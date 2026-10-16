// 301 redirect from the legacy production host to the custom domain.
// - Only the exact production pages.dev host is redirected: preview hosts (<branch>.opscalc-tools.pages.dev)
//   and the custom domain pass through, so no redirect loop is possible.
// - Path and query string are preserved.
// - The Search Console verification file stays reachable on the old host (needed for Change of Address).
// - Project is configured "fail open": if the free daily Functions quota is exhausted, static assets are
//   still served (the site keeps working; only the redirect pauses until midnight UTC).
const LEGACY_HOST = 'opscalc-tools.pages.dev';
const TARGET_HOST = 'tools.saharienne.org';
const KEEP = new Set(['/google21e1d3b118076e1a.html', '/google21e1d3b118076e1a']);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === LEGACY_HOST && !KEEP.has(url.pathname)) {
    url.hostname = TARGET_HOST;
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
