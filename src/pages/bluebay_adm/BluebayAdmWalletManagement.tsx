
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useWalletManagement } from "@/hooks/bluebay_adm/useWalletManagement";
import { WalletManagementGrid } from "@/components/bluebay_adm/wallet-management/WalletManagementGrid";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { MultiSelectAsyncFilter } from "@/components/bluebay_adm/dashboard-comercial/MultiSelectAsyncFilter";
import { fetchActiveRepresentativesRPC } from "@/services/bluebay/dashboardComercialService";

const BluebayAdmWalletManagement = () => {
    const {
        data,
        isLoading,
        startDate,
        endDate,
        setDateRange,
        refreshData,
        selectedRepresentatives,
        setSelectedRepresentatives,
        onlyPending,
        setOnlyPending
    } = useWalletManagement();

    return (
        <div className="min-h-screen bg-background">
            <BluebayAdmMenu />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Carteira</h1>
                        <p className="text-muted-foreground">Monitoramento de pedidos, entregas e saldos por cliente</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-card p-2 rounded-md border text-sm">
                            <label className="cursor-pointer select-none font-medium flex items-center gap-2">
                                <span className={onlyPending ? "text-primary" : "text-muted-foreground"}>Somente Pendências</span>
                                <div
                                    className={`w-9 h-5 rounded-full p-1 transition-colors ${onlyPending ? 'bg-primary' : 'bg-muted'}`}
                                    onClick={() => setOnlyPending(!onlyPending)}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${onlyPending ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </label>
                        </div>
                        <div className="w-[300px]">
                            <MultiSelectAsyncFilter
                                label="Representante"
                                value={selectedRepresentatives}
                                onChange={setSelectedRepresentatives}
                                fetchOptions={async (q) => {
                                    const all = await fetchActiveRepresentativesRPC();
                                    if (!q) return all;
                                    return all.filter(r => r.label.toLowerCase().includes(q.toLowerCase()));
                                }}
                                placeholder="Buscar Representante..."
                                width="w-[300px]"
                            />
                        </div>
                        <DateRangePicker
                            value={{ from: startDate, to: endDate }}
                            onChange={(range) => {
                                if (range?.from && range?.to) {
                                    setDateRange(range.from, range.to);
                                }
                            }}
                        />
                        <Button variant="outline" size="icon" onClick={refreshData} title="Atualizar">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <WalletManagementGrid data={data} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default BluebayAdmWalletManagement;
