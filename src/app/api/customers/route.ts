import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const FILE_PATH = path.join(DATA_DIR, 'customers.json');

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf-8');
  }
}

function readStoredCustomers(): any[] {
  try {
    ensureFileExists();
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function saveStoredCustomers(customers: any[]) {
  try {
    ensureFileExists();
    fs.writeFileSync(FILE_PATH, JSON.stringify(customers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write stored customers:', err);
  }
}

function formatDate(dateObj?: Date | string) {
  const d = dateObj ? new Date(dateObj) : new Date();
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function GET() {
  try {
    let dbCustomersFormatted: any[] = [];

    // 1. Try reading from Supabase users table
    try {
      const supabase = await createClient();
      const { data: dbUsers, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && dbUsers) {
        dbCustomersFormatted = dbUsers.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.email?.split('@')[0] || 'Customer User',
          email: u.email,
          phone: 'N/A',
          orders: 0,
          spent: '$0',
          joined: formatDate(u.created_at),
          role: u.role?.toUpperCase() === 'ADMIN' ? 'Admin' : 'Customer',
        }));
      }
    } catch (dbErr) {
      console.warn('Supabase fetch customers warning:', dbErr);
    }

    // 2. Read file-backed persistent customers
    const localCustomers = readStoredCustomers();

    // 3. Merge database + local JSON file customers (deduplicated by email)
    const combinedMap = new Map();

    dbCustomersFormatted.forEach((c: any) => {
      if (c.email) combinedMap.set(c.email.toLowerCase(), c);
    });

    localCustomers.forEach((c: any) => {
      if (c.email && !combinedMap.has(c.email.toLowerCase())) {
        combinedMap.set(c.email.toLowerCase(), c);
      }
    });

    const finalCustomers = Array.from(combinedMap.values());

    return NextResponse.json({ customers: finalCustomers });
  } catch (err: any) {
    console.error('Customers GET error:', err);
    return NextResponse.json({ customers: readStoredCustomers() });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const customerObj = {
      id: id || `cust_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      phone: 'N/A',
      orders: 0,
      spent: '$0',
      joined: formatDate(),
      role: role === 'ADMIN' || email.toLowerCase().includes('admin') ? 'Admin' : 'Customer',
    };

    // 1. Save to local JSON file store
    const currentList = readStoredCustomers();
    const existingIndex = currentList.findIndex(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (existingIndex >= 0) {
      currentList[existingIndex] = customerObj;
    } else {
      currentList.unshift(customerObj);
    }

    saveStoredCustomers(currentList);

    // 2. Try saving to Supabase users table
    try {
      const supabase = await createClient();
      await supabase.from('users').upsert(
        [
          {
            id: customerObj.id,
            email: customerObj.email,
            full_name: customerObj.name,
            role: customerObj.role === 'Admin' ? 'ADMIN' : 'CUSTOMER',
          },
        ],
        { onConflict: 'email' }
      );
    } catch (dbErr) {
      console.warn('Supabase users table insert warning:', dbErr);
    }

    return NextResponse.json({ customer: customerObj, success: true });
  } catch (err: any) {
    console.error('Customers POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
    }

    // 1. Remove from local JSON file
    const currentList = readStoredCustomers();
    const updatedList = currentList.filter(
      (c) => String(c.id) !== String(id) && c.id !== id
    );
    saveStoredCustomers(updatedList);

    // 2. Remove from Supabase table
    try {
      const supabase = await createClient();
      await supabase.from('users').delete().eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase delete customer warning:', dbErr);
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
