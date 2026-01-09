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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Menu,
  Shield,
  Loader2,
  ChevronRight,
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
  });
  const [isSaving, setIsSaving] = useState(false);

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
        .from("user_groups")
        .select("id, name")
        .eq("id", groupId)
        .single();

      if (groupData) setGroup(groupData as UserGroup);

      // Load menu items
      const { data: menuData } = await (supabase as any)
        .from("menu_items")
        .select("*")
        .eq("group_id", groupId)
        .order("level")
        .order("sort_order");

      setMenuItems((menuData || []) as MenuItem[]);

      // Load system pages
      const { data: pagesData } = await (supabase as any)
        .from("system_pages")
        .select("*")
        .order("name");

      setSystemPages((pagesData || []) as SystemPage[]);

      // Load permissions
      const { data: permsData } = await (supabase as any)
        .from("group_page_permissions")
        .select("*, page:system_pages(*)")
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

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setSelectedMenuItem(item);
      setFormData({
        label: item.label,
        icon: item.icon || "",
        path: item.path || "",
        parent_id: item.parent_id || "",
        page_id: item.page_id || "",
        sort_order: item.sort_order,
        level: item.level,
        is_active: item.is_active,
      });
    } else {
      setSelectedMenuItem(null);
      setFormData({
        label: "",
        icon: "",
        path: "",
        parent_id: "",
        page_id: "",
        sort_order: menuItems.length,
        level: 1,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveMenuItem = async () => {
    if (!formData.label.trim()) {
      toast({
        variant: "destructive",
        title: "Label obrigatório",
        description: "Informe o label do item de menu.",
      });
      return;
    }

    try {
      setIsSaving(true);

      const menuData = {
        group_id: groupId,
        label: formData.label,
        icon: formData.icon || null,
        path: formData.path || null,
        parent_id: formData.parent_id || null,
        page_id: formData.page_id || null,
        sort_order: formData.sort_order,
        level: formData.parent_id ? 2 : 1,
        is_active: formData.is_active,
      };

      if (selectedMenuItem) {
        const { error } = await (supabase as any)
          .from("menu_items")
          .update(menuData)
          .eq("id", selectedMenuItem.id);

        if (error) throw error;
        toast({ title: "Item de menu atualizado!" });
      } else {
        const { error } = await (supabase as any).from("menu_items").insert(menuData);

        if (error) throw error;
        toast({ title: "Item de menu criado!" });
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
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast({ title: "Item de menu excluído!" });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message,
      });
    }
  };

  const handleTogglePermission = async (
    pageId: string,
    field: "can_view" | "can_edit" | "can_delete",
    currentValue: boolean
  ) => {
    try {
      const existing = permissions.find((p) => p.page_id === pageId);

      if (existing) {
        const { error } = await (supabase as any)
          .from("group_page_permissions")
          .update({ [field]: !currentValue })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("group_page_permissions").insert({
          group_id: groupId,
          page_id: pageId,
          [field]: true,
        });

        if (error) throw error;
      }

      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar permissão",
        description: error.message,
      });
    }
  };

  const getPermission = (pageId: string) => {
    return permissions.find((p) => p.page_id === pageId);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/groups")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Configurar Grupo: {group?.name || "..."}
            </h1>
            <p className="text-muted-foreground">
              Gerencie menus e permissões de páginas
            </p>
          </div>
        </div>

        <Tabs defaultValue="menus" className="space-y-6">
          <TabsList>
            <TabsTrigger value="menus" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Menus
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menus">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Itens de Menu</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedMenuItem ? "Editar Item" : "Novo Item de Menu"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input
                          value={formData.label}
                          onChange={(e) =>
                            setFormData({ ...formData, label: e.target.value })
                          }
                          placeholder="Dashboard"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ícone (Lucide)</Label>
                        <Input
                          value={formData.icon}
                          onChange={(e) =>
                            setFormData({ ...formData, icon: e.target.value })
                          }
                          placeholder="Home, Settings, Users..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Caminho (Path)</Label>
                        <Input
                          value={formData.path}
                          onChange={(e) =>
                            setFormData({ ...formData, path: e.target.value })
                          }
                          placeholder="/dashboard"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Item Pai (para submenu)</Label>
                        <Select
                          value={formData.parent_id}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              parent_id: value === "none" ? "" : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum (item raiz)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum (item raiz)</SelectItem>
                            {getParentMenuItems().map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Página do Sistema</Label>
                        <Select
                          value={formData.page_id}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              page_id: value === "none" ? "" : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma página" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {systemPages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.name} ({page.path})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ordem</Label>
                        <Input
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sort_order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ativo</Label>
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveMenuItem} disabled={isSaving}>
                        {isSaving && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : menuItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum item de menu configurado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getParentMenuItems().map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-sm text-muted-foreground">
                              {item.path || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Isso também excluirá todos os subitens.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMenuItem(item.id)}
                                    className="bg-destructive"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        {getChildMenuItems(item.id).map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-3 pl-8 ml-4 border-l-2 border-muted"
                          >
                            <div className="flex items-center gap-3">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <span>{child.label}</span>
                              <span className="text-sm text-muted-foreground">
                                {child.path || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(child)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Excluir item?
                                    </AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteMenuItem(child.id)}
                                      className="bg-destructive"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permissões de Páginas</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : systemPages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma página cadastrada no sistema
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Página</TableHead>
                        <TableHead>Caminho</TableHead>
                        <TableHead className="text-center">Visualizar</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemPages.map((page) => {
                        const perm = getPermission(page.id);
                        return (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">
                              {page.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {page.path}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.can_view || false}
                                onCheckedChange={() =>
                                  handleTogglePermission(
                                    page.id,
                                    "can_view",
                                    perm?.can_view || false
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.can_edit || false}
                                onCheckedChange={() =>
                                  handleTogglePermission(
                                    page.id,
                                    "can_edit",
                                    perm?.can_edit || false
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.can_delete || false}
                                onCheckedChange={() =>
                                  handleTogglePermission(
                                    page.id,
                                    "can_delete",
                                    perm?.can_delete || false
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminGroupMenus;
