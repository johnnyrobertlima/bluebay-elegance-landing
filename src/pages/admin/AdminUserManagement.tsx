import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, Users, UserX, UserCheck, Ban, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAccessDialog } from "@/components/bluebay_adm/users/UserAccessDialog";

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    is_active: boolean;
    is_hidden: boolean;
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
    const [showHidden, setShowHidden] = useState(false);
    const [isTogglingHide, setIsTogglingHide] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);

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

    const [screenSecurity, setScreenSecurity] = useState(true);

    const [userAccessDialog, setUserAccessDialog] = useState<{ isOpen: boolean; userId: string | null; userName: string | null }>({
        isOpen: false,
        userId: null,
        userName: null
    });

    const handleAccessSuccess = () => {
        loadData();
    };

    const loadData = async () => {
        try {
            setIsLoading(true);

            // 0. Load App Config (Screen Security)
            const { data: configData } = await (supabase as any)
                .rpc("get_app_config", { p_key: 'screen_security_enabled' });

            if (configData !== null) {
                setScreenSecurity(configData);
            }

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
                is_hidden: profile.is_hidden || false,
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

    const handleToggleHide = async (profile: UserWithGroups) => {
        try {
            setIsTogglingHide(profile.id);
            const { error } = await (supabase as any)
                .from("profiles")
                .update({ is_hidden: !profile.is_hidden })
                .eq("id", profile.id);

            if (error) throw error;

            toast({
                title: profile.is_hidden ? "Usuário visível" : "Usuário ocultado",
                description: profile.is_hidden ? "O usuário agora aparece na lista padrão." : "O usuário foi movido para os itens ocultos."
            });
            await loadData();
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
                    .from("profiles")
                    .update({ is_hidden: hide })
                    .in("id", chunk);

                if (error) throw error;
            }

            toast({
                title: hide ? "Usuários ocultados" : "Usuários visíveis",
                description: `${ids.length} usuário(s) foram atualizados com sucesso.`
            });
            setSelectedIds(new Set());
            await loadData();
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

    const handleHideAllVisible = (data: UserWithGroups[]) => {
        const visibleIds = data.map(u => u.id);
        if (visibleIds.length > 0) {
            handleBulkToggleHide(true, visibleIds);
        }
    };

    const handleSelectAll = (data: UserWithGroups[], checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(data.map(u => u.id)));
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    if (authLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    const allFilteredUsers = users.filter(u => showHidden || !u.is_hidden);
    const activeUsers = allFilteredUsers.filter(u => u.is_active);
    const inactiveUsers = allFilteredUsers.filter(u => !u.is_active);

    const UserTable = ({ data, isActiveTab }: { data: UserWithGroups[], isActiveTab: boolean }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]">
                        <Checkbox
                            checked={data.length > 0 && selectedIds.size === data.length}
                            onCheckedChange={(checked) => handleSelectAll(data, !!checked)}
                        />
                    </TableHead>
                    <TableHead>Nome / E-mail</TableHead>
                    <TableHead>Grupos Atuais</TableHead>
                    <TableHead>Adicionar Grupo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {showHidden ? "Nenhum usuário encontrado nesta lista." : "Nenhum usuário visível nesta lista."}
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((user) => (
                        <TableRow key={user.id} className={cn(user.is_hidden && "opacity-60 bg-muted/30")}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.has(user.id)}
                                    onCheckedChange={() => toggleSelect(user.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <div className="font-medium flex items-center gap-2">
                                            {user.full_name || "Sem Nome"}
                                            {user.is_hidden && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{user.email || "E-mail não disponível"}</div>
                                    </div>
                                </div>
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
                                    <SelectContent className="bg-white dark:bg-slate-950">
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
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setUserAccessDialog({ isOpen: true, userId: user.id, userName: user.full_name })}
                                        title="Vincular a Cliente/Categoria"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                        <Users className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleHide(user)}
                                        disabled={isTogglingHide === user.id}
                                        title={user.is_hidden ? "Mostrar na lista" : "Ocultar da lista"}
                                    >
                                        {isTogglingHide === user.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : user.is_hidden ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <EyeOff className="h-4 w-4" />
                                        )}
                                    </Button>
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
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="min-h-screen bg-background">
            <BluebayAdmMenu />
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
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

                    <Button
                        onClick={async () => {
                            const newValue = !screenSecurity;
                            setScreenSecurity(newValue);
                            await (supabase as any).rpc("set_app_config", { p_key: 'screen_security_enabled', p_value: newValue });
                            toast({ title: `Segurança de tela ${newValue ? 'LIGADA' : 'DESLIGADA'}` });
                        }}
                        variant={screenSecurity ? "default" : "destructive"}
                        className={cn("gap-2", screenSecurity ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}
                    >
                        {screenSecurity ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        Segurança de Tela: {screenSecurity ? "LIGADO" : "DESLIGADO"}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <div>
                                    <CardTitle>Usuários do Sistema</CardTitle>
                                    <CardDescription>
                                        Gerencie quem tem acesso ao sistema
                                    </CardDescription>
                                </div>
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

                                {!showHidden && selectedIds.size === 0 && (
                                    <div className="flex gap-2">
                                        {activeUsers.length > 0 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleHideAllVisible(activeUsers)}
                                                disabled={isBatchProcessing}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <EyeOff className="h-4 w-4 mr-2" />
                                                Ocultar Todos Ativos ({activeUsers.length})
                                            </Button>
                                        )}
                                        {inactiveUsers.length > 0 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleHideAllVisible(inactiveUsers)}
                                                disabled={isBatchProcessing}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <EyeOff className="h-4 w-4 mr-2" />
                                                Ocultar Todos Inativos ({inactiveUsers.length})
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
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

            <UserAccessDialog
                isOpen={userAccessDialog.isOpen}
                onClose={() => setUserAccessDialog(prev => ({ ...prev, isOpen: false }))}
                userId={userAccessDialog.userId}
                userName={userAccessDialog.userName}
                onSuccess={handleAccessSuccess}
            />
        </div>
    );
};

export default AdminUserManagement;
