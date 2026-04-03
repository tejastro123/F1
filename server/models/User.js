import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: false }, // Optional for OAuth users
  googleId: { type: String, unique: true, sparse: true },
  discordId: { type: String, unique: true, sparse: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  role: { type: String, enum: ['admin', 'viewer', 'user'], default: 'user' },
  favorites: {
    drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }],
    constructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Constructor' }],
    races: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Race' }],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
