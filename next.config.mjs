/**
 * Next.js configuration for a static export hosted on GitHub Pages.
 *
 * - `output: 'export'` produces a fully static site in `out/` (no Node server),
 *   which is what GitHub Pages serves.
 * - `basePath` matches the repository name because this is a project site served
 *   from https://<username>.github.io/control-alt-clean/. You can override it with
 *   NEXT_PUBLIC_BASE_PATH (set it to an empty string for a user site / custom domain).
 * - `images.unoptimized` is required because the Next.js image optimizer needs a
 *   server, which GitHub Pages does not provide.
 * - `trailingSlash` makes routes resolve to /route/index.html, which GitHub Pages
 *   serves cleanly without custom rewrites.
 */

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '/control-alt-clean';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: 'export'` only matters for the production build we ship to Pages.
  // Leaving it off in dev lets us use a root redirect (below) without the
  // "redirects won't work with output: export" warning.
  ...(isProd ? { output: 'export' } : {}),
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Expose the basePath to client code so we can build correct URLs for static
  // assets in /public (e.g. <img src>), which Next does not auto-prefix.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Keep a stray lint rule from ever blocking the Pages deploy.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Dev-only: bounce the bare root ("/") to the basePath so `npm run dev` lands on
// the app instead of a 404. `redirects()` is not part of a static export, so we
// scope it to development to avoid the "redirects will not work with
// output: export" build warning. (For the production preview, `serve.json`
// handles the same redirect — see public/serve.json.)
if (!isProd && basePath) {
  nextConfig.redirects = async () => [
    {
      source: '/',
      destination: basePath,
      basePath: false,
      permanent: false,
    },
  ];
}

export default nextConfig;
