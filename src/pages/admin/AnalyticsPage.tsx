import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";

interface KPIs {
  ordersToday: number;
  revenueToday: number;
  avgOrderValue: number;
  byStatus: Record<string, number>;
}

const AnalyticsPage = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: allOrders } = await supabase
        .from("orders")
        .select("total_amount, order_status, created_at");

      if (!allOrders) { setLoading(false); return; }

      const todayOrders = allOrders.filter(
        (o) => new Date(o.created_at) >= todayStart
      );
      const revenueToday = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
      const avgOrderValue = allOrders.length ? allOrders.reduce((s, o) => s + Number(o.total_amount), 0) / allOrders.length : 0;

      const byStatus: Record<string, number> = {};
      allOrders.forEach((o) => {
        byStatus[o.order_status] = (byStatus[o.order_status] || 0) + 1;
      });

      setKpis({
        ordersToday: todayOrders.length,
        revenueToday,
        avgOrderValue,
        byStatus,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!kpis) return <p className="text-muted-foreground">No hay datos.</p>;

  const kpiCards = [
    { title: "Órdenes Hoy", value: kpis.ordersToday, icon: ShoppingCart },
    { title: "Ingresos Hoy", value: `$${kpis.revenueToday.toFixed(2)}`, icon: DollarSign },
    { title: "Valor Promedio", value: `$${kpis.avgOrderValue.toFixed(2)}`, icon: TrendingUp },
    { title: "Total Órdenes", value: Object.values(kpis.byStatus).reduce((a, b) => a + b, 0), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader><CardTitle>Órdenes por Estado</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(kpis.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="capitalize text-sm">{status}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
