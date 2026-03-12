import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  round: { type: Number, required: true },
  category: { type: String, required: true },
  prediction: { type: String, required: true },
  actualResult: { type: String, default: 'TBD' },
  isCorrect: { type: Boolean, default: null },
  grandPrixName: { type: String, required: true },
}, { timestamps: true });

// Optimize for looking up a specific user's predictions for a specific race
predictionSchema.index({ user: 1, round: 1 });

export default mongoose.model('Prediction', predictionSchema);
