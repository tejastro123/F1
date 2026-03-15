import mongoose from 'mongoose';

const raceSchema = new mongoose.Schema({
  round: { type: Number, required: true, unique: true },
  flag: { type: String, default: '' },
  grandPrixName: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  p1Winner: { type: String, default: null }, // Legacy single fields
  p2: { type: String, default: null },
  p3: { type: String, default: null },
  resultsTop10: [{ type: String }], // Full Top 10 for main race
  sprintTop8: [{ type: String }],    // Full Top 8 for sprint
  status: { type: String, enum: ['completed', 'upcoming'], default: 'upcoming' },
  circuitDetails: {
    history: { type: String, default: '' },
    description: { type: String, default: '' },
    length: { type: String, default: '' },
    turns: { type: Number, default: 0 },
    lapRecord: {
      time: { type: String, default: '' },
      driver: { type: String, default: '' },
      year: { type: String, default: '' }
    }
  },
  sessions: {
    fp1: { type: String, default: null },
    fp2: { type: String, default: null },
    fp3: { type: String, default: null },
    qualifying: { type: String, default: null },
    sprintQualifying: { type: String, default: null },
    sprintRace: { type: String, default: null },
    race: { type: String, default: null } // Standardized race start time
  }
}, { timestamps: true });

raceSchema.index({ status: 1 });

export default mongoose.model('Race', raceSchema);
