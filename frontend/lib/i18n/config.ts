export const LOCALES = ["ar", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "locale";

export const LOCALE_NAMES: Record<Locale, string> = { ar: "العربية", fr: "Français", en: "English" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function directionOf(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** BCP 47 tag for dates and numbers. Arabic uses Latin digits, as is usual in Morocco. */
export function intlLocale(locale: Locale) {
  return locale === "ar" ? "ar-MA-u-nu-latn" : locale === "fr" ? "fr-MA" : "en-US";
}
