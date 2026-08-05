/**
 * Catalog imagery is intentionally checked into `public/images`. Supabase is
 * used for orders only, so a non-local path falls back to the supplied local
 * image instead of producing a Storage URL.
 */
export function getCatalogImageUrl(path: string | null, fallback: string) {
  return path?.startsWith("/") ? path : fallback;
}
