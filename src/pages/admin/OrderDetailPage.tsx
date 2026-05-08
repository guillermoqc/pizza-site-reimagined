import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

interface OrderDetail {
  order_id: string;
  store_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  order_status: string;
  total_amount: number;
  order_created_at: string;
  order_item_id: string | null;
  item_name: string | null;
  item_base_price: number | null;
  quantity: number | null;
  item_total: number | null;
  modifier_id: string | null;
  modifier_name: string | null;
  modifier_price: number | null;
}

interface GroupedItem {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
  total: number;
  modifiers: { name: string; price: number }[];
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("order_full_details" as any)
      .select("*")
      .eq("order_id", id);
    if (!error && data) {
      setRows(data as unknown as OrderDetail[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const changeStatus = async (newStatus: string) => {
    if (!id || !rows.length) return;
    setUpdating(true);
    const currentStatus = rows[0].order_status;

    // Update order status
    const { error: updateErr } = await supabase
      .from("orders")
      .update({ order_status: newStatus as any })
      .eq("id", id);

    if (updateErr) {
      toast({ title: "Error", description: updateErr.message, variant: "destructive" });
      setUpdating(false);
      return;
    }

    // Log history
    await supabase.from("order_status_history").insert({
      order_id: id,
      previous_status: currentStatus as any,
      new_status: newStatus as any,
      changed_by: user?.id,
    });

    toast({ title: "Estado actualizado", description: `${currentStatus} → ${newStatus}` });
    await fetchOrder();
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Orden no encontrada.</p>
        <Button asChild variant="outline"><Link to="/admin/orders"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Link></Button>
      </div>
    );
  }

  const order = rows[0];

  // Group items and their modifiers
  const itemsMap = new Map<string, GroupedItem>();
  rows.forEach((r) => {
    if (!r.order_item_id) return;
    if (!itemsMap.has(r.order_item_id)) {
      itemsMap.set(r.order_item_id, {
        id: r.order_item_id,
        name: r.item_name || "",
        basePrice: Number(r.item_base_price) || 0,
        quantity: r.quantity || 1,
        total: Number(r.item_total) || 0,
        modifiers: [],
      });
    }
    if (r.modifier_id && r.modifier_name) {
      const item = itemsMap.get(r.order_item_id)!;
      if (!item.modifiers.find((m) => m.name === r.modifier_name)) {
        item.modifiers.push({ name: r.modifier_name, price: Number(r.modifier_price) || 0 });
      }
    }
  });
  const items = Array.from(itemsMap.values());

  const currentIdx = STATUS_FLOW.indexOf(order.order_status as any);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/orders"><ArrowLeft className="mr-2 h-4 w-4" />Volver a órdenes</Link>
      </Button>

      {/* Order header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="font-display">Orden #{order.order_id.slice(0, 8)}</CardTitle>
            <Badge variant="outline" className={STATUS_COLORS[order.order_status] || ""}>
              {order.order_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Cliente:</span> {order.customer_name || "—"}</div>
          <div><span className="text-muted-foreground">Teléfono:</span> {order.customer_phone || "—"}</div>
          <div><span className="text-muted-foreground">Fecha:</span> {new Date(order.order_created_at).toLocaleString("es")}</div>
          <div><span className="text-muted-foreground">Total:</span> <strong>${Number(order.total_amount).toFixed(2)}</strong></div>
        </CardContent>
      </Card>

      {/* Status actions */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-2">
          {nextStatus && order.order_status !== "cancelled" && (
            <Button onClick={() => changeStatus(nextStatus)} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Avanzar a: {nextStatus}
            </Button>
          )}
          {order.order_status !== "cancelled" && order.order_status !== "delivered" && (
            <Button variant="destructive" onClick={() => changeStatus("cancelled")} disabled={updating}>
              Cancelar Orden
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{item.name} × {item.quantity}</span>
                <span>${item.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground pl-4">
                Precio base: ${item.basePrice.toFixed(2)}
              </div>
              {item.modifiers.map((mod, i) => (
                <div key={i} className="flex justify-between text-sm pl-4 text-muted-foreground">
                  <span>+ {mod.name}</span>
                  <span>${mod.price.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
            </div>
          ))}
          <div className="flex justify-between font-display font-bold text-lg pt-2">
            <span>Total</span>
            <span>${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;
