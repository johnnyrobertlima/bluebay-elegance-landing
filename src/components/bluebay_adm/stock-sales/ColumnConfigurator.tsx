
import React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings2, GripVertical, RotateCcw } from "lucide-react";
import { ColumnDefinition } from "@/hooks/bluebay_adm/stock-sales/useColumnConfig";
import { Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColumnConfiguratorProps {
    columns: ColumnDefinition[];
    onToggle: (id: string) => void;
    onReorder: (newOrder: ColumnDefinition[]) => void;
    onReset: () => void;
}

export const ColumnConfigurator: React.FC<ColumnConfiguratorProps> = ({
    columns,
    onToggle,
    onReorder,
    onReset
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 h-9">
                    <Settings2 className="h-4 w-4" />
                    <span>Colunas</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white shadow-xl border-gray-200" align="end">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                    <h4 className="font-semibold text-sm text-gray-900">Personalizar Colunas</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-8 px-2 text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Resetar
                    </Button>
                </div>

                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <Reorder.Group
                        axis="y"
                        values={columns}
                        onReorder={onReorder}
                        className="space-y-1"
                    >
                        {columns.map((column) => (
                            <ReorderItem
                                key={column.id}
                                column={column}
                                onToggle={onToggle}
                            />
                        ))}
                    </Reorder.Group>
                </div>

                <div className="p-3 bg-gray-50 text-[10px] text-gray-400 text-center border-t rounded-b-lg">
                    Arraste os itens para reordenar as colunas da tabela.
                </div>
            </PopoverContent>
        </Popover>
    );
};

interface ReorderItemProps {
    column: ColumnDefinition;
    onToggle: (id: string) => void;
}

const ReorderItem: React.FC<ReorderItemProps> = ({ column, onToggle }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={column}
            dragListener={false}
            dragControls={controls}
            className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100/80 group transition-colors",
                !column.visible && "opacity-60"
            )}
        >
            <div
                className="cursor-grab active:cursor-grabbing p-1 text-gray-300 group-hover:text-gray-500 transition-colors"
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <Checkbox
                id={`col-${column.id}`}
                checked={column.visible}
                onCheckedChange={() => onToggle(column.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />

            <Label
                htmlFor={`col-${column.id}`}
                className="flex-1 text-sm font-medium text-gray-700 cursor-pointer select-none"
            >
                {column.label}
            </Label>
        </Reorder.Item>
    );
};
