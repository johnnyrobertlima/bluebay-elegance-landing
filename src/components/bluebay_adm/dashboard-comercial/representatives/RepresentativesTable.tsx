
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Formatador de números para moeda brasileira
const formatCurrency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Formatador de números com separador de milhar
const formatNumber = new Intl.NumberFormat('pt-BR');

export interface RepresentativeData {
    id: string;
    nome: string;
    totalFaturado: number;
    totalItensFaturados: number;
    ticketMedioFaturado: number;
    totalPedidos: number;
    totalItensPedidos: number;
}

interface RepresentativesTableProps {
    stats: RepresentativeData[];
    selectedRepresentative: string | null;
    onRepresentativeSelect: (repId: string) => void;
}

export const RepresentativesTable = ({
    stats,
    selectedRepresentative,
    onRepresentativeSelect
}: RepresentativesTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 text-left">
                        <th className="py-3 px-4 font-medium">Representante</th>
                        <th className="py-3 px-4 font-medium text-right">Total Faturado</th>
                        <th className="py-3 px-4 font-medium text-right">Itens Faturados</th>
                        <th className="py-3 px-4 font-medium text-right">TM por Item Faturado</th>
                        <th className="py-3 px-4 font-medium text-right">Total de Pedido</th>
                        <th className="py-3 px-4 font-medium text-right">Itens Pedidos</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((rep, index) => (
                        <tr
                            key={rep.id}
                            className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 cursor-pointer ${selectedRepresentative === rep.id ? 'bg-primary/10' : ''
                                }`}
                            onClick={() => onRepresentativeSelect(rep.id)} // Currently simple navigation or filter later
                        >
                            <td className="py-3 px-4 font-medium flex items-center">
                                {selectedRepresentative === rep.id && (
                                    <Check className="h-4 w-4 mr-2 text-primary" />
                                )}
                                <div className="flex flex-col">
                                    <span>{rep.nome}</span>
                                    {rep.id !== '0' && <span className="text-xs text-muted-foreground">{rep.id}</span>}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">{formatCurrency.format(rep.totalFaturado)}</td>
                            <td className="py-3 px-4 text-right">{formatNumber.format(rep.totalItensFaturados)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency.format(rep.ticketMedioFaturado)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency.format(rep.totalPedidos)}</td>
                            <td className="py-3 px-4 text-right">{formatNumber.format(rep.totalItensPedidos)}</td>
                        </tr>
                    ))}
                    {stats.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                Nenhum dado de representante encontrado para o período.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
