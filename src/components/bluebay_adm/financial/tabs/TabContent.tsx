
import React from "react";
import { TitleTable } from "../TitleTable";
import { InvoiceTable } from "../InvoiceTable";
import { ClientFinancialTable } from "../ClientFinancialTable";
import { ClientesVencidosTable } from "../ClientesVencidosTable";
import { CobrancaTable } from "../CobrancaTable";
import { CollectedTitlesTable } from "../CollectedTitlesTable";
import { OrigemTable } from "../OrigemTable";
import { CobrancaToggleButton } from "./CobrancaToggleButton";

interface TabContentProps {
  activeTab: string;
  clientFilteredTitles: any[];
  filteredTitles: any[];
  clientFinancialSummaries: any[] | null;
  isLoading: boolean;
  handleClientSelect: (clientCode: string) => void;
  collectedClients?: string[];
  collectionRecords?: any[];
  showCollectedOnly?: boolean;
  onToggleCollectedView?: () => void;
  onCollectionStatusChange?: (clientCode: string, clientName: string, status: string) => void;
  onResetCollectionStatus?: (clientCode: string) => void;
  onResetAllCollectionStatus?: () => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  clientFilteredTitles,
  filteredTitles,
  clientFinancialSummaries,
  isLoading,
  handleClientSelect,
  collectedClients = [],
  collectionRecords = [],
  showCollectedOnly = false,
  onToggleCollectedView,
  onCollectionStatusChange,
  onResetCollectionStatus,
  onResetAllCollectionStatus
}) => {
  switch (activeTab) {
    case "titles":
      return (
        <TitleTable
          titles={clientFilteredTitles}
          isLoading={isLoading}
        />
      );
    case "clients":
      return (
        <ClientFinancialTable
          clients={clientFinancialSummaries || []}
          isLoading={isLoading}
          onClientSelect={handleClientSelect}
        />
      );
    case "clientesVencidos":
      return (
        <ClientesVencidosTable
          titles={filteredTitles}
          isLoading={isLoading}
          onClientSelect={handleClientSelect}
        />
      );
    case "cobranca":
      return (
        <div className="space-y-4">
          {onToggleCollectedView && (
            <div className="flex justify-end mb-4">
              <CobrancaToggleButton 
                showCollectedOnly={showCollectedOnly}
                onToggle={onToggleCollectedView}
              />
            </div>
          )}
          
          <CobrancaTable
            titles={filteredTitles}
            isLoading={isLoading}
            onClientSelect={handleClientSelect}
            onCollectionStatusChange={(clientCode, status) => {
              const client = filteredTitles.find(t => String(t.PES_CODIGO) === clientCode);
              if (client && onCollectionStatusChange) {
                onCollectionStatusChange(clientCode, client.CLIENTE_NOME, status);
              }
            }}
            collectedClients={collectedClients}
            showCollected={showCollectedOnly}
          />
        </div>
      );
    case "cobrados":
      return (
        <CollectedTitlesTable
          records={collectionRecords}
          onResetRecord={onResetCollectionStatus || (() => {})}
          onResetAll={onResetAllCollectionStatus || (() => {})}
        />
      );
    case "origem":
      return (
        <OrigemTable
          titles={clientFilteredTitles}
          isLoading={isLoading}
        />
      );
    default:
      return <div>Conteúdo não encontrado</div>;
  }
};
