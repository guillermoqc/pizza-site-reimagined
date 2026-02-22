
-- 1. Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- 2. Stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_status public.order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Order Items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  item_total NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 5. Order Modifiers table
CREATE TABLE public.order_modifiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  modifier_name TEXT NOT NULL,
  modifier_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 6. Indexes for query optimization
CREATE INDEX idx_orders_store_id ON public.orders(store_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_modifiers_item_id ON public.order_modifiers(order_item_id);

-- 7. Enable RLS (public read/write for now since no auth yet)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_modifiers ENABLE ROW LEVEL SECURITY;

-- Public access policies (to be tightened when auth is added)
CREATE POLICY "Public read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public insert stores" ON public.stores FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read order_modifiers" ON public.order_modifiers FOR SELECT USING (true);
CREATE POLICY "Public insert order_modifiers" ON public.order_modifiers FOR INSERT WITH CHECK (true);

-- 8. Enable realtime for orders (for future real-time tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
