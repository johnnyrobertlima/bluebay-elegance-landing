import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    }
  }, [user, isAdmin]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const { data: groupsData, error } = await (supabase as any)
        .from("user_groups")
        .select("*")
        .order("name");

      if (error) throw error;

      // Get member counts
      const groupsWithCounts = await Promise.all(
        ((groupsData || []) as UserGroup[]).map(async (group: UserGroup) => {
          const { count } = await (supabase as any)
            .from("user_group_members")
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
    } else {
      setSelectedGroup(null);
      setFormData({
        name: "",
        description: "",
        redirect_after_login: "/",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

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
        const { error } = await (supabase as any)
          .from("user_groups")
          .update({
            name: formData.name,
            description: formData.description || null,
            redirect_after_login: formData.redirect_after_login,
            is_active: formData.is_active,
          })
          .eq("id", selectedGroup.id);

        if (error) throw error;
        toast({ title: "Grupo atualizado com sucesso!" });
      } else {
        const { error } = await (supabase as any).from("user_groups").insert({
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
        .from("user_groups")
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
        .from("user_groups")
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedGroup ? "Editar Grupo" : "Novo Grupo"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                  <p className="text-sm text-muted-foreground">
                    URL para onde o usuário será redirecionado após o login
                  </p>
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
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {selectedGroup ? "Salvar" : "Criar"}
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
                            onClick={() =>
                              navigate(`/admin/user-groups/${group.id}/menus`)
                            }
                            title="Configurar Menus"
                          >
                            <Settings className="h-4 w-4" />
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
