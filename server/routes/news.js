import { Router } from 'express';
import News from '../models/News.js';
const router = Router();

// GET /api/v1/news — Get latest F1 news
router.get('/', async (req, res, next) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 }).limit(10);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

export default router;
