import XLSX from 'xlsx';
import pool from '../config/database.js';

/**
 * Parse Excel file to JSON array
 */
export const parseExcel = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

/**
 * Generate Excel file from data array
 */
export const generateExcel = (data, headers = null) => {
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Process data in chunks
 */
export const processInChunks = async (data, chunkSize, processor) => {
  const results = {
    success: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    try {
      await processor(chunk);
      results.success += chunk.length;
    } catch (error) {
      results.errors.push({
        chunk: i / chunkSize + 1,
        error: error.message,
      });
    }
  }

  return results;
};

