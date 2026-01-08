// Stub hook for Estoque export
import * as XLSX from 'xlsx';

export const useEstoqueExport = () => {
  const exportToExcel = (data: any[]) => {
    if (!data || data.length === 0) {
      console.log("No data to export");
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque');
    XLSX.writeFile(workbook, 'estoque.xlsx');
  };

  const handleExportEstoque = (groupedItems: any[], filteredItems: any[]) => {
    const exportData = filteredItems.map(item => ({
      'Código': item.ITEM_CODIGO,
      'Descrição': item.DESCRICAO,
      'Grupo': item.GRU_DESCRICAO,
      'Físico': item.FISICO,
      'Disponível': item.DISPONIVEL,
      'Local': item.LOCAL
    }));
    
    exportToExcel(exportData);
  };

  return {
    exportToExcel,
    handleExportEstoque
  };
};
