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
import { ArrowLeft, Plus, Pencil, Trash2, FileCode, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemPage {
  id: string;
  path: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminSystemPages = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [pages, setPages] = useState<SystemPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SystemPage | null>(null);
  const [formData, setFormData] = useState({
    path: "",
    name: "",
    description: "",
    icon: "",
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
    if (user && isAdmin) {
      loadPages();
    }
  }, [user, isAdmin]);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("system_pages")
        .select("*")
        .order("name");

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar páginas",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (page?: SystemPage) => {
    if (page) {
      setSelectedPage(page);
      setFormData({
        path: page.path,
        name: page.name,
        description: page.description || "",
        icon: page.icon || "",
        is_active: page.is_active,
      });
    } else {
      setSelectedPage(null);
      setFormData({
        path: "",
        name: "",
        description: "",
        icon: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.path.trim() || !formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Informe o caminho e nome da página.",
      });
      return;
    }

    try {
      setIsSaving(true);

      if (selectedPage) {
        const { error } = await supabase
          .from("system_pages")
          .update({
            path: formData.path,
            name: formData.name,
            description: formData.description || null,
            icon: formData.icon || null,
            is_active: formData.is_active,
          })
          .eq("id", selectedPage.id);

        if (error) throw error;
        toast({ title: "Página atualizada!" });
      } else {
        const { error } = await supabase.from("system_pages").insert({
          path: formData.path,
          name: formData.name,
          description: formData.description || null,
          icon: formData.icon || null,
          is_active: formData.is_active,
        });

        if (error) throw error;
        toast({ title: "Página criada!" });
      }

      setIsDialogOpen(false);
      loadPages();
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

  const handleDelete = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from("system_pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;
      toast({ title: "Página excluída!" });
      loadPages();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message,
      });
    }
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Páginas do Sistema</h1>
            <p className="text-muted-foreground">
              Cadastre as páginas disponíveis para controle de acesso
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Página
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedPage ? "Editar Página" : "Nova Página"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dashboard Principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição da página..."
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
                <div className="flex items-center justify-between">
                  <Label>Página Ativa</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Páginas Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma página cadastrada
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Caminho</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {page.path}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {page.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            page.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {page.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(page)}
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
                                <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso removerá a página e todas as permissões
                                  associadas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(page.id)}
                                  className="bg-destructive"
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

export default AdminSystemPages;
