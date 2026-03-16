import { Router } from 'express';
import Prediction from '../models/Prediction.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/predictions — All predictions for the logged-in user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.round) {
      filter.round = parseInt(req.query.round);
    }
    const predictions = await Prediction.find(filter).sort({ round: 1 });
    res.json(predictions);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/predictions — Create or Update a prediction for the logged-in user
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { round, category, prediction, grandPrixName } = req.body;
    
    // Upsert (update if exists for this user/round/category, otherwise insert)
    const result = await Prediction.findOneAndUpdate(
      { user: req.user.id, round, category },
      { prediction, grandPrixName },
      { new: true, upsert: true }
    );
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
export default router;
