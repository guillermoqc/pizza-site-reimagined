import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderModifier {
  modifier_name: string;
  modifier_price: number;
}

interface OrderItem {
  item_name: string;
  base_price: number;
  quantity: number;
  item_total: number;
  modifiers: OrderModifier[];
}

interface OrderPayload {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  items: OrderItem[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload: OrderPayload = await req.json();

    // Validate
    if (!payload.store_id || !payload.customer_name || !payload.customer_phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.items || payload.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order must have at least one item" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: payload.store_id,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        total_amount: payload.total_amount,
        order_status: "pending",
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const itemInserts = payload.items.map((item) => ({
      order_id: order.id,
      item_name: item.item_name,
      base_price: item.base_price,
      quantity: item.quantity,
      item_total: item.item_total,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(itemInserts)
      .select("id");

    if (itemsError) {
      // Rollback: delete the order (cascade will clean up)
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    // 3. Create modifiers
    const modifierInserts: { order_item_id: string; modifier_name: string; modifier_price: number }[] = [];

    payload.items.forEach((item, index) => {
      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach((mod) => {
          modifierInserts.push({
            order_item_id: insertedItems[index].id,
            modifier_name: mod.modifier_name,
            modifier_price: mod.modifier_price,
          });
        });
      }
    });

    if (modifierInserts.length > 0) {
      const { error: modError } = await supabase
        .from("order_modifiers")
        .insert(modifierInserts);

      if (modError) {
        await supabase.from("orders").delete().eq("id", order.id);
        throw modError;
      }
    }

    return new Response(
      JSON.stringify({ order_id: order.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
