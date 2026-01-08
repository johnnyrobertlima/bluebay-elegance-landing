
import React from "react";
import { FinancialTitle, ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { calculateClientSummaries, sortClientSummaries } from "../utils/debtSummaryUtils";
import { ClientSummaryRow } from "../ClientSummaryRow";
import { TableRow, TableCell } from "@/components/ui/table";
import { ClientDetailedTitles } from "../ClientDetailedTitles";

interface ClientSummariesProcessorProps {
  filteredTitles: FinancialTitle[];
  expandedClients: Set<string | number>;
  collectedClients: string[];
  onToggleExpand: (clientCode: string | number) => void;
  onOpenCollectionDialog: (client: ClientDebtSummary) => void;
}

export const ClientSummariesProcessor: React.FC<ClientSummariesProcessorProps> = ({
  filteredTitles,
  expandedClients,
  collectedClients,
  onToggleExpand,
  onOpenCollectionDialog
}) => {
  // Group by client and calculate totals
  const clientSummaries = calculateClientSummaries(filteredTitles);
  
  // Convert to array and sort by total balance descending
  const sortedClientSummaries = sortClientSummaries(clientSummaries);

  return (
    <>
      {sortedClientSummaries.map((summary) => {
        const isExpanded = expandedClients.has(summary.PES_CODIGO);
        const clientTitles = filteredTitles.filter(
          title => String(title.PES_CODIGO) === String(summary.PES_CODIGO)
        );
        const isCollected = collectedClients.includes(String(summary.PES_CODIGO));
        
        return (
          <React.Fragment key={summary.PES_CODIGO}>
            <ClientSummaryRow
              isExpanded={isExpanded}
              summary={summary}
              isCollected={isCollected}
              onToggleExpand={() => onToggleExpand(summary.PES_CODIGO)}
              onOpenCollectionDialog={() => onOpenCollectionDialog(summary)}
            />
            
            {isExpanded && (
              <TableRow className="bg-muted/20">
                <TableCell colSpan={7} className="p-0">
                  <ClientDetailedTitles clientTitles={clientTitles} />
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
