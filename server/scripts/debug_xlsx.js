import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmsPath = path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx');

function debugXlsx() {
  try {
    const workbook = XLSX.readFile(xmsPath);
    console.log('SHEETS:', workbook.SheetNames);
    workbook.SheetNames.forEach(name => {
      const s = workbook.Sheets[name];
      const r = XLSX.utils.sheet_to_json(s, { header: 1 });
      r.forEach((row, i) => {
        if (row && row.includes(44)) {
          console.log(`FOUND 44 in sheet "${name}" at row ${i}:`, JSON.stringify(row));
        }
      });
    });
  } catch (e) {
    console.error(e);
  }
}

debugXlsx();
