import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  FolderTree,
  Loader2,
  Folder,
  Menu,
  Shield, // Added missing import
  Wand2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItem {
  id: string;
  group_id: string;
  parent_id: string | null;
  page_id: string | null;
  label: string;
  icon: string | null;
  path: string | null;
  sort_order: number;
  level: number;
  is_active: boolean;
}

interface SystemPage {
  id: string;
  path: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

interface PagePermission {
  id: string;
  group_id: string;
  page_id: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  page?: SystemPage;
}

interface UserGroup {
  id: string;
  name: string;
}

const AdminGroupMenus = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [group, setGroup] = useState<UserGroup | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [systemPages, setSystemPages] = useState<SystemPage[]>([]);
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Unified Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    icon: "",
    path: "",
    parent_id: "",
    page_id: "",
    sort_order: 0,
    level: 1,
    is_active: true,
    // Unified Permission / Page Creation fields
    is_new_page: false,
    new_page_name: "",
    new_page_path: "",
    new_page_icon: "",
    // Permissions
    can_view: true,
    can_edit: false,
    can_delete: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin && groupId) {
      loadData();
    }
  }, [user, isAdmin, groupId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load group info
      const { data: groupData } = await (supabase as any)
        .from("bluebay_group") // Updated to new table
        .select("id, name")
        .eq("id", groupId)
        .single();

      if (groupData) setGroup(groupData as UserGroup);

      // Load menu items
      const { data: menuData } = await (supabase as any)
        .from("bluebay_menu_item")
        .select("*")
        .eq("group_id", groupId)
        .order("level")
        .order("sort_order");

      setMenuItems((menuData || []) as MenuItem[]);

      const { data: pagesData } = await (supabase as any)
        .from("bluebay_system_page")
        .select("*")
        .order("name");

      setSystemPages((pagesData || []) as SystemPage[]);

      // Load permissions
      const { data: permsData } = await (supabase as any)
        .from("bluebay_group_permission")
        .select("*, page:bluebay_system_page(*)")
        .eq("group_id", groupId);

      setPermissions((permsData || []) as PagePermission[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultStructure = async () => {
    try {
      setIsGenerating(true);

      // Define the structure requested
      const structure = [
        { label: "Home Bluebay", path: "/client-area/bluebay_adm", icon: "Home", sort: 1 },
        {
          label: "Cadastros", icon: "Database", sort: 2,
          children: [
            { label: "Clientes", path: "/client-area/bluebay_adm/clients", icon: "Users" },
            { label: "Gerenciar Grupos", path: "/client-area/bluebay_adm/item-grupo-management", icon: "Layers" },
            { label: "Gerenciar Itens", path: "/client-area/bluebay_adm/item-management", icon: "Box" },
            { label: "Relatório de Itens", path: "/client-area/bluebay_adm/reports", icon: "FileText" }
          ]
        },
        {
          label: "Comercial", icon: "Briefcase", sort: 3,
          children: [
            { label: "Faturamento", path: "/client-area/bluebay_adm/financial", icon: "DollarSign" },
            { label: "Financeiro", path: "/client-area/bluebay_adm/financeiromanager", icon: "CreditCard" },
            { label: "Pedidos", path: "/client-area/bluebay_adm/pedidos", icon: "ShoppingCart" },
            { label: "Relatório de Item", path: "/client-area/bluebay_adm/reports", icon: "FileText" }
          ]
        },
        {
          label: "Produtos", icon: "Package", sort: 4,
          children: [
            { label: "Etiquetas do Produto", path: "/client-area/bluebay_adm/etiquetas", icon: "Tag" },
            { label: "Análise de Compra", path: "/client-area/bluebay_adm/annalisedecompra", icon: "BarChart" },
            { label: "Estoque", path: "/client-area/bluebay_adm/estoque", icon: "Warehouse" },
            { label: "Gerenciamento de Grupos", path: "/client-area/bluebay_adm/item-grupo-management", icon: "Layers" }
          ]
        },
        { label: "Solicitações", path: "/client-area/bluebay_adm/requests", icon: "ClipboardList", sort: 5 },
        {
          label: "Financeiro", icon: "DollarSign", sort: 6,
          children: [
            { label: "Financeiro Bluebay", path: "/client-area/bluebay_adm/financeiromanager", icon: "CreditCard" }
          ]
        },
        {
          label: "Configurações", icon: "Settings", sort: 7,
          children: [
            { label: "Gestão de Relatório", path: "/client-area/bluebay_adm/gestao-relatorios", icon: "File" },
            { label: "Gestão de Páginas", path: "/client-area/bluebay_adm/gestaopaginas", icon: "Layout" },
            { label: "Admin Page", path: "/client-area/bluebay_adm/landing-page", icon: "Layout" },
            { label: "Gestão de Usuário", path: "/admin/users", icon: "Users" },
            { label: "Grupos de Usuarioarios", path: "/admin/user-groups", icon: "Users" }
          ]
        }
      ];

      // Fetch all pages to map paths to IDs
      const { data: allPages } = await (supabase as any).from("bluebay_system_page").select("id, path");
      const pageMap = new Map();
      if (allPages) {
        allPages.forEach((p: any) => pageMap.set(p.path, p.id));
      }

      for (const item of structure) {
        // Create Parent
        let parentId = null;

        // Check if parent exists to avoid dupes (simple check by label)
        const existingParent = menuItems.find(m => m.label === item.label && m.level === 1);

        if (existingParent) {
          parentId = existingParent.id;
        } else {
          const pageId = item.path ? pageMap.get(item.path) : null;
          const { data: newParent, error } = await (supabase as any).from("bluebay_menu_item").insert({
            group_id: groupId,
            label: item.label,
            icon: item.icon,
            sort_order: item.sort,
            level: 1,
            is_active: true,
            path: item.path || null,
            page_id: pageId || null
          }).select().single();

          if (error) throw error;
          parentId = newParent.id;

          // Also grant VIEW permission for this page if it exists
          if (pageId) {
            await (supabase as any).from("bluebay_group_permission").upsert({
              group_id: groupId,
              page_id: pageId,
              can_view: true
            }, { onConflict: 'group_id,page_id' });
          }
        }

        // Create Children
        if (item.children && parentId) {
          let childSort = 1;
          for (const child of item.children) {
            const childPageId = child.path ? pageMap.get(child.path) : null;

            // Check if child exists
            const existingChild = menuItems.find(m => m.label === child.label && m.parent_id === parentId);

            if (!existingChild) {
              await (supabase as any).from("bluebay_menu_item").insert({
                group_id: groupId,
                label: child.label,
                icon: child.icon,
                sort_order: childSort++,
                level: 2,
                parent_id: parentId,
                is_active: true,
                path: child.path,
                page_id: childPageId || null
              });

              // Also grant VIEW permission for this page if it exists
              if (childPageId) {
                await (supabase as any).from("bluebay_group_permission").upsert({
                  group_id: groupId,
                  page_id: childPageId,
                  can_view: true
                }, { onConflict: 'group_id,page_id' });
              }
            }
          }
        }
      }

      toast({ title: "Estrutura padrão personalizada gerada!" });
      loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao gerar estrutura", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setSelectedMenuItem(item);
      // Try to find if this item has a permission linked to its page_id
      const linkedPerm = item.page_id ? permissions.find(p => p.page_id === item.page_id) : null;

      setFormData({
        label: item.label,
        icon: item.icon || "",
        path: item.path || "",
        parent_id: item.parent_id || "",
        page_id: item.page_id || "",
        sort_order: item.sort_order,
        level: item.level,
        is_active: item.is_active,
        is_new_page: false,
        new_page_name: "",
        new_page_path: "",
        new_page_icon: "",
        can_view: linkedPerm ? linkedPerm.can_view : true,
        can_edit: linkedPerm ? linkedPerm.can_edit : false,
        can_delete: linkedPerm ? linkedPerm.can_delete : false,
      });
    } else {
      setSelectedMenuItem(null);
      setFormData({
        label: "",
        icon: "",
        path: "",
        parent_id: "",
        page_id: "",
        sort_order: menuItems.length + 1,
        // Default logic for level: if we add via "Add Subitem", this might need adjustment, but general "New Item" is root.
        level: 1,
        is_active: true,
        is_new_page: false,
        new_page_name: "",
        new_page_path: "",
        new_page_icon: "",
        can_view: true,
        can_edit: false,
        can_delete: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      toast({ variant: "destructive", title: "Label obrigatório" });
      return;
    }

    try {
      setIsSaving(true);

      let finalPageId = formData.page_id;

      // 1. Create System Page if requested
      if (formData.is_new_page) {
        if (!formData.new_page_name || !formData.new_page_path) {
          toast({ variant: "destructive", title: "Para criar página, Nome e Caminho são obrigatórios" });
          setIsSaving(false); return;
        }
        const { data: newPage, error: pageErr } = await (supabase as any)
          .from("bluebay_system_page")
          .insert({
            name: formData.new_page_name,
            path: formData.new_page_path,
            icon: formData.new_page_icon || null,
            is_active: true
          })
          .select()
          .single();

        if (pageErr) throw pageErr;
        finalPageId = newPage.id;
      }

      // 2. Upsert Permission if page is selected
      if (finalPageId && finalPageId !== "none") {
        // Check if permission exists
        const existingPerm = permissions.find(p => p.page_id === finalPageId);

        if (existingPerm) {
          // Update
          await (supabase as any).from("bluebay_group_permission")
            .update({
              can_view: formData.can_view,
              can_edit: formData.can_edit,
              can_delete: formData.can_delete
            })
            .eq("id", existingPerm.id);
        } else {
          // Create
          await (supabase as any).from("bluebay_group_permission")
            .insert({
              group_id: groupId,
              page_id: finalPageId,
              can_view: formData.can_view,
              can_edit: formData.can_edit,
              can_delete: formData.can_delete
            });
        }
      }

      // 3. Save Menu Item
      const menuData = {
        group_id: groupId,
        label: formData.label,
        icon: formData.icon || null,
        path: formData.path || null,
        parent_id: formData.parent_id === "none" ? null : (formData.parent_id || null),
        page_id: finalPageId === "none" ? null : (finalPageId || null),
        sort_order: formData.sort_order,
        level: formData.parent_id && formData.parent_id !== "none" ? 2 : 1,
        is_active: formData.is_active,
      };

      if (selectedMenuItem) {
        const { error } = await (supabase as any)
          .from("bluebay_menu_item")
          .update(menuData)
          .eq("id", selectedMenuItem.id);
        if (error) throw error;
        toast({ title: "Item atualizado!" });
      } else {
        const { error } = await (supabase as any).from("bluebay_menu_item").insert(menuData);
        if (error) throw error;
        toast({ title: "Item criado!" });
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("bluebay_menu_item")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast({ title: "Item excluído!" });
      loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    }
  };

  const getParentMenuItems = () => {
    return menuItems.filter((item) => item.level === 1);
  };

  const getChildMenuItems = (parentId: string) => {
    return menuItems.filter((item) => item.parent_id === parentId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/groups")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configurar Estrutura: {group?.name || "..."}</h1>
            <p className="text-muted-foreground">Defina menus e permissões em um só lugar</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <CardTitle>Estrutura de Acesso</CardTitle>
            </div>
            <div className="flex gap-2">
              {menuItems.length === 0 && (
                <Button variant="secondary" onClick={generateDefaultStructure} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Gerar Padrão
                </Button>
              )}
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum item de menu configurado. Gere a estrutura padrão para começar.
              </div>
            ) : (
              <div className="space-y-4">
                {getParentMenuItems().map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/40 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.icon === "Home" && <FolderTree className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded border">
                          {getChildMenuItems(item.id).length} subitens
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Excluir {item.label}?</AlertDialogTitle>
                            <AlertDialogDescription>Isso excluirá o item e todos o seus subitens.</AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive" onClick={() => handleDeleteMenuItem(item.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="divide-y">
                      {getChildMenuItems(item.id).map(child => {
                        const perm = child.page_id ? permissions.find(p => p.page_id === child.page_id) : null;
                        return (
                          <div key={child.id} className="p-3 pl-8 flex items-center justify-between hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <span>{child.label}</span>
                              {child.page_id && (
                                <div className="flex gap-1 ml-4">
                                  {perm?.can_view && <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded">Visualizar</span>}
                                  {perm?.can_edit && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">Editar</span>}
                                  {perm?.can_delete && <span className="text-[10px] bg-red-100 text-red-800 px-1 rounded">Excluir</span>}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenDialog(child)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>Excluir {child.label}?</AlertDialogTitle>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive" onClick={() => handleDeleteMenuItem(child.id)}>Excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        );
                      })}

                      {/* Shortuct to add subitem */}
                      {/* <div className="p-2 pl-8">
                               <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => {
                                  setSelectedMenuItem(null);
                                  setFormData({ ...formData, parent_id: item.id });
                                  setIsDialogOpen(true);
                               }}>
                                  <Plus className="h-3 w-3 mr-1" /> Adicionar Subitem
                               </Button>
                            </div> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unified Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedMenuItem ? `Editar: ${selectedMenuItem.label}` : "Novo Item de Acesso"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do item de menu e suas permissões.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Left Column: Menu Config */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                  <Menu className="h-4 w-4" /> Configuração do Menu
                </h4>

                <div className="space-y-2">
                  <Label>Seção / Label</Label>
                  <Input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="Ex: Clientes" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="Users" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ordem</Label>
                    <Input type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Item Pai (Agrupador)</Label>
                  <Select value={formData.parent_id || "none"} onValueChange={(v) => setFormData({ ...formData, parent_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Raiz" /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-950">
                      <SelectItem value="none">Nenhum (Item Raiz)</SelectItem>
                      {getParentMenuItems().map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column: Permission & Linking */}
              <div className="space-y-4 pl-6 border-l">
                <h4 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Vínculo e Permissões
                </h4>

                <div className="flex items-center space-x-2 pb-2">
                  <Switch id="create_mode" checked={formData.is_new_page} onCheckedChange={(c) => setFormData({ ...formData, is_new_page: c, page_id: "" })} />
                  <Label htmlFor="create_mode" className="text-xs">Criar nova página de sistema?</Label>
                </div>

                {formData.is_new_page ? (
                  <div className="space-y-2 bg-muted/30 p-2 rounded border animate-in fade-in">
                    <Input className="h-8 text-xs" placeholder="Nome da Página" value={formData.new_page_name} onChange={e => setFormData({ ...formData, new_page_name: e.target.value })} />
                    <Input className="h-8 text-xs font-mono" placeholder="/rota-acesso" value={formData.new_page_path} onChange={e => setFormData({ ...formData, new_page_path: e.target.value })} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Vincular a Página Existente</Label>
                    <Select value={formData.page_id || "none"} onValueChange={(v) => setFormData({ ...formData, page_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950">
                        <SelectItem value="none">Sem Vínculo (Apenas Pasta)</SelectItem>
                        {systemPages.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.path})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <Label>Permissões concedidas ao grupo:</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="cv" checked={formData.can_view} onCheckedChange={(c) => setFormData({ ...formData, can_view: !!c })} />
                      <Label htmlFor="cv">Visualizar</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="ce" checked={formData.can_edit} onCheckedChange={(c) => setFormData({ ...formData, can_edit: !!c })} />
                      <Label htmlFor="ce">Editar (Salvar/Alterar)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="cd" checked={formData.can_delete} onCheckedChange={(c) => setFormData({ ...formData, can_delete: !!c })} />
                      <Label htmlFor="cd">Excluir</Label>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Tudo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default AdminGroupMenus;
