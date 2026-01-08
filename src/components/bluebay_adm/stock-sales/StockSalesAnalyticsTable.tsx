
import React, { useState, useMemo } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableLoadingState } from "./table/TableLoadingState";
import { TableEmptyState } from "./table/TableEmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupedStockTable } from "./table/GroupedStockTable";
import { LayersIcon, ListIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSortableHeader } from "./table/TableSortableHeader";
import { StockSalesTableRow } from "./table/StockSalesTableRow";

interface StockSalesAnalyticsTableProps {
  items: StockItem[];
  isLoading: boolean;
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

export const StockSalesAnalyticsTable: React.FC<StockSalesAnalyticsTableProps> = ({
  items,
  isLoading,
  sortConfig,
  onSort,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");
  
  // Define default visible columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    FISICO: true,
    DISPONIVEL: true,
    RESERVADO: true,
    ENTROU: true,
    QTD_VENDIDA: true,
    VALOR_TOTAL_VENDIDO: true,
    PRECO_MEDIO: true,
    CUSTO_MEDIO: true,
    GIRO_ESTOQUE: true,
    PERCENTUAL_ESTOQUE_VENDIDO: true,
    DIAS_COBERTURA: true,
    DATA_ULTIMA_VENDA: true,
    RANKING: true,
  });
  
  // Memoize the list view table content to improve performance
  const listViewContent = useMemo(() => {
    if (isLoading) {
      return <TableLoadingState />;
    }

    if (items.length === 0) {
      return <TableEmptyState />;
    }

    return (
      <div className="relative border rounded-md">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="min-w-max">
            <Table className="w-auto min-w-full border-collapse">
              <TableHeader className="sticky-header">
                <TableRow>
                  <TableSortableHeader sortKey="ITEM_CODIGO" label="Código" currentSortConfig={sortConfig} onSort={onSort} width="120px" isSticky={true} left={0} />
                  <TableSortableHeader sortKey="DESCRICAO" label="Descrição" currentSortConfig={sortConfig} onSort={onSort} width="180px" />
                  <TableSortableHeader sortKey="GRU_DESCRICAO" label="Grupo" currentSortConfig={sortConfig} onSort={onSort} width="150px" />
                  <TableSortableHeader sortKey="FISICO" label="Estoque Físico" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="DISPONIVEL" label="Disponível" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="RESERVADO" label="Reservado" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="ENTROU" label="Entrou" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="QTD_VENDIDA" label="Qtd. Vendida" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="VALOR_TOTAL_VENDIDO" label="Valor Vendido" currentSortConfig={sortConfig} onSort={onSort} width="150px" align="right" />
                  <TableSortableHeader sortKey="PRECO_MEDIO" label="Preço Médio" currentSortConfig={sortConfig} onSort={onSort} width="150px" align="right" />
                  <TableSortableHeader sortKey="CUSTO_MEDIO" label="Custo Médio" currentSortConfig={sortConfig} onSort={onSort} width="150px" align="right" />
                  {/* Nova coluna para o valor de teste */}
                  <TableSortableHeader sortKey="teste" label="Teste (media_valor)" currentSortConfig={sortConfig} onSort={onSort} width="150px" align="right" />
                  <TableSortableHeader sortKey="GIRO_ESTOQUE" label="Giro Estoque" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="PERCENTUAL_ESTOQUE_VENDIDO" label="% Vendido" currentSortConfig={sortConfig} onSort={onSort} width="100px" align="right" />
                  <TableSortableHeader sortKey="DIAS_COBERTURA" label="Dias Cobertura" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="right" />
                  <TableSortableHeader sortKey="DATA_ULTIMA_VENDA" label="Última Venda" currentSortConfig={sortConfig} onSort={onSort} width="120px" align="center" />
                  <TableSortableHeader sortKey="RANKING" label="Ranking" currentSortConfig={sortConfig} onSort={onSort} width="100px" align="right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <StockSalesTableRow 
                    key={`${item.ITEM_CODIGO}-${index}`} 
                    item={item} 
                    index={index}
                    visibleColumns={visibleColumns}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }, [items, isLoading, sortConfig, onSort, visibleColumns]);

  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
    <div className="relative">
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grouped")}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            Exibindo total de {items.length} registros.
          </div>
          <TabsList>
            <TabsTrigger value="grouped" className="flex items-center gap-1">
              <LayersIcon className="h-4 w-4" />
              <span>Agrupado</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <ListIcon className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grouped" className="mt-0">
          <GroupedStockTable 
            items={items}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={onSort}
          />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {listViewContent}
        </TabsContent>
      </Tabs>
    </div>
  );
};
