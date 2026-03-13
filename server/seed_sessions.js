import mongoose from 'mongoose';
import Race from './models/Race.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

async function seedSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const races = [
      { name: 'Australian GP', sessions: { fp1: 'Fri 12:30', fp2: 'Fri 16:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Chinese GP', sessions: { fp1: 'Fri 11:30', sprintQualifying: 'Fri 15:30', sprintRace: 'Sat 11:00', qualifying: 'Sat 15:00', race: 'Sun 15:00' } }, // Sprint
      { name: 'Japanese GP', sessions: { fp1: 'Fri 11:30', fp2: 'Fri 15:00', fp3: 'Sat 11:30', qualifying: 'Sat 15:00', race: 'Sun 14:00' } },
      { name: 'Bahrain GP', sessions: { fp1: 'Fri 14:30', fp2: 'Fri 18:00', fp3: 'Sat 15:30', qualifying: 'Sat 19:00', race: 'Sun 18:00' } },
      { name: 'Saudi Arabian GP', sessions: { fp1: 'Fri 16:30', fp2: 'Fri 20:00', fp3: 'Sat 16:30', qualifying: 'Sat 20:00', race: 'Sun 20:00' } },
      { name: 'Miami GP', sessions: { fp1: 'Fri 12:30', sprintQualifying: 'Fri 16:30', sprintRace: 'Sat 12:00', qualifying: 'Sat 16:00', race: 'Sun 16:00' } }, // Sprint
      { name: 'Emilia Romagna GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Monaco GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Spanish GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Canadian GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 14:00' } },
      { name: 'Austrian GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'British GP', sessions: { fp1: 'Fri 12:30', fp2: 'Fri 16:00', fp3: 'Sat 11:30', qualifying: 'Sat 15:00', race: 'Sun 15:00' } },
      { name: 'Hungarian GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Belgian GP', sessions: { fp1: 'Fri 13:30', sprintQualifying: 'Fri 17:30', sprintRace: 'Sat 13:00', qualifying: 'Sat 17:00', race: 'Sun 15:00' } }, // Sprint
      { name: 'Dutch GP', sessions: { fp1: 'Fri 12:30', fp2: 'Fri 16:00', fp3: 'Sat 11:30', qualifying: 'Sat 15:00', race: 'Sun 15:00' } },
      { name: 'Italian GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Azerbaijan GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 12:30', qualifying: 'Sat 16:00', race: 'Sun 15:00' } },
      { name: 'Singapore GP', sessions: { fp1: 'Fri 17:30', fp2: 'Fri 21:00', fp3: 'Sat 17:30', qualifying: 'Sat 21:00', race: 'Sun 20:00' } },
      { name: 'United States GP', sessions: { fp1: 'Fri 12:30', sprintQualifying: 'Fri 16:30', sprintRace: 'Sat 13:00', qualifying: 'Sat 17:00', race: 'Sun 14:00' } }, // Sprint
      { name: 'Mexico City GP', sessions: { fp1: 'Fri 12:30', fp2: 'Fri 16:00', fp3: 'Sat 11:30', qualifying: 'Sat 15:00', race: 'Sun 14:00' } },
      { name: 'São Paulo GP', sessions: { fp1: 'Fri 11:30', sprintQualifying: 'Fri 15:30', sprintRace: 'Sat 11:00', qualifying: 'Sat 15:00', race: 'Sun 14:00' } }, // Sprint
      { name: 'Las Vegas GP', sessions: { fp1: 'Thu 18:30', fp2: 'Thu 22:00', fp3: 'Fri 18:30', qualifying: 'Fri 22:00', race: 'Sat 22:00' } },
      { name: 'Qatar GP', sessions: { fp1: 'Fri 16:30', sprintQualifying: 'Fri 20:30', sprintRace: 'Sat 16:00', qualifying: 'Sat 20:00', race: 'Sun 20:00' } }, // Sprint
      { name: 'Abu Dhabi GP', sessions: { fp1: 'Fri 13:30', fp2: 'Fri 17:00', fp3: 'Sat 14:30', qualifying: 'Sat 18:00', race: 'Sun 17:00' } }
    ];

    for (const r of races) {
      const result = await Race.findOneAndUpdate(
        { grandPrixName: r.name },
        { $set: { sessions: r.sessions } },
        { new: true }
      );
      if (result) {
        console.log(`Updated Real Timings for: ${r.name}`);
      } else {
        console.warn(`Race not found: ${r.name}`);
      }
    }

    console.log('F1 2026 Authentic Schedule Seeding Complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedSessions();
