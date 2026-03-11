import { Router } from 'express';
import Prediction from '../models/Prediction.js';

const router = Router();

// GET /api/v1/predictions — All predictions, optional ?round=N filter
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.round) {
      filter.round = parseInt(req.query.round);
    }
    const predictions = await Prediction.find(filter).sort({ round: 1 });
    res.json(predictions);
  } catch (error) {
    next(error);
  }
});

export default router;
