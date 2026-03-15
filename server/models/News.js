import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String },
  url: { type: String, required: true, unique: true },
  source: { type: String, default: 'F1 Official' },
  imageUrl: { type: String },
  publishedAt: { type: Date, default: Date.now },
  category: { type: String, default: 'General' },
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);
export default News;
