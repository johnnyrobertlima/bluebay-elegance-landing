import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import UserRolesManagement from "./pages/admin/UserRolesManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserGroups from "./pages/admin/AdminUserGroups";
import AdminGroupMenus from "./pages/admin/AdminGroupMenus";
import AdminGroupMenuSelection from "./pages/admin/AdminGroupMenuSelection";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminSystemPages from "./pages/admin/AdminSystemPages";
import AdminIndexContent from "./pages/admin/AdminIndexContent";
import { bluebayAdmRoutes } from "@/lib/routes/bluebay-adm-routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/produtos/:id" element={<ProductDetail />} />
              <Route path="/colecao" element={<Products />} />
              <Route path="/masculino" element={<Products />} />
              <Route path="/feminino" element={<Products />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/admin/roles" element={<UserRolesManagement />} />
              <Route path="/admin/user-groups" element={<AdminUserGroups />} />
              <Route path="/admin/user-groups/:groupId/menus" element={<AdminGroupMenus />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/system-pages" element={<AdminSystemPages />} />
              <Route path="/admin/group-menus" element={<AdminGroupMenuSelection />} />
              <Route path="/admin/index-content" element={<AdminIndexContent />} />
              {bluebayAdmRoutes}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
