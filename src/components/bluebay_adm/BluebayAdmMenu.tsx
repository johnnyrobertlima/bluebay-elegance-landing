import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu, X, Users, Receipt, BarChart2, FileText, ClipboardCheck, LogOut,
  FileSpreadsheet, Package, ShoppingBag, ShoppingCart, PackageCheck,
  Group, Tag, Search, Settings, Home, FolderPen, Briefcase, ChevronDown, LayoutDashboard,
  Layers, Box, DollarSign, CreditCard, Warehouse, ClipboardList, Layout, Shield, Wallet
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
import { useAuth } from "@/hooks/useAuth";

type MenuItem = {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  sort_order?: number;
};

// Map string icon names to components
const IconMap: Record<string, any> = {
  Home: Home,
  Database: FolderPen,
  Users: Users,
  Layers: Layers,
  Box: Box,
  FileText: FileText,
  Briefcase: Briefcase,
  DollarSign: DollarSign,
  CreditCard: CreditCard,
  ShoppingCart: ShoppingCart,
  ShoppingBag: ShoppingBag,
  Package: Package,
  Tag: Tag,
  BarChart: BarChart2,
  BarChart2: BarChart2,
  Warehouse: Warehouse,
  ClipboardList: ClipboardList,
  File: FileText,
  FileSpreadsheet: FileSpreadsheet,
  Settings: Settings,
  Layout: Layout,
  LayoutDashboard: LayoutDashboard,
  Shield: Shield,
  Receipt: Receipt,
  PackageCheck: PackageCheck,
  Group: Group,
  Search: Search,
  ClipboardCheck: ClipboardCheck
};

export const BluebayAdmMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, allowedPaths, homePage } = useAuth();

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return <Home className="h-4 w-4 mr-2" />;
    const IconComponent = IconMap[iconName] || Home;
    return <IconComponent className="h-4 w-4 mr-2" />;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user) return;

      try {
        setIsLoadingMenu(true);
        // 1. Fetch ALL active pages
        const { data: allPages, error } = await (supabase as any)
          .from("bluebay_system_page")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;

        // 2. Filter pages based on permissions
        // We build a set of visible IDs to ensure parents are always included
        const visiblePageIds = new Set<string>();
        const allPagesMap = new Map<string, any>();
        (allPages || []).forEach(p => allPagesMap.set(p.id, p));

        const normalizedAllowedPaths = (allowedPaths || []).map(p => p.toLowerCase().trim());

        (allPages || []).forEach((page: any) => {
          const path = page.path?.toLowerCase().trim();
          if (isAdmin || normalizedAllowedPaths.includes(path)) {
            visiblePageIds.add(page.id);

            // Safety: Ensure all parents are visible too
            let parentId = page.parent_id;
            while (parentId && allPagesMap.has(parentId)) {
              if (visiblePageIds.has(parentId)) break;
              visiblePageIds.add(parentId);
              parentId = allPagesMap.get(parentId).parent_id;
            }
          }
        });

        // 3. Build hierarchy from visible set
        const pageMap = new Map<string, MenuItem>();

        // Pass 1: Create visible items
        visiblePageIds.forEach(id => {
          const page = allPagesMap.get(id);
          pageMap.set(id, {
            name: page.name,
            path: page.path,
            icon: getIcon(page.icon),
            children: []
          });
        });

        // Pass 2: Connect children
        visiblePageIds.forEach(id => {
          const page = allPagesMap.get(id);
          const item = pageMap.get(id)!;
          if (page.parent_id && pageMap.has(page.parent_id)) {
            pageMap.get(page.parent_id)!.children!.push(item);
          }
        });

        // Pass 3: Final root list (Filter out orphan roots as per request)
        const rootItems: MenuItem[] = [];

        // ALways add Home button first, linking to user's homePage
        rootItems.push({
          name: "Início",
          path: homePage || "/client-area/bluebay_adm",
          icon: <Home className="h-4 w-4 mr-2" />
        });

        visiblePageIds.forEach(id => {
          const page = allPagesMap.get(id);
          if (!page.parent_id) {
            const item = pageMap.get(id)!;
            // Only show root if it has children
            // Standalone roots are accessible but not shown in menu as per user request
            if (item.children && item.children.length > 0) {
              // Avoid duplicates if Home is also in system pages
              const path = item.path?.toLowerCase().trim();
              const homePath = homePage?.toLowerCase().trim();
              if (path !== homePath) {
                rootItems.push(item);
              }
            }
          }
        });

        setMenuItems(rootItems);
      } catch (error) {
        console.error("Error building dynamic menu:", error);
        toast({ variant: "destructive", title: "Erro ao carregar menu dinâmico" });
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [user, isAdmin, allowedPaths]);

  const handleLogout = async () => {
    try {
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado",
      });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      // If it's a 403 or any other error, we still want to redirect the user
      // and clear the local session perception if possible.
      // useAuth hook will likely pick up the session change anyway or we force navigation.
      if (error.status === 403) {
        // Session likely already invalid
      }
      toast({
        title: "Desconectado",
        description: "Sessão encerrada.",
      });
    } finally {
      navigate('/login');
    }
  };

  if (!user) return null; // Don't show menu if not logged in

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-primary shadow-md">
        <div className="container mx-auto px-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex justify-between items-center py-3">
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => (
                item.children && item.children.length > 0 ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger className="flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap outline-none focus:bg-primary-700 data-[state=open]:bg-primary-700">
                      {item.icon}
                      {item.name}
                      <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.name} asChild>
                          <NavLink to={child.path || "#"} className="flex items-center cursor-pointer w-full">
                            {child.icon}
                            {child.name}
                          </NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <NavLink
                    key={item.name}
                    to={item.path || "#"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap",
                        isActive ? "bg-primary-800" : ""
                      )
                    }
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
                item.children && item.children.length > 0 ? (
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
                          key={child.name}
                          to={child.path || "#"}
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
                    key={item.name}
                    to={item.path || "#"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-2 text-sm rounded-md transition-colors text-white",
                        isActive ? "bg-primary-800" : "hover:bg-primary-700"
                      )
                    }
                    onClick={() => setIsOpen(false)}
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
