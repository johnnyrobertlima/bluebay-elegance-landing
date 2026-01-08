
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClientSelectionBannerProps {
  selectedClient: string | null;
  onResetClientSelection: () => void;
}

export const ClientSelectionBanner: React.FC<ClientSelectionBannerProps> = ({
  selectedClient,
  onResetClientSelection
}) => {
  if (!selectedClient) return null;

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onResetClientSelection}
        className="flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para todos os clientes
      </Button>
    </div>
  );
};
