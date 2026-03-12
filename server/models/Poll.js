import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

export default mongoose.model('Poll', pollSchema);
