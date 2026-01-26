
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useSeasonPerformance } from "@/hooks/bluebay_adm/useSeasonPerformance";
import { SeasonPerformanceGrid } from "@/components/bluebay_adm/season-performance/SeasonPerformanceGrid";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

const SEASON_OPTIONS = [
    { label: "Primavera / Verão", value: "Primavera / Verão" },
    { label: "Outono / Inverno", value: "Outono / Inverno" },
    { label: "Todas", value: "Todas" },
    { label: "Não Definida", value: "Não Definida" },
];

const BluebayAdmSeasonPerformance = () => {
    const {
        data,
        isLoading,
        startDate,
        endDate,
        setDateRange,
        refreshData,
        selectedSeasons,
        setSelectedSeasons
    } = useSeasonPerformance();

    return (
        <div className="min-h-screen bg-background">
            <BluebayAdmMenu />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Desempenho por Estação</h1>
                        <p className="text-muted-foreground">Análise de vendas e pedidos por grupo e estação do ano</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
                        <div className="w-full sm:w-[250px]">
                            <MultiSelect
                                options={SEASON_OPTIONS}
                                selected={selectedSeasons}
                                onChange={setSelectedSeasons}
                                placeholder="Filtrar por Estação"
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

                <SeasonPerformanceGrid data={data} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default BluebayAdmSeasonPerformance;
