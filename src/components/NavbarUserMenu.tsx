"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, LayoutDashboard, Loader2 } from "lucide-react";
import { logout } from "@/app/login/actions";

interface NavbarUserMenuProps {
  displayName: string;
  isAdmin: boolean;
}

export default function NavbarUserMenu({ displayName, isAdmin }: NavbarUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
        localStorage.removeItem("wishlist");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSigningOut(false);
      setOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="relative hidden sm:block" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-full hover:bg-slate-200 transition-all"
      >
        {/* Avatar circle */}
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white ${isAdmin ? "bg-amber-500" : "bg-blue-600"}`}>
          {initials}
        </span>
        <span className="hidden sm:inline max-w-[80px] truncate">{displayName || "Account"}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">{displayName || "Account"}</p>
            <p className={`text-[10px] font-semibold mt-0.5 ${isAdmin ? "text-amber-600" : "text-blue-600"}`}>
              {isAdmin ? "🛡 Admin" : "👤 Customer"}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <User size={14} className="text-blue-500" />
              My Account
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
              >
                <LayoutDashboard size={14} className="text-amber-500" />
                Admin Dashboard
              </Link>
            )}

            <div className="mx-3 my-1 border-t border-slate-100" />

            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
