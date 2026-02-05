
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ExternalLink } from "lucide-react";

export default function CatalogRedirect() {
    const { item_codigo } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [item, setItem] = useState<any | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            if (!item_codigo) return;

            try {
                // Use maybeSingle to handle not found gracefully
                const { data, error } = await supabase
                    .from("BLUEBAY_ITEM")
                    .select("ITEM_CODIGO, DESCRICAO, URL_CATALOGO")
                    .eq("ITEM_CODIGO", item_codigo)
                    .maybeSingle() as any;

                if (error) {
                    console.error("Error fetching item", error);
                    setError("Erro ao buscar informações do produto.");
                } else if (!data) {
                    setError("Produto não encontrado.");
                } else {
                    setItem(data);
                    if (data.URL_CATALOGO && data.URL_CATALOGO.trim() !== "") {
                        // Redirect immediately if URL exists
                        window.location.href = data.URL_CATALOGO;
                        return; // return to avoid turning off loading (though component will unmount)
                    }
                }
            } catch (err) {
                console.error("Exception", err);
                setError("Ocorreu um erro inesperado.");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [item_codigo]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-muted-foreground">Buscando catálogo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                <Card className="max-w-md w-full shadow-lg">
                    <CardHeader className="flex flex-col items-center">
                        <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
                        <CardTitle className="text-center text-destructive">Algo deu errado</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If we're here, item was found but has no URL_CATALOGO
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-yellow-500">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <ExternalLink className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Catálogo Indisponível</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 pt-4">
                    <div className="bg-slate-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-slate-500 mb-1">PRODUTO</p>
                        <p className="text-lg font-bold text-slate-800">{item?.ITEM_CODIGO}</p>
                        <p className="text-slate-600">{item?.DESCRICAO}</p>
                    </div>

                    <p className="text-slate-600 text-lg">
                        Este produto ainda não possui um link de catálogo cadastrado.
                    </p>

                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-200 mt-4">
                        <p className="font-medium">
                            Solicite para seu representante adicionar o catálogo.
                        </p>
                    </div>

                    <p className="text-xs text-muted-foreground mt-8">
                        BlueBay Adm System
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
