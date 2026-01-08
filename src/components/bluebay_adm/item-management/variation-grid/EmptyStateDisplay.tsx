
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type EmptyStateType = "no-item" | "item-not-found" | "no-data";

interface EmptyStateDisplayProps {
  type: EmptyStateType;
  details?: string;
}

export const EmptyStateDisplay = ({ type, details }: EmptyStateDisplayProps) => {
  let title = "";
  let description = "";

  switch (type) {
    case "no-item":
      title = "Sem Código de Item";
      description = "Selecione um item para gerenciar suas variações.";
      break;
    case "item-not-found":
      title = "Item Não Encontrado";
      description = "O item selecionado não foi encontrado no banco de dados ou não possui valores de matriz/filial corretos.";
      if (details) {
        description += ` ${details}`;
      }
      break;
    case "no-data":
      title = "Não Há Dados";
      description = "Não foram encontradas cores ou tamanhos cadastrados no sistema. Por favor, cadastre-os primeiro.";
      break;
  }

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  );
};
