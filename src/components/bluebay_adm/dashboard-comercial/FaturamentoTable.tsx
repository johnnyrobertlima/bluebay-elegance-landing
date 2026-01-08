
import React from "react";
import { Card } from "@/components/ui/card";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaturamentoTableContent } from "./tables/FaturamentoTable";
import { PedidosTableContent } from "./tables/PedidosTable";

interface FaturamentoTableProps {
  faturamentoData: FaturamentoItem[];
  pedidoData: PedidoItem[];
  isLoading: boolean;
}

export const FaturamentoTable: React.FC<FaturamentoTableProps> = ({ 
  faturamentoData, 
  pedidoData, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="p-4 mt-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-6">
      <Tabs defaultValue="faturamento">
        <TabsList className="mb-4">
          <TabsTrigger value="faturamento">Notas Fiscais Emitidas</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faturamento">
          <h2 className="text-xl font-semibold mb-4">Notas Fiscais Emitidas</h2>
          <FaturamentoTableContent 
            faturamentoData={faturamentoData} 
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="pedidos">
          <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
          <PedidosTableContent 
            pedidoData={pedidoData}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
