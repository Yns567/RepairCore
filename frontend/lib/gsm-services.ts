export const gsmServiceCategories = [
  {
    value: "IMEI",
    label: "IMEI / SN Services",
    shortLabel: "IMEI Services",
    description: "Device information, blacklist and eligibility checks for devices you own or are authorized to service.",
  },
  {
    value: "SERVER_CREDIT",
    label: "Server / Tool Credits",
    shortLabel: "Credits",
    description: "Credit packs delivered manually to supported existing tool accounts.",
  },
  {
    value: "TOOL_RENTAL",
    label: "Tool Rental",
    shortLabel: "Tool Rent",
    description: "Short-term access requests for professional repair tools.",
  },
] as const;

export type GsmServiceCategory = (typeof gsmServiceCategories)[number]["value"];

/** Translation keys for the customer-facing category names. */
export const gsmCategoryKeys = {
  IMEI: "nav.imeiServices",
  SERVER_CREDIT: "nav.toolCredits",
  TOOL_RENTAL: "nav.toolRent",
} as const;

export function gsmCategoryKey(category: string): string {
  return gsmCategoryKeys[category as GsmServiceCategory] ?? category;
}

export function getGsmServiceCategory(category: string) {
  return gsmServiceCategories.find((item) => item.value === category);
}

export function isGsmServiceCategory(value: string | undefined): value is GsmServiceCategory {
  return gsmServiceCategories.some((category) => category.value === value);
}
