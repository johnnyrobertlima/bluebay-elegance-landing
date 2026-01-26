import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Users, UserX, UserCheck, Ban, Trash2 } from "lucide-react";

interface Profile {
    id: string;
    full_name: string | null;
    is_active: boolean;
}

interface UserGroup {
    id: string;
    name: string;
}

interface UserWithGroups extends Profile {
    groups: UserGroup[];
}

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [users, setUsers] = useState<UserWithGroups[]>([]);
    const [allGroups, setAllGroups] = useState<UserGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

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

            // 1. Load Groups
            const { data: groupsData, error: groupsError } = await (supabase as any)
                .from("bluebay_group")
                .select("id, name")
                .eq("is_active", true)
                .order("name");

            if (groupsError) throw groupsError;
            setAllGroups(groupsData || []);

            // 2. Load Profiles with Emails via RPC
            const { data: profilesData, error: profilesError } = await (supabase as any)
                .rpc("get_admin_users_list");

            if (profilesError) throw profilesError;

            // 3. Load Memberships
            const { data: membersData, error: membersError } = await (supabase as any)
                .from("bluebay_group_member")
                .select("user_id, group:bluebay_group(id, name)");

            if (membersError) throw membersError;

            // 4. Merge Data
            const membersMap = new Map<string, UserGroup[]>();
            membersData?.forEach((item: any) => {
                const current = membersMap.get(item.user_id) || [];
                if (item.group) {
                    current.push(item.group);
                }
                membersMap.set(item.user_id, current);
            });

            // RPC returns { id, email, full_name, is_active }
            const usersWithGroups = (profilesData || []).map((profile: any) => ({
                id: profile.id,
                full_name: profile.full_name,
                email: profile.email,
                is_active: profile.is_active,
                groups: membersMap.get(profile.id) || [],
            }));

            setUsers(usersWithGroups);

        } catch (error: any) {
            console.error("Error loading users:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar dados",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGroup = async (userId: string, groupId: string) => {
        if (!groupId) return;
        try {
            setIsProcessing(userId);
            const { error } = await (supabase as any)
                .from("bluebay_group_member")
                .insert({ user_id: userId, group_id: groupId });

            if (error) {
                if (error.code !== '23505') throw error;
            }

            toast({ title: "Usuário adicionado ao grupo" });
            await loadData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao adicionar grupo",
                description: error.message,
            });
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRemoveGroup = async (userId: string, groupId: string) => {
        try {
            setIsProcessing(userId);
            const { error } = await (supabase as any)
                .from("bluebay_group_member")
                .delete()
                .eq("user_id", userId)
                .eq("group_id", groupId);

            if (error) throw error;

            toast({ title: "Usuário removido do grupo" });
            await loadData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao remover grupo",
                description: error.message,
            });
        } finally {
            setIsProcessing(null);
        }
    };

    // Smart Buffer for Batch Updates
    // We use Refs to avoid re-renders on every click validation
    const pendingUpdatesRef = useRef<Map<string, boolean>>(new Map());
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const toggleUserStatus = (userId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // 1. Optimistic Update (Immediate UI Feedback)
        // We use function update to ensure we always work with latest state
        setUsers(prevUsers => prevUsers.map(u =>
            u.id === userId ? { ...u, is_active: newStatus } : u
        ));

        // 2. Buffer the Change
        // Using a Map ensures that if I click toggle 20 times, only the FINAL state is sent.
        pendingUpdatesRef.current.set(userId, newStatus);

        // 3. Reset Scheduler (Debounce)
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
            await flushUpdates();
        }, 1000); // Wait 1 second after last click before sending
    };

    const flushUpdates = async () => {
        const changes = pendingUpdatesRef.current;
        if (changes.size === 0) return;

        // Clone and clear buffer strictly before async to avoid race conditions with new clicks
        const batchToProcess = new Map(changes);
        pendingUpdatesRef.current.clear();

        // Group by status (Enable vs Disable)
        const toActivate: string[] = [];
        const toDeactivate: string[] = [];

        batchToProcess.forEach((status, id) => {
            if (status) toActivate.push(id);
            else toDeactivate.push(id);
        });

        try {
            const promises = [];

            // Execute Batch RPCs
            if (toActivate.length > 0) {
                promises.push(
                    (supabase as any).rpc('bulk_update_user_status', {
                        p_user_ids: toActivate,
                        p_new_status: true
                    })
                );
            }

            if (toDeactivate.length > 0) {
                promises.push(
                    (supabase as any).rpc('bulk_update_user_status', {
                        p_user_ids: toDeactivate,
                        p_new_status: false
                    })
                );
            }

            const results = await Promise.all(promises);
            const errors = results.filter(r => r.error);

            if (errors.length > 0) throw errors[0].error;

            toast({
                title: "Sincronização concluída",
                description: `${batchToProcess.size} usuário(s) atualizado(s) com sucesso.`,
                duration: 2000
            });

        } catch (error: any) {
            console.error("Batch update failed:", error);

            // Critical Failure: Sync from server to restore truth
            toast({
                variant: "destructive",
                title: "Erro de Sincronização",
                description: "Houve um problema ao salvar as alterações em lote. Recarregando dados...",
            });
            await loadData();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    if (authLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    const activeUsers = users.filter(u => u.is_active);
    const inactiveUsers = users.filter(u => !u.is_active);

    const UserTable = ({ data, isActiveTab }: { data: UserWithGroups[], isActiveTab: boolean }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome / E-mail</TableHead>
                    <TableHead>Grupos Atuais</TableHead>
                    <TableHead>Adicionar Grupo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Nenhum usuário encontrado nesta lista.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="font-medium">{user.full_name || "Sem Nome"}</div>
                                <div className="text-xs text-muted-foreground">{user.email || "E-mail não disponível"}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-2">
                                    {user.groups.length > 0 ? (
                                        user.groups.map((g) => (
                                            <Badge key={g.id} variant="secondary" className="flex items-center gap-1">
                                                {g.name}
                                                <button
                                                    onClick={() => handleRemoveGroup(user.id, g.id)}
                                                    className="ml-1 hover:text-destructive"
                                                    disabled={isProcessing === user.id}
                                                >
                                                    &times;
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Select onValueChange={(groupId) => handleAddGroup(user.id, groupId)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Selecionar grupo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allGroups
                                            .filter(g => !user.groups.find(ug => ug.id === g.id))
                                            .map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="text-right">
                                {isActiveTab ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Desativar Usuário"
                                        onClick={() => toggleUserStatus(user.id, true)}
                                        disabled={isProcessing === user.id}
                                    >
                                        <UserX className="h-5 w-5" />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                        title="Reativar Usuário"
                                        onClick={() => toggleUserStatus(user.id, false)}
                                        disabled={isProcessing === user.id}
                                    >
                                        <UserCheck className="h-5 w-5" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Gestão de Usuários
                        </h1>
                        <p className="text-muted-foreground">
                            Gerencie os grupos e status dos usuários
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Usuários do Sistema</CardTitle>
                        <CardDescription>
                            Gerencie quem tem acesso ao sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <Tabs defaultValue="active" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                                    <TabsTrigger value="active">
                                        Ativos ({activeUsers.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="inactive">
                                        Desativados ({inactiveUsers.length})
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="active">
                                    <UserTable data={activeUsers} isActiveTab={true} />
                                </TabsContent>
                                <TabsContent value="inactive">
                                    <UserTable data={inactiveUsers} isActiveTab={false} />
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminUserManagement;
