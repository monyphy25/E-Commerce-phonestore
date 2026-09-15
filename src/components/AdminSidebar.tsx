"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart2,
  Settings, Tag, Star, LogOut, ChevronRight, Loader2, Menu, X, ArrowLeft
} from "lucide-react";
import { logout } from "@/app/login/actions";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: BarChart2 },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent background scrolling when admin mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <>
      {/* ── Mobile Top Header (Mobile & Tablet < lg) ── */}
      <div className="lg:hidden w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle admin navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            Phone<span className="text-blue-600">Store</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
              Admin
            </span>
          </Link>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Storefront
        </Link>
      </div>

      {/* ── Mobile Drawer Backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Slide-over Navigation Drawer ── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Phone<span className="text-blue-600">Store</span>
            <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Customer View
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
          >
            {signingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
            {signingOut ? 'Signing out...' : 'Sign Out Admin'}
          </button>
        </div>
      </aside>

      {/* ── Desktop Sidebar (Visible on lg: screens) ── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-white border-r border-slate-200 flex-col shadow-xs shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Phone<span className="text-blue-600">Store</span>
            <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Admin
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  size={17}
                  className={active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}
                />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            Back to Storefront
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {signingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
}

