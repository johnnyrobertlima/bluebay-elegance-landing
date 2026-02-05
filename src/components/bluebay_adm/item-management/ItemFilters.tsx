import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadAllItemsButton } from "@/components/bluebay_adm/item-management/LoadAllItemsButton";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, X, Search } from "lucide-react";
import { ChangeEvent, useRef, useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { DataUpgradeDialog } from "./DataUpgradeDialog";

interface ItemFiltersProps {
  searchTerms: string[];
  onAddSearchTerm: (term: string) => void;
  onRemoveSearchTerm: (term: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  empresaFilter: string;
  onEmpresaFilterChange: (value: string) => void;
  groups: any[];
  empresas: string[];
  onLoadAllItems: () => void;
  isLoadingAll: boolean;
  onExportItems?: () => void;
  onImportItems?: (file: File) => void;
}

export const ItemFilters = ({
  searchTerms,
  onAddSearchTerm,
  onRemoveSearchTerm,
  groupFilter,
  onGroupFilterChange,
  empresaFilter,
  onEmpresaFilterChange,
  groups,
  empresas,
  onLoadAllItems,
  isLoadingAll,
  onExportItems,
  onImportItems
}: ItemFiltersProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportItems) {
      onImportItems(file);
      e.target.value = '';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddSearchTerm(inputValue.trim());
        setInputValue("");
      }
    }
  };

  return (
    <div className="space-y-4 bg-card p-4 rounded-md border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite e aperte Enter para adicionar filtro..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8 w-full"
            />
          </div>

          {searchTerms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {searchTerms.map((term, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  {term}
                  <button
                    onClick={() => onRemoveSearchTerm(term)}
                    className="ml-1 hover:text-destructive focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {searchTerms.length > 0 && (
                <span className="text-xs text-muted-foreground self-center ml-1">
                  (Filtros acumulados: busca itens contendo TODAS as palavras)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-full md:w-64">
          <Select value={groupFilter} onValueChange={onGroupFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem
                  key={group.id || group.gru_codigo}
                  value={group.gru_codigo || `group-${group.id}`}
                >
                  {group.gru_descricao} {group.gru_codigo ? `(${group.gru_codigo})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-64">
          <Select value={empresaFilter} onValueChange={onEmpresaFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem
                  key={empresa || "sem-empresa"}
                  value={empresa || "sem-empresa"}
                >
                  {empresa || "Sem empresa"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between pt-2 border-t">
        <LoadAllItemsButton
          onLoadAll={onLoadAllItems}
          isLoading={isLoadingAll}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onExportItems}
          >
            <FileDown className="h-4 w-4" />
            Exportar Itens
          </Button>

          <DataUpgradeDialog onSuccess={onLoadAllItems} />

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleImportButtonClick}
          >
            <FileUp className="h-4 w-4" />
            Importar Itens (Legado)
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
