import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, DollarSign, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { dashboardApi, type AnalyticsData } from "@/lib/dashboardApi";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308",
  confirmed: "#3B82F6",
  preparing: "#F97316",
  ready: "#A855F7",
  delivered: "#22C55E",
  cancelled: "#EF4444",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
}

function KPICard({ title, value, subtitle, icon: Icon, iconColor }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconColor}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      dashboardApi.getAnalytics().then(setData).catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg m-6">
        {error ?? "Failed to load analytics"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live overview — refreshes every 30 s</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Orders Today"
          value={String(data.orders_today)}
          subtitle={`${data.orders_last_7_days} this week`}
          icon={ShoppingBag}
          iconColor="bg-blue-500"
        />
        <KPICard
          title="Revenue Today"
          value={formatCurrency(data.revenue_today)}
          subtitle={`${formatCurrency(data.revenue_last_7_days)} this week`}
          icon={DollarSign}
          iconColor="bg-green-500"
        />
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(data.avg_order_value)}
          subtitle="today's average"
          icon={TrendingUp}
          iconColor="bg-purple-500"
        />
        <KPICard
          title="Total Orders"
          value={data.total_orders.toLocaleString()}
          subtitle="all time"
          icon={Package}
          iconColor="bg-orange-500"
        />
      </div>

      {/* Orders by status chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {data.orders_by_status.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.orders_by_status}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value, "Orders"]}
                  labelFormatter={(label: string) =>
                    label.charAt(0).toUpperCase() + label.slice(1)
                  }
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.orders_by_status.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? "#6B7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
