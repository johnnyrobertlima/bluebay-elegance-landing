
import React from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import { ItemBadges } from "./ItemBadges";
import { StockTurnoverIndicator } from "./StockTurnoverIndicator";
import { formatCurrency, formatNumber, formatPercentage } from "../utils/formatters";
import { format } from "date-fns";

import { ColumnDefinition } from "@/hooks/bluebay_adm/stock-sales/useColumnConfig";

interface StockSalesTableRowProps {
  item: StockItem;
  index: number;
  visibleColumns: Record<string, boolean>;
  columnOrder: ColumnDefinition[];
}

export const StockSalesTableRow: React.FC<StockSalesTableRowProps> = ({
  item,
  index,
  visibleColumns,
  columnOrder
}) => {
  const isEven = index % 2 === 0;
  const hasLowStock = (item.DISPONIVEL || 0) < 5;
  const isNewProduct = item.PRODUTO_NOVO;
  const isTopProduct = (item.RANKING || 0) <= 10;

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const renderCell = (colId: string) => {
    switch (colId) {
      case "ITEM_CODIGO":
        return (
          <TableCell className="p-2 font-medium sticky left-0 z-20 bg-inherit border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
            <div className="flex items-center">
              <span className="whitespace-nowrap">{item.ITEM_CODIGO}</span>
              <ItemBadges
                isNew={isNewProduct}
                isLowStock={hasLowStock}
                isTop={isTopProduct}
              />
            </div>
          </TableCell>
        );
      case "DESCRICAO":
        return (
          <TableCell className="p-2 max-w-[250px]">
            <div className="truncate" title={item.DESCRICAO}>
              {item.DESCRICAO}
            </div>
          </TableCell>
        );
      case "GRU_DESCRICAO":
        return <TableCell className="p-2">{item.GRU_DESCRICAO}</TableCell>;
      case "FISICO":
        return <TableCell className="p-2 text-right">{formatNumber(item.FISICO)}</TableCell>;
      case "DISPONIVEL":
        return <TableCell className="p-2 text-right">{formatNumber(item.DISPONIVEL)}</TableCell>;
      case "RESERVADO":
        return <TableCell className="p-2 text-right">{formatNumber(item.RESERVADO)}</TableCell>;
      case "ENTROU":
        return <TableCell className="p-2 text-right">{formatNumber(item.ENTROU)}</TableCell>;
      case "QTD_VENDIDA":
        return <TableCell className="p-2 text-right">{formatNumber(item.QTD_VENDIDA)}</TableCell>;
      case "VALOR_TOTAL_VENDIDO":
        return <TableCell className="p-2 text-right">{formatCurrency(item.VALOR_TOTAL_VENDIDO)}</TableCell>;
      case "PRECO_MEDIO":
        return <TableCell className="p-2 text-right">{formatCurrency(item.PRECO_MEDIO)}</TableCell>;
      case "CUSTO_MEDIO":
        return <TableCell className="p-2 text-right">{formatCurrency(item.CUSTO_MEDIO)}</TableCell>;
      case "GIRO_ESTOQUE":
        return <TableCell className="p-2 text-right"><StockTurnoverIndicator turnover={item.GIRO_ESTOQUE} /></TableCell>;
      case "PERCENTUAL_ESTOQUE_VENDIDO":
        return <TableCell className="p-2 text-right">{formatPercentage(item.PERCENTUAL_ESTOQUE_VENDIDO)}</TableCell>;
      case "DIAS_COBERTURA":
        return <TableCell className="p-2 text-right">{item.DIAS_COBERTURA >= 999 ? "∞" : formatNumber(item.DIAS_COBERTURA)}</TableCell>;
      case "DATA_ULTIMA_VENDA":
        return <TableCell className="p-2 text-center">{item.DATA_ULTIMA_VENDA ? formatDate(new Date(item.DATA_ULTIMA_VENDA)) : "-"}</TableCell>;
      case "RANKING":
        return <TableCell className="p-2 text-right">{item.RANKING ? String(item.RANKING) : "-"}</TableCell>;
      case "teste":
        return <TableCell className="p-2 text-right">{formatCurrency(item.teste)}</TableCell>;
      default:
        return null;
    }
  };

  return (
    <TableRow
      key={item.ITEM_CODIGO}
      className={cn(
        isEven ? "bg-white" : "bg-gray-50",
        hasLowStock && "bg-red-50 hover:bg-red-100",
        isNewProduct && !hasLowStock && "bg-blue-50 hover:bg-blue-100",
        "relative"
      )}
    >
      {columnOrder.map(col => {
        if (!col.visible) return null;
        return <React.Fragment key={col.id}>{renderCell(col.id)}</React.Fragment>;
      })}
    </TableRow>
  );
};
