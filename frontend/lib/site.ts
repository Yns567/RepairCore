// Business identity shown on contact and legal pages. Change it here only.
export const SITE = {
  name: "RepairCore",
  city: "Casablanca",
  country: "Morocco",
  supportEmail: "nessyou468@gmail.com",
  phone: "0638116689",
  /** International format for WhatsApp links (Morocco +212, leading 0 removed). */
  whatsapp: "212638116689",
  legalUpdated: "2026-10-06",
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
