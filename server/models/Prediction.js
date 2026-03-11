import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  category: { type: String, required: true },
  prediction: { type: String, required: true },
  actualResult: { type: String, default: 'TBD' },
  isCorrect: { type: Boolean, default: null },
  grandPrixName: { type: String, required: true },
}, { timestamps: true });

predictionSchema.index({ round: 1 });

export default mongoose.model('Prediction', predictionSchema);
