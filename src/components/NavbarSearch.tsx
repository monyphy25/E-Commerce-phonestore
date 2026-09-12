"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavbarSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group ml-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search phones..."
        className="pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 w-48 transition-all placeholder-slate-400"
        aria-label="Search products"
      />
      <button type="submit" className="absolute left-0 top-0 h-full px-3 flex items-center" aria-label="Submit search">
        <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
      </button>
    </form>
  );
}
