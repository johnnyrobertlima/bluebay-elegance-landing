
import React from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import { ItemBadges } from "./ItemBadges";
import { StockTurnoverIndicator } from "./StockTurnoverIndicator";
import { formatCurrency, formatNumber, formatPercentage } from "../utils/formatters";
import { format } from "date-fns";

interface StockSalesTableRowProps {
  item: StockItem;
  index: number;
  visibleColumns: Record<string, boolean>;
}

export const StockSalesTableRow: React.FC<StockSalesTableRowProps> = ({ 
  item, 
  index,
  visibleColumns
}) => {
  const isEven = index % 2 === 0;
  // Updated to use a threshold of 5 units instead of 100
  const hasLowStock = (item.DISPONIVEL || 0) < 5;
  const isNewProduct = item.PRODUTO_NOVO;
  const isTopProduct = (item.RANKING || 0) <= 10;
  
  // Helper function to format dates
  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
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
      <TableCell className="p-2 font-medium sticky left-0 z-20 bg-inherit border-r">
        <div className="flex items-center">
          <span className="whitespace-nowrap">{item.ITEM_CODIGO}</span>
          <ItemBadges 
            isNew={isNewProduct} 
            isLowStock={hasLowStock} 
            isTop={isTopProduct}
          />
        </div>
      </TableCell>
      
      <TableCell className="p-2 max-w-[250px]">
        <div className="truncate" title={item.DESCRICAO}>
          {item.DESCRICAO}
        </div>
      </TableCell>
      
      <TableCell className="p-2">{item.GRU_DESCRICAO}</TableCell>
      
      {visibleColumns.FISICO && (
        <TableCell className="p-2 text-right">
          {formatNumber(item.FISICO)}
        </TableCell>
      )}
      
      {visibleColumns.DISPONIVEL && (
        <TableCell className="p-2 text-right">
          {formatNumber(item.DISPONIVEL)}
        </TableCell>
      )}
      
      {visibleColumns.RESERVADO && (
        <TableCell className="p-2 text-right">
          {formatNumber(item.RESERVADO)}
        </TableCell>
      )}
      
      {visibleColumns.ENTROU && (
        <TableCell className="p-2 text-right">
          {formatNumber(item.ENTROU)}
        </TableCell>
      )}
      
      {visibleColumns.QTD_VENDIDA && (
        <TableCell className="p-2 text-right">
          {formatNumber(item.QTD_VENDIDA)}
        </TableCell>
      )}
      
      {visibleColumns.VALOR_TOTAL_VENDIDO && (
        <TableCell className="p-2 text-right">
          {formatCurrency(item.VALOR_TOTAL_VENDIDO)}
        </TableCell>
      )}
      
      {visibleColumns.PRECO_MEDIO && (
        <TableCell className="p-2 text-right">
          {formatCurrency(item.PRECO_MEDIO)}
        </TableCell>
      )}
      
      {visibleColumns.CUSTO_MEDIO && (
        <TableCell className="p-2 text-right">
          {formatCurrency(item.CUSTO_MEDIO)}
        </TableCell>
      )}

      {/* Display the teste column (media_valor_unitario) */}
      {visibleColumns.teste && (
        <TableCell className="p-2 text-right">
          {formatCurrency(item.teste)}
        </TableCell>
      )}
      
      {visibleColumns.GIRO_ESTOQUE && (
        <TableCell className="p-2 text-right">
          <StockTurnoverIndicator turnover={item.GIRO_ESTOQUE} />
        </TableCell>
      )}
      
      {visibleColumns.PERCENTUAL_ESTOQUE_VENDIDO && (
        <TableCell className="p-2 text-right">
          {formatPercentage(item.PERCENTUAL_ESTOQUE_VENDIDO)}
        </TableCell>
      )}
      
      {visibleColumns.DIAS_COBERTURA && (
        <TableCell className="p-2 text-right">
          {item.DIAS_COBERTURA >= 999 ? "∞" : formatNumber(item.DIAS_COBERTURA)}
        </TableCell>
      )}
      
      {visibleColumns.DATA_ULTIMA_VENDA && (
        <TableCell className="p-2 text-center">
          {item.DATA_ULTIMA_VENDA ? formatDate(new Date(item.DATA_ULTIMA_VENDA)) : "-"}
        </TableCell>
      )}
      
      {visibleColumns.RANKING && (
        <TableCell className="p-2 text-right">
          {item.RANKING ? String(item.RANKING) : "-"}
        </TableCell>
      )}
    </TableRow>
  );
};
