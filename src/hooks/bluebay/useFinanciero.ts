import { useState, useEffect, useCallback, useMemo } from "react";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import { FinancialTitle, ClientDebtSummary } from "./types/financialTypes";
import { format, startOfDay, endOfDay } from "date-fns";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const useFinanciero = () => {
  const [titles, setTitles] = useState<FinancialTitle[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<FinancialTitle[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalVencido: 0,
    totalAVencer: 0,
    totalPago: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 30);
    const to = new Date(today);
    to.setDate(today.getDate() + 7);
    return { from, to };
  });
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [notaFilter, setNotaFilter] = useState<string>("");
  const [clientFinancialSummaries, setClientFinancialSummaries] = useState<ClientDebtSummary[]>([]);

  const pagination = usePagination(2000);

  const availableStatuses = ["todos", "vencidos", "a_vencer", "pagos"];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      let clientIds: string[] = [];
      if (clientFilter) {
        const { data: clientResults, error: clientSearchError } = await supabase
          .from("BLUEBAY_PESSOA")
          .select("PES_CODIGO")
          .or(`RAZAOSOCIAL.ilike.%${clientFilter}%,APELIDO.ilike.%${clientFilter}%`);

        if (clientSearchError) throw clientSearchError;
        clientIds = (clientResults || []).map(c => String(c.PES_CODIGO));

        if (clientIds.length === 0) {
          setTitles([]);
          setFilteredTitles([]);
          setClientFinancialSummaries([]);
          pagination.updateTotalCount(0);
          return;
        }
      }

      let query = supabase
        .from("BLUEBAY_TITULO")
        .select("PES_CODIGO, NUMNOTA, NUMDOCUMENTO, DTVENCIMENTO, DTEMISSAO, DTPAGTO, VLRTITULO, VLRSALDO, STATUS, ANOBASE, TIPO", { count: "exact" })
        .eq("TIPO", "R") // Receipts only
        .order("DTVENCIMENTO", { ascending: true });

      if (clientIds.length > 0) {
        query = query.in("PES_CODIGO", clientIds);
      }

      // Apply date filters if available
      if (dateRange.from) {
        query = query.gte("DTVENCIMENTO", format(dateRange.from, "yyyy-MM-dd"));
      }
      if (dateRange.to) {
        query = query.lte("DTVENCIMENTO", format(dateRange.to, "yyyy-MM-dd"));
      }

      // Apply status filters
      if (statusFilter === "vencidos") {
        query = query.lt("DTVENCIMENTO", format(new Date(), "yyyy-MM-dd")).is("DTPAGTO", null);
      } else if (statusFilter === "a_vencer") {
        query = query.gte("DTVENCIMENTO", format(new Date(), "yyyy-MM-dd")).is("DTPAGTO", null);
      } else if (statusFilter === "pagos") {
        query = query.not("DTPAGTO", "is", null);
      }

      // Apply text filters
      if (notaFilter) {
        query = query.eq("NUMNOTA", parseInt(notaFilter));
      }

      // Handle pagination
      const from = (pagination.currentPage - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch client names for the results
      const uniquePesCodigos = [...new Set((data || []).map(t => t.PES_CODIGO).filter(Boolean))];
      const clientMap = new Map<string, string>();

      if (uniquePesCodigos.length > 0) {
        const { data: clients, error: clientError } = await supabase
          .from("BLUEBAY_PESSOA")
          .select("PES_CODIGO, RAZAOSOCIAL, APELIDO")
          .in("PES_CODIGO", uniquePesCodigos.map(id => parseInt(id!)));

        if (clientError) console.error("Error fetching names:", clientError);
        clients?.forEach(c => {
          clientMap.set(String(c.PES_CODIGO), c.APELIDO || c.RAZAOSOCIAL || `Cliente ${c.PES_CODIGO}`);
        });
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const results = (data as any[]).map(t => {
        let status = t.STATUS;
        const isPaid = t.DTPAGTO !== null;
        const isOverdue = !isPaid && t.DTVENCIMENTO && t.DTVENCIMENTO < today;

        if (isPaid) status = "3";
        else if (isOverdue) status = "VENCIDO";
        else if (!isPaid) status = "1"; // Open/Pending

        return {
          ...t,
          STATUS: status,
          CLIENTE_NOME: clientMap.get(String(t.PES_CODIGO)) || "Desconhecido"
        };
      }) as FinancialTitle[];

      setTitles(results);
      setFilteredTitles(results);

      if (count !== null) {
        pagination.updateTotalCount(count);
        setHasMorePages(count > pagination.currentPage * pagination.pageSize);
      }

      // Fetch client summaries using RPC
      const { data: clientsData, error: clientsError } = await supabase
        .rpc('get_client_financial_summaries', {
          p_status_filter: statusFilter,
          p_client_filter: clientFilter || null,
          p_date_from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : null,
          p_date_to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null,
          p_nota_filter: notaFilter || null
        });

      if (clientsData) {
        setClientFinancialSummaries((clientsData as any[]).map(c => ({
          PES_CODIGO: c.PES_CODIGO,
          CLIENTE_NOME: c.CLIENTE_NOME,
          totalVencido: Number(c.totalVencido),
          totalAVencer: Number(c.totalAVencer),
          totalPago: Number(c.totalPago),
          TOTAL_SALDO: Number(c.totalVencido) + Number(c.totalAVencer),
          QUANTIDADE_TITULOS: 0,
          DIAS_VENCIDO_MAX: 0
        })));
      } else {
        setClientFinancialSummaries([]);
      }

      // Calculate totals using RPC for accuracy across all pages
      const { data: totalsData, error: totalsError } = await supabase
        .rpc('get_financial_totals', {
          p_status_filter: statusFilter,
          p_client_filter: clientFilter || null,
          p_date_from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : null,
          p_date_to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null,
          p_nota_filter: notaFilter || null
        });

      if (totalsData) {
        const data = totalsData as any; // Cast to any or define an interface for the RPC result
        setFinancialSummary({
          totalVencido: Number(data.totalVencido || 0),
          totalAVencer: Number(data.totalAVencer || 0),
          totalPago: Number(data.totalPago || 0)
        });
      }

    } catch (error) {
      console.error("Error loading financial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, statusFilter, clientFilter, notaFilter, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateDateRange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const updateStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const updateClientFilter = useCallback((client: string) => {
    setClientFilter(client);
  }, []);

  const updateNotaFilter = useCallback((nota: string) => {
    setNotaFilter(nota);
  }, []);

  return {
    titles,
    filteredTitles,
    filteredInvoices,
    isLoading,
    isLoadingMore,
    hasMorePages,
    financialSummary,
    clientFinancialSummaries,
    dateRange,
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    pagination,
    refreshData: loadData
  };
};
