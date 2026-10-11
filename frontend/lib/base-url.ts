/** The site's public origin, used for sitemap, robots and absolute metadata URLs. */
export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "https://repaircore.vercel.app").replace(/\/$/, "");
}
