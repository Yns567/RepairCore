import "server-only";

import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, intlLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { interpolate, type Params } from "./define";
import { dictionaries, type MessageKey } from "./messages";

/** Locale from the cookie, else the browser's preferred language, else Arabic. */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  const dictionary = dictionaries[locale];
  const t = (key: MessageKey, params?: Params) => interpolate(dictionary[key], params);
  const formatDate = (date: Date) =>
    date.toLocaleString(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" });
  return { t, locale, formatDate };
}
