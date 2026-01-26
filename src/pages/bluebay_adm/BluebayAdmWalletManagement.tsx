
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useWalletManagement } from "@/hooks/bluebay_adm/useWalletManagement";
import { WalletManagementGrid } from "@/components/bluebay_adm/wallet-management/WalletManagementGrid";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const BluebayAdmWalletManagement = () => {
    const {
        data,
        isLoading,
        startDate,
        endDate,
        setDateRange,
        refreshData
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
