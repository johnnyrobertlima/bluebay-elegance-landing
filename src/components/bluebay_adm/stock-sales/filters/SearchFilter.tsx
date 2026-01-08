
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex-1 flex items-center gap-2 relative">
      <Search className="h-4 w-4 text-gray-500 absolute left-3" />
      <Input
        type="text"
        placeholder="Buscar por código ou descrição"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};
