"use client";

import { createContext, useCallback, useContext } from "react";
import type { Locale } from "./config";
import { interpolate, type Params } from "./define";
import type { MessageKey, Messages } from "./messages";

const I18nContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

export function useT() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useT must be used inside I18nProvider.");
  const { messages, locale } = context;
  const t = useCallback((key: MessageKey, params?: Params) => interpolate(messages[key], params), [messages]);
  return { t, locale };
}
