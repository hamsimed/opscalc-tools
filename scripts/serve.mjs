#!/usr/bin/env node
// Minimal local static server that mimics Cloudflare Pages URL handling:
// /path -> /path.html, /dir/ -> /dir/index.html, unknown -> 404.html with status 404.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function exists(f) { try { return (await stat(f)).isFile(); } catch { return false; } }

export async function resolve(pathname) {
  const p = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(ROOT, p);
  if (p.includes('..')) return null;
  for (const cand of [base, base + '.html', join(base, 'index.html')]) if (await exists(cand)) return cand;
  return null;
}

export function start(port = 8080) {
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    const file = await resolve(pathname);
    if (!file) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      return res.end(await readFile(join(ROOT, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8080;
  start(port).then(() => console.log(`Serving on http://localhost:${port}`));
}
