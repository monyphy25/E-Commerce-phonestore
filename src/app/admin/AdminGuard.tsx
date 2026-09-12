"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, LogIn, ArrowLeft, ShieldCheck, Lock } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
  user: any;
  isAdmin: boolean;
}

export default function AdminGuard({ children, user, isAdmin }: AdminGuardProps) {
  const [authorized, setAuthorized] = useState(isAdmin);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check client cookies & local storage for role state
    if (isAdmin) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const checkRole = () => {
      // Check cookies
      const cookies = document.cookie;
      const hasAdminCookie = cookies.includes("demo_user_role=ADMIN");
      
      // Check demo user email
      const demoEmail = cookies.match(/demo_user_email=([^;]+)/)?.[1];
      const isEmailAdmin = demoEmail && decodeURIComponent(demoEmail).toLowerCase().includes("admin");

      if (hasAdminCookie || isEmailAdmin) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
      setChecking(false);
    };

    checkRole();
  }, [isAdmin]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-gray-400 text-sm animate-pulse flex items-center gap-2">
          <Lock size={18} className="text-amber-400" /> Verifying Admin Authorization...
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Admin Access Restricted</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Only administrator accounts can access the PhoneStore Admin Dashboard. Regular customer accounts are restricted.
            </p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-xs text-left space-y-2">
            <div className="font-semibold text-gray-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" /> Demo Admin Account:
            </div>
            <div className="text-gray-400 font-mono">
              Email: <span className="text-amber-300 font-bold">admin@phonestore.com</span>
            </div>
            <div className="text-gray-400 font-mono">
              Password: <span className="text-amber-300 font-bold">admin123</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login?admin=true"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <LogIn size={16} /> Sign In as Admin
            </Link>

            <Link
              href="/"
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
