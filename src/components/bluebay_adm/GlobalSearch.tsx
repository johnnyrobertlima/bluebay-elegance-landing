
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Package, ShoppingBag, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "client" | "product" | "order";
  title: string;
  subtitle: string;
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const searchData = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search clients
      const { data: clients } = await supabase
        .from("BLUEBAY_PESSOA")
        .select("PES_CODIGO, RAZAOSOCIAL, APELIDO, CNPJCPF, CIDADE, UF")
        .or(`RAZAOSOCIAL.ilike.%${term}%,APELIDO.ilike.%${term}%,CNPJCPF.ilike.%${term}%`)
        .limit(5);

      if (clients) {
        clients.forEach((client) => {
          searchResults.push({
            id: `client-${client.PES_CODIGO}`,
            type: "client",
            title: client.RAZAOSOCIAL || client.APELIDO || "Cliente",
            subtitle: `${client.CNPJCPF || ""} • ${client.CIDADE || ""}/${client.UF || ""}`,
            path: `/client-area/bluebay_adm/clients?search=${encodeURIComponent(client.RAZAOSOCIAL || client.APELIDO || "")}`,
          });
        });
      }

      // Search products
      const { data: products } = await supabase
        .from("BLUEBAY_ITEM")
        .select("ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO, CODIGOAUX")
        .or(`DESCRICAO.ilike.%${term}%,ITEM_CODIGO.ilike.%${term}%,CODIGOAUX.ilike.%${term}%`)
        .limit(5);

      if (products) {
        products.forEach((product) => {
          searchResults.push({
            id: `product-${product.ITEM_CODIGO}`,
            type: "product",
            title: product.DESCRICAO || product.ITEM_CODIGO,
            subtitle: `Código: ${product.ITEM_CODIGO} • ${product.GRU_DESCRICAO || "Sem grupo"}`,
            path: `/client-area/bluebay_adm/item-management?search=${encodeURIComponent(product.ITEM_CODIGO)}`,
          });
        });
      }

      // Search orders
      const { data: orders } = await supabase
        .from("BLUEBAY_PEDIDO")
        .select("PED_NUMPEDIDO, PED_ANOBASE, DATA_PEDIDO, STATUS, PEDIDO_CLIENTE")
        .or(`PED_NUMPEDIDO.ilike.%${term}%,PEDIDO_CLIENTE.ilike.%${term}%`)
        .limit(5);

      if (orders) {
        orders.forEach((order) => {
          searchResults.push({
            id: `order-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`,
            type: "order",
            title: `Pedido ${order.PED_NUMPEDIDO}`,
            subtitle: `${order.DATA_PEDIDO ? new Date(order.DATA_PEDIDO).toLocaleDateString("pt-BR") : ""} • ${order.STATUS || ""}`,
            path: `/client-area/bluebay_adm/pedidos?search=${encodeURIComponent(order.PED_NUMPEDIDO)}`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchData(searchTerm);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, searchData]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
    }
  }, [open]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onOpenChange(false);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return <Users className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "order":
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return "Cliente";
      case "product":
        return "Produto";
      case "order":
        return "Pedido";
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return "bg-green-100 text-green-700";
      case "product":
        return "bg-blue-100 text-blue-700";
      case "order":
        return "bg-amber-100 text-amber-700";
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Busca Global</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes, produtos ou pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="border-t mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Digite pelo menos 2 caracteres para buscar</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Nenhum resultado encontrado para "{searchTerm}"</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="p-2">
                {(["client", "product", "order"] as const).map((type) => {
                  const typeResults = groupedResults[type];
                  if (!typeResults?.length) return null;

                  return (
                    <div key={type} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getTypeColor(type))}>
                          {getTypeLabel(type)}s ({typeResults.length})
                        </span>
                      </div>
                      {typeResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", getTypeColor(result.type))}>
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{result.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Enter</kbd> selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Esc</kbd> fechar
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
