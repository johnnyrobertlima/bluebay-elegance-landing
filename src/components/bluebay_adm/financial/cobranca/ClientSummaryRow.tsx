
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { ExpandToggle } from "./components/ExpandToggle";
import { ClientSummaryInfo } from "./components/ClientSummaryInfo";
import { CollectionButton } from "./components/CollectionButton";

interface ClientSummaryRowProps {
  isExpanded: boolean;
  summary: ClientDebtSummary;
  isCollected: boolean;
  onToggleExpand: () => void;
  onOpenCollectionDialog: () => void;
}

export const ClientSummaryRow: React.FC<ClientSummaryRowProps> = ({
  isExpanded,
  summary,
  isCollected,
  onToggleExpand,
  onOpenCollectionDialog,
}) => {
  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={onToggleExpand}>
      <TableCell>
        <ExpandToggle isExpanded={isExpanded} />
      </TableCell>
      <ClientSummaryInfo summary={summary} />
      <TableCell className="text-right">
        <CollectionButton 
          isCollected={isCollected} 
          onClick={(e) => {
            e.stopPropagation();
            onOpenCollectionDialog();
          }}
        />
      </TableCell>
    </TableRow>
  );
};
