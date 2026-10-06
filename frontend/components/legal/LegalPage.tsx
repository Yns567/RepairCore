import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { LEGAL, type LegalSlug } from "@/lib/legal-content";
import { SITE } from "@/lib/site";

const CITY = { ar: "الدار البيضاء", fr: "Casablanca", en: "Casablanca" } as const;

async function resolve(slug: LegalSlug) {
  const locale = await getLocale();
  const doc = LEGAL[slug][locale];
  const fill = (text: string) =>
    text
      .replaceAll("{email}", SITE.supportEmail)
      .replaceAll("{phone}", SITE.phone)
      .replaceAll("{city}", CITY[locale])
      .replaceAll("{updated}", SITE.legalUpdated);
  return { doc, fill };
}

export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const { doc } = await resolve(slug);
  return { title: doc.title };
}

export default async function LegalPage({ slug }: { slug: LegalSlug }) {
  const { doc, fill } = await resolve(slug);

  return (
    <main className="min-h-screen bg-[#070d18] px-4 sm:px-6 py-6 md:py-12">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{doc.title}</h1>
        <p className="mt-4 leading-7 text-slate-400">{fill(doc.intro)}</p>
        {doc.sections.map((section) => (
          <section key={section.h} className="mt-9">
            <h2 className="text-lg font-bold text-white">{section.h}</h2>
            {section.p.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-7 text-slate-300">{fill(paragraph)}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
