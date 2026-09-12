'use server'

import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

function saveCustomerToLocalFile(customer: { id: string; name: string; email: string; role: string }) {
  try {
    const DATA_DIR = path.join(process.cwd(), 'src', 'data')
    const FILE_PATH = path.join(DATA_DIR, 'customers.json')
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    let list: any[] = []
    if (fs.existsSync(FILE_PATH)) {
      list = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8') || '[]')
    }
    const joinedFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
    const idx = list.findIndex((c: any) => c.email.toLowerCase() === customer.email.toLowerCase())
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

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required' }
  }

  const isEmailAdmin = email.toLowerCase().includes('admin')
  const userRole = isEmailAdmin ? 'ADMIN' : 'CUSTOMER'

  try {
    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: userRole,
        },
      },
    })

    const userId = authData?.user?.id || `user_${Date.now()}`

    // 1. Persistent Save to local file store
    saveCustomerToLocalFile({
      id: userId,
      name: name,
      email: email,
      role: userRole,
    })

    // 2. Save/upsert to Supabase public.users table
    try {
      await supabase.from('users').upsert(
        [
          {
            id: userId,
            email: email,
            full_name: name,
            role: userRole,
          },
        ],
        { onConflict: 'email' }
      )
    } catch (dbErr) {
      console.warn('Public users table registration notice:', dbErr)
    }

    if (error && !error.message.includes('already registered')) {
      console.warn('Supabase auth signup notice:', error.message)
    }

    const cookieStore = await cookies()
    cookieStore.set('demo_user_role', userRole, { path: '/' })
    cookieStore.set('demo_user_email', email, { path: '/' })

    return { success: true, role: userRole }
  } catch (err: any) {
    console.error('Registration exception:', err)
    return { error: err.message || 'Registration failed' }
  }
}
