
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface GroupFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const GroupFilter: React.FC<GroupFilterProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Filtrar por grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os grupos</SelectItem>
          {options && options.map((group) => (
            <SelectItem key={group} value={group || "sem-nome"}>
              {group || "Sem nome"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
