
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { GroupedEstoque } from "@/types/bk/estoque";

interface AnaliseDeCompraGroupItemProps {
  group: GroupedEstoque;
  index: number;
}

export const AnaliseDeCompraGroupItem = ({ group, index }: AnaliseDeCompraGroupItemProps) => {
  return (
    <AccordionItem key={index} value={`group-${index}`} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
        <div className="flex justify-between items-center w-full pr-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-2 py-1 rounded-full bg-primary/10">
              {group.totalItems}
            </Badge>
            <span className="font-medium">{group.groupName}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Estoque Físico</p>
              <span className="font-medium">{group.totalFisico}</span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-white rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Físico</TableHead>
                <TableHead className="text-right">Disponível</TableHead>
                <TableHead className="text-right">Reservado</TableHead>
                <TableHead>Sublocalização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.items.map((item) => (
                <TableRow key={item.ITEM_CODIGO}>
                  <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                  <TableCell>{item.DESCRICAO}</TableCell>
                  <TableCell className="text-right">{item.FISICO}</TableCell>
                  <TableCell className="text-right">{item.DISPONIVEL}</TableCell>
                  <TableCell className="text-right">{item.RESERVADO}</TableCell>
                  <TableCell>{item.SUBLOCAL}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
