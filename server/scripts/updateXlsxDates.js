import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Official 2026 F1 Race Calendar dates from formula1.com
 * Keyed by round number → race day date string
 */
const OFFICIAL_2026_DATES = {
  1:  'Mar 08',
  2:  'Mar 15',
  3:  'Mar 29',
  4:  'Apr 12',
  5:  'Apr 19',
  6:  'May 03',
  7:  'May 24',
  8:  'Jun 07',
  9:  'Jun 14',
  10: 'Jun 28',
  11: 'Jul 05',
  12: 'Jul 19',
  13: 'Jul 26',
  14: 'Aug 23',
  15: 'Sep 06',
  16: 'Sep 13',
  17: 'Sep 26',
  18: 'Oct 11',
  19: 'Oct 25',
  20: 'Nov 01',
  21: 'Nov 08',
  22: 'Nov 21',
  23: 'Nov 29',
  24: 'Dec 06',
};

const XLSX_FILES = [
  path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx'),
  path.resolve(__dirname, '../../F1 2026.xlsx'),
];

const SHEET_NAME = '\u{1F5D3} Calendar'; // 🗓 Calendar
const DATA_START_ROW = 5; // 0-indexed row where data begins
const COL_ROUND = 0;      // Column A = round number
const COL_DATE = 3;        // Column D = date

function updateXlsx(filePath) {
  console.log(`\nProcessing: ${path.basename(filePath)}`);

  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
    console.log(`  ⚠️  Could not open file: ${err.message}`);
    return;
  }

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    console.log(`  ⚠️  Sheet "${SHEET_NAME}" not found — skipping`);
    return;
  }

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  let updated = 0;

  for (let i = DATA_START_ROW; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[COL_ROUND] || typeof row[COL_ROUND] !== 'number') continue;

    const round = row[COL_ROUND];
    const newDate = OFFICIAL_2026_DATES[round];

    if (newDate) {
      const oldDate = row[COL_DATE] || '(empty)';
      // Get the cell address for the DATE column in this row
      const cellAddr = XLSX.utils.encode_cell({ r: i, c: COL_DATE });
      // Update the cell value
      if (!sheet[cellAddr]) {
        sheet[cellAddr] = { t: 's', v: newDate };
      } else {
        sheet[cellAddr].v = newDate;
        sheet[cellAddr].t = 's'; // ensure it's treated as string
        // Remove any date formatting that might interfere
        delete sheet[cellAddr].w;
        delete sheet[cellAddr].z;
      }
      console.log(`  ✅ Round ${String(round).padStart(2, ' ')}: "${oldDate}" → "${newDate}"`);
      updated++;
    }
  }

  XLSX.writeFile(workbook, filePath);
  console.log(`  📝 Saved! (${updated} dates updated)`);
}

console.log('🏎  F1 2026 — Updating Excel files with official race dates\n');

for (const file of XLSX_FILES) {
  updateXlsx(file);
}

console.log('\n🏁 Done!');
