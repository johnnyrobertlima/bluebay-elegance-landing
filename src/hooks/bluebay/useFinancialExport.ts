// Stub hook for Financial export
import * as XLSX from 'xlsx';

interface UseFinancialExportProps {
  activeTab: string;
  filteredTitles: any[];
  filteredInvoices: any[];
  clientFinancialSummaries: any[];
}

export const useFinancialExport = ({
  activeTab,
  filteredTitles,
  filteredInvoices,
  clientFinancialSummaries
}: UseFinancialExportProps) => {
  const exportToExcel = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      console.log("No data to export");
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, filename);
  };

  const exportToPdf = (data: any[]) => {
    console.log("Export to PDF not implemented", data);
  };

  const handleExportToExcel = () => {
    switch (activeTab) {
      case 'titulos':
        exportToExcel(filteredTitles, 'titulos_financeiros.xlsx');
        break;
      case 'notas':
        exportToExcel(filteredInvoices, 'notas_fiscais.xlsx');
        break;
      case 'clientes':
        exportToExcel(clientFinancialSummaries, 'resumo_clientes.xlsx');
        break;
      default:
        exportToExcel(filteredTitles, 'financeiro.xlsx');
    }
  };

  return {
    exportToExcel,
    exportToPdf,
    handleExportToExcel
  };
};
