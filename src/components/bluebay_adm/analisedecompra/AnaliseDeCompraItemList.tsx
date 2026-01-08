
import { Loader2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { GroupedEstoque } from "@/types/bk/estoque";
import { AnaliseDeCompraGroupItem } from "./AnaliseDeCompraGroupItem";

interface AnaliseDeCompraItemListProps {
  isLoading: boolean;
  groupedItems: GroupedEstoque[];
  searchTerm: string;
  totalItems: number;
}

export const AnaliseDeCompraItemList = ({ isLoading, groupedItems, searchTerm, totalItems }: AnaliseDeCompraItemListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-500">
          {searchTerm
            ? "Nenhum item com estoque positivo encontrado para esta busca."
            : "Nenhum item com estoque positivo disponível no momento."}
        </p>
      </div>
    );
  }

  // Calcular o total real de itens em todos os grupos
  const actualTotalItems = groupedItems.reduce((sum, group) => sum + group.items.length, 0);
  
  console.log(`🔢 Exibindo total informado: ${totalItems} itens, total real: ${actualTotalItems} itens`);

  return (
    <div>
      <div className="mb-4 text-sm text-gray-500">
        Exibindo {actualTotalItems} {actualTotalItems === 1 ? 'item' : 'itens'} {searchTerm ? 'para a busca atual' : 'no total'}
      </div>
      <Accordion type="multiple" className="w-full">
        {groupedItems.map((group, index) => (
          <AnaliseDeCompraGroupItem key={index} group={group} index={index} />
        ))}
      </Accordion>
    </div>
  );
};
