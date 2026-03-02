import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, RefreshCw } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

interface Order {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  order_status: string;
  created_at: string;
  store_id: string;
}

const PAGE_SIZE = 15;

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") {
      query = query.eq("order_status", statusFilter as any);
    }
    if (search.trim()) {
      query = query.or(`id.eq.${search.trim()},customer_phone.ilike.%${search.trim()}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setOrders(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [statusFilter, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Órdenes</h1>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Buscar por ID o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="secondary" size="sm">Buscar</Button>
        </form>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron órdenes.
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}…</TableCell>
                    <TableCell>{order.customer_name || "—"}</TableCell>
                    <TableCell>{order.customer_phone || "—"}</TableCell>
                    <TableCell className="text-right font-medium">${Number(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[order.order_status] || ""}>
                        {order.order_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("es")}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{total} órdenes en total</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                Anterior
              </Button>
              <span className="flex items-center text-sm px-2">
                {page + 1} / {totalPages || 1}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
