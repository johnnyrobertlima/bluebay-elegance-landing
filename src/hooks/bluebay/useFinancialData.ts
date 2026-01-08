
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialTitle } from "./types/financialTypes";

export interface ConsolidatedInvoice {
  NUMNOTA: number;
  NOTA?: string;
  PES_CODIGO: string;
  CLIENTE_NOME: string;
  DTEMISSAO: string;
  DATA_EMISSAO?: string;
  totalTitulos: number;
  valorTotal: number;
  VALOR_NOTA?: number;
  valorPago: number;
  valorPendente: number;
}

export const useFinancialData = (pesCodigoFilter?: string) => {
  const { data: titles, isLoading, error, refetch } = useQuery({
    queryKey: ["financial-titles", pesCodigoFilter],
    queryFn: async () => {
      let query = supabase
        .from("BLUEBAY_TITULO")
        .select("*")
        .eq("TIPO", "R")
        .order("DTVENCIMENTO", { ascending: true });

      if (pesCodigoFilter) {
        query = query.eq("PES_CODIGO", pesCodigoFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FinancialTitle[];
    },
  });

  const consolidateByInvoice = (titles: FinancialTitle[]): ConsolidatedInvoice[] => {
    const invoiceMap = new Map<number, ConsolidatedInvoice>();

    titles.forEach((title) => {
      const numNota = title.NUMNOTA;
      if (!numNota) return;

      const existing = invoiceMap.get(numNota);
      if (existing) {
        existing.totalTitulos += 1;
        existing.valorTotal += title.VLRTITULO || 0;
        existing.valorPago += title.DTPAGTO ? (title.VLRTITULO || 0) : 0;
        existing.valorPendente += !title.DTPAGTO ? (title.VLRSALDO || 0) : 0;
      } else {
        invoiceMap.set(numNota, {
          NUMNOTA: numNota,
          NOTA: String(numNota),
          PES_CODIGO: title.PES_CODIGO || "",
          CLIENTE_NOME: title.CLIENTE_NOME || "",
          DTEMISSAO: title.DTEMISSAO || "",
          DATA_EMISSAO: title.DTEMISSAO || "",
          totalTitulos: 1,
          valorTotal: title.VLRTITULO || 0,
          VALOR_NOTA: title.VLRTITULO || 0,
          valorPago: title.DTPAGTO ? (title.VLRTITULO || 0) : 0,
          valorPendente: !title.DTPAGTO ? (title.VLRSALDO || 0) : 0,
        });
      }
    });

    return Array.from(invoiceMap.values());
  };

  return {
    titles: titles || [],
    consolidatedInvoices: titles ? consolidateByInvoice(titles) : [],
    isLoading,
    error,
    refetch,
  };
};
