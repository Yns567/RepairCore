import type { Locale } from "../config";
import { account } from "./account";
import { auth } from "./auth";
import { catalog } from "./catalog";
import { home } from "./home";
import { layout } from "./layout";
import { store } from "./store";
import { ui } from "./ui";

const groups = [layout, home, store, auth, account, catalog, ui] as const;

type Group = (typeof groups)[number];
type KeysOf<G> = G extends { en: infer E } ? keyof E : never;
export type MessageKey = KeysOf<Group> & string;
export type Messages = Record<MessageKey, string>;

function merge(locale: Locale): Messages {
  return Object.assign({}, ...groups.map((group) => group[locale])) as Messages;
}

export const dictionaries: Record<Locale, Messages> = { ar: merge("ar"), fr: merge("fr"), en: merge("en") };
