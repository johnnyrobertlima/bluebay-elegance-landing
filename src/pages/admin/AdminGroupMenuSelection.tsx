import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Menu, Users, ChevronRight, Loader2 } from "lucide-react";

interface UserGroup {
    id: string;
    name: string;
    description: string | null;
    menu_items_count?: number;
}

const AdminGroupMenuSelection = () => {
    const navigate = useNavigate();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                .from("bluebay_group")
                .select("id, name, description")
                .eq("is_active", true)
                .order("name");

            if (error) throw error;

            // Get menu items counts
            const groupsWithCounts = await Promise.all(
                ((groupsData || []) as UserGroup[]).map(async (group: UserGroup) => {
                    const { count } = await (supabase as any)
                        .from("bluebay_menu_item")
                        .select("*", { count: "exact", head: true })
                        .eq("group_id", group.id);
                    return { ...group, menu_items_count: count || 0 };
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
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Menu className="h-6 w-6 text-primary" />
                            Menus por Grupo
                        </h1>
                        <p className="text-muted-foreground">
                            Selecione um grupo para configurar seus menus de navegação
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <Users className="h-12 w-12 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium">Nenhum grupo ativo encontrado</h3>
                        <p className="text-muted-foreground mt-2">
                            Crie grupos de usuários primeiro em <Button variant="link" className="px-1 h-auto" onClick={() => navigate('/admin/user-groups')}>Grupos de Usuários</Button>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <Card
                                key={group.id}
                                className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-primary/20 hover:border-l-primary"
                                onClick={() => navigate(`/admin/user-groups/${group.id}/menus`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{group.name}</CardTitle>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <CardDescription>{group.description || "Sem descrição"}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Menu className="h-4 w-4" />
                                        {group.menu_items_count} {group.menu_items_count === 1 ? 'item' : 'itens'} de menu
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminGroupMenuSelection;
