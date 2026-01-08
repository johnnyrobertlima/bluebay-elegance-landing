
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface LoadAllItemsButtonProps {
  onLoadAll: () => void;
  isLoading: boolean;
}

export const LoadAllItemsButton = ({
  onLoadAll,
  isLoading
}: LoadAllItemsButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onLoadAll}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          <span>Carregando produtos em lotes de 1000...</span>
        </>
      ) : (
        <span>Carregar todos os produtos</span>
      )}
    </Button>
  );
};
