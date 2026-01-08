
interface EstoqueSummaryCardsProps {
  totalGroups: number;
  totalItems: number;
  totalPhysicalStock: number;
}

export const EstoqueSummaryCards = ({ totalGroups, totalItems, totalPhysicalStock }: EstoqueSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total de Grupos</h3>
        <p className="text-2xl font-bold">{totalGroups}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total de Itens</h3>
        <p className="text-2xl font-bold">{totalItems}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Estoque Físico Total</h3>
        <p className="text-2xl font-bold">{totalPhysicalStock.toLocaleString()}</p>
      </div>
    </div>
  );
};
