
import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface ItemManagementHeaderProps {
  onNewItem: () => void;
  isDialogOpen: boolean;
}

export const ItemManagementHeader = ({ 
  onNewItem, 
  isDialogOpen 
}: ItemManagementHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <PackageCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Gerenciamento de Itens</h1>
      </div>
      
      <Dialog open={isDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex gap-2 items-center" onClick={onNewItem}>
            <span className="plus-icon">+</span>
            Novo Item
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
};
