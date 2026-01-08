
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Users, Receipt, BarChart2, FileText, ClipboardCheck, LogOut, FileSpreadsheet, Package, ShoppingBag, ShoppingCart, PackageCheck, Group, Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlobalSearch } from "./GlobalSearch";

export const BluebayAdmMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { name: "Home Bluebay", path: "/client-area/bluebay_adm", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { name: "Clientes", path: "/client-area/bluebay_adm/clients", icon: <Users className="h-4 w-4 mr-2" /> },
    { name: "Faturamento", path: "/client-area/bluebay_adm/financial", icon: <Receipt className="h-4 w-4 mr-2" /> },
    { name: "Financeiro", path: "/client-area/bluebay_adm/financeiromanager", icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> },
    { name: "Estoque", path: "/client-area/bluebay_adm/estoque", icon: <Package className="h-4 w-4 mr-2" /> },
    { name: "Análise de Compra", path: "/client-area/bluebay_adm/annalisedecompra", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
    { name: "Pedidos", path: "/client-area/bluebay_adm/pedidos", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { name: "Etiquetas do Produto", path: "/client-area/bluebay_adm/etiquetas", icon: <Tag className="h-4 w-4 mr-2" /> },
    { name: "Relatório de Itens", path: "/client-area/bluebay_adm/reports", icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: "Gerenciar Itens", path: "/client-area/bluebay_adm/item-management", icon: <PackageCheck className="h-4 w-4 mr-2" /> },
    { name: "Gerenciar Grupos", path: "/client-area/bluebay_adm/item-grupo-management", icon: <Group className="h-4 w-4 mr-2" /> },
    { name: "Solicitações", path: "/client-area/bluebay_adm/requests", icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado",
      });
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Não foi possível desconectar. Tente novamente.",
      });
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-primary shadow-md">
        <div className="container mx-auto px-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex justify-between items-center py-3">
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap",
                      isActive ? "bg-primary-800" : ""
                    )
                  }
                  end={item.path === "/client-area/bluebay_adm"}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 text-white hover:bg-primary-700"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Buscar</span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-primary-800 px-1.5 font-mono text-[10px] font-medium text-white/70">
                  ⌘K
                </kbd>
              </Button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex justify-between items-center py-3">
            <span className="font-semibold text-lg text-white">Bluebay ADM Menu</span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="mr-1 text-white hover:bg-primary-700"
              >
                <Search size={20} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="mr-2 text-white bg-blue-700 hover:bg-blue-800"
              >
                <LogOut size={20} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 text-white hover:bg-primary-700"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isOpen && (
            <div className="md:hidden py-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-2 text-sm rounded-md transition-colors text-white",
                      isActive ? "bg-primary-800" : "hover:bg-primary-700"
                    )
                  }
                  onClick={() => setIsOpen(false)}
                  end={item.path === "/client-area/bluebay_adm"}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm rounded-md transition-colors text-white bg-blue-700 hover:bg-blue-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};
