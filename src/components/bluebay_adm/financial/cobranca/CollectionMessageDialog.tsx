
import React from "react";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogDescription 
} from "@/components/ui/alert-dialog";
import { ClientDebtSummary, FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { useCollectionMessage } from "./hooks/useCollectionMessage";
import { CollectionMessageContent } from "./components/CollectionMessageContent";
import { CollectionDialogActions } from "./components/CollectionDialogActions";

interface CollectionMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient: ClientDebtSummary | null;
  clientTitles: FinancialTitle[];
  onCollectionConfirm: () => void;
}

export const CollectionMessageDialog: React.FC<CollectionMessageDialogProps> = ({
  isOpen,
  onClose,
  selectedClient,
  clientTitles,
  onCollectionConfirm
}) => {
  const { 
    isSending, 
    handleCopyText, 
    handleOpenOutlookWeb,
    handleSendMailto
  } = useCollectionMessage(selectedClient, clientTitles, onCollectionConfirm);

  if (!selectedClient) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Mensagem de Cobrança - {selectedClient.CLIENTE_NOME}</AlertDialogTitle>
          <AlertDialogDescription>
            Utilize as opções abaixo para enviar uma mensagem de cobrança para o cliente {selectedClient.CLIENTE_NOME}.
            Você pode copiar o texto ou abrir diretamente no Outlook Web.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <CollectionMessageContent 
          clientName={selectedClient.CLIENTE_NOME}
          clientTitles={clientTitles}
          onCopy={handleCopyText}
          onSendEmail={handleOpenOutlookWeb}
          onSendMailto={handleSendMailto}
          isSending={isSending}
        />
        
        <CollectionDialogActions 
          onClose={onClose}
          onConfirm={onCollectionConfirm}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};
