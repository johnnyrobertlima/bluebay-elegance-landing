
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    fetchInstagramConfig,
    updateInstagramConfig,
    InstagramConfigData,
    uploadLandingImage
} from "@/services/bluebay_adm/landingPageService";
import { Loader2, Link as LinkIcon, Upload } from "lucide-react";

export const InstagramEditor = () => {
    const [formData, setFormData] = useState<InstagramConfigData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<number | null>(null); // Index of post being uploaded

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchInstagramConfig();
        if (data) {
            // Ensure we have 4 posts for the manual editor
            const posts = data.manual_posts || [];
            while (posts.length < 4) {
                posts.push({ image_url: "", link: "", caption: "" });
            }
            setFormData({ ...data, manual_posts: posts });
        } else {
            setFormData({
                username: "@bluebayoficial",
                title: "@bluebayoficial no Instagram",
                subtitle: "",
                manual_posts: Array(4).fill({ image_url: "", link: "", caption: "" }),
                use_api: false
            });
        }
        setIsLoading(false);
    };

    const handleChange = (field: keyof InstagramConfigData, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const handlePostChange = (index: number, field: 'image_url' | 'link' | 'caption', value: string) => {
        if (!formData) return;
        const newPosts = [...formData.manual_posts];
        newPosts[index] = { ...newPosts[index], [field]: value };
        setFormData({ ...formData, manual_posts: newPosts });
    };

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(index);
        try {
            const url = await uploadLandingImage(file);
            handlePostChange(index, "image_url", url);
            toast({ title: "Imagem enviada", description: `Post ${index + 1} atualizado.` });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha no upload." });
        } finally {
            setIsUploading(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setIsSaving(true);
        try {
            await updateInstagramConfig(formData);
            toast({ title: "Configuração salva", description: "Seção Instagram atualizada." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!formData) return <div>Erro ao carregar dados.</div>;

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Configuração Geral</CardTitle>
                    <CardDescription>Defina os textos da seção de redes sociais.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Usuário Instagram (Ex: @bluebayoficial)</Label>
                            <Input value={formData.username || ""} onChange={(e) => handleChange("username", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Título da Seção</Label>
                            <Input value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Subtítulo / Descrição</Label>
                        <Textarea value={formData.subtitle || ""} onChange={(e) => handleChange("subtitle", e.target.value)} rows={2} />
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                        <div className="flex flex-col gap-1 opacity-50 pointer-events-none"> {/* Disabled for now as per plan */}
                            <div className="flex items-center space-x-2">
                                <Switch id="use-api" checked={formData.use_api} onCheckedChange={(checked) => handleChange("use_api", checked)} disabled />
                                <Label htmlFor="use-api">Usar API do Instagram (Automático)</Label>
                            </div>
                            <span className="text-xs text-muted-foreground ml-12">Em desenvolvimento. Use o modo manual abaixo.</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Posts Manuais</CardTitle>
                    <CardDescription>Defina as 4 imagens que aparecerão se a integração automática estiver desligada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {formData.manual_posts.map((post, index) => (
                            <div key={index} className="space-y-3 border p-4 rounded-lg bg-muted/20">
                                <Label className="font-bold">Post {index + 1}</Label>

                                {/* Image Preview */}
                                <div className="relative aspect-square bg-muted rounded-md overflow-hidden border">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem imagem</div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Label htmlFor={`upload-${index}`} className="cursor-pointer text-white bg-black/50 px-3 py-2 rounded-md hover:bg-black/70 text-xs">
                                            {isUploading === index ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                                        </Label>
                                        <Input
                                            id={`upload-${index}`}
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(index, e)}
                                            disabled={isUploading === index}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Link do Post</Label>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-3 w-3 text-muted-foreground" />
                                        <Input
                                            className="h-8 text-xs"
                                            value={post.link || ""}
                                            onChange={(e) => handlePostChange(index, 'link', e.target.value)}
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Configuração"}
                </Button>
            </div>
        </form>
    );
};
