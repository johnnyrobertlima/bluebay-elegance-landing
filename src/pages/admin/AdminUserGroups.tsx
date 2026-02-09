import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, Plus, Pencil, Trash2, Users, Settings, Loader2, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";

interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  redirect_after_login: string;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
  member_count?: number;
}

const AdminUserGroups = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    redirect_after_login: "/",
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [isTogglingHide, setIsTogglingHide] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // New State for Permissions and Cost Centers
  const [allPages, setAllPages] = useState<any[]>([]);
  const [allCostCenters, setAllCostCenters] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [selectedCostCenters, setSelectedCostCenters] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadGroups();
      loadAllPages();
      loadAllCostCenters();
    }
  }, [user, isAdmin]);

  const loadAllPages = async () => {
    const { data } = await (supabase as any).from("bluebay_system_page").select("*").order("name");
    setAllPages(data || []);
  };

  const loadAllCostCenters = async () => {
    const { data } = await (supabase as any).from("v_bluebay_unique_cost_centers").select("*");
    setAllCostCenters(data?.map((d: any) => d.centrocusto) || []);
  };

  const loadGroupPermissions = async (groupId: string, groupName: string) => {
    // Pages
    if (groupName === "Admin" || groupName === "Administradores") {
      setSelectedPages(new Set(allPages.map(p => p.id)));
    } else {
      const { data: pagePerms } = await (supabase as any)
        .from("bluebay_group_page_permission")
        .select("page_id")
        .eq("group_id", groupId)
        .eq("can_view", true);
      setSelectedPages(new Set(pagePerms?.map((p: any) => p.page_id) || []));
    }

    // Cost Centers
    const { data: ccMaps } = await (supabase as any)
      .from("bluebay_group_cost_center")
      .select("centrocusto")
      .eq("group_id", groupId);
    setSelectedCostCenters(new Set(ccMaps?.map((c: any) => c.centrocusto) || []));
  };

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const { data: groupsData, error } = await (supabase as any)
        .from("bluebay_group")
        .select("*")
        .order("name");

      if (error) throw error;

      // Get member counts
      const groupsWithCounts = await Promise.all(
        ((groupsData || []) as UserGroup[]).map(async (group: UserGroup) => {
          const { count } = await (supabase as any)
            .from("bluebay_group_member")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
          return { ...group, member_count: count || 0 };
        })
      );

      setGroups(groupsWithCounts as UserGroup[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar grupos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (group?: UserGroup) => {
    if (group) {
      setSelectedGroup(group);
      setFormData({
        name: group.name,
        description: group.description || "",
        redirect_after_login: group.redirect_after_login,
        is_active: group.is_active,
      });
      loadGroupPermissions(group.id, group.name);
    } else {
      setSelectedGroup(null);
      setFormData({
        name: "",
        description: "",
        redirect_after_login: "/",
        is_active: true,
      });
      setSelectedPages(new Set());
      setSelectedCostCenters(new Set());
    }
    setIsDialogOpen(true);
  };

  const togglePage = (id: string) => {
    if (selectedGroup?.name === "Admin" || selectedGroup?.name === "Administradores") {
      toast({
        variant: "destructive",
        title: "Permissão bloqueada",
        description: "Grupos Administrativos devem ter acesso a todas as páginas.",
      });
      return;
    }
    const newPages = new Set(selectedPages);
    if (newPages.has(id)) newPages.delete(id);
    else newPages.add(id);
    setSelectedPages(newPages);
  };

  const toggleCostCenter = (cc: string) => {
    const newCC = new Set(selectedCostCenters);
    if (newCC.has(cc)) newCC.delete(cc);
    else newCC.add(cc);
    setSelectedCostCenters(newCC);
  };

  const handleRefreshPages = () => loadAllPages();

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Informe o nome do grupo.",
      });
      return;
    }

    try {
      setIsSaving(true);

      if (selectedGroup) {
        // 1. Update Core Data
        const { error: groupError } = await (supabase as any)
          .from("bluebay_group")
          .update({
            name: formData.name,
            description: formData.description || null,
            redirect_after_login: formData.redirect_after_login,
            is_active: formData.is_active,
          })
          .eq("id", selectedGroup.id);

        if (groupError) throw groupError;

        // 2. Update Page Permissions (Simplified)
        // First delete all for this group and then insert selected ones
        await (supabase as any).from("bluebay_group_page_permission").delete().eq("group_id", selectedGroup.id);

        if (selectedPages.size > 0) {
          const pageInserts = Array.from(selectedPages).map(id => ({
            group_id: selectedGroup.id,
            page_id: id,
            can_view: true
          }));
          const { error: pageError } = await (supabase as any).from("bluebay_group_page_permission").insert(pageInserts);
          if (pageError) throw pageError;
        }

        // 3. Update Cost Centers
        await (supabase as any).from("bluebay_group_cost_center").delete().eq("group_id", selectedGroup.id);

        if (selectedCostCenters.size > 0) {
          const ccInserts = Array.from(selectedCostCenters).map(cc => ({
            group_id: selectedGroup.id,
            centrocusto: cc
          }));
          const { error: ccError } = await (supabase as any).from("bluebay_group_cost_center").insert(ccInserts);
          if (ccError) throw ccError;
        }

        toast({ title: "Grupo e permissões atualizados com sucesso!" });
      } else {
        const { error } = await (supabase as any).from("bluebay_group").insert({
          name: formData.name,
          description: formData.description || null,
          redirect_after_login: formData.redirect_after_login,
          is_active: formData.is_active,
        });

        if (error) throw error;
        toast({ title: "Grupo criado com sucesso!" });
      }

      setIsDialogOpen(false);
      loadGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar grupo",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("bluebay_group")
        .delete()
        .eq("id", groupId);

      if (error) throw error;
      toast({ title: "Grupo excluído com sucesso!" });
      loadGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir grupo",
        description: error.message,
      });
    }
  };

  const handleToggleHide = async (group: UserGroup) => {
    try {
      setIsTogglingHide(group.id);
      const { error } = await (supabase as any)
        .from("bluebay_group")
        .update({ is_hidden: !group.is_hidden })
        .eq("id", group.id);

      if (error) throw error;

      toast({
        title: group.is_hidden ? "Grupo visível" : "Grupo ocultado",
        description: group.is_hidden ? "O grupo agora aparece na lista padrão." : "O grupo foi movido para os itens ocultos."
      });
      loadGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar visibilidade",
        description: error.message,
      });
    } finally {
      setIsTogglingHide(null);
    }
  };

  const handleBulkToggleHide = async (hide: boolean, idsToProcess?: string[]) => {
    try {
      const ids = idsToProcess || Array.from(selectedIds);
      if (ids.length === 0) return;

      setIsBatchProcessing(true);

      // Chunking to avoid URL length limits (400 Bad Request)
      const CHUNK_SIZE = 20;
      for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        const { error } = await (supabase as any)
          .from("bluebay_group")
          .update({ is_hidden: hide })
          .in("id", chunk);

        if (error) throw error;
      }

      toast({
        title: hide ? "Grupos ocultados" : "Grupos visíveis",
        description: `${ids.length} grupo(s) foram atualizados com sucesso.`
      });
      setSelectedIds(new Set());
      loadGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na operação em lote",
        description: error.message,
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleHideAllVisible = () => {
    const visibleIds = filteredGroups.map(g => g.id);
    if (visibleIds.length > 0) {
      handleBulkToggleHide(true, visibleIds);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredGroups.map(g => g.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredGroups = groups.filter(group => showHidden || !group.is_hidden);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BluebayAdmMenu />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Grupos de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie grupos, permissões e redirecionamentos
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHidden(!showHidden)}
              className={cn(showHidden && "bg-muted")}
            >
              {showHidden ? (
                <><Eye className="h-4 w-4 mr-2" /> Ocultar itens ocultos</>
              ) : (
                <><EyeOff className="h-4 w-4 mr-2" /> Visualizar ocultos</>
              )}
            </Button>

            {selectedIds.size > 0 && (
              <div className="flex gap-2 animate-fade-in">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkToggleHide(true)}
                  disabled={isBatchProcessing}
                >
                  {isBatchProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  Ocultar Selecionados ({selectedIds.size})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkToggleHide(false)}
                  disabled={isBatchProcessing}
                >
                  {isBatchProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  Mostrar Selecionados
                </Button>
              </div>
            )}

            {!showHidden && filteredGroups.length > 0 && selectedIds.size === 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleHideAllVisible}
                disabled={isBatchProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar Todos os Visíveis ({filteredGroups.length})
              </Button>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedGroup ? "Editar Grupo" : "Novo Grupo"}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="pages">Páginas</TabsTrigger>
                  <TabsTrigger value="cc">C. Custos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Grupo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Administradores"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descrição do grupo..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redirect">Página após Login</Label>
                    <Input
                      id="redirect"
                      value={formData.redirect_after_login}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          redirect_after_login: e.target.value,
                        })
                      }
                      placeholder="/dashboard"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Grupo Ativo</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pages" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Selecionar Páginas</Label>
                      <Button variant="outline" size="sm" onClick={handleRefreshPages}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
                      {allPages.map((page) => {
                        const isAssigned = selectedPages.has(page.id);
                        return (
                          <div
                            key={page.id}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded-md transition-colors",
                              isAssigned ? "bg-green-100 dark:bg-green-900/30" : "hover:bg-muted"
                            )}
                          >
                            <Checkbox
                              id={`page-${page.id}`}
                              checked={isAssigned}
                              onCheckedChange={() => togglePage(page.id)}
                              disabled={selectedGroup?.name === "Admin" || selectedGroup?.name === "Administradores"}
                            />
                            <Label
                              htmlFor={`page-${page.id}`}
                              className={cn(
                                "flex-grow cursor-pointer text-sm",
                                isAssigned && "font-semibold text-green-700 dark:text-green-400"
                              )}
                            >
                              {page.name}
                              <span className="text-[10px] text-muted-foreground ml-2">({page.path})</span>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cc" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Centros de Custo</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto border rounded-md p-2">
                      {allCostCenters.map((cc) => (
                        <div key={cc} className="flex items-center space-x-2 p-1 hover:bg-muted rounded text-sm">
                          <Checkbox
                            id={`cc-${cc}`}
                            checked={selectedCostCenters.has(cc)}
                            onCheckedChange={() => toggleCostCenter(cc)}
                          />
                          <Label htmlFor={`cc-${cc}`} className="flex-grow cursor-pointer">
                            {cc}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {selectedGroup ? "Salvar Tudo" : "Criar Grupo"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Grupos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {showHidden ? "Nenhum grupo encontrado" : "Nenhum grupo visível"}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={filteredGroups.length > 0 && selectedIds.size === filteredGroups.length}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Redirect</TableHead>
                    <TableHead className="text-center">Membros</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id} className={cn(group.is_hidden && "opacity-60 bg-muted/30")}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(group.id)}
                          onCheckedChange={() => toggleSelect(group.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {group.name}
                          {group.is_hidden && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {group.description || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {group.redirect_after_login}
                      </TableCell>
                      <TableCell className="text-center">
                        {group.member_count}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${group.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                        >
                          {group.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleHide(group)}
                            disabled={isTogglingHide === group.id}
                            title={group.is_hidden ? "Mostrar na lista" : "Ocultar da lista"}
                          >
                            {isTogglingHide === group.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : group.is_hidden ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(group)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Excluir grupo?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso removerá permanentemente o grupo "{group.name}"
                                  e todas as associações de usuários.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(group.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserGroups;
