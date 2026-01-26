
import { useState, useEffect } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { reportConfigService, ReportConfig, ReportTypeConfig } from "@/services/bluebay/reportConfigService";
import { Loader2, RefreshCw } from "lucide-react";

const GestaoRelatorios = () => {
    const [transacaoConfigs, setTransacaoConfigs] = useState<ReportConfig[]>([]);
    const [typeConfigs, setTypeConfigs] = useState<ReportTypeConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const { toast } = useToast();

    const fetchAllConfigs = async () => {
        setLoading(true);
        try {
            const [transacoes, tipos] = await Promise.all([
                reportConfigService.getConfigs(),
                reportConfigService.getTypeConfigs()
            ]);
            setTransacaoConfigs(transacoes);
            setTypeConfigs(tipos);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao carregar configurações",
                description: "Não foi possível carregar as configurações.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await Promise.all([
                reportConfigService.syncConfigs(),
                reportConfigService.syncTypeConfigs()
            ]);
            await fetchAllConfigs();
            toast({
                title: "Sincronização concluída",
                description: "Novas transações e tipos foram atualizados.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro na sincronização",
                description: "Não foi possível sincronizar os dados.",
                variant: "destructive"
            });
        } finally {
            setSyncing(false);
        }
    };

    const handleUpdateTransacao = async (config: ReportConfig, field: keyof ReportConfig, value: any) => {
        const newConfigs = transacaoConfigs.map(c =>
            c.transacao === config.transacao ? { ...c, [field]: value } : c
        );
        setTransacaoConfigs(newConfigs);

        try {
            const updatedConfig = newConfigs.find(c => c.transacao === config.transacao);
            if (updatedConfig) {
                await reportConfigService.updateConfig(
                    updatedConfig.transacao,
                    updatedConfig.description,
                    updatedConfig.report_dashboard_comercial
                );

                reportConfigService.refreshDashboardCache(90).then(() => console.log("Cache refreshed"));
            }
        } catch (error) {
            console.error(error);
            setTransacaoConfigs(transacaoConfigs); // Revert
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    };

    const handleUpdateType = async (config: ReportTypeConfig, field: keyof ReportTypeConfig, value: any) => {
        const newConfigs = typeConfigs.map(c =>
            c.tipo === config.tipo ? { ...c, [field]: value } : c
        );
        setTypeConfigs(newConfigs);

        try {
            const updatedConfig = newConfigs.find(c => c.tipo === config.tipo);
            if (updatedConfig) {
                await reportConfigService.updateTypeConfig(
                    updatedConfig.tipo,
                    updatedConfig.description,
                    updatedConfig.report_dashboard_comercial
                );

                reportConfigService.refreshDashboardCache(90).then(() => console.log("Cache refreshed"));
            }
        } catch (error) {
            console.error(error);
            setTypeConfigs(typeConfigs); // Revert
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    };

    useEffect(() => {
        fetchAllConfigs();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <BluebayAdmBanner />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <BluebayAdmMenu />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Gestão de Relatórios</h1>
                    <Button onClick={handleSync} disabled={syncing}>
                        {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Sincronizar Dados
                    </Button>
                </div>

                <Tabs defaultValue="tipos">
                    <TabsList className="mb-4">
                        <TabsTrigger value="tipos">Tipos (CFOP/Natureza)</TabsTrigger>
                        <TabsTrigger value="transacoes">Transações (Códigos)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tipos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração de Tipos</CardTitle>
                                <CardDescription>Filtre notas fiscais pelo campo TIPO (ex: 'V', 'E', 'D').</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Tipo</TableHead>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead className="text-center w-[150px]">Dashboard Comercial</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {typeConfigs.map((config) => (
                                                <TableRow key={config.tipo}>
                                                    <TableCell className="font-bold">{config.tipo}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={config.description || ''}
                                                            onChange={(e) => handleUpdateType(config, 'description', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={config.report_dashboard_comercial}
                                                            onCheckedChange={(checked) => handleUpdateType(config, 'report_dashboard_comercial', checked)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {typeConfigs.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">Nenhum tipo encontrado.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transacoes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração de Transações</CardTitle>
                                <CardDescription>Filtre notas fiscais por IDs específicos de TRANSAÇÃO.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Transação</TableHead>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead className="text-center w-[150px]">Dashboard</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transacaoConfigs.map((config) => (
                                                <TableRow key={config.transacao}>
                                                    <TableCell className="font-mono">{config.transacao}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={config.description || ''}
                                                            onChange={(e) => handleUpdateTransacao(config, 'description', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={config.report_dashboard_comercial}
                                                            onCheckedChange={(checked) => handleUpdateTransacao(config, 'report_dashboard_comercial', checked)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {transacaoConfigs.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">Nenhuma transação encontrada.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default GestaoRelatorios;
