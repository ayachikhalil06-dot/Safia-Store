"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    startTransition(() => {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-500"
      />

      <input
        type="search"
        placeholder="Rechercher un produit..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="
          w-full
          rounded-full
          border
          border-pink-100
          bg-pink-50
          py-3
          pl-12
          pr-12
          text-sm
          text-gray-700
          shadow-sm
          transition-all
          duration-300
          placeholder:text-gray-400
          focus:border-pink-400
          focus:bg-white
          focus:outline-none
          focus:ring-4
          focus:ring-pink-100
        "
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-pink-500"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {isPending && (
        <div className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      )}
    </form>
  );
}