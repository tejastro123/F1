import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  fullName: { type: String, required: true, unique: true },
  nationality: { type: String, required: true },
  team: { type: String, required: true },
  points: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  podiums: { type: Number, default: 0 },
  gridPosition: { type: Number, default: 0 },
  photoUrl: { type: String, default: null },
  driverNumber: { type: Number, default: null },
  bio: { type: String, default: '' },
  achievements: [{ type: String }],
  careerStats: {
    wins: { type: Number, default: 0 },
    podiums: { type: Number, default: 0 },
    poles: { type: Number, default: 0 },
    championships: { type: Number, default: 0 }
  }
}, { timestamps: true });

driverSchema.index({ points: -1 });
driverSchema.index({ team: 1 });

export default mongoose.model('Driver', driverSchema);
