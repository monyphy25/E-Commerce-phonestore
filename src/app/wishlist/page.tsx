"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=500&q=80";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      productId: item.id,
      name: item.name,
      brand: item.brand,
      price: item.discountPrice ?? item.price,
      image: item.image || DEFAULT_IMAGE,
      quantity: 1,
      storage: item.storage,
      color: item.color,
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-14">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {items.length === 0
                  ? "No saved items yet"
                  : `${items.length} saved item${items.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors border border-slate-200 hover:border-red-200 px-3 py-2 rounded-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-9 h-9 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-slate-500 mb-6">
              Browse our catalog and click the ♥ heart icon to save items you love.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
              {items.map((item) => {
                const inStock = item.stock !== undefined ? item.stock > 0 : true;
                const image = item.image || DEFAULT_IMAGE;
                const added = addedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 transition-colors shadow-sm"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={13} className="text-red-500 fill-red-500" />
                    </button>

                    {/* Image */}
                    <Link href={`/products/${item.id}`} className="block bg-slate-50">
                      <div className="flex items-center justify-center p-5 h-[180px] sm:h-[220px]">
                        <img
                          src={image}
                          alt={item.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                          className="h-full w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="px-4 pt-3 pb-4 flex flex-col gap-1.5 flex-1">
                      <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">{item.brand}</span>
                      <Link href={`/products/${item.id}`}>
                        <p className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {item.name}
                        </p>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mt-1">
                        {item.discountPrice ? (
                          <>
                            <span className="text-base font-extrabold text-red-500">${item.discountPrice.toLocaleString()}</span>
                            <span className="text-sm text-slate-400 line-through">${item.price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-slate-900">${item.price.toLocaleString()}</span>
                        )}
                      </div>

                      {/* In Stock */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
                        <span className={`text-xs font-semibold ${inStock ? "text-green-600" : "text-red-500"}`}>
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!inStock}
                        className={`mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all ${
                          added
                            ? "bg-green-500 text-white"
                            : !inStock
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-700 active:scale-95"
                        }`}
                      >
                        <ShoppingCart size={13} />
                        {added ? "Added!" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold group"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
