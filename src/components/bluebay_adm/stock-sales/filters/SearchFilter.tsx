
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchFilterProps {
  searchTerms: string[];
  onAddSearchTerm: (value: string) => void;
  onRemoveSearchTerm: (value: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerms,
  onAddSearchTerm,
  onRemoveSearchTerm
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddSearchTerm(inputValue);
        setInputValue("");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-2 relative">
        <Search className="h-4 w-4 text-gray-500 absolute left-3" />
        <Input
          type="text"
          placeholder="Buscar por código ou descrição (Enter para adicionar)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
          disabled={searchTerms.length >= 20}
        />
      </div>

      {searchTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerms.map((term, index) => (
            <Badge
              key={`${term}-${index}`}
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
            >
              {term}
              <button
                onClick={() => onRemoveSearchTerm(term)}
                className="hover:text-blue-900 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
