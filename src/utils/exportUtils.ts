
import * as XLSX from "xlsx";

export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = "Dados"
): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCsv = <T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const formatDataForExport = <T extends Record<string, unknown>>(
  data: T[],
  columnMapping: Record<string, string>
): Record<string, unknown>[] => {
  return data.map((item) => {
    const formatted: Record<string, unknown> = {};
    for (const [key, label] of Object.entries(columnMapping)) {
      formatted[label] = item[key];
    }
    return formatted;
  });
};
