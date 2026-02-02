
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
import { ColumnConfigurator } from "./ColumnConfigurator";
import { useColumnConfig } from "@/hooks/bluebay_adm/stock-sales/useColumnConfig";

interface StockSalesAnalyticsTableProps {
  items: StockItem[];
  isLoading: boolean;
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
  configKey?: string; // Added
  excludeIds?: string[]; // Added
}

export const StockSalesAnalyticsTable: React.FC<StockSalesAnalyticsTableProps> = ({
  items,
  isLoading,
  sortConfig,
  onSort,
  configKey = "bluebay_stock_sales_columns_v1", // Default
  excludeIds = [] // Default
}) => {
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list");

  const {
    columns: configColumns,
    visibleColumnsMap,
    toggleColumn,
    reorderColumns,
    resetColumns
  } = useColumnConfig(configKey, excludeIds);

  // Memoize the list view table content to improve performance
  const listViewContent = useMemo(() => {
    if (isLoading) {
      return <TableLoadingState />;
    }

    if (items.length === 0) {
      return <TableEmptyState />;
    }

    return (
      <div className="relative border rounded-md bg-white shadow-sm">
        {/* Adjusted ScrollArea to show approximately 14 rows (approx 14 * 44px + 40px header) */}
        <ScrollArea className="h-[650px]">
          <div className="min-w-max">
            <Table className="w-auto min-w-full border-collapse">
              <TableHeader className="sticky top-0 z-30 bg-gray-50 border-b">
                <TableRow>
                  {configColumns.map((col) => {
                    if (!col.visible) return null;

                    const isCoreCode = col.id === "ITEM_CODIGO";

                    return (
                      <TableSortableHeader
                        key={col.id}
                        sortKey={col.id as keyof StockItem}
                        label={col.label}
                        currentSortConfig={sortConfig}
                        onSort={onSort}
                        width={col.width}
                        align={col.align}
                        isSticky={isCoreCode}
                        left={isCoreCode ? 0 : undefined}
                      />
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <StockSalesTableRow
                    key={`${item.ITEM_CODIGO}-${index}`}
                    item={item}
                    index={index}
                    visibleColumns={visibleColumnsMap}
                    columnOrder={configColumns}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }, [items, isLoading, sortConfig, onSort, visibleColumnsMap, configColumns]);

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
          <div className="flex items-center gap-3">
            <ColumnConfigurator
              columns={configColumns}
              onToggle={toggleColumn}
              onReorder={reorderColumns}
              onReset={resetColumns}
            />
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
