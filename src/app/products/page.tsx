"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, Loader2, X, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  discount_price?: number;
  discountPrice?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  image?: string;
  stock?: number;
  storage?: string;
  color?: string;
  display?: string;
  chip?: string;
  camera?: string;
  badge?: "SALE" | "NEW" | "HOT";
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", brand: "Apple", price: 1099, discountPrice: 999, rating: 4.9, stock: 20, storage: "256GB", color: "Titanium", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80" },
  { id: "iphone-14", name: "iPhone 14", brand: "Apple", price: 799, rating: 4.7, stock: 30, storage: "128GB", color: "Midnight", image: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=400&q=80" },
  { id: "iphone-13", name: "iPhone 13", brand: "Apple", price: 699, discountPrice: 599, rating: 4.6, stock: 25, storage: "128GB", color: "Pink", image: "https://images.unsplash.com/photo-1632633173522-47456de71b76?auto=format&fit=crop&w=400&q=80" },
  { id: "galaxy-s24-ultra", name: "Galaxy S24 Ultra", brand: "Samsung", price: 1299, rating: 4.8, stock: 15, storage: "512GB", color: "Phantom Black", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80" },
  { id: "galaxy-a54", name: "Galaxy A54", brand: "Samsung", price: 449, rating: 4.5, stock: 40, storage: "128GB", color: "Awesome Graphite", image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80" },
  { id: "pixel-9-pro", name: "Pixel 9 Pro", brand: "Google", price: 999, discountPrice: 899, rating: 4.7, stock: 10, storage: "128GB", color: "Obsidian", image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80" },
];

const BRANDS = ["All", "Apple", "Samsung", "Vivo", "Oppo", "Google", "Accessories"];

/* Brand accent gradients for section headings */
const BRAND_ACCENT: Record<string, string> = {
  apple:       "from-slate-800 to-slate-500",
  samsung:     "from-blue-700 to-blue-400",
  vivo:        "from-sky-600 to-sky-400",
  oppo:        "from-emerald-600 to-emerald-400",
  google:      "from-indigo-600 to-indigo-400",
  accessories: "from-amber-600 to-amber-400",
};
function getBrandAccent(brand: string) {
  return BRAND_ACCENT[brand.toLowerCase()] ?? "from-slate-700 to-slate-500";
}

type FormattedProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount?: number;
  image: string;
  stock: number;
  storage?: string;
  color?: string;
  display?: string;
  chip?: string;
  camera?: string;
  badge?: "SALE" | "NEW" | "HOT";
};

function formatProduct(p: Product): FormattedProduct {
  return {
    id: String(p.id),
    name: p.name,
    brand: p.brand || "",
    price: p.price,
    discountPrice: p.discount_price || p.discountPrice,
    rating: p.rating || 4.5,
    reviewCount: p.review_count,
    image: p.image_url || p.image || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
    stock: typeof p.stock === "number" ? p.stock : 10,
    storage: p.storage,
    color: p.color,
    display: p.display,
    chip: p.chip,
    camera: p.camera,
    badge: p.badge,
  };
}

/* Horizontal scroll row with nav arrows */
function BrandRow({ brand, products }: { brand: string; products: FormattedProduct[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };
  const accent = getBrandAccent(brand);
  return (
    <section className="mb-14">
      {/* Brand header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${accent}`} />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{brand}</h2>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {products.length} {products.length === 1 ? "model" : "models"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {/* Scrollable row — hide native scrollbar */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <div key={p.id} className="flex-none w-[220px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      {/* Thin separator */}
      <div className={`mt-6 h-px bg-gradient-to-r ${accent} opacity-20`} />
    </section>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync search query from URL param on mount
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      })
      .catch(() => setProducts(FALLBACK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesBrand =
      selectedBrand === "All" ||
      (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    return matchesBrand && matchesSearch;
  });

  const clearSearch = () => {
    setSearchQuery("");
    router.replace("/products");
  };

  /* Group filtered products by brand */
  const brandGroups: { brand: string; items: FormattedProduct[] }[] = [];
  const seen = new Map<string, FormattedProduct[]>();
  for (const p of filteredProducts) {
    const brandKey = p.brand || "Other";
    if (!seen.has(brandKey)) {
      seen.set(brandKey, []);
      brandGroups.push({ brand: brandKey, items: seen.get(brandKey)! });
    }
    seen.get(brandKey)!.push(formatProduct(p));
  }


  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* ── Sidebar Filters (Horizontal pills on mobile/tablet, vertical sidebar on desktop) ── */}
        <aside className="w-full md:w-52 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs md:sticky md:top-24">
            <h2 className="text-xs md:text-sm font-bold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-blue-600" /> Filters
            </h2>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Brand</h3>
              <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`whitespace-nowrap md:w-full text-left px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
                      selectedBrand === brand
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 bg-slate-50 md:bg-transparent hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Page heading */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">The Latest Brands Are Here</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Browse the newest phones by brand — scroll to explore more</p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl mb-6 md:mb-8">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> products
                {selectedBrand !== "All" && (
                  <span className="ml-1">in <span className="text-blue-600 font-semibold">{selectedBrand}</span></span>
                )}
                {searchQuery && (
                  <span className="ml-1">for <span className="text-blue-600 font-semibold">&quot;{searchQuery}&quot;</span></span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Inline search bar */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full sm:w-52 pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {selectedBrand !== "All" && (
                <button
                  onClick={() => setSelectedBrand("All")}
                  className="text-xs text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-500" />
              <p className="text-sm">Loading catalog from Supabase...</p>
            </div>
          ) : brandGroups.length > 0 ? (
            <div>
              {brandGroups.map(({ brand, items }) => (
                <BrandRow key={brand} brand={brand} products={items} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                {searchQuery ? `No products found for "${searchQuery}"` : "No products found matching the selected filter."}
              </p>
              <button
                onClick={() => { setSelectedBrand("All"); clearSearch(); }}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Show all products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
