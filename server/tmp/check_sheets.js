import XLSX from 'xlsx';
try {
  const workbook = XLSX.readFile('c:/Users/tejas/OneDrive/Desktop/F1/data/F1_2026_PRO.xlsx');
  console.log(workbook.SheetNames);
} catch (err) {
  console.error("Error reading file:", err.message);
}
