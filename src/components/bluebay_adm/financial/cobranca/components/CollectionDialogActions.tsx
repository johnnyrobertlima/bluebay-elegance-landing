
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";

interface CollectionDialogActionsProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const CollectionDialogActions: React.FC<CollectionDialogActionsProps> = ({
  onClose,
  onConfirm
}) => {
  return (
    <AlertDialogFooter>
      <Button variant="outline" onClick={onClose}>Sair</Button>
      <Button onClick={onConfirm}>Realizar Cobrança</Button>
    </AlertDialogFooter>
  );
};
