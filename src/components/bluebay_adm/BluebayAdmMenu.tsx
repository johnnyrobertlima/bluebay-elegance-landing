import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu, X, Users, Receipt, BarChart2, FileText, ClipboardCheck, LogOut,
  FileSpreadsheet, Package, ShoppingBag, ShoppingCart, PackageCheck,
  Group, Tag, Search, Settings, Home, FolderPen, Briefcase, ChevronDown, LayoutDashboard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlobalSearch } from "./GlobalSearch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type MenuItem = {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
};

export const BluebayAdmMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Mobile submenus state
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems: MenuItem[] = [
    {
      name: "Home Bluebay",
      path: "/client-area/bluebay_adm",
      icon: <Home className="h-4 w-4 mr-2" />
    },
    {
      name: "Cadastros",
      icon: <FolderPen className="h-4 w-4 mr-2" />,
      children: [
        { name: "Gerenciar Grupos", path: "/client-area/bluebay_adm/item-grupo-management", icon: <Group className="h-4 w-4 mr-2" /> },
        { name: "Gerenciar Itens", path: "/client-area/bluebay_adm/item-management", icon: <PackageCheck className="h-4 w-4 mr-2" /> },
        { name: "Relatório de Itens", path: "/client-area/bluebay_adm/reports", icon: <FileText className="h-4 w-4 mr-2" /> },
      ]
    },
    {
      name: "Comercial",
      icon: <Briefcase className="h-4 w-4 mr-2" />,
      children: [
        { name: "Faturamento", path: "/client-area/bluebay_adm/financial", icon: <Receipt className="h-4 w-4 mr-2" /> },
        { name: "Financeiro", path: "/client-area/bluebay_adm/financeiromanager", icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> },
        { name: "Pedidos", path: "/client-area/bluebay_adm/pedidos", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
      ]
    },
    {
      name: "Clientes",
      icon: <Users className="h-4 w-4 mr-2" />,
      children: [
        { name: "Lista de Clientes", path: "/client-area/bluebay_adm/clients", icon: <Users className="h-4 w-4 mr-2" /> },
        { name: "Gerenciamento de Carteira", path: "/client-area/bluebay_adm/wallet-management", icon: <Briefcase className="h-4 w-4 mr-2" /> },
      ]
    },
    {
      name: "Produtos",
      icon: <Package className="h-4 w-4 mr-2" />,
      children: [
        { name: "Etiquetas do Produto", path: "/client-area/bluebay_adm/etiquetas", icon: <Tag className="h-4 w-4 mr-2" /> },
        { name: "Análise de Compra", path: "/client-area/bluebay_adm/annalisedecompra", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
        { name: "Desempenho por Estação", path: "/client-area/bluebay_adm/season-performance", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
        { name: "Estoque", path: "/client-area/bluebay_adm/estoque", icon: <Package className="h-4 w-4 mr-2" /> },
      ]
    },
    {
      name: "Solicitações",
      path: "/client-area/bluebay_adm/requests",
      icon: <ClipboardCheck className="h-4 w-4 mr-2" />
    },
    {
      name: "Configurações",
      icon: <Settings className="h-4 w-4 mr-2" />,
      children: [
        { name: "Gestão de Relatório", path: "/client-area/bluebay_adm/gestao-relatorios", icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> },
        { name: "Página Inicial", path: "/client-area/bluebay_adm/landing-page", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
      ]
    }
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
                item.children ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger className="flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap outline-none focus:bg-primary-700 data-[state=open]:bg-primary-700">
                      {item.icon}
                      {item.name}
                      <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.path} asChild>
                          <NavLink to={child.path!} className="flex items-center cursor-pointer w-full">
                            {child.icon}
                            {child.name}
                          </NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path!}
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
                )
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
            <span className="font-semibold text-lg text-white">Bluebay ADM</span>
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
            <div className="md:hidden py-2 space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto">
              {menuItems.map((item) => (
                item.children ? (
                  <Collapsible
                    key={item.name}
                    open={openSubmenus[item.name]}
                    onOpenChange={() => toggleSubmenu(item.name)}
                  >
                    <CollapsibleTrigger className="flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors text-white hover:bg-primary-700 justify-between">
                      <div className="flex items-center">
                        {item.icon}
                        {item.name}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openSubmenus[item.name] ? "transform rotate-180" : "")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 bg-primary-800/20 rounded-md my-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path!}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center pl-8 pr-4 py-2 text-sm rounded-md transition-colors text-white",
                              isActive ? "bg-primary-800" : "hover:bg-primary-700"
                            )
                          }
                          onClick={() => setIsOpen(false)}
                        >
                          {child.icon}
                          {child.name}
                        </NavLink>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path!}
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
                )
              ))}

              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm rounded-md transition-colors text-white bg-blue-700 hover:bg-blue-800 mt-4"
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
