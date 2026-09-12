"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? cart.getTotalItems() : 0;

  return (
    <Link
      href="/cart"
      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
    >
      <ShoppingCart className="h-4.5 w-4.5 h-[18px] w-[18px]" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
