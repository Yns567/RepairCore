import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[#070D18]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[100px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Ready to stock your bench?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Create a free account to track orders, manage software licenses,
          and pick up where you left off in your courses.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-500"
          >
            Create Free Account
          </Link>
          <Link
            href="/store"
            className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
          >
            Browse the Store
          </Link>
        </div>
      </div>
    </section>
  );
}
