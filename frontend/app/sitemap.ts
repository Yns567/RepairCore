import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";

// Regenerated at most once a day; Google re-crawls it periodically.
export const revalidate = 86400;

const STATIC_ROUTES = [
  "",
  "/store",
  "/price-list",
  "/services",
  "/software",
  "/learning",
  "/brands",
  "/contact",
  "/terms",
  "/refunds",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = baseUrl();

  const [products, services, courses] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.gsmService.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.course.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
  ]).catch(() => [[], [], []] as const);

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((p) => ({ url: `${url}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...services.map((s) => ({ url: `${url}/services/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...courses.map((c) => ({ url: `${url}/learning/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
