"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Home, ShoppingBag, Flame, LogIn, UserPlus, Heart, LayoutDashboard, User, Mail, Info } from "lucide-react";

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export default function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible on mobile/tablet only */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
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
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search phones..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Nav links */}
        <nav className="px-3 space-y-1">
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
            href="/deals"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl transition-colors"
          >
            <Flame className="h-4 w-4 text-orange-500" />
            🔥 Deals
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
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-amber-500" />
            Admin Dashboard
          </Link>
        </nav>

        {/* Divider */}
        <div className="mx-5 my-4 border-t border-slate-100" />

        {/* Auth actions */}
        <div className="px-4 space-y-2">
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
