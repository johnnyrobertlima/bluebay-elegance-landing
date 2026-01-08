
import React from "react";
import { TableBody } from "@/components/ui/table";
import { GroupedStockData } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { StockGroupHeader } from "./StockGroupHeader";
import { StockSalesTableRow } from "./StockSalesTableRow";

interface GroupedTableBodyProps {
  groupedData: GroupedStockData[];
  toggleGroup: (groupName: string) => void;
  visibleColumns: Record<string, boolean>;
}

export const GroupedTableBody: React.FC<GroupedTableBodyProps> = ({
  groupedData,
  toggleGroup,
  visibleColumns
}) => {
  return (
    <TableBody>
      {groupedData.map((group) => (
        <React.Fragment key={group.groupName}>
          {/* Group Header Row */}
          <StockGroupHeader 
            group={group}
            onToggle={() => toggleGroup(group.groupName)}
            visibleColumns={visibleColumns}
          />
          
          {/* Group Items (when expanded) */}
          {group.isExpanded && group.items.map((item, itemIndex) => (
            <StockSalesTableRow 
              key={`${item.ITEM_CODIGO}-${itemIndex}`} 
              item={item} 
              index={itemIndex}
              visibleColumns={visibleColumns}
            />
          ))}
        </React.Fragment>
      ))}
    </TableBody>
  );
};
