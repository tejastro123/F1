import mongoose from 'mongoose';

const raceSchema = new mongoose.Schema({
  round: { type: Number, required: true, unique: true },
  flag: { type: String, default: '' },
  grandPrixName: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  p1Winner: { type: String, default: null },
  p2: { type: String, default: null },
  p3: { type: String, default: null },
  sprintWinner: { type: String, default: null },
  status: { type: String, enum: ['completed', 'upcoming'], default: 'upcoming' },
}, { timestamps: true });

raceSchema.index({ status: 1 });

export default mongoose.model('Race', raceSchema);
