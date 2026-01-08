
import React, { useEffect, useState } from "react";

interface FinancialSummaryProps {
  filteredTitles: any[];
  selectedClient: string | null;
  onSummaryCalculated: (summary: {
    totalValoresVencidos: number;
    totalPago: number;
    totalEmAberto: number;
  }) => void;
}

export const FinancialSummaryCalculator: React.FC<FinancialSummaryProps> = ({
  filteredTitles,
  selectedClient,
  onSummaryCalculated
}) => {
  // Calcular o resumo financeiro baseado nos títulos filtrados
  useEffect(() => {
    const today = new Date();
    // Remover a hora, minutos e segundos para comparar apenas as datas
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let totalPago = 0;
    let totalEmAberto = 0;
    let totalValoresVencidos = 0;

    // Obter os títulos que devem ser considerados (todos filtrados ou apenas os do cliente)
    const titlesToCalculate = selectedClient 
      ? filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient)
      : filteredTitles;
    
    // Processar títulos para cálculo de resumo, excluindo títulos cancelados (status '4')
    titlesToCalculate
      .filter(title => title.STATUS !== '4') // Excluir títulos cancelados
      .forEach(title => {
        // Verifica se há data de vencimento e prepara para comparação
        let vencimentoDate = null;
        if (title.DTVENCIMENTO) {
          const vencimento = new Date(title.DTVENCIMENTO);
          vencimentoDate = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
        }
        
        const vlrTitulo = title.VLRTITULO || 0;
        const vlrSaldo = title.VLRSALDO || 0;
        
        // Verificar se o título está pago
        if (title.STATUS === '3') { // Status 3 = Pago
          totalPago += vlrTitulo;
        } else if (title.STATUS === 'VENCIDO') {
          // Status VENCIDO: saldo disponível em títulos vencidos
          totalValoresVencidos += vlrSaldo;
        } else if (vlrSaldo > 0) {
          // Para outros status com saldo, verificar se está vencido ou em aberto
          if (!vencimentoDate || vencimentoDate < todayDateOnly) {
            // Se vencido mas não marcado como VENCIDO (por segurança), conta como vencido
            totalValoresVencidos += vlrSaldo;
          } else {
            // Valores EM ABERTO: data de vencimento é hoje ou futura
            totalEmAberto += vlrSaldo;
          }
        }
      });

    onSummaryCalculated({
      totalValoresVencidos,
      totalPago,
      totalEmAberto
    });
  }, [filteredTitles, selectedClient, onSummaryCalculated]);

  return null; // Este é um componente funcional sem renderização
};
