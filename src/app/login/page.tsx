"use client";

import { login, logout } from "./actions";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound, UserCheck, AlertCircle, LogOut, User } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginFormContent() {
  const [activeTab, setActiveTab] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredNotice, setRegisteredNotice] = useState(false);

  // Active login state
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ email: string; role: string; name: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check initial login state on mount
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setRegisteredNotice(true);
    }
    if (searchParams.get("admin") === "true") {
      setActiveTab("admin");
      setEmail("admin@phonestore.com");
      setPassword("admin123");
    }

    // Check existing customer session
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.customers && data.customers.length > 0) {
          const firstCust = data.customers[0];
          setLoggedInUser({
            email: firstCust.email,
            role: firstCust.role || "CUSTOMER",
            name: firstCust.name || firstCust.email.split("@")[0],
          });
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const fillDemoAdmin = () => {
    setActiveTab("admin");
    setEmail("admin@phonestore.com");
    setPassword("admin123");
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      const userRole = result?.role || (email.toLowerCase().includes("admin") ? "ADMIN" : "CUSTOMER");
      const userName = email.split("@")[0];

      // Sync customer details to API
      try {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: userName, role: userRole }),
        });
      } catch (syncErr) {
        console.warn("Sync customer notice:", syncErr);
      }

      // Hide login form & set logged-in state
      setUserLoggedIn(true);
      setLoggedInUser({
        email,
        role: userRole,
        name: userName,
      });

      if (userRole === "ADMIN" || activeTab === "admin" || email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
        localStorage.removeItem("wishlist");
      }
      setUserLoggedIn(false);
      setLoggedInUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setSigningOut(false);
      router.refresh();
    }
  }

  // Render Logged-In State Card when customer is logged in
  if (userLoggedIn || loggedInUser) {
    const isUserAdmin = loggedInUser?.role?.toUpperCase() === "ADMIN" || loggedInUser?.email?.toLowerCase().includes("admin");
    return (
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">Signed In Successfully</h2>
          <p className="text-slate-500 text-sm">You are currently logged into PhoneStore</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {(loggedInUser?.name || loggedInUser?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 truncate">{loggedInUser?.name || "Customer Account"}</div>
              <div className="text-xs text-slate-500 truncate">{loggedInUser?.email}</div>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                isUserAdmin ? "text-amber-700 bg-amber-50 border-amber-200" : "text-blue-700 bg-blue-50 border-blue-200"
              }`}
            >
              {isUserAdmin ? "Admin" : "Customer"}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {isUserAdmin ? (
            <Link
              href="/admin"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-amber-600/20"
            >
              <ShieldCheck size={16} /> Go to Admin Dashboard
            </Link>
          ) : (
            <Link
              href="/account"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-600/20"
            >
              <User size={16} /> Go to My Account
            </Link>
          )}

          <Link
            href="/products"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            Continue Shopping <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-slate-500 hover:text-red-600 font-medium text-xs py-2 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} /> {signingOut ? "Signing out..." : "Sign out or switch account"}
          </button>
        </div>
      </div>
    );
  }

  // Render Login Form when not logged in
  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
          <KeyRound size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
        <p className="text-slate-500 text-sm">Sign in to manage orders or access store</p>
      </div>

      {/* Login Mode Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setActiveTab("customer"); setError(null); }}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "customer"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck size={14} /> Customer Login
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("admin"); setError(null); }}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "admin"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck size={14} /> Admin Access
        </button>
      </div>

      {/* Demo Admin Auto Fill Box */}
      {activeTab === "admin" && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900 flex items-center gap-1">
              <ShieldCheck size={13} className="text-amber-600" /> Demo Admin Credentials:
            </span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg font-bold transition-all shadow-sm"
            >
              Fill Credentials
            </button>
          </div>
          <div className="text-amber-800 font-mono text-[11px]">
            Email: <span className="font-bold">admin@phonestore.com</span> | Pass: <span className="font-bold">admin123</span>
          </div>
        </div>
      )}

      {/* Registration Success Banner */}
      {registeredNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Account created successfully!</p>
            <p className="text-xs text-emerald-600">Please enter your credentials to sign in.</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {activeTab === "admin" ? "Admin Email Address" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
              placeholder={activeTab === "admin" ? "admin@phonestore.com" : "you@email.com"}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-11 pr-11 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2 shadow-md disabled:opacity-50 ${
            activeTab === "admin"
              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
          }`}
        >
          {loading ? "Verifying Credentials..." : activeTab === "admin" ? "Sign In as Admin" : "Sign In to Store"} <ArrowRight size={16} />
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 pt-2">
        Don't have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold">
          Register Customer Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 min-h-[calc(100vh-200px)]">
      <Suspense fallback={<div className="text-slate-500 text-center">Loading Login Page...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
