
import { Check } from 'lucide-react';
import { CentroCustoData } from '../utils/pedidoUtils';

// Formatador de números para moeda brasileira
const formatCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

// Formatador de números com separador de milhar
const formatNumber = new Intl.NumberFormat('pt-BR');

interface CentroCustoTableProps {
  indicadores: CentroCustoData[];
  selectedCentroCusto: string | null;
  onCentroCustoSelect: (centroCusto: string) => void;
}

export const CentroCustoTable = ({
  indicadores,
  selectedCentroCusto,
  onCentroCustoSelect
}: CentroCustoTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-3 px-4 font-medium">Centro de Custo</th>
            <th className="py-3 px-4 font-medium text-right">Total Faturado</th>
            <th className="py-3 px-4 font-medium text-right">Itens Faturados</th>
            <th className="py-3 px-4 font-medium text-right">TM por Item Faturado</th>
            <th className="py-3 px-4 font-medium text-right">Total de Pedido</th>
            <th className="py-3 px-4 font-medium text-right">Itens Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {indicadores.map((centro, index) => (
            <tr 
              key={index} 
              className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 cursor-pointer ${
                selectedCentroCusto === centro.nome ? 'bg-primary/10' : ''
              }`}
              onClick={() => onCentroCustoSelect(centro.nome)}
            >
              <td className="py-3 px-4 font-medium flex items-center">
                {selectedCentroCusto === centro.nome && (
                  <Check className="h-4 w-4 mr-2 text-primary" />
                )}
                {centro.nome}
              </td>
              <td className="py-3 px-4 text-right">{formatCurrency.format(centro.totalFaturado)}</td>
              <td className="py-3 px-4 text-right">{formatNumber.format(centro.totalItensFaturados)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency.format(centro.ticketMedioFaturado)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency.format(centro.totalPedidos)}</td>
              <td className="py-3 px-4 text-right">{formatNumber.format(centro.totalItensPedidos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
