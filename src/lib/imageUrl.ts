/**
 * Resolves product/image URLs for display.
 * Backend stores relative paths (e.g. /uploads/xxx.jpg, /objects/xxx) which
 * only work when requested from the backend. We prefix them with the backoffice
 * base URL so the storefront can load them (backend URL + path).
 * Local paths (e.g. /category-homme.jpg) are left as-is so Next.js serves them.
 *
 * Prioritized for Railway production:
 * - NEXT_PUBLIC_UPLOADS_BASE_URL overrides when set (e.g. in Railway env).
 * - Fallback to production backoffice so deployed store-front works without env.
 */
const PRODUCTION_BACKOFFICE_URL = "https://backoffice-production-d5cd.up.railway.app";

const UPLOADS_BASE =
  (typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "")
    : (process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "")) ||
  PRODUCTION_BACKOFFICE_URL;

/** Paths that are served by the backoffice (need base URL when used from store-front). */
const BACKEND_IMAGE_PATH_PREFIXES = ["/uploads/", "/objects/"] as const;

function isBackendImagePath(url: string): boolean {
  return BACKEND_IMAGE_PATH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export function getProductImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl?.trim()) return null;
  const url = imageUrl.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/") && isBackendImagePath(url)) {
    if (!UPLOADS_BASE) return null;
    const base = UPLOADS_BASE.replace(/\/$/, "");
    return `${base}${url}`;
  }
  if (url.startsWith("/")) return url;
  return url;
}

/** Use with next/image: pass unoptimized when true so external backoffice images load without optimizer (avoids "isn't a valid image" when backend returns 404 or non-image). */
export function isExternalImageUrl(src: string | null | undefined): boolean {
  return Boolean(src?.startsWith("http://") || src?.startsWith("https://"));
}
