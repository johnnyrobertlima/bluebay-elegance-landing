
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RepresentativesTable, RepresentativeData } from './representatives/RepresentativesTable';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface RepresentativesIndicatorsProps {
    stats?: RepresentativeData[];
    isLoading: boolean;
    selectedRepresentative?: string[];
    onRepresentativeSelect?: (repId: string[]) => void;
}

export const RepresentativesIndicators = ({
    stats,
    isLoading,
    selectedRepresentative = [], // Default
    onRepresentativeSelect
}: RepresentativesIndicatorsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleRepClick = (repId: string) => {
        if (onRepresentativeSelect) {
            const current = selectedRepresentative || [];
            if (current.includes(repId)) {
                onRepresentativeSelect(current.filter(id => id !== repId));
            } else {
                onRepresentativeSelect([...current, repId]);
            }
        }
    };

    // Sort by Total Pedidos DESC
    const sortedStats = useMemo(() => {
        if (!stats) return [];
        return [...stats].sort((a, b) => b.totalPedidos - a.totalPedidos);
    }, [stats]);

    const displayedStats = isExpanded ? sortedStats : sortedStats.slice(0, 5);
    const hasMore = sortedStats.length > 5;

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Indicadores por Representante</CardTitle>
                </CardHeader>
                <CardContent className="h-32 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    // Fallback if no stats provided
    if (!stats) return null;

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    Top {isExpanded ? sortedStats.length : 5} Representantes (por Total de Pedidos)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <RepresentativesTable
                    stats={displayedStats}
                    selectedRepresentative={selectedRepresentative}
                    onRepresentativeSelect={handleRepClick}
                />

                {hasMore && (
                    <div className="mt-4 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full sm:w-auto"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="mr-2 h-4 w-4" />
                                    Ver menos
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                    Ver mais ({sortedStats.length - 5} restantes)
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
