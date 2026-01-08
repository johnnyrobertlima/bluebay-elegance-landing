
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface ItemsTableProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => Promise<void>;
}

export const ItemsTable = ({ items, onEdit, onDelete }: ItemsTableProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-8 text-center">
        <p className="text-muted-foreground">Nenhum item encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="max-h-[600px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead className="w-[100px]">Cód. Auxiliar</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Data Cadastro</TableHead>
              <TableHead className="text-right w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.ITEM_CODIGO}>
                <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                <TableCell>{item.CODIGOAUX || "-"}</TableCell>
                <TableCell>{item.DESCRICAO}</TableCell>
                <TableCell>{item.GRU_DESCRICAO || "-"}</TableCell>
                <TableCell>
                  {item.ativo !== false ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.DATACADASTRO 
                    ? format(new Date(item.DATACADASTRO), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <AlertDialog>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o item "{item.DESCRICAO}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDelete(item)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
