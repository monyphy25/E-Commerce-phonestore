"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Home, ShoppingBag, Flame, LogIn, UserPlus, Heart, LayoutDashboard, User, Mail, Info } from "lucide-react";

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export default function MobileMenu({ isLoggedIn, isAdmin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Prevent background scrolling when menu drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      {/* Hamburger button — visible on mobile/tablet only */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-72 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <span className="text-lg font-bold text-slate-900">
            Phone<span className="text-blue-600">Store</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search (mobile) */}
        <div className="p-4 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
            />
            <button type="submit" className="absolute left-3 top-3 text-slate-400">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Nav links (scrollable) */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Home className="h-4 w-4 text-slate-400" />
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Info className="h-4 w-4 text-slate-400" />
            About
          </Link>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <ShoppingBag className="h-4 w-4 text-slate-400" />
            All Products
          </Link>
          <Link
            href="/products?brand=Apple"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl transition-colors"
          >
            <Flame className="h-4 w-4 text-orange-500" />
            🔥 Apple Deals
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Heart className="h-4 w-4 text-slate-400" />
            Wishlist
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Mail className="h-4 w-4 text-slate-400" />
            Contact Us
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-amber-500" />
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Divider */}
        <div className="mx-5 my-2 border-t border-slate-100 shrink-0" />

        {/* Auth actions */}
        <div className="p-4 space-y-2 shrink-0">
          {isLoggedIn ? (
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all"
            >
              <User className="h-4 w-4 text-blue-600" />
              My Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all"
              >
                <LogIn className="h-4 w-4 text-blue-600" />
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

