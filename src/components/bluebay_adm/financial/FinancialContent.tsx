
import React from "react";
import { FinancialTabs } from "./FinancialTabs";
import { DateRange } from "@/hooks/bluebay/types/financialTypes";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { FinancialFilters } from "./FinancialFilters";
import { ClientSelectionBanner } from "./ClientSelectionBanner";
import { TabContent } from "./tabs/TabContent";
import { getTabDefinitions } from "./tabs/TabDefinitions";

interface FinancialContentProps {
  isLoading: boolean;
  filteredSummary: {
    totalValoresVencidos: number;
    totalPago: number;
    totalEmAberto: number;
  };
  selectedClient: string | null;
  statusFilter: string;
  updateStatusFilter: (status: string) => void;
  availableStatuses: string[];
  clientFilter: string;
  updateClientFilter: (client: string) => void;
  notaFilter: string;
  updateNotaFilter: (nota: string) => void;
  dateRange: DateRange;
  updateDateRange: (dateRange: DateRange) => void;
  handleResetClientSelection: () => void;
  handleClientSelect: (clientCode: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  clientFilteredTitles: any[];
  filteredTitles: any[];
  clientFinancialSummaries: any[] | null;
  collectedClients?: string[];
  collectionRecords?: any[];
  showCollectedOnly?: boolean;
  onToggleCollectedView?: () => void;
  onCollectionStatusChange?: (clientCode: string, clientName: string, status: string) => void;
  onResetCollectionStatus?: (clientCode: string) => void;
  onResetAllCollectionStatus?: () => void;
}

export const FinancialContent: React.FC<FinancialContentProps> = ({
  isLoading,
  filteredSummary,
  selectedClient,
  statusFilter,
  updateStatusFilter,
  availableStatuses,
  clientFilter,
  updateClientFilter,
  notaFilter,
  updateNotaFilter,
  dateRange,
  updateDateRange,
  handleResetClientSelection,
  handleClientSelect,
  activeTab,
  setActiveTab,
  clientFilteredTitles,
  filteredTitles,
  clientFinancialSummaries,
  collectedClients = [],
  collectionRecords = [],
  showCollectedOnly = false,
  onToggleCollectedView,
  onCollectionStatusChange,
  onResetCollectionStatus,
  onResetAllCollectionStatus
}) => {
  const renderTabContent = () => {
    return (
      <TabContent
        activeTab={activeTab}
        clientFilteredTitles={clientFilteredTitles}
        filteredTitles={filteredTitles}
        clientFinancialSummaries={clientFinancialSummaries}
        isLoading={isLoading}
        handleClientSelect={handleClientSelect}
        collectedClients={collectedClients}
        collectionRecords={collectionRecords}
        showCollectedOnly={showCollectedOnly}
        onToggleCollectedView={onToggleCollectedView}
        onCollectionStatusChange={onCollectionStatusChange}
        onResetCollectionStatus={onResetCollectionStatus}
        onResetAllCollectionStatus={onResetAllCollectionStatus}
      />
    );
  };

  const getTabDefinitionsWithContent = () => {
    const tabDefs = getTabDefinitions();
    
    return tabDefs.map(tab => ({
      ...tab,
      content: renderTabContent()
    }));
  };

  return (
    <div className="space-y-4">
      {/* Financial summary cards */}
      <FinancialSummaryCards 
        totalValoresVencidos={filteredSummary.totalValoresVencidos}
        totalPago={filteredSummary.totalPago}
        totalEmAberto={filteredSummary.totalEmAberto}
        label={selectedClient ? "Cliente Selecionado" : undefined}
      />

      {/* Filters section */}
      <FinancialFilters
        statusFilter={statusFilter}
        onStatusChange={updateStatusFilter}
        statuses={availableStatuses}
        clientFilter={clientFilter}
        onClientFilterChange={updateClientFilter}
        notaFilter={notaFilter}
        onNotaFilterChange={updateNotaFilter}
        dateRange={dateRange}
        onDateRangeUpdate={updateDateRange}
      />

      <ClientSelectionBanner 
        selectedClient={selectedClient}
        onResetClientSelection={handleResetClientSelection}
      />

      <FinancialTabs
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value)}
        tabs={getTabDefinitionsWithContent()}
      />
    </div>
  );
};
