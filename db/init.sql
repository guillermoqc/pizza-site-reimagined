-- ============================================================
-- Pizza Site — PostgreSQL init script for Docker
-- Adapted from Supabase migrations (Supabase-specific features
-- like auth.users, RLS, and supabase_realtime are excluded).
-- The admin_users table is created automatically by FastAPI on
-- first startup — no need to define it here.
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE public.order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
);

-- ── Core tables ──────────────────────────────────────────────
CREATE TABLE public.stores (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name   TEXT        NOT NULL,
  phone_number TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id             UUID                 NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id       UUID                 REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name  TEXT,
  customer_phone TEXT,
  total_amount   NUMERIC(10,2)        NOT NULL DEFAULT 0,
  order_status   public.order_status  NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id          UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name   TEXT          NOT NULL,
  base_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity    INTEGER       NOT NULL DEFAULT 1,
  item_total  NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE public.order_modifiers (
  id             UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id  UUID          NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  modifier_name  TEXT          NOT NULL,
  modifier_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE public.menu_items (
  id          TEXT          NOT NULL PRIMARY KEY,
  name        TEXT          NOT NULL,
  description TEXT          NOT NULL,
  category    TEXT          NOT NULL,
  base_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url   TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_orders_store_id   ON public.orders(store_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status     ON public.orders(order_status);
CREATE INDEX idx_order_items_order_id    ON public.order_items(order_id);
CREATE INDEX idx_order_modifiers_item_id ON public.order_modifiers(order_item_id);
CREATE INDEX idx_menu_items_category     ON public.menu_items(category);

-- ── Convenience view ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.order_full_details AS
SELECT
  o.id             AS order_id,
  o.store_id,
  o.customer_name,
  o.customer_phone,
  o.order_status,
  o.total_amount,
  o.created_at     AS order_created_at,
  oi.id            AS order_item_id,
  oi.item_name,
  oi.base_price    AS item_base_price,
  oi.quantity,
  oi.item_total,
  om.id            AS modifier_id,
  om.modifier_name,
  om.modifier_price
FROM public.orders o
LEFT JOIN public.order_items    oi ON oi.order_id      = o.id
LEFT JOIN public.order_modifiers om ON om.order_item_id = oi.id;

-- ── Seed: default store ──────────────────────────────────────
INSERT INTO public.stores (store_name, phone_number)
VALUES ('Main Branch', '+1-555-0100');
