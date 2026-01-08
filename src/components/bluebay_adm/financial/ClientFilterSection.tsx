
import React from "react";
import { ClientFilterBadge } from "@/components/bluebay_adm/financial/ClientFilterBadge";

interface ClientFilterSectionProps {
  selectedClient: string | null;
  onResetClientSelection: () => void;
}

export const ClientFilterSection: React.FC<ClientFilterSectionProps> = ({
  selectedClient,
  onResetClientSelection
}) => {
  if (!selectedClient) return null;
  
  return (
    <ClientFilterBadge onReset={onResetClientSelection} />
  );
};
