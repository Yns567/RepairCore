"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ path = "/store" }: { path?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (search.trim()) {
      router.push(`${path}?search=${encodeURIComponent(search)}`);
    } else {
      router.push(path);
    }
  }

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-[#111827] px-5 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
      />
    </form>
  );
}
