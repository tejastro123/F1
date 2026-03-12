import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmsPath = path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx');

function debugXlsx() {
  try {
    const workbook = XLSX.readFile(xmsPath);
    const sheet = workbook.Sheets['🏎 Drivers'];
    if (!sheet) {
      console.log('Sheet not found');
      return;
    }
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('HEADERS (Row 3):', JSON.stringify(raw[3]));
    const maxRow = raw.find(r => r && r[2] === 'Max Verstappen');
    console.log('MAX ROW:', JSON.stringify(maxRow));
    const oconRow = raw.find(r => r && r[2] === 'Esteban Ocon');
    console.log('OCON ROW:', JSON.stringify(oconRow));
  } catch (e) {
    console.error(e);
  }
}

debugXlsx();
