import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Warranty from "./pages/Warranty";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProduct from "./pages/admin/AdminProduct";
import AdminCategory from "./pages/admin/AdminCategory";
import Payment from "./components/Payment";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import AdminCart from "./pages/admin/AdminCart";
import AdminCustomer from "./pages/admin/AdminCustomer";
import AdminAttributeGroups from "./pages/admin/AdminAttributeGroups";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import AdminWarrantyPackages from "./pages/admin/AdminWarrantyPackages";
import AdminProductWarrantyConfig from "./pages/admin/AdminProductWarrantyConfig";
import AdminRepairRequests from "./pages/admin/AdminRepairRequests";
import AdminRevenueStats from "./pages/admin/AdminRevenueStats";
import ProfilePage from "./pages/Profile";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/adminProduct"
            element={
              <AdminRoute>
                <AdminProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/adminCategory"
            element={
              <AdminRoute>
                <AdminCategory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/adminCart"
            element={
              <AdminRoute>
                <AdminCart />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/adminCustomer"
            element={
              <AdminRoute>
                <AdminCustomer />
              </AdminRoute>
            }
          />
           <Route
            path="/admin/adminAttributeGroups"
            element={
              <AdminRoute>
                <AdminAttributeGroups />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/adminWarrantyPackages"
            element={
              <AdminRoute>
                <AdminWarrantyPackages />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/adminProductWarranty"
            element={
              <AdminRoute>
                <AdminProductWarrantyConfig />
              </AdminRoute>
            }
          />
           <Route
            path="/admin/repair-requests"
            element={
              <AdminRoute>
                <AdminRepairRequests />
              </AdminRoute>
            }
          />
           <Route
            path="/admin/revenue"
            element={
              <AdminRoute>
                <AdminRevenueStats />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
