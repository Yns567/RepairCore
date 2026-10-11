import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/base-url";

export default function robots(): MetadataRoute.Robots {
  const url = baseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private and transactional pages out of search results.
      disallow: ["/admin", "/account", "/checkout", "/cart", "/api", "/login", "/register", "/forgot-password", "/reset-password"],
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
