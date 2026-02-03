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
  BluebayAdmLandingPage,
  BluebayAdmGestaoPaginas,
  BluebayAdmItemManagement,
  BluebayAdmGestaoCentroCusto,
  RepresentativeAnalysis
} from "@/pages/bluebay_adm";
import BluebayAdmStockSalesAnalytics from "@/pages/bluebay_adm/BluebayAdmStockSalesAnalytics";
import GestaoRelatorios from "@/pages/bluebay_adm/GestaoRelatorios";
import BluebayAdmSeasonPerformance from "@/pages/bluebay_adm/BluebayAdmSeasonPerformance";
import BluebayAdmWalletManagement from "@/pages/bluebay_adm/BluebayAdmWalletManagement";
import BluebayAdmDashboardDiretoria from "@/pages/bluebay_adm/BluebayAdmDashboardDiretoria";
import EANMaintenance from "@/pages/bluebay_adm/EANMaintenance";

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
      <PermissionGuard resourcePath="/client-area/bluebay_adm/stock-sales-analytics">
        <BluebayAdmStockSalesAnalytics />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/gestao-relatorios" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/gestao-relatorios">
        <GestaoRelatorios />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/dashboard" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/dashboard">
        <BluebayAdmDashboard />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/dashboard_comercial" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/dashboard_comercial">
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
        <BluebayAdmFinanceiroManager />
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
      <PermissionGuard resourcePath="/client-area/bluebay_adm/item-grupo-management">
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
      <PermissionGuard resourcePath="/client-area/bluebay_adm/landing-page">
        <BluebayAdmLandingPage />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/season-performance" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/season-performance">
        <BluebayAdmSeasonPerformance />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/wallet-management" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/wallet-management">
        <BluebayAdmWalletManagement />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/gestaopaginas" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/gestaopaginas">
        <BluebayAdmGestaoPaginas />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/gestaocentrocusto" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/gestaocentrocusto">
        <BluebayAdmGestaoCentroCusto />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/dashboard_diretoria" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/dashboard_diretoria">
        <BluebayAdmDashboardDiretoria />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/analise-representante" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/analise-representante">
        <RepresentativeAnalysis />
      </PermissionGuard>
    } />
    <Route path="/client-area/bluebay_adm/ean-maintenance" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm/ean-maintenance">
        <EANMaintenance />
      </PermissionGuard>
    } />
  </>
);
