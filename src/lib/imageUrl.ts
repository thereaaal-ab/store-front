/**
 * Resolves product image URLs for display.
 * Backend often stores relative paths (e.g. /uploads/xxx.jpg) which only work
 * when requested from the backend. We prefix them with UPLOADS_BASE_URL so
 * the storefront can load them (e.g. from your backoffice API).
 */
const UPLOADS_BASE = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "")
  : (process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "");

export function getProductImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl?.trim()) return null;
  const url = imageUrl.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/") && UPLOADS_BASE) {
    const base = UPLOADS_BASE.replace(/\/$/, "");
    return `${base}${url}`;
  }
  if (url.startsWith("/")) return null;
  return url;
}
