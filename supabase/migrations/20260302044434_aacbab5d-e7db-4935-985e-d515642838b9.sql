
CREATE OR REPLACE VIEW public.order_full_details AS
SELECT
  o.id AS order_id,
  o.store_id,
  o.customer_name,
  o.customer_phone,
  o.order_status,
  o.total_amount,
  o.created_at AS order_created_at,
  oi.id AS order_item_id,
  oi.item_name,
  oi.base_price AS item_base_price,
  oi.quantity,
  oi.item_total,
  om.id AS modifier_id,
  om.modifier_name,
  om.modifier_price
FROM public.orders o
LEFT JOIN public.order_items oi ON oi.order_id = o.id
LEFT JOIN public.order_modifiers om ON om.order_item_id = oi.id;
