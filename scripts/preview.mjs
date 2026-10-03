/**
 * Local production preview server (no dependencies).
 *
 * `next build` exports the site into ./out with every URL prefixed by the
 * basePath (/control-alt-clean). This little server mimics how GitHub Pages
 * serves a project site: it mounts ./out under that basePath and redirects the
 * bare root ("/") to it — so `npm run serve` behaves just like production,
 * assets and all.
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/control-alt-clean';
const outDir = join(process.cwd(), 'out');
const port = Number(process.env.PORT ?? 3000);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

async function send(res, filePath) {
  const body = await readFile(filePath);
  res.writeHead(200, {
    'Content-Type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent((req.url ?? '/').split('?')[0]);

  // Bounce the bare root to the app's basePath.
  if (pathname === '/' || pathname === '') return redirect(res, `${basePath}/`);
  if (pathname === basePath) return redirect(res, `${basePath}/`);

  if (!pathname.startsWith(`${basePath}/`)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }

  const rel = pathname.slice(basePath.length); // leading "/..."
  let filePath = normalize(join(outDir, rel));

  // Guard against path traversal outside ./out.
  if (filePath !== outDir && !filePath.startsWith(outDir + sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    let info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath);
    }
    return await send(res, filePath);
  } catch {
    // Fall back to the exported 404 page if present.
    try {
      return await send(res, join(outDir, '404.html'));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
  }
});

stat(join(outDir, 'index.html'))
  .then(() => {
    server.listen(port, () => {
      console.log(`\n  🧼 Control Alt Clean preview running`);
      console.log(`  → http://localhost:${port}${basePath}/\n`);
    });
  })
  .catch(() => {
    console.error('No build found in ./out. Run `npm run build` first.');
    process.exit(1);
  });
