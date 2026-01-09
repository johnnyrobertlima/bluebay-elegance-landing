import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Layout,
  Image,
  Type,
  Share2,
  Grid3X3,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface IndexSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, any>;
}

interface IndexContent {
  id: string;
  section_id: string;
  content_key: string;
  content_type: string;
  content_value: string | null;
  settings: Record<string, any>;
}

interface IndexImage {
  id: string;
  section_id: string | null;
  image_key: string;
  image_url: string;
  alt_text: string | null;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

interface IndexCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const AdminIndexContent = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [sections, setSections] = useState<IndexSection[]>([]);
  const [contents, setContents] = useState<IndexContent[]>([]);
  const [images, setImages] = useState<IndexImage[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [categories, setCategories] = useState<IndexCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<IndexSection | null>(null);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<SocialLink | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IndexCategory | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [sectionsRes, contentsRes, imagesRes, socialRes, categoriesRes] =
        await Promise.all([
          (supabase as any).from("index_sections").select("*").order("sort_order"),
          (supabase as any).from("index_content").select("*"),
          (supabase as any).from("index_images").select("*").order("sort_order"),
          (supabase as any).from("social_links").select("*").order("sort_order"),
          (supabase as any).from("index_categories").select("*").order("sort_order"),
        ]);

      setSections((sectionsRes.data || []) as IndexSection[]);
      setContents((contentsRes.data || []) as IndexContent[]);
      setImages((imagesRes.data || []) as IndexImage[]);
      setSocialLinks((socialRes.data || []) as SocialLink[]);
      setCategories((categoriesRes.data || []) as IndexCategory[]);
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

  const handleToggleSectionVisibility = async (section: IndexSection) => {
    try {
      const { error } = await (supabase as any)
        .from("index_sections")
        .update({ is_visible: !section.is_visible })
        .eq("id", section.id);

      if (error) throw error;
      toast({ title: `Seção ${!section.is_visible ? "ativada" : "ocultada"}!` });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const handleSaveSection = async (data: Partial<IndexSection>) => {
    try {
      setIsSaving(true);
      if (selectedSection) {
        const { error } = await (supabase as any)
          .from("index_sections")
          .update(data)
          .eq("id", selectedSection.id);
        if (error) throw error;
        toast({ title: "Seção atualizada!" });
      }
      setSectionDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSocialLink = async (data: Partial<SocialLink>) => {
    try {
      setIsSaving(true);
      if (selectedSocial) {
        const { error } = await (supabase as any)
          .from("social_links")
          .update(data)
          .eq("id", selectedSocial.id);
        if (error) throw error;
        toast({ title: "Link atualizado!" });
      } else {
        const { error } = await (supabase as any).from("social_links").insert(data);
        if (error) throw error;
        toast({ title: "Link criado!" });
      }
      setSocialDialogOpen(false);
      setSelectedSocial(null);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("social_links").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Link excluído!" });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const handleSaveCategory = async (data: Partial<IndexCategory>) => {
    try {
      setIsSaving(true);
      if (selectedCategory) {
        const { error } = await (supabase as any)
          .from("index_categories")
          .update(data)
          .eq("id", selectedCategory.id);
        if (error) throw error;
        toast({ title: "Categoria atualizada!" });
      } else {
        const { error } = await (supabase as any).from("index_categories").insert(data);
        if (error) throw error;
        toast({ title: "Categoria criada!" });
      }
      setCategoryDialogOpen(false);
      setSelectedCategory(null);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("index_categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Categoria excluída!" });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const getContentForSection = (sectionId: string) => {
    return contents.filter((c) => c.section_id === sectionId);
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
            <h1 className="text-3xl font-bold">Conteúdo da Página Inicial</h1>
            <p className="text-muted-foreground">
              Gerencie textos, imagens e seções da index
            </p>
          </div>
        </div>

        <Tabs defaultValue="sections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Seções
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Imagens
            </TabsTrigger>
          </TabsList>

          {/* SEÇÕES */}
          <TabsContent value="sections">
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    contents={getContentForSection(section.id)}
                    onToggleVisibility={() => handleToggleSectionVisibility(section)}
                    onEdit={() => {
                      setSelectedSection(section);
                      setSectionDialogOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* REDES SOCIAIS */}
          <TabsContent value="social">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Links de Redes Sociais</CardTitle>
                  <CardDescription>
                    Configure os links das redes sociais exibidos no site
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setSelectedSocial(null);
                    setSocialDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Link
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : socialLinks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum link cadastrado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plataforma</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {socialLinks.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell className="font-medium">
                            {link.platform}
                          </TableCell>
                          <TableCell className="text-sm">{link.url}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                link.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {link.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedSocial(link);
                                  setSocialDialogOpen(true);
                                }}
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
                                    <AlertDialogTitle>Excluir link?</AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSocialLink(link.id)}
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
          </TabsContent>

          {/* CATEGORIAS */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias da Página Inicial</CardTitle>
                  <CardDescription>
                    Configure as categorias exibidas na seção de categorias
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCategoryDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : categories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma categoria cadastrada
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {cat.description || "-"}
                          </TableCell>
                          <TableCell className="text-sm">{cat.link_url || "-"}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                cat.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {cat.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCategoryDialogOpen(true);
                                }}
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
                                      Excluir categoria?
                                    </AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCategory(cat.id)}
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
          </TabsContent>

          {/* IMAGENS */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Imagens da Página Inicial</CardTitle>
                <CardDescription>
                  Gerencie as imagens utilizadas nas seções da página inicial
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : images.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma imagem cadastrada
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="border rounded-lg p-2 space-y-2"
                      >
                        <img
                          src={img.image_url}
                          alt={img.alt_text || ""}
                          className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-sm font-medium truncate">
                          {img.image_key}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Section Edit Dialog */}
        <SectionEditDialog
          open={sectionDialogOpen}
          onOpenChange={setSectionDialogOpen}
          section={selectedSection}
          onSave={handleSaveSection}
          isSaving={isSaving}
        />

        {/* Social Link Dialog */}
        <SocialLinkDialog
          open={socialDialogOpen}
          onOpenChange={setSocialDialogOpen}
          link={selectedSocial}
          onSave={handleSaveSocialLink}
          isSaving={isSaving}
        />

        {/* Category Dialog */}
        <CategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          category={selectedCategory}
          onSave={handleSaveCategory}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

// Helper Components
const SectionCard = ({
  section,
  contents,
  onToggleVisibility,
  onEdit,
}: {
  section: IndexSection;
  contents: IndexContent[];
  onToggleVisibility: () => void;
  onEdit: () => void;
}) => (
  <Card className={!section.is_visible ? "opacity-60" : ""}>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          {section.title || section.section_key}
          {!section.is_visible && (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleVisibility}
          title={section.is_visible ? "Ocultar" : "Mostrar"}
        >
          {section.is_visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Key:</strong> {section.section_key}
        </p>
        <p>
          <strong>Ordem:</strong> {section.sort_order}
        </p>
        {contents.length > 0 && (
          <div className="mt-2">
            <strong>Conteúdos:</strong>
            <ul className="list-disc list-inside">
              {contents.map((c) => (
                <li key={c.id}>
                  {c.content_key}: {c.content_value?.substring(0, 50)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const SectionEditDialog = ({
  open,
  onOpenChange,
  section,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: IndexSection | null;
  onSave: (data: Partial<IndexSection>) => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    sort_order: 0,
  });

  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title || "",
        subtitle: section.subtitle || "",
        description: section.description || "",
        sort_order: section.sort_order,
      });
    }
  }, [section]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Seção: {section?.section_key}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
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
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SocialLinkDialog = ({
  open,
  onOpenChange,
  link,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: SocialLink | null;
  onSave: (data: Partial<SocialLink>) => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    icon: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (link) {
      setFormData({
        platform: link.platform,
        url: link.url,
        icon: link.icon || "",
        is_active: link.is_active,
        sort_order: link.sort_order,
      });
    } else {
      setFormData({
        platform: "",
        url: "",
        icon: "",
        is_active: true,
        sort_order: 0,
      });
    }
  }, [link]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? "Editar Link" : "Novo Link Social"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <Input
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value })
              }
              placeholder="Instagram, Facebook, WhatsApp..."
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Ícone (Lucide)</Label>
            <Input
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="Instagram, Facebook, MessageCircle..."
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: IndexCategory | null;
  onSave: (data: Partial<IndexCategory>) => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    link_url: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        image_url: category.image_url || "",
        link_url: category.link_url || "",
        is_active: category.is_active,
        sort_order: category.sort_order,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image_url: "",
        link_url: "",
        is_active: true,
        sort_order: 0,
      });
    }
  }, [category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Camisetas"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>URL da Imagem</Label>
            <Input
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              placeholder="/images/categoria.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input
              value={formData.link_url}
              onChange={(e) =>
                setFormData({ ...formData, link_url: e.target.value })
              }
              placeholder="/products?category=camisetas"
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminIndexContent;
