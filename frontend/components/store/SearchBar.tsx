"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (search.trim()) {
      router.push(`/store?search=${encodeURIComponent(search)}`);
    } else {
      router.push("/store");
    }
  }

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none focus:border-blue-500"
      />
    </form>
  );
}