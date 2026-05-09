import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'report', sheetName = 'Data') => {
  if (!data || !data.length) {
    alert('Không có dữ liệu để xuất!');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Export multiple data sets to separate sheets in one Excel file
 * @param {Array} sheets - Array of { name, data } objects
 * @param {String} fileName - Name of the file
 */
export const exportMultiSheetExcel = (sheets, fileName = 'report') => {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    if (sheet.data && sheet.data.length) {
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    }
  });

  if (wb.SheetNames.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
