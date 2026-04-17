import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function corsHeaders(origin: string) {
  const allowed = ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

function badRequest(msg: string, origin: string) {
  return new Response(
    JSON.stringify({ error: msg }),
    { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
  );
}

interface OrderModifier {
  modifier_name: string;
  modifier_price: number;
}

interface OrderItem {
  item_name: string;
  base_price: number;
  quantity: number;
  modifiers: OrderModifier[];
}

interface OrderPayload {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: corsHeaders(origin) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let payload: OrderPayload;
    try {
      payload = await req.json();
    } catch {
      return badRequest("Invalid JSON body", origin);
    }

    // --- Input validation ---

    if (!payload.store_id || !UUID_REGEX.test(payload.store_id)) {
      return badRequest("Invalid store_id", origin);
    }

    const name = typeof payload.customer_name === "string" ? payload.customer_name.trim() : "";
    if (name.length < 2 || name.length > 100) {
      return badRequest("customer_name must be 2–100 characters", origin);
    }

    const phone = typeof payload.customer_phone === "string" ? payload.customer_phone.trim() : "";
    if (phone.length < 7 || phone.length > 25) {
      return badRequest("customer_phone must be 7–25 characters", origin);
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return badRequest("Order must have at least one item", origin);
    }

    if (payload.items.length > 30) {
      return badRequest("Order cannot exceed 30 items", origin);
    }

    // Validate each item and recompute totals server-side
    let computedTotal = 0;

    const validatedItems = payload.items.map((item, i) => {
      const itemName = typeof item.item_name === "string" ? item.item_name.trim() : "";
      if (itemName.length < 1 || itemName.length > 200) {
        throw new RangeError(`Item ${i + 1}: item_name must be 1–200 characters`);
      }

      const price = Number(item.base_price);
      if (!isFinite(price) || price < 0 || price > 10_000) {
        throw new RangeError(`Item ${i + 1}: base_price out of range`);
      }

      const qty = Math.floor(Number(item.quantity));
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        throw new RangeError(`Item ${i + 1}: quantity must be 1–20`);
      }

      const itemTotal = Math.round(price * qty * 100) / 100;
      computedTotal += itemTotal;

      const validatedModifiers = (item.modifiers ?? []).map((mod, j) => {
        const modName = typeof mod.modifier_name === "string" ? mod.modifier_name.trim() : "";
        if (modName.length < 1 || modName.length > 200) {
          throw new RangeError(`Item ${i + 1} modifier ${j + 1}: modifier_name must be 1–200 characters`);
        }
        const modPrice = Number(mod.modifier_price);
        if (!isFinite(modPrice) || modPrice < 0 || modPrice > 10_000) {
          throw new RangeError(`Item ${i + 1} modifier ${j + 1}: modifier_price out of range`);
        }
        return { modifier_name: modName, modifier_price: modPrice };
      });

      return { item_name: itemName, base_price: price, quantity: qty, item_total: itemTotal, modifiers: validatedModifiers };
    });

    computedTotal = Math.round(computedTotal * 100) / 100;

    // 1. Create order using server-computed total
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: payload.store_id,
        customer_name: name,
        customer_phone: phone,
        total_amount: computedTotal,
        order_status: "pending",
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const itemInserts = validatedItems.map((item) => ({
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
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    // 3. Create modifiers
    const modifierInserts: { order_item_id: string; modifier_name: string; modifier_price: number }[] = [];

    validatedItems.forEach((item, index) => {
      item.modifiers.forEach((mod) => {
        modifierInserts.push({
          order_item_id: insertedItems[index].id,
          modifier_name: mod.modifier_name,
          modifier_price: mod.modifier_price,
        });
      });
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
      { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Order creation error:", error);

    if (error instanceof RangeError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      { status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
    );
  }
});
