
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroEditor } from "@/components/bluebay_adm/landing-page/HeroEditor";
import { CollectionEditor } from "@/components/bluebay_adm/landing-page/CollectionEditor";
import { CatalogEditor } from "@/components/bluebay_adm/landing-page/CatalogEditor";
import { InstagramEditor } from "@/components/bluebay_adm/landing-page/InstagramEditor";
import { LayoutDashboard, Image, ShoppingBag, BookOpen, Instagram } from "lucide-react";

export const BluebayAdmLandingPage = () => {
    return (
        <main className="container-fluid p-0 max-w-full min-h-screen bg-background">
            <BluebayAdmMenu />
            <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="h-8 w-8 text-bluebay-navy" />
                        Administração da Página Inicial
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie os conteúdos, banners e seções da página principal do site.
                    </p>
                </div>

                <Tabs defaultValue="hero" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px] h-auto p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger value="hero" className="flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                            <Image className="h-4 w-4" /> Hero
                        </TabsTrigger>
                        <TabsTrigger value="collection" className="flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                            <ShoppingBag className="h-4 w-4" /> Coleção
                        </TabsTrigger>
                        <TabsTrigger value="catalog" className="flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                            <BookOpen className="h-4 w-4" /> Catálogo
                        </TabsTrigger>
                        <TabsTrigger value="instagram" className="flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                            <Instagram className="h-4 w-4" /> Instagram
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero" className="space-y-4 focus-visible:outline-none">
                        <HeroEditor />
                    </TabsContent>

                    <TabsContent value="collection" className="space-y-4 focus-visible:outline-none">
                        <CollectionEditor />
                    </TabsContent>

                    <TabsContent value="catalog" className="space-y-4 focus-visible:outline-none">
                        <CatalogEditor />
                    </TabsContent>

                    <TabsContent value="instagram" className="space-y-4 focus-visible:outline-none">
                        <InstagramEditor />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
};

export default BluebayAdmLandingPage;
