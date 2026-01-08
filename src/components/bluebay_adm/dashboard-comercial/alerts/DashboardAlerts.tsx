
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { FaturamentoItem } from "@/services/bluebay/dashboardComercialTypes";

interface DashboardAlertsProps {
  hasData: boolean;
  isLoading: boolean;
  naoIdentificados: FaturamentoItem[];
}

export const DashboardAlerts = ({
  hasData,
  isLoading,
  naoIdentificados
}: DashboardAlertsProps) => {
  // Don't show alerts while loading
  if (isLoading) {
    return null;
  }

  const totalNaoIdentificados = naoIdentificados?.length || 0;
  const showNaoIdentificadosAlert = totalNaoIdentificados > 0;
  
  // Safe find function with null checks to avoid "Cannot read properties of undefined" error
  const findValidItemWithNota = (items: FaturamentoItem[] | undefined | null) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    
    // First try to find an item with both ITEM_CODIGO and NOTA
    let item = items.find(i => i && i.NOTA && i.ITEM_CODIGO);
    
    // If not found, just find any item with NOTA
    if (!item) item = items.find(i => i && i.NOTA);
    
    // If still not found, return the first valid item
    if (!item) item = items.find(i => i !== null && i !== undefined);
    
    return item || null;
  };
  
  // Get a sample of the first non-identified item for the alert example with enhanced safety
  const exemploItem = findValidItemWithNota(naoIdentificados);
  
  // Se não houver dados, exibir mensagem informativa
  if (!hasData) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum dado encontrado</AlertTitle>
        <AlertDescription>
          Não foram encontrados registros para o período selecionado.
          Tente alterar o intervalo de datas ou verifique se há dados disponíveis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {showNaoIdentificadosAlert && (
        <Alert className="mb-6" variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Itens sem Centro de Custo</AlertTitle>
          <AlertDescription>
            Foram encontrados {totalNaoIdentificados} itens sem Centro de Custo definido.
            {exemploItem && (
              <span className="block mt-1">
                Exemplo: Nota {exemploItem.NOTA || 'N/A'} 
                {exemploItem.ITEM_CODIGO ? ` - Item ${exemploItem.ITEM_CODIGO}` : ''}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
