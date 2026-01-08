
import { FinancialTitle, ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { differenceInDays } from "date-fns";

/**
 * Calculates client debt summaries from filtered financial titles
 * @param filteredTitles Array of financial titles
 * @returns Record of client debt summaries indexed by client code
 */
export const calculateClientSummaries = (
  filteredTitles: FinancialTitle[]
): Record<string | number, ClientDebtSummary> => {
  const clientSummaries: Record<string | number, ClientDebtSummary> = {};
  
  filteredTitles.forEach(title => {
    const clientKey = String(title.PES_CODIGO);
    
    if (!clientSummaries[clientKey]) {
      clientSummaries[clientKey] = {
        PES_CODIGO: title.PES_CODIGO,
        CLIENTE_NOME: title.CLIENTE_NOME || "",
        TOTAL_SALDO: 0,
        DIAS_VENCIDO_MAX: 0,
        QUANTIDADE_TITULOS: 0
      };
    }
    
    const summary = clientSummaries[clientKey];
    summary.TOTAL_SALDO += title.VLRSALDO;
    summary.QUANTIDADE_TITULOS++;
    
    // Calculate days overdue and track maximum
    if (title.DTVENCIMENTO) {
      const vencimentoDate = new Date(title.DTVENCIMENTO);
      const diasVencido = differenceInDays(new Date(), vencimentoDate);
      
      // Update maximum overdue days if this title is older
      if (diasVencido > summary.DIAS_VENCIDO_MAX) {
        summary.DIAS_VENCIDO_MAX = diasVencido;
      }
    }
  });
  
  return clientSummaries;
};

/**
 * Sorts client summaries by total balance in descending order
 * @param clientSummaries Record of client debt summaries
 * @returns Array of sorted client debt summaries
 */
export const sortClientSummaries = (
  clientSummaries: Record<string | number, ClientDebtSummary>
): ClientDebtSummary[] => {
  return Object.values(clientSummaries).sort((a, b) => 
    b.TOTAL_SALDO - a.TOTAL_SALDO
  );
};

/**
 * Filters titles to include only overdue unpaid ones
 * @param titles Array of financial titles
 * @returns Array of filtered financial titles
 */
export const filterOverdueUnpaidTitles = (titles: FinancialTitle[]): FinancialTitle[] => {
  return titles.filter(title => {
    const isPaid = title.STATUS === '3'; // Status 3 = Paid
    const isCanceled = title.STATUS === '4'; // Status 4 = Canceled
    const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
    const isOverdue = vencimentoDate && vencimentoDate < new Date();
    
    return !isPaid && !isCanceled && isOverdue && title.VLRSALDO > 0;
  });
};
