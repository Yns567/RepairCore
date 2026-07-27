export const catalogCategories = [
  { slug: "programmers", label: "Programmers" },
  { slug: "boxes", label: "Boxes & Dongles" },
  { slug: "tools", label: "Repair Tools" },
  { slug: "spare-parts", label: "Spare Parts" },
  { slug: "accessories", label: "Accessories" },
] as const;

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
