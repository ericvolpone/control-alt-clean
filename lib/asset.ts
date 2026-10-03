/**
 * Build a URL for a static asset in /public that respects the configured
 * basePath. Next.js prefixes routes and the special `app/icon.svg`, but it does
 * NOT prefix plain `<img src>` values, so we do it here.
 *
 * Example: assetPath('/mop.svg') -> '/control-alt-clean/mop.svg'
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function assetPath(path: string): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalised}`;
}
