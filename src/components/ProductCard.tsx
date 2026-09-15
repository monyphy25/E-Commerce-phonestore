"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useState } from "react";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount?: number;
  image?: string;
  image_url?: string;
  stock?: number;
  storage?: string;
  color?: string;
  display?: string;
  chip?: string;
  camera?: string;
  badge?: "SALE" | "NEW" | "HOT";
};

const DEFAULT_PHONE_IMAGE =
  "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=500&q=80";

/* Brand config: color + short label */
const BRAND_META: Record<string, { color: string; label: string }> = {
  apple:        { color: "text-slate-600",  label: "Apple"    },
  samsung:      { color: "text-blue-600",   label: "SAMSUNG"  },
  xiaomi:       { color: "text-orange-500", label: "Xiaomi"   },
  oneplus:      { color: "text-red-600",    label: "ONEPLUS"  },
  oppo:         { color: "text-green-600",  label: "OPPO"     },
  vivo:         { color: "text-blue-500",   label: "vivo"     },
  google:       { color: "text-blue-500",   label: "Google"   },

};

function getBrandMeta(brand: string) {
  const key = brand.toLowerCase();
  return BRAND_META[key] ?? { color: "text-slate-700", label: brand };
}

/* Badge pill */
const BADGE_MAP = {
  SALE: { text: "SALE", cls: "bg-red-500" },
  NEW:  { text: "NEW",  cls: "bg-green-500" },
  HOT:  { text: "HOT",  cls: "bg-orange-500" },
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [cartPop, setCartPop] = useState(false);

  const displayImage = product.image || product.image_url || DEFAULT_PHONE_IMAGE;
  const inStock      = product.stock !== undefined ? product.stock > 0 : true;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  // Resolve badge
  let badge: { text: string; cls: string } | null = null;
  if (product.badge && BADGE_MAP[product.badge]) {
    badge = BADGE_MAP[product.badge];
  } else if (discount && discount >= 5) {
    badge = { text: `−${discount}%`, cls: "bg-blue-500" };
  }

  const brandMeta = getBrandMeta(product.brand);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product.id,
      name:      product.name,
      brand:     product.brand,
      price:     product.discountPrice ?? product.price,
      image:     displayImage,
      quantity:  1,
      storage:   product.storage,
      color:     product.color,
    });
    setCartPop(true);
    setTimeout(() => setCartPop(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 relative group h-full">

      {/* ── Badge ── */}
      {badge && (
        <span className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 text-[9px] sm:text-[10px] font-extrabold text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full tracking-wide ${badge.cls}`}>
          {badge.text}
        </span>
      )}

      {/* ── Wishlist ── */}
      <button
        onClick={() => toggleItem({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          discountPrice: product.discountPrice,
          image: displayImage,
          stock: product.stock,
          storage: product.storage,
          color: product.color,
          rating: product.rating,
        })}
        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 hover:border-red-300 transition-colors shadow-xs"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={14}
          className={wishlisted ? "text-red-500" : "text-slate-400"}
          fill={wishlisted ? "currentColor" : "none"}
        />
      </button>

      {/* ── Product Image ── */}
      <Link href={`/products/${product.id}`} className="block bg-slate-50 relative shrink-0">
        <div className="flex items-center justify-center p-3 sm:p-5 h-[160px] xs:h-[180px] sm:h-[220px]">
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-500 border border-slate-300 bg-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          <img
            src={displayImage}
            alt={product.name}
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHONE_IMAGE; }}
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="p-3 sm:px-4 sm:pt-3 sm:pb-4 flex flex-col flex-1 justify-between gap-1.5 sm:gap-2">
        <div className="space-y-1">
          {/* Brand */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] sm:text-xs font-extrabold tracking-wider ${brandMeta.color}`}>
              {brandMeta.label}
            </span>
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="text-xs sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Storage & Color Options */}
          <div className="flex flex-wrap gap-1 mt-1 mb-1">
            {product.storage && (
              <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {product.storage.split(',')[0].trim()}
                {product.storage.split(',').length > 1 ? ` +${product.storage.split(',').length - 1}` : ""}
              </span>
            )}
            {product.color && (
              <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {product.color.split(',')[0].trim()}
                {product.color.split(',').length > 1 ? ` +${product.color.split(',').length - 1}` : ""}
              </span>
            )}
          </div>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {product.discountPrice ? (
              <>
                <span className="text-base sm:text-xl font-extrabold text-red-500">
                  ${product.discountPrice.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  ${product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-xl font-extrabold text-slate-900">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* In Stock indicator */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
            <span className={`text-[11px] sm:text-xs font-semibold ${inStock ? "text-green-600" : "text-red-500"}`}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Actions: View Details + Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 pt-1">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2.5 px-2 text-xs sm:text-sm font-bold text-slate-700 border border-slate-300 rounded-full hover:border-slate-500 hover:text-slate-900 transition-all text-center"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Details</span>
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              aria-label="Add to cart"
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all shrink-0 ${
                cartPop
                  ? "bg-green-500 scale-90"
                  : !inStock
                  ? "bg-slate-200 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-700 active:scale-90"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
