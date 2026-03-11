import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Race from '../models/Race.js';

/**
 * Official 2026 F1 Race Calendar dates from formula1.com
 * Format: "Mon DD" — matches the existing date format used by
 * formatDate.js and useCountdown.js on the frontend.
 */
const OFFICIAL_2026_DATES = [
  { round: 1,  date: 'Mar 08', grandPrixName: 'Australian Grand Prix' },
  { round: 2,  date: 'Mar 15', grandPrixName: 'Chinese Grand Prix' },
  { round: 3,  date: 'Mar 29', grandPrixName: 'Japanese Grand Prix' },
  { round: 4,  date: 'Apr 12', grandPrixName: 'Bahrain Grand Prix' },
  { round: 5,  date: 'Apr 19', grandPrixName: 'Saudi Arabian Grand Prix' },
  { round: 6,  date: 'May 03', grandPrixName: 'Miami Grand Prix' },
  { round: 7,  date: 'May 24', grandPrixName: 'Canadian Grand Prix' },
  { round: 8,  date: 'Jun 07', grandPrixName: 'Monaco Grand Prix' },
  { round: 9,  date: 'Jun 14', grandPrixName: 'Barcelona-Catalunya Grand Prix' },
  { round: 10, date: 'Jun 28', grandPrixName: 'Austrian Grand Prix' },
  { round: 11, date: 'Jul 05', grandPrixName: 'British Grand Prix' },
  { round: 12, date: 'Jul 19', grandPrixName: 'Belgian Grand Prix' },
  { round: 13, date: 'Jul 26', grandPrixName: 'Hungarian Grand Prix' },
  { round: 14, date: 'Aug 23', grandPrixName: 'Dutch Grand Prix' },
  { round: 15, date: 'Sep 06', grandPrixName: 'Italian Grand Prix' },
  { round: 16, date: 'Sep 13', grandPrixName: 'Spanish Grand Prix' },
  { round: 17, date: 'Sep 26', grandPrixName: 'Azerbaijan Grand Prix' },
  { round: 18, date: 'Oct 11', grandPrixName: 'Singapore Grand Prix' },
  { round: 19, date: 'Oct 25', grandPrixName: 'United States Grand Prix' },
  { round: 20, date: 'Nov 01', grandPrixName: 'Mexico City Grand Prix' },
  { round: 21, date: 'Nov 08', grandPrixName: 'São Paulo Grand Prix' },
  { round: 22, date: 'Nov 21', grandPrixName: 'Las Vegas Grand Prix' },
  { round: 23, date: 'Nov 29', grandPrixName: 'Qatar Grand Prix' },
  { round: 24, date: 'Dec 06', grandPrixName: 'Abu Dhabi Grand Prix' },
];

async function updateRaceDates() {
  console.log('🏎  F1 2026 — Updating race dates from official calendar');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!\n');

  let updated = 0;
  let notFound = 0;

  for (const entry of OFFICIAL_2026_DATES) {
    const result = await Race.findOneAndUpdate(
      { round: entry.round },
      { date: entry.date },
      { new: true }
    );

    if (result) {
      console.log(`  ✅ Round ${String(entry.round).padStart(2, ' ')} | ${entry.grandPrixName.padEnd(32)} | ${entry.date}`);
      updated++;
    } else {
      console.log(`  ⚠️  Round ${entry.round} not found in database — skipping`);
      notFound++;
    }
  }

  console.log(`\n🏁 Done! Updated: ${updated}, Not found: ${notFound}`);
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

updateRaceDates().catch((err) => {
  console.error('❌ Update failed:', err.message);
  process.exit(1);
});
