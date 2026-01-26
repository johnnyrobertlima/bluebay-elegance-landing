import { Route } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import BluebayAdmHome from "@/pages/BluebayAdmHome";
import {
  BluebayAdmReports,
  BluebayAdmDashboard,
  BluebayAdmClients,
  BluebayAdmFinancial,
  BluebayAdmEstoque,
  BluebayAdmPedidos,
  BluebayAdmFinanceiroManager,
  BluebayAdmRequests,
  BluebayAdmAnaliseDeCompra,
  BluebayAdmDashboardComercial,
  BluebayAdmItemGrupoManagement,
  BluebayAdmEtiquetas,
  BluebayAdmLandingPage
} from "@/pages/bluebay_adm";
import BluebayAdmStockSalesAnalytics from "@/pages/bluebay_adm/BluebayAdmStockSalesAnalytics";
import BluebayAdmItemManagement from "@/pages/bluebay_adm/BluebayAdmItemManagement";

export const bluebayAdmRoutes = (
  <>
    <Route path="/client-area/bluebay_adm" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm">
        <BluebayAdmHome />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/reports" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/reports">
        <BluebayAdmReports />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/stock-sales-analytics" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/reports">
        <BluebayAdmStockSalesAnalytics />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/dashboard" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/dashboard">
        <BluebayAdmDashboard />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/dashboard_comercial" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/dashboard">
        <BluebayAdmDashboardComercial />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/clients" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/clients">
        <BluebayAdmClients />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/financial" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/financial">
        <BluebayAdmFinancial />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/estoque" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/estoque">
        <BluebayAdmEstoque />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/annalisedecompra" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/annalisedecompra">
        <BluebayAdmAnaliseDeCompra />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/pedidos" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/pedidos">
        <BluebayAdmPedidos />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/item-management" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/item-management">
        <BluebayAdmItemManagement />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/item-grupo-management" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/item-management">
        <BluebayAdmItemGrupoManagement />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/etiquetas" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/etiquetas">
        <BluebayAdmEtiquetas />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/financeiromanager" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/financeiromanager">
        <BluebayAdmFinanceiroManager />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/requests" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/requests">
        <BluebayAdmRequests />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/landing-page" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/dashboard">
        <BluebayAdmLandingPage />
      </PermissionGuard>
    } />
  </>
);
