import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import DealsPage from "./pages/DealsPage";
import LocationsPage from "./pages/LocationsPage";
import CheckoutPage from "./pages/CheckoutPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AuthPage from "./pages/AuthPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
