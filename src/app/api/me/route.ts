import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me
 * Returns the currently logged-in user's info from Supabase session + cookie fallback.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieRole  = cookieStore.get('demo_user_role')?.value  || null;
    const cookieEmail = cookieStore.get('demo_user_email')?.value || null;

    // 1. Try Supabase session first
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Try to get extra profile from public.users table
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || cookieRole || 'CUSTOMER';
      return NextResponse.json({
        id:    user.id,
        email: user.email,
        name:  profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role:  role.toUpperCase(),
      });
    }

    // 2. Cookie-only fallback (demo/offline admin mode)
    if (cookieEmail) {
      return NextResponse.json({
        id:    null,
        email: cookieEmail,
        name:  cookieEmail.split('@')[0],
        role:  (cookieRole || 'CUSTOMER').toUpperCase(),
      });
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
