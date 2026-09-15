"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight, MoveRight, Loader2, Truck, Headphones, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { AppleIcon, SamsungIcon, VivoIcon, OppoIcon, GoogleIcon } from "@/components/BrandLogos";
import BannerCarousel from "@/components/BannerCarousel";

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

const DEFAULT_FEATURED: Product[] = [
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1399,
    discountPrice: 1299,
    rating: 4.8,
    review_count: 128,
    stock: 20,
    storage: "256GB",
    display: "6.7\" Super Retina XDR",
    chip: "A17 Pro Chip",
    camera: "48MP Main Camera",
    badge: "SALE",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1199,
    rating: 4.7,
    review_count: 96,
    stock: 15,
    storage: "256GB",
    display: "6.8\" Dynamic AMOLED 2X",
    chip: "Snapdragon 8 Gen 3",
    camera: "200MP Main Camera",
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "pixel-9-pro",
    name: "Pixel 9 Pro",
    brand: "Google",
    price: 899,
    rating: 4.6,
    review_count: 78,
    stock: 10,
    storage: "128GB",
    display: "6.3\" OLED Display",
    chip: "Google Tensor G4",
    camera: "50MP Main Camera",
    badge: "HOT",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "nothing-phone-2a",
    name: "Nothing Phone (2a)",
    brand: "Nothing",
    price: 799,
    discountPrice: 719,
    rating: 4.5,
    review_count: 64,
    stock: 8,
    storage: "256GB",
    display: "6.7\" AMOLED Display",
    chip: "Dimensity 7200 Pro",
    camera: "50MP Main Camera",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=500&q=80",
  },
];

const BRANDS = [
  { label: "All",          slug: "all",          icon: Sparkles },
  { label: "Apple",        slug: "Apple",        icon: AppleIcon },
  { label: "Samsung",      slug: "Samsung",      icon: SamsungIcon },
  { label: "Vivo",         slug: "Vivo",         icon: VivoIcon },
  { label: "Oppo",         slug: "Oppo",         icon: OppoIcon },
  { label: "Google Pixel", slug: "Google",       icon: GoogleIcon },
  { label: "Accessories",  slug: "Accessories",  icon: Headphones },
];



const TRUST_BADGES = [
  { icon: ShieldCheck, title: "100% Authentic",  desc: "Official products",       color: "text-blue-500" },
  { icon: RefreshCw,   title: "7 Days Return",   desc: "Easy return & refund",    color: "text-green-500" },
  { icon: Truck,       title: "Free Shipping",   desc: "On orders over $50",      color: "text-purple-500" },
  { icon: Headphones,  title: "24/7 Support",    desc: "We're here to help",      color: "text-orange-500" },
];

export default function Home() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeBrand, setActiveBrand] = useState("all");

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(DEFAULT_FEATURED);
        }
      })
      .catch(() => setProducts(DEFAULT_FEATURED))
      .finally(() => setLoading(false));
  }, []);

  const ACCESSORY_BRANDS = ["accessories"];

  const sortProductsPhoneFirst = (list: Product[]) =>
    [...list]
      .sort((a: any, b: any) => {
        // Oldest first (first-added at top)
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
      })
      .sort((a, b) => {
        // Accessories always sink to the bottom
        const aIsAccessory = ACCESSORY_BRANDS.includes((a.brand || "").toLowerCase());
        const bIsAccessory = ACCESSORY_BRANDS.includes((b.brand || "").toLowerCase());
        if (aIsAccessory && !bIsAccessory) return 1;
        if (!aIsAccessory && bIsAccessory) return -1;
        return 0;
      });

  const filtered = sortProductsPhoneFirst(
    activeBrand === "all"
      ? products
      : products.filter(
          (p) => (p.brand || "").toLowerCase() === activeBrand.toLowerCase()
        )
  );

  return (
    <div className="flex flex-col items-center bg-white">

      {/* ─── Hero Banner Carousel (Clean 4-Banner Slider) ─── */}
      <BannerCarousel />


      {/* ─── Featured Products ─────────────────────────────── */}
      <section className="w-full bg-white py-10">        
        <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Devices</h2>
          </div>
          <Link href="/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 group">
            See All <MoveRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Shop by Brand pills ── */}
        <div className="flex items-center justify-between gap-2.5 overflow-x-auto sm:flex-wrap pb-2 mb-8 no-scrollbar scroll-smooth">
          {BRANDS.map((brand) => {
            const active = activeBrand === brand.slug;
            const Icon = brand.icon;
            return (
              <button
                key={brand.slug}
                onClick={() => setActiveBrand(brand.slug)}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm sm:text-base font-semibold rounded-full border transition-all duration-200 whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{brand.label}</span>
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 size={28} className="animate-spin mx-auto mb-3 text-blue-500" />
            <p className="text-sm">Loading devices...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {filtered.slice(0, 25).map((p) => {
              const formattedProduct = {
                id: String(p.id),
                name: p.name,
                brand: p.brand || "Smartphones",
                price: p.price,
                discountPrice: p.discount_price || p.discountPrice,
                rating: p.rating || 4.5,
                reviewCount: p.review_count,
                image: p.image_url || p.image,
                stock: typeof p.stock === "number" ? p.stock : 10,
                storage: p.storage,
                color: p.color,
                display: p.display,
                chip: p.chip,
                camera: p.camera,
                badge: p.badge,
              };
              return <ProductCard key={p.id} product={formattedProduct} />;
            })}
          </div>

        ) : (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">No products found for this brand.</p>
            <button onClick={() => setActiveBrand("all")} className="mt-3 text-xs text-blue-600 hover:underline">
              Show all products
            </button>
          </div>
        )}

        {/* ── Trust badges row ── */}
        <div className="mt-10 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TRUST_BADGES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xs">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">{title}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
