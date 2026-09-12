-- Run this SQL in your Supabase Dashboard SQL Editor to fix RLS permissions
-- Dashboard URL: https://supabase.com/dashboard/project/_/sql

-- Option 1: Allow public insert/update/delete policies on products, orders, order_items
DROP POLICY IF EXISTS "Public insert products" ON public.products;
DROP POLICY IF EXISTS "Public update products" ON public.products;
DROP POLICY IF EXISTS "Public delete products" ON public.products;
DROP POLICY IF EXISTS "Public select products" ON public.products;

CREATE POLICY "Public select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

-- Product Images
DROP POLICY IF EXISTS "Public insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Public select product_images" ON public.product_images;
DROP POLICY IF EXISTS "Public delete product_images" ON public.product_images;

CREATE POLICY "Public select product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public insert product_images" ON public.product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete product_images" ON public.product_images FOR DELETE USING (true);

-- Orders
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public select orders" ON public.orders;
DROP POLICY IF EXISTS "Public delete orders" ON public.orders;

CREATE POLICY "Public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete orders" ON public.orders FOR DELETE USING (true);

-- Order Items
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public select order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public delete order_items" ON public.order_items;

CREATE POLICY "Public select order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete order_items" ON public.order_items FOR DELETE USING (true);

-- Alternatively, disable RLS for direct development access:
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
