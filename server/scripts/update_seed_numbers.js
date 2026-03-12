import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmsPath = path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx');
const seedPath = path.resolve(__dirname, 'seedFromXlsx.js');

function updateSeed() {
  try {
    const workbook = XLSX.readFile(xmsPath);
    const sheet = workbook.Sheets['🏎 Drivers'];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // User's numbers in order
    const userNumbers = [63, 12, 16, 44, 1, 3, 87, 41, 5, 10, 31, 23, 30, 43, 55, 11, 6, 81, 27, 14, 77, 18];
    
    const mapping = {};
    let userIdx = 0;
    for (let i = 4; i < raw.length; i++) {
        const row = raw[i];
        if (!row || !row[2] || row[2] === 'TOTALS') continue;
        const name = row[2];
        mapping[name] = userNumbers[userIdx];
        userIdx++;
        if (userIdx >= userNumbers.length) break;
    }
    
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    const startMarker = 'const OFFICIAL_NUMBERS = {';
    const endMarker = '};';
    
    const startIndex = seedContent.indexOf(startMarker);
    const endIndex = seedContent.indexOf(endMarker, startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const newMapping = `const OFFICIAL_NUMBERS = ${JSON.stringify(mapping, null, 2)}`;
        const updatedContent = seedContent.substring(0, startIndex) + newMapping + seedContent.substring(endIndex + 2);
        fs.writeFileSync(seedPath, updatedContent);
        console.log('Successfully updated seedFromXlsx.js with new mapping.');
        console.log('Mapping used:', JSON.stringify(mapping, null, 2));
    } else {
        console.error('Could not find OFFICIAL_NUMBERS block in seedFromXlsx.js');
    }
    
  } catch (e) {
    console.error(e);
  }
}

updateSeed();
