import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, type Order } from "@/lib/dashboardApi";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-orange-100 text-orange-800 border-orange-200",
  ready: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};

function formatCurrency(v: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function DashboardOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    dashboardApi
      .getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function advance() {
    if (!order) return;
    const next = NEXT_STATUS[order.order_status ?? "pending"];
    if (!next) return;
    setUpdating(true);
    setActionError(null);
    try {
      const updated = await dashboardApi.updateOrderStatus(order.id, next);
      setOrder(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function cancel() {
    if (!order) return;
    setUpdating(true);
    setActionError(null);
    try {
      const updated = await dashboardApi.updateOrderStatus(order.id, "cancelled");
      setOrder(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 text-red-600">
        {error ?? "Order not found"}
      </div>
    );
  }

  const status = order.order_status ?? "pending";
  const nextStatus = NEXT_STATUS[status];
  const canCancel = !["delivered", "cancelled"].includes(status);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/orders")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to orders
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-xs font-mono text-gray-400 mt-1">{order.id}</p>
        </div>
        <Badge
          variant="outline"
          className={`capitalize border text-sm px-3 py-1 ${STATUS_COLORS[status]}`}
        >
          {status}
        </Badge>
      </div>

      {/* Customer info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium mt-0.5">{order.customer_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium mt-0.5">{order.customer_phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Placed at</p>
            <p className="font-medium mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-semibold text-lg mt-0.5">{formatCurrency(order.total_amount)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.item_name ?? "Item"}</span>
                  <span className="text-xs text-gray-400">×{item.quantity ?? 1}</span>
                </div>
                {item.modifiers.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {item.modifiers.map((mod) => (
                      <li key={mod.id} className="text-xs text-gray-500 flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        {mod.modifier_name}
                        {mod.modifier_price ? ` (+${formatCurrency(mod.modifier_price)})` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="text-sm font-semibold ml-4">
                {formatCurrency(item.item_total)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {actionError}
        </p>
      )}

      <div className="flex gap-3">
        {nextStatus && (
          <Button
            className="bg-green-600 hover:bg-green-700 capitalize"
            onClick={advance}
            disabled={updating}
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Mark as {nextStatus}
          </Button>
        )}
        {canCancel && (
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={cancel} disabled={updating}>
            Cancel order
          </Button>
        )}
      </div>
    </div>
  );
}
