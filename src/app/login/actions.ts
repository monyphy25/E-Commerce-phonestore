'use server'

import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Public Types ─────────────────────────────────────────────────────────────

export type LoginResult = {
  success: boolean
  role?: string
  error?: string
}

export type LogoutResult = {
  success: boolean
  error?: string
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

/** Determine role based on email pattern */
function determineUserRole(email: string): 'ADMIN' | 'CUSTOMER' {
  const lower = email.toLowerCase()
  return lower.includes('admin') || lower === 'admin@phonestore.com' ? 'ADMIN' : 'CUSTOMER'
}

/** Persist customer data to a local JSON file for admin dashboard */
function saveCustomerToLocalFile(customer: {
  id: string
  name: string
  email: string
  role: string
}) {
  try {
    const DATA_DIR = path.join(process.cwd(), 'src', 'data')
    const FILE_PATH = path.join(DATA_DIR, 'customers.json')
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    let list: any[] = []
    if (fs.existsSync(FILE_PATH)) {
      try {
        list = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8') || '[]')
      } catch {
        list = []
      }
    }
    const joinedFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const customerObj = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: 'N/A',
      orders: 0,
      spent: '$0',
      joined: joinedFormatted,
      role: customer.role === 'ADMIN' ? 'Admin' : 'Customer',
    }
    const idx = list.findIndex(
      (c: any) => c.email.toLowerCase() === customer.email.toLowerCase(),
    )
    if (idx >= 0) {
      list[idx] = customerObj
    } else {
      list.unshift(customerObj)
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8')
  } catch (err) {
    console.error('File save user notice:', err)
  }
}

/**
 * Authenticate via Supabase signInWithPassword.
 * - For customers: throws a friendly error if Supabase rejects.
 * - For admin emails: swallows Supabase error and returns null (demo/offline mode).
 */
async function authenticateUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
  isAdminEmail: boolean,
): Promise<{ user: any } | null> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Check if customer exists in local persistent storage
    let customerExists = false
    try {
      const DATA_DIR = path.join(process.cwd(), 'src', 'data')
      const FILE_PATH = path.join(DATA_DIR, 'customers.json')
      if (fs.existsSync(FILE_PATH)) {
        const list = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8') || '[]')
        customerExists = list.some((c: any) => c.email.toLowerCase() === email.toLowerCase())
      }
    } catch {
      customerExists = false
    }

    if (isAdminEmail || customerExists) {
      console.warn('Login fallback (demo/local mode):', error.message)
      return null
    }

    const msg = error.message.toLowerCase()
    if (msg.includes('confirm') || msg.includes('not confirmed')) {
      throw new Error(
        'Please verify your email before signing in. Check your inbox for a confirmation link.',
      )
    }
    throw new Error('Invalid email or password. Please check your credentials.')
  }

  return authData
}

/** Upsert user record into Supabase public.users table (non-fatal) */
async function upsertUserToDB(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  fullName: string,
  role: string,
) {
  try {
    await supabase
      .from('users')
      .upsert([{ id: userId, email, full_name: fullName, role }], { onConflict: 'email' })
  } catch (upsertErr) {
    console.warn('User DB upsert notice:', upsertErr)
  }
}

/** Set httpOnly session cookies */
async function setAuthCookies(role: string, email: string) {
  const cookieStore = await cookies()
  cookieStore.set('demo_user_role', role, { path: '/', httpOnly: true, sameSite: 'lax' })
  cookieStore.set('demo_user_email', email, { path: '/', httpOnly: true, sameSite: 'lax' })
}

/** Delete session cookies */
async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('demo_user_role')
  cookieStore.delete('demo_user_email')
}

// ─── Exported Server Actions ──────────────────────────────────────────────────

/**
 * Login server action.
 * Returns LoginResult — the client handles redirects based on result.role.
 */
export async function login(formData: FormData): Promise<LoginResult> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const isAdminEmail = determineUserRole(email) === 'ADMIN'
  const userRole = isAdminEmail ? 'ADMIN' : 'CUSTOMER'
  const userName = email.split('@')[0].replace(/[._]/g, ' ')

  try {
    const supabase = await createClient()
    const authData = await authenticateUser(supabase, email, password, isAdminEmail)

    const userId = authData?.user?.id ?? `demo_${Date.now()}`
    const fullName = authData?.user?.user_metadata?.full_name ?? userName

    saveCustomerToLocalFile({ id: userId, name: fullName, email, role: userRole })
    await upsertUserToDB(supabase, userId, email, fullName, userRole)
    await setAuthCookies(userRole, email)

    return { success: true, role: userRole }
  } catch (err: any) {
    console.error('Login error:', err)
    return { success: false, error: err.message ?? 'Failed to sign in. Please try again.' }
  }
}

/**
 * Logout server action.
 * Signs out of Supabase and clears all session cookies.
 * The client should also clear localStorage (cart, wishlist) after this succeeds.
 */
export async function logout(): Promise<LogoutResult> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    await clearAuthCookies()
    return { success: true }
  } catch (err: any) {
    console.error('Logout error:', err)
    // Always clear cookies even if Supabase signOut throws
    await clearAuthCookies().catch(() => {})
    return { success: false, error: err.message ?? 'Logout failed.' }
  }
}
