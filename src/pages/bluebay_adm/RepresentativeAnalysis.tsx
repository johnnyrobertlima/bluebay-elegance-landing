
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BluebayAdmMenu } from '@/components/bluebay_adm/BluebayAdmMenu';
import { DashboardComercialData, ProductCategoryStat, ClientStat, RepresentativeOrder, RepresentativeOrderItem } from '@/service/bluebay/dashboardComercialTypes';
import { fetchDashboardStats, fetchProductStats, fetchClientStats, fetchRepresentativeOrdersList, fetchRepresentativeOrderItems, fetchRepresentativeInvoices } from '@/service/bluebay/dashboardComercialService';
import { format, subDays, subMonths, startOfMonth, startOfYear, subYears } from 'date-fns';
import { Loader2, Search, DollarSign, ShoppingCart, UserPlus, BarChart3, Calendar, Filter, Download, ArrowLeftRight, ChevronDown, ChevronUp, Box, FileText, MoreHorizontal, Banknote, FileSpreadsheet, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AsyncFilter } from '@/components/bluebay_adm/dashboard-comercial/AsyncFilter';
import { formatCurrency } from '@/utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ClientPortfolioDialog } from '@/components/bluebay_adm/dashboard-comercial/ClientPortfolioDialog';
import { supabase } from "@/integrations/supabase/client";

const RepresentativeAnalysis = () => {
    // --- State ---
    const [selectedRepresentative, setSelectedRepresentative] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '6m' | '1y' | '3y'>('30d');
    const [mixDisplayMode, setMixDisplayMode] = useState<'categoria' | 'produto'>('categoria');
    const [clientDisplayMode, setClientDisplayMode] = useState<'apelido' | 'grupo'>('apelido');
    const [selectedMixItem, setSelectedMixItem] = useState<string | null>(null);
    const [orderSearch, setOrderSearch] = useState('');
    const [isClientModalOpen, setIsClientModalOpen] = useState(false); // Used for "View All"
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'pedidos', direction: 'desc' });
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [dashboardData, setDashboardData] = useState<DashboardComercialData | null>(null);
    const [productStats, setProductStats] = useState<ProductCategoryStat[]>([]);
    const [clientStats, setClientStats] = useState<ClientStat[]>([]);
    const [clientMetrics, setClientMetrics] = useState({ active_clients: 0, portfolio_clients: 0, new_clients: 0 });
    const [ordersList, setOrdersList] = useState<RepresentativeOrder[]>([]);

    // Expansion State
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<Record<string, RepresentativeOrderItem[]>>({});
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
    const [showTotalOrders, setShowTotalOrders] = useState(false);
    const [showCancelledOrders, setShowCancelledOrders] = useState(false);
    const [showFaturadoOrders, setShowFaturadoOrders] = useState(false);

    // Faturamento Modal State
    const [isFaturamentoModalOpen, setIsFaturamentoModalOpen] = useState(false);
    const [faturamentoDetails, setFaturamentoDetails] = useState<any[]>([]);
    const [loadingFaturamento, setLoadingFaturamento] = useState(false);

    const TREEMAP_COLORS = [
        "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57",
        "#ffc658", "#ff8042", "#ffbb28", "#ff7300", "#d0ed57"
    ];

    // --- Handlers ---
    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handlePeriodChange = (period: '30d' | '6m' | '1y' | '3y') => {
        setSelectedPeriod(period);
        setSelectedMixItem(null);
        const today = new Date();
        let start = subDays(today, 30);

        switch (period) {
            case '30d': start = subDays(today, 30); break;
            case '6m': start = subMonths(today, 6); break;
            case '1y': start = subDays(today, 365); break;
            case '3y': start = subDays(today, 365 * 3); break;
        }
        setStartDate(start);
        setEndDate(today);
    };

    const handleRepChange = (val: string | null) => {
        setSelectedRepresentative(val ? [val] : []);
        setSelectedMixItem(null);
    };

    // --- Faturamento Modal ---
    // Fix: Updated service to use correct column alias
    const handleOpenFaturamentoModal = async () => {
        if (!selectedRepresentative[0]) return;
        setIsFaturamentoModalOpen(true);
        setLoadingFaturamento(true);
        try {
            const data = await fetchRepresentativeInvoices(Number(selectedRepresentative[0]), startDate, endDate);
            setFaturamentoDetails(data);
        } catch (error) {
            console.error("Error loading invoices", error);
        } finally {
            setLoadingFaturamento(false);
        }
    };

    const exportFaturamentoPDF = () => {
        const doc = new jsPDF();
        const repName = getRepName();
        doc.text(`Detalhamento de Faturamento - ${repName}`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`, 14, 22);

        autoTable(doc, {
            startY: 28,
            head: [['Data', 'Nota', 'Grupo', 'Apelido', 'Razão Social', 'Valor']],
            body: faturamentoDetails.slice(0, 500).map(i => [
                format(new Date(i.data_emissao), 'dd/MM/yyyy'),
                i.nota || '-',
                i.grupo_economico || i.centrocusto || 'N/A',
                i.apelido || 'N/A',
                i.razaosocial?.substring(0, 30) || 'N/A',
                formatCurrency(i.valor_nota)
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 102, 173] }
        });
        doc.save(`Faturamento_Detalhado_${repName}.pdf`);
    };

    const handleExpandOrder = async (uniqueKey: string, matriz: number, filial: number, orderNum: string, orderYear: number) => {
        if (expandedOrderId === uniqueKey) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(uniqueKey);

        if (!orderItems[uniqueKey]) {
            setLoadingItems(prev => new Set(prev).add(uniqueKey));
            try {
                const items = await fetchRepresentativeOrderItems(matriz, filial, orderNum, orderYear);
                setOrderItems(prev => ({ ...prev, [uniqueKey]: items }));
            } catch (err) {
                console.error("Error loading items", err);
            } finally {
                setLoadingItems(prev => {
                    const next = new Set(prev);
                    next.delete(uniqueKey);
                    return next;
                });
            }
        }
    };

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        if (selectedRepresentative.length === 0) {
            setDashboardData(null);
            setProductStats([]);
            setClientStats([]);
            setClientMetrics({ active_clients: 0, portfolio_clients: 0, new_clients: 0 });
            setOrdersList([]);
            return;
        }

        setIsLoading(true);

        try {
            const repId = parseInt(selectedRepresentative[0]);
            const controller = new AbortController();
            const signal = controller.signal;
            const { fetchRepresentativeClientMetrics } = await import("@/services/bluebay/dashboardComercialService");

            const [mainStats, prodStats, cliStats, cliMetrics, orders] = await Promise.all([
                fetchDashboardStats(startDate, endDate, null, selectedRepresentative, [], [], signal),
                fetchProductStats(startDate, endDate, null, selectedRepresentative, [], []),
                fetchClientStats(startDate, endDate, null, selectedRepresentative, [], []),
                fetchRepresentativeClientMetrics(repId, startDate, endDate),
                fetchRepresentativeOrdersList(repId, startDate, endDate)
            ]);

            const formattedData: DashboardComercialData = {
                dailyFaturamento: mainStats.dailyFaturamento || [],
                monthlyFaturamento: mainStats.monthlyFaturamento || [],
                totalFaturado: mainStats.totalFaturado || 0,
                totalItens: mainStats.totalItens || 0,
                mediaValorItem: mainStats.mediaValorItem || 0,
                faturamentoItems: [],
                pedidoItems: [],
                costCenterStats: mainStats.costCenterStats || [],
                representativeStats: mainStats.representativeStats || [],
                dataRangeInfo: mainStats.dataRangeInfo || { startDateRequested: '', endDateRequested: '', startDateActual: null, endDateActual: null, hasCompleteData: false },
                totals: mainStats.totals
            };

            setDashboardData(formattedData);
            setProductStats(prodStats);
            setClientStats(cliStats);
            setClientMetrics(cliMetrics);
            setOrdersList(orders as RepresentativeOrder[]);
        } catch (error) {
            console.error('[REP_ANALYSIS] Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, selectedRepresentative]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Derived UI Values ---
    const totalPedidosValue = dashboardData?.totals?.totalPedidosValue || 0;
    const totalPedidosQty = dashboardData?.totals?.totalPedidosCount ?? dashboardData?.totals?.totalPedidosQty ?? 0;
    const totalFaturado = dashboardData?.totalFaturado || 0;

    // Client Metrics
    const distinctClients = clientMetrics.active_clients;
    const novosClientes = clientMetrics.new_clients;
    const carteiraTotal = clientMetrics.portfolio_clients;

    const displayClients = useMemo(() => {
        let clients = [];
        if (clientDisplayMode === 'apelido') {
            clients = clientStats.map(c => ({
                id: c.PES_CODIGO,
                name: c.APELIDO,
                subtitle: `ID: ${c.PES_CODIGO}`,
                faturamento: c.TOTAL_FATURADO,
                pedidos: c.TOTAL_PEDIDO,
                itens: c.ITENS_PEDIDOS
            }));
        } else {
            const map = new Map<string, any>();
            clientStats.forEach(c => {
                const grp = c.NOME_CATEGORIA || 'Sem Grupo';
                if (!map.has(grp)) {
                    map.set(grp, { id: grp, name: grp, subtitle: 'Grupo Econômico', faturamento: 0, pedidos: 0, itens: 0, count: 0 });
                }
                const existing = map.get(grp);
                existing.faturamento += c.TOTAL_FATURADO;
                existing.pedidos += c.TOTAL_PEDIDO;
                existing.itens += c.ITENS_PEDIDOS;
                existing.count += 1;
            });
            clients = Array.from(map.values());
        }
        return clients.sort((a, b) => {
            const valA = a[sortConfig.key as keyof typeof a] || 0;
            const valB = b[sortConfig.key as keyof typeof b] || 0;
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        });
    }, [clientStats, clientDisplayMode, sortConfig]);

    const mixCategories = useMemo(() => {
        if (!productStats) return [];
        if (mixDisplayMode === 'categoria') {
            return productStats.map((cat, index) => ({
                name: cat.GRU_DESCRICAO || 'Outros',
                size: cat.QTDE_ITENS || cat.QTDE_FATURADA || 0,
                fill: TREEMAP_COLORS[index % TREEMAP_COLORS.length]
            })).sort((a, b) => b.size - a.size).slice(0, 20);
        } else {
            const allItems = productStats.flatMap(cat => cat.items || []);
            const map = new Map<string, any>();
            allItems.forEach(item => {
                const label = item.ITEM_CODIGO || 'N/A';
                if (!map.has(label)) {
                    map.set(label, { name: label, size: 0 });
                }
                map.get(label).size += (item.QTDE_ITENS || item.QTDE_FATURADA || 0);
            });
            return Array.from(map.values()).map((item, index) => ({
                ...item,
                fill: TREEMAP_COLORS[index % TREEMAP_COLORS.length]
            })).sort((a, b) => b.size - a.size).slice(0, 20);
        }
    }, [productStats, mixDisplayMode]);

    const mixTotal = mixCategories.reduce((acc, c) => acc + c.size, 0);
    const hasSelection = selectedRepresentative.length > 0;

    const getRepName = () => {
        if (dashboardData?.representativeStats?.[0]) return dashboardData.representativeStats[0].nome;
        return selectedRepresentative[0] || 'Selecionado';
    };

    // --- PDF Export Handler ---
    const handleExportPDF = async () => {
        setIsLoading(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const currentYear = new Date().getFullYear();
            const repId = selectedRepresentative[0] ? parseInt(selectedRepresentative[0]) : 0;
            let portfolioDataRaw: any[] = [];
            let repName = getRepName();

            if (repId) {
                const { fetchRepresentativeClientPortfolio, fetchActiveRepresentativesRPC } = await import("@/services/bluebay/dashboardComercialService");
                portfolioDataRaw = await fetchRepresentativeClientPortfolio(repId, currentYear - 3, currentYear);
                const allReps = await fetchActiveRepresentativesRPC(24);
                const foundRep = allReps.find(r => r.value === selectedRepresentative[0]);
                if (foundRep) repName = foundRep.label;
            }

            const portfolioMap = new Map<string, any>();
            portfolioDataRaw.forEach(item => {
                const key = item.CLIENTE_ID.toString();
                if (!portfolioMap.has(key)) {
                    portfolioMap.set(key, { name: item.APELIDO || item.RAZAOSOCIAL || `Cliente ${key}`, years: {} });
                }
                portfolioMap.get(key).years[item.ANO] = item.TOTAL_VALOR;
            });

            const portfolioRows = Array.from(portfolioMap.values()).map(c => [
                c.name.substring(0, 30),
                formatCurrency(c.years[currentYear - 3] || 0),
                formatCurrency(c.years[currentYear - 2] || 0),
                formatCurrency(c.years[currentYear - 1] || 0),
                formatCurrency(c.years[currentYear] || 0),
            ]);

            const primaryColor = [59, 102, 173]; const secondaryColor = [80, 141, 98]; const accentColor = [224, 141, 77];

            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(0, 0, pageWidth, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14); doc.setFont("helvetica", "bold");
            doc.text("Relatório de Análise do Representante", 14, 13);

            doc.setTextColor(50, 50, 50); doc.setFontSize(10); doc.setFont("helvetica", "normal");
            doc.text("Representante:", 14, 30); doc.setFont("helvetica", "bold");
            doc.text(repName.toUpperCase(), 40, 30);
            doc.setFont("helvetica", "normal"); doc.text("Período:", 14, 38);
            doc.setFont("helvetica", "bold"); doc.setFillColor(240, 240, 240); doc.setDrawColor(200, 200, 200);
            doc.roundedRect(38, 33, 55, 7, 1, 1, 'FD');
            doc.text(`${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`, 41, 38);

            let yPos = 55; const kpiWidth = (pageWidth - 28 - 10) / 3; const kpiHeight = 35; // Increased Height for full numbers

            // Helper for full number display
            const formatFullCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

            // Box 1
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.roundedRect(14, yPos, kpiWidth, kpiHeight, 2, 2, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.text("Faturamento Total", 18, yPos + 8);
            doc.setFontSize(11); doc.setFont("helvetica", "bold");
            doc.text(formatFullCurrency(totalFaturado), 18, yPos + 18);
            doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text(`Ticket Médio: ${formatCurrency(dashboardData?.mediaValorItem || 0)}`, 18, yPos + 28);

            // Box 2
            doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.roundedRect(14 + kpiWidth + 5, yPos, kpiWidth, kpiHeight, 2, 2, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Total de Pedidos", 18 + kpiWidth + 5, yPos + 8);
            doc.setFontSize(11); doc.setFont("helvetica", "bold");
            doc.text(formatFullCurrency(totalPedidosValue), 18 + kpiWidth + 5, yPos + 18);
            doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text(`Total Itens: ${new Intl.NumberFormat('pt-BR').format(dashboardData?.totalItens || 0)}`, 18 + kpiWidth + 5, yPos + 28);

            // Box 3
            doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.roundedRect(14 + (kpiWidth + 5) * 2, yPos, kpiWidth, kpiHeight, 2, 2, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text(`Ativos: ${distinctClients}`, 18 + (kpiWidth + 5) * 2, yPos + 10);
            doc.text(`Novos: ${novosClientes}`, 18 + (kpiWidth + 5) * 2, yPos + 18);
            doc.text(`Carteira: ${carteiraTotal}`, 18 + (kpiWidth + 5) * 2, yPos + 26);

            yPos += 45;
            doc.setTextColor(50, 50, 50); doc.setFontSize(12); doc.setFont("helvetica", "bold");
            doc.text("Top 5 Clientes (Valor de Pedidos)", 14, yPos);

            autoTable(doc, {
                startY: yPos + 5,
                head: [['Cliente', 'Valor Pedidos']],
                body: displayClients.slice(0, 5).map(c => [c.name.substring(0, 35), formatCurrency(c.pedidos)]),
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;

            // Orders Block
            doc.setFontSize(12); doc.text("Acompanhamento de Pedidos (Detalhado)", 14, yPos);
            doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(100);
            doc.text("*Exibindo apenas Pedidos em Aberto ou Parciais", 14, yPos + 5);
            doc.setFont("helvetica", "bold"); doc.setTextColor(50);

            // FILTER LOGIC FOR PDF: Open/Partial Only
            const filteredOrders = ordersList.filter(o => {
                if (['4', '5', '9'].includes(o.STATUS)) return false; // Exclude Cancelled
                if (o.STATUS === '1') return true; // Open
                if (Number(o.QTDE_SALDO) > 0) return true; // Partial
                return false;
            });

            const clientCategoryMap = new Map<string, string>();
            clientStats.forEach(c => {
                if (c.APELIDO && c.NOME_CATEGORIA) clientCategoryMap.set(c.APELIDO, c.NOME_CATEGORIA);
            });

            const ordersDataWithItems: any[] = [];
            const docOrders = filteredOrders.slice(0, 100);
            const { fetchRepresentativeOrderItems } = await import("@/services/bluebay/dashboardComercialService");
            const ordersWithItems = await Promise.all(docOrders.map(async (o) => {
                const items = await fetchRepresentativeOrderItems(o.MATRIZ, o.FILIAL, o.PED_NUMPEDIDO, o.PED_ANOBASE);
                return { ...o, items };
            }));

            for (const o of ordersWithItems) {
                const category = clientCategoryMap.get(o.APELIDO || '') || '';
                // Block Headers
                ordersDataWithItems.push([{
                    content: `${category ? category + ' - ' : ''}${o.APELIDO || 'N/A'}`.toUpperCase(),
                    colSpan: 5, styles: { fillColor: [240, 245, 250], textColor: 0, fontStyle: 'bold', fontSize: 9 }
                }]);
                const pedidoInfo = `PEDIDO: ${o.PED_NUMPEDIDO}  |  DATA: ${o.DATA_PEDIDO ? format(new Date(o.DATA_PEDIDO), 'dd/MM/yy') : '-'}  |  COD.CLI: ${o.PES_CODIGO_CLIENTE || '-'}  |  RAZÃO: ${o.RAZAOSOCIAL || '-'}`;
                ordersDataWithItems.push([{
                    content: pedidoInfo, colSpan: 5, styles: { fillColor: [255, 255, 255], textColor: 80, fontSize: 8, fontStyle: 'bold' }
                }]);
                // Item Header
                ordersDataWithItems.push([
                    { content: 'CÓDIGO', styles: { fontStyle: 'bold', fontSize: 7, textColor: 150 } },
                    { content: 'DESCRIÇÃO', styles: { fontStyle: 'bold', fontSize: 7, textColor: 150 } },
                    { content: 'QTD. SALDO', styles: { fontStyle: 'bold', halign: 'right', fontSize: 7, textColor: 150 } },
                    { content: 'VALOR UNIT.', styles: { fontStyle: 'bold', halign: 'right', fontSize: 7, textColor: 150 } },
                    { content: 'TOTAL ITEM', styles: { fontStyle: 'bold', halign: 'right', fontSize: 7, textColor: 150 } },
                ]);
                // Items
                if (o.items && o.items.length > 0) {
                    o.items.forEach(i => {
                        const totalItem = (i.QTDE_SALDO > 0 ? i.QTDE_SALDO : i.QTDE_PEDIDA) * i.VALOR_UNITARIO;
                        ordersDataWithItems.push([
                            { content: i.ITEM_CODIGO, styles: { fontSize: 7, textColor: 50 } },
                            { content: i.DESCRICAO?.substring(0, 50), styles: { fontSize: 7, textColor: 50 } },
                            { content: Number(i.QTDE_SALDO), styles: { fontSize: 7, textColor: 50, halign: 'right' } },
                            { content: formatCurrency(i.VALOR_UNITARIO), styles: { fontSize: 7, textColor: 50, halign: 'right' } },
                            { content: formatCurrency(totalItem), styles: { fontSize: 7, textColor: 50, halign: 'right' } },
                        ]);
                    });
                } else {
                    ordersDataWithItems.push([{ content: 'Sem itens.', colSpan: 5, styles: { fontSize: 7, fontStyle: 'italic', halign: 'center' } }]);
                }
                // Footer
                const totalPedido = o.VALOR_TOTAL;
                const sumFaturado = o.items.reduce((acc, i) => acc + (i.QTDE_ENTREGUE * i.VALOR_UNITARIO), 0);
                const sumPendente = o.items.reduce((acc, i) => acc + (i.QTDE_SALDO * i.VALOR_UNITARIO), 0);
                ordersDataWithItems.push([
                    { content: '', colSpan: 2, styles: { minCellHeight: 1 } },
                    { content: `PED: ${formatCurrency(totalPedido)}`, styles: { fontSize: 7, fontStyle: 'bold', halign: 'right' } },
                    { content: `FAT: ${formatCurrency(sumFaturado)}`, styles: { fontSize: 7, fontStyle: 'bold', halign: 'right', textColor: [22, 163, 74] } },
                    { content: `PEND: ${formatCurrency(sumPendente)}`, styles: { fontSize: 7, fontStyle: 'bold', halign: 'right', textColor: [37, 99, 235] } },
                ]);
                ordersDataWithItems.push([{ content: '', colSpan: 5, styles: { minCellHeight: 4 } }]); // Spacer
            }

            autoTable(doc, {
                startY: yPos + 7, head: [], body: ordersDataWithItems, theme: 'plain',
                styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 25 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 20 }, 3: { cellWidth: 25 }, 4: { cellWidth: 25 }
                }
            });

            doc.addPage();
            doc.setFontSize(14); doc.text("Análise de Carteira de Clientes", 14, 20);
            autoTable(doc, {
                startY: 25,
                head: [['Cliente', (currentYear - 3).toString(), (currentYear - 2).toString(), (currentYear - 1).toString(), currentYear.toString()]],
                body: portfolioRows, theme: 'striped', headStyles: { fillColor: primaryColor as any },
                styles: { fontSize: 8 }, columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } }
            });

            doc.save(`Analise_Representante_${repName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        } catch (error) { console.error("Error generating PDF:", error); } finally { setIsLoading(false); }
    };

    // --- Excel Export Handler ---
    const handleExportExcel = async () => {
        setIsLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const repName = getRepName();
            const repId = selectedRepresentative[0] ? parseInt(selectedRepresentative[0]) : 0;

            // 1. Prepare Client Map for Category/Group lookup
            const clientMap = new Map<string, { grupo: string, apelido: string, razao: string }>();
            clientStats.forEach(c => {
                const key = String(c.PES_CODIGO);
                clientMap.set(key, { grupo: c.NOME_CATEGORIA || '', apelido: c.APELIDO, razao: 'N/A' });
                // Note: clientStats doesn't strictly have RAZAOSOCIAL typed in interface above? 
                // Actually ClientStat interface in this file (implicit) might not have it, 
                // but usually dashboard types have it. Let's rely on orders/invoice data for Razao if missing here.
            });

            // --- Sheet 1: Análise de Pedidos em Aberto (Renamed) ---
            const filteredOrders = ordersList.filter(o => {
                if (['4', '5', '9'].includes(o.STATUS)) return false;
                if (o.STATUS === '1') return true;
                if (Number(o.QTDE_SALDO) > 0) return true;
                return false;
            });

            const sheet1Data: any[] = [];
            const { fetchRepresentativeOrderItems, fetchRepresentativeInvoices: fetchInvoicesForExcel } = await import("@/services/bluebay/dashboardComercialService");

            // Chunked fetching for items
            const BATCH_SIZE = 20;
            for (let i = 0; i < filteredOrders.length; i += BATCH_SIZE) {
                const batch = filteredOrders.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (o) => {
                    const items = await fetchRepresentativeOrderItems(o.MATRIZ, o.FILIAL, o.PED_NUMPEDIDO, o.PED_ANOBASE);
                    const saldoItems = items.filter(it => it.QTDE_SALDO > 0);
                    const statusStr = o.STATUS === '1' ? 'Aberto' : (o.STATUS === '3' ? 'Faturado' : o.STATUS);

                    if (saldoItems.length > 0) {
                        saldoItems.forEach(it => {
                            sheet1Data.push({
                                'Data': o.DATA_PEDIDO ? format(new Date(o.DATA_PEDIDO), 'dd/MM/yyyy') : '',
                                'Pedido': o.PED_NUMPEDIDO,
                                'Cliente': o.APELIDO,
                                'Razão Social': o.RAZAOSOCIAL,
                                'Item Código': it.ITEM_CODIGO,
                                'Descrição': it.DESCRICAO,
                                'Qtd Pedida': it.QTDE_PEDIDA,
                                'Qtd Ent': it.QTDE_ENTREGUE,
                                'Saldo': it.QTDE_SALDO,
                                'Valor Total Item': (it.QTDE_SALDO * it.VALOR_UNITARIO),
                                'Status': statusStr
                            });
                        });
                    } else {
                        sheet1Data.push({
                            'Data': o.DATA_PEDIDO ? format(new Date(o.DATA_PEDIDO), 'dd/MM/yyyy') : '',
                            'Pedido': o.PED_NUMPEDIDO,
                            'Cliente': o.APELIDO,
                            'Razão Social': o.RAZAOSOCIAL,
                            'Item Código': '-',
                            'Descrição': 'PEDIDO GENÉRICO COM SALDO',
                            'Qtd Pedida': o.QTDE_PEDIDA,
                            'Qtd Ent': o.QTDE_ENTREGUE,
                            'Saldo': o.QTDE_SALDO,
                            'Valor Total Item': o.VALOR_TOTAL,
                            'Status': statusStr
                        });
                    }
                }));
            }

            // --- Sheet 2: Analise de Pedidos (New - All Status) ---
            const sheet2Data: any[] = [];

            // We'll iterate all ordersList. 
            // Note: ordersList is ALREADY filtered by date range selected in dashboard. User might want *all* historical?
            // Usually exports match the view. User said "as colunas devem ser...".
            // I will use ordersList which is the current view's orders.

            ordersList.forEach(o => {
                // Get Grupo from map using PES_CODIGO_CLIENTE or APELIDO match
                let grupo = '';
                if (o.PES_CODIGO_CLIENTE && clientMap.has(String(o.PES_CODIGO_CLIENTE))) {
                    grupo = clientMap.get(String(o.PES_CODIGO_CLIENTE))!.grupo;
                } else if (o.APELIDO) {
                    // Fallback try to find by Apelido in stats
                    const found = clientStats.find(cs => cs.APELIDO === o.APELIDO);
                    if (found) grupo = found.NOME_CATEGORIA || '';
                }

                sheet2Data.push({
                    'Data': o.DATA_PEDIDO ? format(new Date(o.DATA_PEDIDO), 'dd/MM/yyyy') : '',
                    'Pedido': o.PED_NUMPEDIDO,
                    'Pedido Mercos': o.PEDIDO_OUTRO || '',
                    'Grupo Economico': grupo,
                    'Cliente': o.APELIDO,
                    'Razão Social': o.RAZAOSOCIAL,
                    'Qtd Pedida': o.QTDE_PEDIDA,
                    'Qtd Ent': o.QTDE_ENTREGUE,
                    'Saldo': o.QTDE_SALDO,
                    'Valor Total': o.VALOR_TOTAL,
                    'STATUS': o.STATUS === '1' ? 'Aberto' : (o.STATUS === '3' ? 'Faturado' : (o.STATUS === '4' ? 'Cancelado' : o.STATUS))
                });
            });


            // --- Sheet 3: Análise de Carteira (Fix columns) ---
            let portfolioDataRaw: any[] = [];

            // 1. Get Portfolio
            if (repId) {
                const { fetchRepresentativeClientPortfolio } = await import("@/services/bluebay/dashboardComercialService");
                portfolioDataRaw = await fetchRepresentativeClientPortfolio(repId, currentYear - 3, currentYear);
            }

            // 2. Get Pedidos (Orders) - Aggregation from BLUEBAY_PEDIDO (Items)
            // Use BLUEBAY_PEDIDO as CAPA might not be available/reliable. Sum (Qtd * Valor).
            const { data: ordersItems, error: ordersErr } = await supabase
                .from('BLUEBAY_PEDIDO')
                .select('PED_ANOBASE, PES_CODIGO, QTDE_PEDIDA, VALOR_UNITARIO')
                .eq('REPRESENTANTE', repId)
                .gte('PED_ANOBASE', currentYear - 3)
                .in('STATUS', ['1', '2', '3']) // Open, Approved, Faturado. Exclude 4 (Cancel), 5 (Susp), 9 (Dev)
                .neq('STATUS', '4');

            const ordersMap = new Map<string, number>();
            if (ordersItems) {
                ordersItems.forEach((item: any) => {
                    const key = `${item.PES_CODIGO}-${item.PED_ANOBASE}`;
                    const val = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
                    ordersMap.set(key, (ordersMap.get(key) || 0) + val);
                });
            }

            // Group Portfolio by Client
            const portfolioMap = new Map<string, any>();

            // Pre-fill with portfolio data (Sales/Faturamento data source)
            portfolioDataRaw.forEach(item => {
                const clientId = String(item.CLIENTE_ID);
                if (!portfolioMap.has(clientId)) {
                    const mapped = clientMap.get(clientId);
                    portfolioMap.set(clientId, {
                        grupo: mapped?.grupo || '',
                        cliente: item.APELIDO || mapped?.apelido || '',
                        razao: item.RAZAOSOCIAL || '',
                        years: {}
                    });
                }
                const yr = item.ANO;
                if (!portfolioMap.get(clientId).years[yr]) {
                    portfolioMap.get(clientId).years[yr] = { fat: item.TOTAL_VALOR };
                } else {
                    portfolioMap.get(clientId).years[yr].fat += item.TOTAL_VALOR;
                }
            });

            // Ensure clients with Orders but no Faturamento are included (Optional but good for "Carteira")
            // Iterate known clients from ordersMap? 
            // For now, let's stick to clients in Portfolio + Clients in Orders if we can match them?
            // The user report usually keys off the Portfolio list. If a client NEVER bought before (no portfolio) but has order now, 
            // it might be missing if we only iterate portfolioMap.
            // Let's add clients from OrdersMap to PortfolioMap if missing.
            if (ordersItems) {
                const uniqueClientIdsInOrders = new Set(ordersItems.map((i: any) => i.PES_CODIGO));
                uniqueClientIdsInOrders.forEach(cid => {
                    const clientId = String(cid);
                    if (!portfolioMap.has(clientId)) {
                        const mapped = clientMap.get(clientId);
                        if (mapped) { // Only if we have client details (active client)
                            portfolioMap.set(clientId, {
                                grupo: mapped.grupo || '',
                                cliente: mapped.apelido || '',
                                razao: mapped.razao || '',
                                years: {}
                            });
                        }
                    }
                });
            }

            const finalSheet3Data: any[] = [];
            // Use Map keys to ensure unique clients
            for (const [clientId, info] of portfolioMap.entries()) {

                let totalPedidosLast4Years = 0;
                // Calculate total first nicely
                for (let y = currentYear - 3; y <= currentYear; y++) {
                    const orderKey = `${clientId}-${y}`;
                    totalPedidosLast4Years += (ordersMap.get(orderKey) || 0);
                }

                // If no activity at all in 4 years (rare if filtered by rep), skip? 
                // Currently keeping all.

                const orderedRow: any = {
                    'Grupo Economico': info.grupo,
                    'Cliente': info.cliente,
                    'Razão Social': info.razao,
                    [`Pedidos (Total ${currentYear - 3}-${currentYear})`]: totalPedidosLast4Years
                };

                for (let y = currentYear - 3; y <= currentYear; y++) {
                    const orderKey = `${clientId}-${y}`;
                    const orderVal = ordersMap.get(orderKey) || 0;
                    const fatVal = info.years[y]?.fat || 0;

                    orderedRow[`Pedidos ${y}`] = orderVal;
                    orderedRow[`Faturamento ${y}`] = fatVal;
                }
                finalSheet3Data.push(orderedRow);
            }


            // --- Sheet 4: Nota no periodo (New) ---
            const invoices = await fetchInvoicesForExcel(repId, startDate, endDate);

            const sheet4Data = invoices.map(inv => ({
                'Data': inv.data_emissao ? format(new Date(inv.data_emissao), 'dd/MM/yyyy') : '',
                'Nota': inv.nota || inv.id?.split('-')?.[1] || '',
                'Grupo Econômico': inv.grupo_economico || 'N/A',
                'Apelido': inv.apelido,
                'Razão Social': inv.razaosocial,
                'Valor Faturado': inv.valor_nota
            }));


            // Workbook Creation
            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
            const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
            const ws3 = XLSX.utils.json_to_sheet(finalSheet3Data);
            const ws4 = XLSX.utils.json_to_sheet(sheet4Data);

            XLSX.utils.book_append_sheet(wb, ws1, "Análise de Pedidos em Aberto"); // Renamed
            XLSX.utils.book_append_sheet(wb, ws2, "Analise de Pedidos"); // New
            XLSX.utils.book_append_sheet(wb, ws3, "Analise de Carteira");
            XLSX.utils.book_append_sheet(wb, ws4, "Nota no periodo"); // New

            XLSX.writeFile(wb, `Analise_Representante_${repName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);

        } catch (error) { console.error("Error generating Excel:", error); } finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans">
            <BluebayAdmMenu />
            <main className="max-w-[1440px] mx-auto p-8 lg:p-12">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Análise do Representante</h2>
                        <p className="text-slate-500 mt-1">Acompanhamento de performance em tempo real</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {hasSelection && (
                            <>
                                <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white border border-green-700 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-semibold">
                                    <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
                                </button>
                                <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm font-semibold">
                                    <FileText className="h-4 w-4" /> Exportar PDF
                                </button>
                            </>
                        )}
                        {isLoading && hasSelection && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-full md:w-auto flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Representante:</label>
                        <div className="relative w-full md:min-w-[400px]">
                            <div className="flex gap-2 w-full">
                                <AsyncFilter
                                    label="Selecione o Representante"
                                    value={selectedRepresentative[0] || null}
                                    onChange={handleRepChange}
                                    fetchOptions={async (q) => {
                                        const { fetchActiveRepresentativesRPC } = await import("@/services/bluebay/dashboardComercialService");
                                        const all = await fetchActiveRepresentativesRPC(24);
                                        if (!q) return all;
                                        return all.filter(r => r.label.toLowerCase().includes(q.toLowerCase()));
                                    }}
                                    width="w-full"
                                    placeholder="Buscar..."
                                />
                                <ClientPortfolioDialog representativeId={selectedRepresentative[0] ? Number(selectedRepresentative[0]) : null} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex bg-slate-100 p-1 rounded-xl">
                        {(['30d', '6m', '1y', '3y'] as const).map(p => {
                            let label = p as string;
                            if (p === '30d') label = '30 Dias';
                            if (p === '6m') label = '6 Meses';
                            if (p === '1y') label = '1 Ano';
                            if (p === '3y') label = '3 Anos';
                            return (
                                <button key={p} onClick={() => handlePeriodChange(p)} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === p ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>
                            );
                        })}
                    </div>
                </div>

                {!hasSelection ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[16px] shadow-sm border border-slate-100 my-10">
                        <div className="bg-blue-50 p-6 rounded-full mb-6"><Search className="h-10 w-10 text-blue-500" /></div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Selecione um Representante</h3>
                        <p className="text-slate-500 max-w-md">Utilize o filtro acima para selecionar um representante e visualizar sua análise de performance detalhada.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            {/* Card Faturamento Total with Click */}
                            <div onClick={handleOpenFaturamentoModal} className="bg-[#3b66ad] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden cursor-pointer hover:bg-[#345c9e] transition-colors">
                                <div className="relative z-10 flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-blue-100 font-medium mb-1 flex items-center gap-2">Faturamento Total <Search className="h-4 w-4 opacity-50" /></p>
                                        <h3 className="text-4xl lg:text-5xl font-bold">{new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'BRL' }).format(totalFaturado)}</h3>
                                        <p className="text-blue-200 text-sm mt-2">Ticket Médio: <span className="font-bold text-white">{formatCurrency(dashboardData?.mediaValorItem || 0)}</span></p>
                                    </div>
                                    <Banknote className="h-12 w-12 opacity-40" />
                                </div>
                            </div>

                            <div className="bg-[#508d62] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-green-100 font-medium mb-1">Total de Pedidos</p>
                                        <h3 className="text-4xl lg:text-5xl font-bold">{new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'BRL' }).format(totalPedidosValue)}</h3>
                                        <p className="text-green-200 text-sm mt-2">Total Itens: <span className="font-bold text-white">{new Intl.NumberFormat('pt-BR').format(dashboardData?.totalItens || 0)}</span></p>
                                    </div>
                                    <ShoppingCart className="h-12 w-12 opacity-40" />
                                </div>
                            </div>
                            <div className="bg-[#e08d4d] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-orange-100 font-medium mb-1">Clientes Ativos</p>
                                        <h3 className="text-4xl lg:text-5xl font-bold">{distinctClients}</h3>
                                    </div>
                                    <UserPlus className="h-12 w-12 opacity-40" />
                                </div>
                                <div className="flex gap-4 text-sm text-orange-100 font-medium">
                                    <span className="bg-white/10 px-3 py-1 rounded-lg">Novos: <span className="font-bold">{novosClientes}</span></span>
                                    <span className="bg-white/10 px-3 py-1 rounded-lg">Carteira (3 anos): <span className="font-bold">{carteiraTotal}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Top Clients & Mix */}
                        <div className="grid grid-cols-12 gap-8 mb-10">
                            {/* Mix de Produtos - Expanded Width */}
                            <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-10">
                                    <h4 className="font-bold text-xl text-slate-800">Mix de Produtos</h4>
                                    <button onClick={() => { setMixDisplayMode(prev => prev === 'categoria' ? 'produto' : 'categoria'); setSelectedMixItem(null); }} className="p-2 bg-slate-100 rounded-lg text-slate-600"><ArrowLeftRight className="h-4 w-4" /></button>
                                </div>
                                <div className="h-[450px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <Treemap data={mixCategories} dataKey="size" nameKey="name" stroke="#fff" content={<CustomizedTreemapContent />} animationDuration={500}>
                                            <RechartsTooltip content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                                                            <p className="font-bold text-slate-800">{data.name}</p>
                                                            <p className="text-slate-500 text-sm">Qtd: <span className="font-bold text-[#3b66ad]">{data.size}</span></p>
                                                        </div>
                                                    );
                                                } return null;
                                            }} />
                                        </Treemap>
                                    </ResponsiveContainer>
                                </div>

                            </div>

                            {/* Top Clientes - Narrower, only Pedidos */}
                            <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-xl text-slate-800">Top Clientes</h4>
                                    <button onClick={() => setIsClientModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Ver Completo</button>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-lg mb-4 self-start">
                                    <button onClick={() => setClientDisplayMode('apelido')} className={`px-3 py-1 text-xs ${clientDisplayMode === 'apelido' ? 'bg-white shadow-sm' : ''}`}>Por Cliente</button>
                                    <button onClick={() => setClientDisplayMode('grupo')} className={`px-3 py-1 text-xs ${clientDisplayMode === 'grupo' ? 'bg-white shadow-sm' : ''}`}>Por Grupo</button>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full">
                                        <thead><tr className="text-left border-b border-slate-100"><th className="pb-4">Cliente</th><th className="pb-4 text-right">Pedidos (R$)</th></tr></thead>
                                        <tbody>
                                            {displayClients.slice(0, 5).map((client, idx) => (
                                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                                                    <td className="py-4"><div className="font-bold text-sm block truncate max-w-[150px]">{client.name}</div><div className="text-xs text-slate-400">{client.subtitle}</div></td>
                                                    <td className="py-4 text-right font-bold text-[#3b66ad]">{formatCurrency(client.pedidos)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Order Grid Section */}
                        <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 overflow-hidden mb-10">


                            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div><h4 className="font-bold text-xl text-slate-800">Acompanhamento de Pedidos</h4><p className="text-slate-500 text-sm">Status e histórico recente ({ordersList.length} pedidos)</p></div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:flex-none"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="text" placeholder="Buscar pedido, cliente..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full" /></div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Switch checked={showFaturadoOrders} onCheckedChange={setShowFaturadoOrders} id="show-faturado" />
                                            <Label htmlFor="show-faturado" className="text-xs font-medium text-slate-600">Exibir Faturados</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={showCancelledOrders} onCheckedChange={setShowCancelledOrders} id="show-cancelled" />
                                            <Label htmlFor="show-cancelled" className="text-xs font-medium text-slate-600">Exibir Cancelados</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium"><tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Pedido</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4 text-right">Valor Total</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Ações</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {ordersList.filter(o => {
                                            if (!showCancelledOrders && ['4', '5', '9'].includes(o.STATUS)) return false;
                                            if (!showFaturadoOrders && o.STATUS === '3') return false;
                                            if (!orderSearch) return true;
                                            const searchLower = orderSearch.toLowerCase();
                                            return o.PED_NUMPEDIDO.includes(searchLower) || o.APELIDO?.toLowerCase().includes(searchLower) || o.RAZAOSOCIAL?.toLowerCase().includes(searchLower);
                                        }).slice(0, 50).map((order) => {
                                            const uniqueKey = `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}`;
                                            const isExpanded = expandedOrderId === uniqueKey;
                                            const items = orderItems[uniqueKey] || [];
                                            let statusColor = "bg-slate-100 text-slate-600"; let statusLabel = order.STATUS;
                                            switch (order.STATUS) { case '1': statusLabel = 'Aberto'; statusColor = 'bg-yellow-50 text-yellow-600'; break; case '2': statusLabel = 'Aprovado'; statusColor = 'bg-blue-50 text-blue-600'; break; case '3': statusLabel = 'Faturado'; statusColor = 'bg-green-50 text-green-600'; break; case '4': statusLabel = 'Cancelado'; statusColor = 'bg-red-50 text-red-600'; break; case '5': statusLabel = 'Suspenso'; statusColor = 'bg-orange-50 text-orange-600'; break; case '9': statusLabel = 'Devolução'; statusColor = 'bg-purple-50 text-purple-600'; break; }
                                            return (
                                                <React.Fragment key={uniqueKey}>
                                                    <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleExpandOrder(uniqueKey, order.MATRIZ, order.FILIAL, order.PED_NUMPEDIDO, order.PED_ANOBASE)}>
                                                        <td className="px-6 py-4 font-medium text-slate-600">{order.DATA_PEDIDO ? format(new Date(order.DATA_PEDIDO), 'dd/MM/yyyy') : '-'}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-800">#{order.PED_NUMPEDIDO}</td>
                                                        <td className="px-6 py-4"><div className="font-bold text-slate-700">{order.APELIDO || 'N/A'}</div><div className="text-xs text-slate-400">{order.RAZAOSOCIAL?.substring(0, 30)}...</div></td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(order.VALOR_TOTAL)}</td>
                                                        <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor} inline-block min-w-[80px]`}>{statusLabel}</span></td>
                                                        <td className="px-6 py-4 text-center">{loadingItems.has(uniqueKey) ? <Loader2 className="h-4 w-4 animate-spin text-blue-500 mx-auto" /> : (isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 mx-auto" /> : <ChevronDown className="h-4 w-4 text-slate-400 mx-auto" />)}</td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="bg-slate-50"><td colSpan={6} className="px-6 py-4"><div className="bg-white rounded-lg border border-slate-200 p-4 shadow-inner"><h5 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><Box className="h-4 w-4" /> Itens do Pedido</h5>{items.length > 0 ? (<div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="text-slate-500 border-b border-slate-100"><th className="py-2 text-left">Código</th><th className="py-2 text-left">Descrição</th><th className="py-2 text-right">Qtd. Pedida</th><th className="py-2 text-right">Qtd. Entregue</th><th className="py-2 text-right">Qtd. Saldo</th><th className="py-2 text-right">Valor Unit.</th><th className="py-2 text-right">Total Item</th></tr></thead><tbody className="divide-y divide-slate-50">{items.map((item, idx) => (<tr key={idx}><td className="py-2 font-medium">{item.ITEM_CODIGO}</td><td className="py-2 text-slate-600">{item.DESCRICAO}</td><td className="py-2 text-right">{item.QTDE_PEDIDA}</td><td className="py-2 text-right font-medium text-green-600">{item.QTDE_ENTREGUE}</td><td className="py-2 text-right font-medium text-blue-600">{item.QTDE_SALDO}</td><td className="py-2 text-right text-slate-500">{formatCurrency(item.VALOR_UNITARIO)}</td><td className="py-2 text-right font-bold text-slate-700">{formatCurrency((item.QTDE_SALDO > 0 ? item.QTDE_SALDO : item.QTDE_PEDIDA) * item.VALOR_UNITARIO)}</td></tr>))}</tbody></table></div>) : (<p className="text-slate-400 text-center py-4 italic">Nenhum item encontrado.</p>)}</div></td></tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Faturamento Details Modal */}
                <Dialog open={isFaturamentoModalOpen} onOpenChange={setIsFaturamentoModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex justify-between items-center">
                                <span>Detalhamento de Faturamento</span>
                                <button onClick={exportFaturamentoPDF} className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                                    <Download className="h-4 w-4" /> PDF
                                </button>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {loadingFaturamento ? (
                                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Nota</TableHead>
                                            <TableHead>Grupo Econômico</TableHead>
                                            <TableHead>Apelido</TableHead>
                                            <TableHead>Razão Social</TableHead>
                                            <TableHead className="text-right">Valor Faturado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {faturamentoDetails.length > 0 ? (
                                            faturamentoDetails.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{format(new Date(item.data_emissao), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{item.nota || '-'}</TableCell>
                                                    <TableCell>{item.grupo_economico || item.centrocusto || 'N/A'}</TableCell>
                                                    <TableCell>{item.apelido || 'N/A'}</TableCell>
                                                    <TableCell>{item.razaosocial?.substring(0, 30)}</TableCell>
                                                    <TableCell className="text-right font-bold text-slate-700">{formatCurrency(item.valor_nota)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={5} className="text-center py-4">Nenhum registro encontrado.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Top Clients Full List Modal */}
                <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Lista Completa de Clientes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Grupo</TableHead>
                                        <TableHead className="text-right">Pedidos</TableHead>
                                        <TableHead className="text-right">Faturamento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayClients.map((client, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell>{client.subtitle}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(client.pedidos)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(client.faturamento)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    );
};

// Helper for Treemap Colors
const CustomizedTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name, fill } = props;
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: fill || '#8884d8',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > 50 && height > 30 && (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold">
                    {(name || 'N/A').substring(0, 10)}
                </text>
            )}
        </g>
    );
};

export default RepresentativeAnalysis;
