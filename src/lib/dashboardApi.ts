const API_BASE = import.meta.env.VITE_DASHBOARD_API_URL ?? "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface OrderModifier {
  id: string;
  modifier_name: string | null;
  modifier_price: number | null;
}

export interface OrderItem {
  id: string;
  item_name: string | null;
  base_price: number | null;
  quantity: number | null;
  item_total: number | null;
  modifiers: OrderModifier[];
}

export interface Order {
  id: string;
  store_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number | null;
  order_status: string | null;
  created_at: string | null;
  items: OrderItem[];
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface AnalyticsData {
  orders_today: number;
  revenue_today: number;
  avg_order_value: number;
  total_orders: number;
  orders_by_status: OrderStatusCount[];
  revenue_last_7_days: number;
  orders_last_7_days: number;
}

export interface OrderListParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}

// ── API client (class-based, strongly typed) ─────────────────────────────────

class DashboardApiClient {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail ?? "Request failed");
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async login(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<AdminUser> {
    return this.request<AdminUser>("/auth/me");
  }

  // Orders
  async getOrders(params: OrderListParams = {}): Promise<OrderListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.page_size) query.set("page_size", String(params.page_size));
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return this.request<OrderListResponse>(`/orders${qs ? `?${qs}` : ""}`);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, newStatus: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>("/analytics");
  }
}

export const dashboardApi = new DashboardApiClient();
