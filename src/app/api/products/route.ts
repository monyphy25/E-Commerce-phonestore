import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const DELETED_FILE = path.join(DATA_DIR, 'deleted_products.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStoredProducts(): any[] {
  try {
    ensureDir();
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function saveStoredProducts(products: any[]) {
  try {
    ensureDir();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write stored products:', err);
  }
}

function readDeletedIds(): string[] {
  try {
    ensureDir();
    if (!fs.existsSync(DELETED_FILE)) return [];
    const data = fs.readFileSync(DELETED_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function addDeletedId(id: string) {
  try {
    ensureDir();
    const list = readDeletedIds();
    if (!list.includes(String(id))) {
      list.push(String(id));
      fs.writeFileSync(DELETED_FILE, JSON.stringify(list, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to save deleted ID:', err);
  }
}

function clearDeletedIds() {
  try {
    ensureDir();
    fs.writeFileSync(DELETED_FILE, JSON.stringify([]), 'utf-8');
  } catch (err) {
    console.error('Failed to clear deleted IDs:', err);
  }
}

function getDedupeKey(p: any): string | null {
  if (!p) return null;
  if (p.sku && String(p.sku).trim() !== '' && String(p.sku) !== 'N/A') {
    return `sku_${String(p.sku).trim().toLowerCase()}`;
  }
  if (p.name && String(p.name).trim() !== '') {
    return `name_${String(p.name).trim().toLowerCase()}`;
  }
  return `id_${p.id}`;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/products
 * Fetch products from Supabase database combined with local JSON stored products.
 * Deduplicates by Name or SKU while ensuring the most up-to-date edits are preserved.
 */
export async function GET() {
  try {
    const deletedList = readDeletedIds();
    const deletedSet = new Set(deletedList.map((id) => String(id).toLowerCase()));

    const supabase = await createClient();
    const { data: dbProducts } = await supabase
      .from('products')
      .select('*, product_images(image_url)')
      .order('created_at', { ascending: true });

    const localProducts = readStoredProducts();

    const dbProductsFormatted = (dbProducts || []).map((p: any) => {
      const img = p.image_url || p.image || p.product_images?.[0]?.image_url || null;
      return {
        ...p,
        image_url: img,
        image: img,
      };
    });

    const productMap = new Map();

    // 1. Process DB products first
    dbProductsFormatted.forEach((p: any) => {
      if (p && p.id) {
        const idStr = String(p.id).toLowerCase();
        const slugStr = p.slug ? String(p.slug).toLowerCase() : '';
        const dedupeKey = getDedupeKey(p);

        if (dedupeKey && !deletedSet.has(idStr) && !deletedSet.has(slugStr)) {
          const img = p.image_url || p.image || null;
          productMap.set(dedupeKey, {
            ...p,
            image_url: img,
            image: img,
          });
        }
      }
    });

    // 2. Process local products (local edits take precedence over stale DB records)
    localProducts.forEach((p) => {
      if (p && p.id) {
        const idStr = String(p.id).toLowerCase();
        const slugStr = p.slug ? String(p.slug).toLowerCase() : '';
        const dedupeKey = getDedupeKey(p);

        if (dedupeKey && !deletedSet.has(idStr) && !deletedSet.has(slugStr)) {
          const img = p.image_url || p.image || null;
          if (productMap.has(dedupeKey)) {
            const existingDb = productMap.get(dedupeKey);
            productMap.set(dedupeKey, {
              ...existingDb,
              ...p,
              image_url: img || existingDb.image_url,
              image: img || existingDb.image,
            });
          } else {
            productMap.set(dedupeKey, {
              ...p,
              image_url: img,
              image: img,
            });
          }
        }
      }
    });

    const uniqueProducts = Array.from(productMap.values());
    return NextResponse.json(
      { products: uniqueProducts },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.error('Products GET error:', err);
    return NextResponse.json(
      { products: readStoredProducts() },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  }
}

/**
 * POST /api/products
 * Create product in Supabase database & save to local JSON file
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      brand,
      category,
      description,
      price,
      discount_price,
      sku,
      stock,
      ram,
      storage,
      status,
      image_url,
      image,
      color,
    } = body;

    const finalImage = image_url || image || null;
    const cleanName = (name || 'Product').trim();
    const cleanSku = (sku || `SKU-${Date.now().toString().slice(-4)}`).trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const productRecord = {
      id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: cleanName,
      slug,
      description: description || '',
      price: Number(price),
      discount_price: discount_price ? Number(discount_price) : null,
      stock: Number(stock),
      sku: cleanSku,
      status: status || (Number(stock) === 0 ? 'Out of Stock' : Number(stock) <= 5 ? 'Low Stock' : 'In Stock'),
      image_url: finalImage,
      image: finalImage,
      brand: brand || '',
      category: category || 'Flagship',
      ram: ram || '8GB',
      storage: storage || '256GB',
      color: color || '',
      created_at: new Date().toISOString(),
    };

    // 1. Check if product already exists locally by SKU or Name to prevent duplication
    const currentList = readStoredProducts();
    const existingIndex = currentList.findIndex(
      (p) =>
        (p.sku && p.sku.toLowerCase() === cleanSku.toLowerCase()) ||
        (p.name && p.name.toLowerCase() === cleanName.toLowerCase())
    );

    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...currentList[existingIndex], ...productRecord };
    } else {
      currentList.push(productRecord);
    }

    saveStoredProducts(currentList);

    // 2. Try inserting into Supabase
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productRecord.name,
          slug: productRecord.slug,
          description: productRecord.description,
          price: productRecord.price,
          discount_price: productRecord.discount_price,
          stock: productRecord.stock,
          sku: productRecord.sku,
          status: productRecord.status,
        }])
        .select();

      if (!error && data && data[0] && productRecord.image_url) {
        try {
          await supabase.from('product_images').insert([{
            product_id: data[0].id,
            image_url: productRecord.image_url,
          }]);
        } catch (imgErr) {
          console.warn('Image table insert notice:', imgErr);
        }
      }
    } catch (dbErr) {
      console.warn('Supabase product insert notice:', dbErr);
    }

    return NextResponse.json({ success: true, product: productRecord }, { status: 201 });
  } catch (err: any) {
    console.error('Product creation exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/products
 * Update an existing product by ID in local JSON store and Supabase
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, sku, name } = body;

    if (!id && !sku && !name) {
      return NextResponse.json({ error: 'Missing product identifier' }, { status: 400 });
    }

    // 1. Update in local JSON file
    const currentList = readStoredProducts();
    const idx = currentList.findIndex((p) =>
      (id && (String(p.id) === String(id) || String(p.slug) === String(id))) ||
      (sku && p.sku && String(p.sku).toLowerCase() === String(sku).toLowerCase()) ||
      (name && p.name && String(p.name).toLowerCase() === String(name).toLowerCase())
    );

    // Build updated fields cleanly without overwriting existing data with undefined or NaN
    const updatedFields: any = {};
    if (body.name !== undefined && String(body.name).trim() !== '') updatedFields.name = body.name;
    if (body.price !== undefined && !isNaN(Number(body.price))) updatedFields.price = Number(body.price);
    if (body.discount_price !== undefined) {
      updatedFields.discount_price = body.discount_price !== null && !isNaN(Number(body.discount_price)) ? Number(body.discount_price) : null;
    }
    if (body.stock !== undefined && !isNaN(Number(body.stock))) {
      const stockNum = Number(body.stock);
      updatedFields.stock = stockNum;
      if (stockNum === 0) updatedFields.status = 'Out of Stock';
      else if (stockNum <= 5) updatedFields.status = 'Low Stock';
      else updatedFields.status = body.status || 'In Stock';
    } else if (body.status !== undefined) {
      updatedFields.status = body.status;
    }
    if (body.brand !== undefined) updatedFields.brand = body.brand;
    if (body.category !== undefined) updatedFields.category = body.category;
    if (body.description !== undefined) updatedFields.description = body.description;
    if (body.sku !== undefined && String(body.sku).trim() !== '') updatedFields.sku = body.sku;
    if (body.storage !== undefined) updatedFields.storage = body.storage;
    if (body.color !== undefined) updatedFields.color = body.color;
    if (body.image_url !== undefined || body.image !== undefined) {
      const img = body.image_url || body.image;
      if (img) {
        updatedFields.image_url = img;
        updatedFields.image = img;
      }
    }

    let updatedProduct: any = null;

    if (idx >= 0) {
      currentList[idx] = {
        ...currentList[idx],
        ...updatedFields,
        id: currentList[idx].id, // preserve original ID
      };
      updatedProduct = currentList[idx];
      saveStoredProducts(currentList);
    } else {
      // Product may exist only in Supabase DB or is new, save it to local store
      const newEntry = {
        id: id || `prod_${Date.now()}`,
        name: body.name || 'Product',
        price: !isNaN(Number(body.price)) ? Number(body.price) : 0,
        stock: !isNaN(Number(body.stock)) ? Number(body.stock) : 10,
        sku: body.sku || `SKU-${Date.now().toString().slice(-4)}`,
        status: body.status || 'In Stock',
        brand: body.brand || '',
        category: body.category || '',
        ...updatedFields,
      };
      currentList.push(newEntry);
      updatedProduct = newEntry;
      saveStoredProducts(currentList);
    }

    // 2. Try updating in Supabase
    try {
      const supabase = await createClient();
      const dbUpdatePayload: any = {};
      if (updatedFields.name !== undefined) dbUpdatePayload.name = updatedFields.name;
      if (updatedFields.price !== undefined) dbUpdatePayload.price = updatedFields.price;
      if (updatedFields.stock !== undefined) dbUpdatePayload.stock = updatedFields.stock;
      if (updatedFields.status !== undefined) dbUpdatePayload.status = updatedFields.status;
      if (updatedFields.brand !== undefined) dbUpdatePayload.brand = updatedFields.brand;
      if (updatedFields.category !== undefined) dbUpdatePayload.category = updatedFields.category;
      if (updatedFields.description !== undefined) dbUpdatePayload.description = updatedFields.description;
      if (updatedFields.sku !== undefined) dbUpdatePayload.sku = updatedFields.sku;
      if (updatedFields.discount_price !== undefined) dbUpdatePayload.discount_price = updatedFields.discount_price;
      if (updatedFields.storage !== undefined) dbUpdatePayload.storage = updatedFields.storage;
      if (updatedFields.color !== undefined) dbUpdatePayload.color = updatedFields.color;

      const isUUID = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUUID) {
        await supabase.from('products').update(dbUpdatePayload).eq('id', id);
      } else if (body.sku) {
        await supabase.from('products').update(dbUpdatePayload).eq('sku', body.sku);
      } else if (body.name) {
        await supabase.from('products').update(dbUpdatePayload).eq('name', body.name);
      }
    } catch (dbErr) {
      console.warn('Supabase product update notice:', dbErr);
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    console.error('Product update exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/products
 * Delete single product or purge all products
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const purgeAll = searchParams.get('purge');

    if (purgeAll === 'true') {
      saveStoredProducts([]);
      clearDeletedIds();

      try {
        const { data: allProds } = await supabase.from('products').select('id');
        if (allProds) {
          allProds.forEach((p) => addDeletedId(String(p.id)));
        }
        await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Purge DB step notice:', e);
      }
      return NextResponse.json({ message: 'All stock and products cleared successfully.' });
    }

    if (id) {
      // 1. Mark ID as deleted persistently
      addDeletedId(String(id));

      // 2. Remove from local JSON file
      const currentList = readStoredProducts();
      const updatedList = currentList.filter(
        (p) => String(p.id) !== String(id) && p.id !== id && String(p.slug) !== String(id)
      );
      saveStoredProducts(updatedList);

      // 3. Try deleting from Supabase
      try {
        const isUUID = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('products').delete().eq('id', id);
        } else {
          await supabase.from('products').delete().eq('slug', id);
        }
      } catch (e) {
        console.warn('Supabase delete notice:', e);
      }
      return NextResponse.json({ message: 'Product deleted successfully' });
    }

    return NextResponse.json({ error: 'Missing product ID or purge flag' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
