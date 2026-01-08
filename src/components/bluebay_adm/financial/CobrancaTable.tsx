
import React, { useState } from "react";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { useToast } from "@/components/ui/use-toast";
import { ClientDetailedTitles } from "./cobranca/ClientDetailedTitles";
import { CollectionMessageDialog } from "./cobranca/CollectionMessageDialog";
import { ClientSummaryRow } from "./cobranca/ClientSummaryRow";
import { sortClientSummaries, filterOverdueUnpaidTitles } from "./cobranca/utils/debtSummaryUtils";
import { useClientEmails } from "./cobranca/hooks/useClientEmails";
import { CobrancaTableHeader } from "./cobranca/components/CobrancaTableHeader";
import { EmptyTitlesMessage } from "./cobranca/components/EmptyTitlesMessage";
import { ClientSummariesProcessor } from "./cobranca/components/ClientSummariesProcessor";

interface CobrancaTableProps {
  titles: any[];
  isLoading: boolean;
  onClientSelect: (clientCode: string) => void;
  onCollectionStatusChange?: (clientCode: string, status: string) => void;
  collectedClients?: string[];
  showCollected?: boolean;
}

export const CobrancaTable: React.FC<CobrancaTableProps> = ({ 
  titles, 
  isLoading,
  onClientSelect,
  onCollectionStatusChange,
  collectedClients = [],
  showCollected = false
}) => {
  const [expandedClients, setExpandedClients] = useState<Set<string | number>>(new Set());
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDebtSummary | null>(null);
  const { toast } = useToast();
  const { clientsEmailsMap } = useClientEmails(titles);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  // Filter only overdue unpaid titles
  const overdueUnpaidTitles = filterOverdueUnpaidTitles(titles);

  // Apply collected clients filter
  const filteredTitles = showCollected 
    ? overdueUnpaidTitles.filter(title => collectedClients.includes(String(title.PES_CODIGO)))
    : overdueUnpaidTitles.filter(title => !collectedClients.includes(String(title.PES_CODIGO)));

  if (filteredTitles.length === 0) {
    return <EmptyTitlesMessage showCollected={showCollected} />;
  }

  const toggleClientExpand = (clientCode: string | number) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientCode)) {
        newSet.delete(clientCode);
      } else {
        newSet.add(clientCode);
      }
      return newSet;
    });
  };

  const handleOpenCollectionDialog = (client: ClientDebtSummary) => {
    // Adicionar o email do cliente ao objeto selecionado
    const clientWithEmail = {
      ...client,
      CLIENTE_EMAIL: clientsEmailsMap[String(client.PES_CODIGO)] || ""
    };
    
    setSelectedClient(clientWithEmail);
    setIsMessageDialogOpen(true);
  };

  const handleCloseCollectionDialog = () => {
    setIsMessageDialogOpen(false);
    setSelectedClient(null);
  };

  const handleCollection = () => {
    if (selectedClient && onCollectionStatusChange) {
      onCollectionStatusChange(String(selectedClient.PES_CODIGO), "Cobrança realizada");
      toast({
        title: "Cobrança registrada",
        description: `A cobrança para ${selectedClient.CLIENTE_NOME} foi registrada com sucesso.`,
      });
    }
    setIsMessageDialogOpen(false);
    setSelectedClient(null);
  };

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <CobrancaTableHeader />
          </TableHeader>
          <TableBody>
            <ClientSummariesProcessor 
              filteredTitles={filteredTitles}
              expandedClients={expandedClients}
              collectedClients={collectedClients}
              onToggleExpand={toggleClientExpand}
              onOpenCollectionDialog={handleOpenCollectionDialog}
            />
          </TableBody>
        </Table>
      </div>

      {selectedClient && (
        <CollectionMessageDialog
          isOpen={isMessageDialogOpen}
          onClose={handleCloseCollectionDialog}
          selectedClient={selectedClient}
          clientTitles={filteredTitles.filter(
            title => String(title.PES_CODIGO) === String(selectedClient.PES_CODIGO)
          )}
          onCollectionConfirm={handleCollection}
        />
      )}
    </>
  );
};
