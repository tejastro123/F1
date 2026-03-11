import XLSX from 'xlsx';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Driver from '../models/Driver.js';
import Constructor, { TEAM_COLORS } from '../models/Constructor.js';
import Race from '../models/Race.js';
import Prediction from '../models/Prediction.js';

const DEFAULT_XLSX_PATH = path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx');

/**
 * Parse drivers from the '🏎 Drivers' sheet
 * Headers at row 4 (0-indexed: 3), data starts row 5 (0-indexed: 4)
 * Columns: [empty, POS, DRIVER, NAT, TEAM, PTS, WINS, PODS, GRID, empty]
 */
function parseDrivers(workbook) {
  const sheet = workbook.Sheets['🏎 Drivers'];
  if (!sheet) throw new Error('Drivers sheet not found');

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const drivers = [];

  for (let i = 4; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[1] || typeof row[1] !== 'number') continue;
    if (row[2] === 'TOTALS') break;

    drivers.push({
      rank: row[1],
      fullName: row[2],
      nationality: row[3] || '',
      team: row[4] || '',
      points: row[5] || 0,
      wins: row[6] || 0,
      podiums: row[7] || 0,
      gridPosition: row[8] || 0,
      photoUrl: null,
    });
  }

  return drivers;
}

/**
 * Parse constructors from the '🏗 Constructors' sheet
 * Headers at row 4 (0-indexed: 3), data starts row 5 (0-indexed: 4)
 * Columns: [empty, POS, CONSTRUCTOR, POINTS, WINS, PODIUMS, empty]
 */
function parseConstructors(workbook) {
  const sheet = workbook.Sheets['🏗 Constructors'];
  if (!sheet) throw new Error('Constructors sheet not found');

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const constructors = [];

  for (let i = 4; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[1] || typeof row[1] !== 'number') continue;

    const teamName = row[2];
    const colors = TEAM_COLORS[teamName] || { primary: '#FFFFFF', secondary: '#000000' };

    constructors.push({
      rank: row[1],
      teamName,
      points: row[3] || 0,
      wins: row[4] || 0,
      podiums: row[5] || 0,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
    });
  }

  return constructors;
}

/**
 * Parse races from the '🗓 Calendar' sheet
 * Headers at row 5 (0-indexed: 4), data starts row 6 (0-indexed: 5)
 * Columns: [RD, flag, GRAND PRIX, DATE, VENUE, WINNER P1, P2, P3, empty]
 */
function parseRaces(workbook) {
  const sheet = workbook.Sheets['🗓 Calendar'];
  if (!sheet) throw new Error('Calendar sheet not found');

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const races = [];

  for (let i = 5; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[0] || typeof row[0] !== 'number') continue;

    const p1 = row[5] && row[5] !== '—' ? row[5] : null;
    const p2 = row[6] && row[6] !== '—' ? row[6] : null;
    const p3 = row[7] && row[7] !== '—' ? row[7] : null;
    const status = p1 ? 'completed' : 'upcoming';

    races.push({
      round: row[0],
      flag: row[1] || '',
      grandPrixName: row[2],
      venue: row[4] || '',
      date: row[3] || '',
      p1Winner: p1,
      p2,
      p3,
      sprintWinner: null,
      status,
    });
  }

  return races;
}

/**
 * Parse predictions from the '🎯 Predictions' sheet
 * Header row at row 4 (has ROUND info), data headers at row 5 (0-indexed: 4), data from row 6 (0-indexed: 5)
 * Columns: [CATEGORY, YOUR PREDICTION, ACTUAL RESULT, STATUS, %, empty]
 */
function parsePredictions(workbook) {
  const sheet = workbook.Sheets['🎯 Predictions'];
  if (!sheet) throw new Error('Predictions sheet not found');

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const predictions = [];

  // Get round info from row 4 (0-indexed: 3)
  const roundInfoRow = raw[3];
  let round = 2;
  let grandPrixName = 'Chinese GP';

  if (roundInfoRow && roundInfoRow[0]) {
    const roundMatch = String(roundInfoRow[0]).match(/ROUND\s+(\d+)/i);
    if (roundMatch) round = parseInt(roundMatch[1]);

    const gpMatch = String(roundInfoRow[0]).match(/·\s*(.+)/);
    if (gpMatch) grandPrixName = gpMatch[1].trim();
  }

  for (let i = 5; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[0] || row[0] === 'PREDICTION SCORE') break;
    if (row[0] === 'CATEGORY') continue;

    const statusText = row[3] ? String(row[3]) : '';
    let isCorrect = null;
    if (statusText.includes('CORRECT')) isCorrect = true;
    else if (statusText.includes('WRONG') || statusText.includes('INCORRECT')) isCorrect = false;

    predictions.push({
      round,
      category: row[0].replace(/^[^\w]*/, '').trim(),
      prediction: row[1] || '',
      actualResult: row[2] || 'TBD',
      isCorrect,
      grandPrixName,
    });
  }

  return predictions;
}

/**
 * Main seed function — callable from CLI or admin upload route
 */
export async function seedFromXlsx(xlsxPath = DEFAULT_XLSX_PATH) {
  const workbook = XLSX.readFile(xlsxPath);

  const drivers = parseDrivers(workbook);
  const constructors = parseConstructors(workbook);
  const races = parseRaces(workbook);
  const predictions = parsePredictions(workbook);

  const results = {
    drivers: { added: 0, updated: 0, unchanged: 0 },
    constructors: { added: 0, updated: 0, unchanged: 0 },
    races: { added: 0, updated: 0, unchanged: 0 },
    predictions: { added: 0, updated: 0, unchanged: 0 },
  };

  // Upsert drivers
  for (const d of drivers) {
    const existing = await Driver.findOne({ fullName: d.fullName });
    const res = await Driver.findOneAndUpdate(
      { fullName: d.fullName },
      d,
      { upsert: true, new: true, runValidators: true }
    );
    if (!existing) results.drivers.added++;
    else results.drivers.updated++;
  }

  // Upsert constructors
  for (const c of constructors) {
    const existing = await Constructor.findOne({ teamName: c.teamName });
    await Constructor.findOneAndUpdate(
      { teamName: c.teamName },
      c,
      { upsert: true, new: true, runValidators: true }
    );
    if (!existing) results.constructors.added++;
    else results.constructors.updated++;
  }

  // Upsert races
  for (const r of races) {
    const existing = await Race.findOne({ round: r.round });
    await Race.findOneAndUpdate(
      { round: r.round },
      r,
      { upsert: true, new: true, runValidators: true }
    );
    if (!existing) results.races.added++;
    else results.races.updated++;
  }

  // Upsert predictions
  for (const p of predictions) {
    const existing = await Prediction.findOne({ round: p.round, category: p.category });
    await Prediction.findOneAndUpdate(
      { round: p.round, category: p.category },
      p,
      { upsert: true, new: true, runValidators: true }
    );
    if (!existing) results.predictions.added++;
    else results.predictions.updated++;
  }

  return results;
}

// CLI execution
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('seedFromXlsx.js') ||
  process.argv[1].includes('seedFromXlsx')
);

if (isMainModule) {
  try {
    console.log('🏎  F1 2026 Seed Script');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Seeding data...\n');

    const results = await seedFromXlsx();

    console.log('✅ Seed complete!');
    console.log('  Drivers:', results.drivers);
    console.log('  Constructors:', results.constructors);
    console.log('  Races:', results.races);
    console.log('  Predictions:', results.predictions);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}
