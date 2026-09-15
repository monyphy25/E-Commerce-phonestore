"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Shield, ShoppingBag, LogOut, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/login/actions";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.email && !data.error) {
          setUser(data);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignOut = async () => {
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
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user ? user.name.charAt(0) : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user ? user.name : "Customer Account"}</h1>
              <p className="text-sm text-gray-400">{user ? user.email : "Manage your orders and settings"}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="text-blue-500" size={18} /> Profile Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-400">Full Name:</span>
                <span className="text-white font-medium">{user?.name || "Customer"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-medium">{user?.email || "customer@example.com"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-blue-400 font-semibold">{user?.role || "Customer"}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-emerald-500" size={18} /> Orders & Shopping
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Track your recent orders, review items, and manage shipping addresses.
              </p>
            </div>
            <Link
              href="/products"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Browse Store <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
