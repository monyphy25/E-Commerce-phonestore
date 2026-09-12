"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistBadge() {
  const { items } = useWishlist();
  const count = items.length;

  return (
    <Link
      href="/wishlist"
      className="relative p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors hidden sm:block"
      aria-label={`Wishlist (${count} items)`}
    >
      <Heart className={`h-4 w-4 ${count > 0 ? "text-red-500 fill-red-500" : ""}`} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
