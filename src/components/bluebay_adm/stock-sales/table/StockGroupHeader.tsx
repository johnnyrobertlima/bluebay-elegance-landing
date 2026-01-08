
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatTableNumber, formatTablePercentage } from "../utils/formatters";
import { GroupedStockData } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { StockTurnoverIndicator } from "./StockTurnoverIndicator";

interface StockGroupHeaderProps {
  group: GroupedStockData;
  onToggle: () => void;
  visibleColumns: Record<string, boolean>;
}

export const StockGroupHeader: React.FC<StockGroupHeaderProps> = ({ 
  group, 
  onToggle,
  visibleColumns
}) => {
  return (
    <TableRow 
      className="bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors group-header"
      onClick={onToggle}
    >
      <TableCell className="font-semibold flex items-center min-w-[250px] max-w-[250px] sticky left-0 z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
        {group.isExpanded ? 
          <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" /> : 
          <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
        }
        <div className="truncate">
          {group.groupName} ({group.totalItems} itens)
        </div>
      </TableCell>
      
      {visibleColumns.FISICO && (
        <TableCell className="font-medium text-right min-w-[120px]">
          {formatTableNumber(group.totalFisico, 0)}
        </TableCell>
      )}
      
      {visibleColumns.DISPONIVEL && (
        <TableCell className="font-medium text-right min-w-[120px]">
          {formatTableNumber(group.totalDisponivel, 0)}
        </TableCell>
      )}
      
      {visibleColumns.RESERVADO && (
        <TableCell className="font-medium text-right min-w-[120px]">
          {formatTableNumber(group.totalReservado, 0)}
        </TableCell>
      )}
      
      {visibleColumns.ENTROU && (
        <TableCell className="font-medium text-right min-w-[120px]">
          {formatTableNumber(group.totalEntrou || 0, 0)}
        </TableCell>
      )}
      
      {visibleColumns.QTD_VENDIDA && (
        <TableCell className="font-medium text-right min-w-[120px]">
          {formatTableNumber(group.totalVendido, 0)}
        </TableCell>
      )}
      
      {visibleColumns.VALOR_TOTAL_VENDIDO && (
        <TableCell className="font-medium text-right min-w-[150px]">
          {formatCurrency(group.totalValorVendido)}
        </TableCell>
      )}
      
      {visibleColumns.GIRO_ESTOQUE && (
        <TableCell className="font-medium text-right min-w-[120px]">
          <StockTurnoverIndicator turnover={group.giroEstoqueGrupo} />
        </TableCell>
      )}
      
      {visibleColumns.PERCENTUAL_ESTOQUE_VENDIDO && (
        <TableCell className="font-medium text-right min-w-[100px]">
          {formatTablePercentage(group.percentualVendidoGrupo)}
        </TableCell>
      )}
      
      {visibleColumns.DIAS_COBERTURA && (
        <TableCell className="font-medium text-right min-w-[120px]">
          {Math.round(group.diasCoberturaGrupo).toLocaleString()}
        </TableCell>
      )}
      
      {visibleColumns.DATA_ULTIMA_VENDA && (
        <TableCell className="font-medium text-center min-w-[120px]">
          -
        </TableCell>
      )}
      
      {visibleColumns.RANKING && (
        <TableCell className="font-medium text-right min-w-[100px]">
          -
        </TableCell>
      )}
    </TableRow>
  );
};
