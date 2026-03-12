import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmsPath = path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx');

function mapUserNumbers() {
  try {
    const workbook = XLSX.readFile(xmsPath);
    const sheet = workbook.Sheets['🏎 Drivers'];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // User's numbers in order
    const userNumbers = [63, 12, 16, 44, 1, 3, 87, 41, 5, 10, 31, 23, 30, 43, 55, 11, 6, 81, 27, 14, 77, 18];
    
    console.log('--- Mapping User Numbers to Excel Names ---');
    let userIdx = 0;
    for (let i = 4; i < raw.length; i++) {
        const row = raw[i];
        if (!row || !row[2] || row[2] === 'TOTALS') continue;
        const name = row[2];
        const num = userNumbers[userIdx];
        console.log(`"${name}": ${num},`);
        userIdx++;
        if (userIdx >= userNumbers.length) break;
    }
  } catch (e) {
    console.error(e);
  }
}

mapUserNumbers();
