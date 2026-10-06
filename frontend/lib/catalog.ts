import type { MessageKey } from "@/lib/i18n/messages";

export const catalogCategories = [
  { slug: "programmers", label: "Programmers", key: "nav.programmers" },
  { slug: "boxes", label: "Boxes & Dongles", key: "nav.boxesDongles" },
  { slug: "tools", label: "Repair Tools", key: "nav.repairTools" },
  { slug: "spare-parts", label: "Spare Parts", key: "nav.spareParts" },
  { slug: "accessories", label: "Accessories", key: "nav.accessories" },
] as const satisfies readonly { slug: string; label: string; key: MessageKey }[];

/** Translated category label; unknown categories fall back to their raw value. */
export function translateCategory(category: string | null | undefined, t: (key: MessageKey) => string) {
  const known = catalogCategories.find((item) => item.slug === category);
  return known ? t(known.key) : category ?? t("store.product");
}

export const hardwareCategorySlugs = catalogCategories.map(
  (category) => category.slug,
);

export function getCatalogCategoryLabel(category: string | null | undefined) {
  return (
    catalogCategories.find((item) => item.slug === category)?.label ??
    category ??
    "Product"
  );
}

export function isCatalogCategory(category: string | undefined) {
  return catalogCategories.some((item) => item.slug === category);
}
