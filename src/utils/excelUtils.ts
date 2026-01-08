import * as XLSX from 'xlsx';

/**
 * Create and download an Excel file
 */
export const createAndDownloadExcel = (
  data: any[],
  filename: string,
  sheetName: string = 'Sheet1'
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

/**
 * Format data for Excel export
 */
export const formatDataForExcel = (data: any[], columns: { key: string; label: string }[]) => {
  return data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      row[col.label] = item[col.key];
    });
    return row;
  });
};

/**
 * Parse Excel file to JSON
 */
export const parseExcelToJson = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
