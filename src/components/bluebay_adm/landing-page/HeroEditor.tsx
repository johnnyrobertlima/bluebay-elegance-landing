
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchHeroData, updateHeroData, HeroSectionData, uploadLandingImage } from "@/services/bluebay_adm/landingPageService";
import { Loader2, Upload } from "lucide-react";

export const HeroEditor = () => {
    const [formData, setFormData] = useState<HeroSectionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchHeroData();
        if (data) {
            setFormData(data);
        } else {
            // Default initial state if DB is empty (should rely on migration but just in case)
            setFormData({
                bg_image_url: "",
                badge_text: "",
                heading_text: "",
                subtitle_text: "",
                button_primary_text: "",
                button_primary_link: "",
                button_secondary_text: "",
                button_secondary_link: "",
                stats_years: "",
                stats_clients: "",
                stats_products: ""
            });
        }
        setIsLoading(false);
    };

    const handleChange = (field: keyof HeroSectionData, value: string) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setIsSaving(true);
        try {
            await updateHeroData(formData);
            toast({
                title: "Sucesso",
                description: "Seção Hero atualizada com sucesso!",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao salvar as alterações.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Assuming uploadLandingImage is implemented in service
            const url = await uploadLandingImage(file);
            handleChange("bg_image_url", url);
            toast({
                title: "Imagem enviada",
                description: "Imagem de fundo atualizada. Lembre-se de salvar.",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro no upload",
                description: "Falha ao enviar a imagem. Verifique as configurações de Storage.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    if (!formData) return <div>Erro ao carregar dados.</div>;

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuração do Hero (Banner Principal)</CardTitle>
                    <CardDescription>Edite os textos e a imagem principal da página inicial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Background Image */}
                    <div className="space-y-2">
                        <Label>Imagem de Fundo</Label>
                        <div className="flex items-start gap-4">
                            <div className="relative w-40 h-24 bg-muted rounded-md overflow-hidden border">
                                {formData.bg_image_url ? (
                                    <img src={formData.bg_image_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem imagem</div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={formData.bg_image_url || ""}
                                    onChange={(e) => handleChange("bg_image_url", e.target.value)}
                                    placeholder="URL da imagem ou upload"
                                />
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="hero-image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('hero-image-upload')?.click()}
                                        disabled={isUploading}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {isUploading ? 'Enviando...' : 'Fazer Upload'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Badge (Texto Pequeno)</Label>
                            <Input
                                value={formData.badge_text || ""}
                                onChange={(e) => handleChange("badge_text", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Título Principal</Label>
                            <Input
                                value={formData.heading_text || ""}
                                onChange={(e) => handleChange("heading_text", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Textarea
                            value={formData.subtitle_text || ""}
                            onChange={(e) => handleChange("subtitle_text", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label>Botão Principal (Texto)</Label>
                            <Input
                                value={formData.button_primary_text || ""}
                                onChange={(e) => handleChange("button_primary_text", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Botão Principal (Link)</Label>
                            <Input
                                value={formData.button_primary_link || ""}
                                onChange={(e) => handleChange("button_primary_link", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Botão Secundário (Texto)</Label>
                            <Input
                                value={formData.button_secondary_text || ""}
                                onChange={(e) => handleChange("button_secondary_text", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Botão Secundário (Link)</Label>
                            <Input
                                value={formData.button_secondary_link || ""}
                                onChange={(e) => handleChange("button_secondary_link", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label>Estatística: Anos</Label>
                            <Input
                                value={formData.stats_years || ""}
                                onChange={(e) => handleChange("stats_years", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Estatística: Clientes</Label>
                            <Input
                                value={formData.stats_clients || ""}
                                onChange={(e) => handleChange("stats_clients", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Estatística: Produtos</Label>
                            <Input
                                value={formData.stats_products || ""}
                                onChange={(e) => handleChange("stats_products", e.target.value)}
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
};
