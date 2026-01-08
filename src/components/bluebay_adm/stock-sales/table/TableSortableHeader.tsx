
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableHead } from "@/components/ui/table";

interface TableSortableHeaderProps {
  sortKey: keyof StockItem;
  label: string;
  currentSortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
  width?: string;
  align?: 'left' | 'right' | 'center';
  isSticky?: boolean;
  left?: number;
}

export const TableSortableHeader: React.FC<TableSortableHeaderProps> = ({
  sortKey,
  label,
  currentSortConfig,
  onSort,
  width = 'auto',
  align = 'left',
  isSticky = false,
  left = 0
}) => {
  const isActive = currentSortConfig.key === sortKey;
  const alignmentClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  
  const stickyStyles: React.CSSProperties = isSticky ? {
    position: 'sticky',
    left: `${left}px`,
    zIndex: 35,
    backgroundColor: '#f9fafb'
  } : {};
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 whitespace-nowrap bg-gray-50 font-medium ${isSticky ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}
      onClick={() => onSort(sortKey)}
      style={{ 
        minWidth: width === 'auto' ? 'auto' : width,
        width: width === 'auto' ? 'auto' : width,
        ...stickyStyles
      }}
    >
      <div className={`flex items-center ${alignmentClass} w-full`}>
        {label}
        <ArrowUpDown 
          className={`inline ml-1 h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`}
        />
      </div>
    </TableHead>
  );
};
