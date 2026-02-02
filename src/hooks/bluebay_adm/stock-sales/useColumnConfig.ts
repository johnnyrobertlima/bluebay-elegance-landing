import { useState, useEffect, useCallback, useMemo } from "react";

export interface ColumnDefinition {
    id: string;
    label: string;
    visible: boolean;
    width?: string;
    align?: 'left' | 'right' | 'center';
}

const STORAGE_KEY = "bluebay_stock_sales_columns_v1";

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
    { id: "ITEM_CODIGO", label: "Código", visible: true, width: "120px" },
    { id: "DESCRICAO", label: "Descrição", visible: true, width: "180px" },
    { id: "GRU_DESCRICAO", label: "Grupo", visible: true, width: "150px" },
    { id: "FISICO", label: "Estoque Físico", visible: true, width: "120px", align: "right" },
    { id: "DISPONIVEL", label: "Disponível", visible: true, width: "120px", align: "right" },
    { id: "RESERVADO", label: "Reservado", visible: true, width: "120px", align: "right" },
    { id: "ENTROU", label: "Entrou", visible: true, width: "120px", align: "right" },
    { id: "QTD_VENDIDA", label: "Qtd. Vendida", visible: true, width: "120px", align: "right" },
    { id: "VALOR_TOTAL_VENDIDO", label: "Valor Vendido", visible: true, width: "150px", align: "right" },
    { id: "PRECO_MEDIO", label: "Preço Médio", visible: true, width: "150px", align: "right" },
    { id: "CUSTO_MEDIO", label: "Custo Médio", visible: true, width: "150px", align: "right" },
    { id: "GIRO_ESTOQUE", label: "Giro Estoque", visible: true, width: "120px", align: "right" },
    { id: "PERCENTUAL_ESTOQUE_VENDIDO", label: "% Vendido", visible: true, width: "100px", align: "right" },
    { id: "DIAS_COBERTURA", label: "Dias Cobertura", visible: true, width: "120px", align: "right" },
    { id: "DATA_ULTIMA_VENDA", label: "Última Venda", visible: true, width: "120px", align: "center" },
    { id: "RANKING", label: "Ranking", visible: true, width: "100px", align: "right" },
];

export const useColumnConfig = (storageKey: string = "bluebay_stock_sales_columns_v1", excludeIds: string[] = []) => {
    const filteredDefaults = useMemo(() =>
        DEFAULT_COLUMNS.filter(col => !excludeIds.includes(col.id)),
        [excludeIds]);

    const [columns, setColumns] = useState<ColumnDefinition[]>(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with filtered defaults
                const merged = filteredDefaults.map(def => {
                    const savedCol = parsed.find((c: any) => c.id === def.id);
                    return savedCol ? { ...def, ...savedCol } : def;
                });

                // Preserve order from saved if possible, but keep new ones at the end
                const ordered = parsed
                    .map((savedCol: any) => merged.find(m => m.id === savedCol.id))
                    .filter(Boolean) as ColumnDefinition[];

                const missing = merged.filter(m => !ordered.find(o => o.id === m.id));
                return [...ordered, ...missing];
            } catch (e) {
                console.error("Error parsing saved columns", e);
                return filteredDefaults;
            }
        }
        return filteredDefaults;
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(columns));
    }, [columns, storageKey]);

    const toggleColumn = useCallback((id: string) => {
        setColumns(prev => prev.map(col =>
            col.id === id ? { ...col, visible: !col.visible } : col
        ));
    }, []);

    const reorderColumns = useCallback((newOrder: ColumnDefinition[]) => {
        setColumns(newOrder);
    }, []);

    const resetColumns = useCallback(() => {
        setColumns(filteredDefaults);
    }, [filteredDefaults]);

    const visibleColumnsMap = useMemo(() => {
        return columns.reduce((acc, col) => {
            acc[col.id] = col.visible;
            return acc;
        }, {} as Record<string, boolean>);
    }, [columns]);

    return {
        columns,
        visibleColumnsMap,
        toggleColumn,
        reorderColumns,
        resetColumns
    };
};
