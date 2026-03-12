import mongoose from 'mongoose';

const TEAM_COLORS = {
  'Mercedes': { primary: '#27F4D2', secondary: '#00A19C' },
  'Ferrari': { primary: '#E8002D', secondary: '#FF2800' },
  'Red Bull': { primary: '#3671C6', secondary: '#1B3B73' },
  'McLaren': { primary: '#FF8000', secondary: '#47C7FC' },
  'Aston Martin': { primary: '#229971', secondary: '#00594F' },
  'Alpine': { primary: '#FF87BC', secondary: '#0093CC' },
  'Williams': { primary: '#1868DB', secondary: '#00A3E0' },
  'RB': { primary: '#6692FF', secondary: '#1B3B73' },
  'Haas': { primary: '#B6BABD', secondary: '#E6002D' },
  'Audi': { primary: '#FF0000', secondary: '#2D826D' },
  'Cadillac': { primary: '#1D1D1B', secondary: '#DAA520' },
};

const constructorSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  teamName: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  podiums: { type: Number, default: 0 },
  primaryColor: { type: String, default: '#FFFFFF' },
  secondaryColor: { type: String, default: '#000000' },
  bio: { type: String, default: '' },
  history: { type: String, default: '' },
  base: { type: String, default: 'TBD' },
  teamPrincipal: { type: String, default: 'TBD' },
  powerUnit: { type: String, default: 'TBD' },
  achievements: [{ type: String }],
  foundedYear: { type: Number },
}, { timestamps: true });

constructorSchema.index({ points: -1 });

// Pre-save hook to auto-assign team colors
constructorSchema.pre('save', function (next) {
  if (TEAM_COLORS[this.teamName]) {
    this.primaryColor = TEAM_COLORS[this.teamName].primary;
    this.secondaryColor = TEAM_COLORS[this.teamName].secondary;
  }
  next();
});

export { TEAM_COLORS };
export default mongoose.model('Constructor', constructorSchema);
