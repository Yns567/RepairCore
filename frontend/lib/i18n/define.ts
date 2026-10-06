/**
 * Declares one group of messages with English as the source of truth.
 * TypeScript rejects the group if Arabic or French is missing a key.
 */
export function defineMessages<const T extends Record<string, string>>(
  en: T,
  translations: { ar: Record<keyof T, string>; fr: Record<keyof T, string> },
) {
  return { en, ...translations };
}

export type Params = Record<string, string | number>;

export function interpolate(template: string, params?: Params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
