import Link from 'next/link';
import { Heart, LogIn, UserPlus, LayoutDashboard, User } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import CartBadge from './CartBadge';
import MobileMenu from './MobileMenu';
import NavbarSearch from './NavbarSearch';
import WishlistBadge from './WishlistBadge';
import NavbarUserMenu from './NavbarUserMenu';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Read role from httpOnly cookie set on login
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('demo_user_role')?.value || '';
  const cookieEmail = cookieStore.get('demo_user_email')?.value || '';

  // Determine if admin: Supabase user_metadata OR cookie fallback
  const isAdmin = cookieRole.toUpperCase() === 'ADMIN';
  const isLoggedIn = !!user || !!cookieEmail;

  // Display name: prefer Supabase metadata, fall back to cookie email prefix
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    cookieEmail?.split('@')[0] ||
    '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="w-full flex h-16 items-center px-4 sm:px-6 lg:px-8 py-3 gap-4">

        {/* ── Logo (far left) ── */}
        <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-0.5 shrink-0 mr-auto lg:mr-0">
          Phone<span className="text-blue-600">Store</span>
        </Link>

        {/* ── Center / Right area: Nav + Search (desktop) ── */}
        <div className="hidden lg:flex items-center gap-1 ml-auto">
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Home</Link>
            <Link href="/about" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">About</Link>
            <Link href="/products" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Products</Link>
            <Link href="/contact" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Contact Us</Link>
          </nav>

          {/* Search */}
          <NavbarSearch />
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          <WishlistBadge />
          <CartBadge />

          {/* Admin button — only visible to admin role */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-all"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Auth area */}
          {isLoggedIn ? (
            /* Client component handles Account dropdown + Logout */
            <NavbarUserMenu displayName={displayName} isAdmin={isAdmin} />
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-full hover:bg-slate-200 transition-all"
              >
                <LogIn className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
