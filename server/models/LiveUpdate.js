import mongoose from 'mongoose';

const liveUpdateSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['YELLOW_FLAG', 'GREEN_FLAG', 'RED_FLAG', 'CHEQUERED_FLAG', 'COMMENTARY', 'INVESTIGATION', 'PURPLE_SECTOR'],
    default: 'COMMENTARY'
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sector: { type: Number },
  driver: { type: String }
});

export default mongoose.model('LiveUpdate', liveUpdateSchema);
