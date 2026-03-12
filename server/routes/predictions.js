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

// GET /api/v1/predictions/leaderboard — Get user rankings
router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaderboard = await Prediction.aggregate([
      { $match: { isCorrect: { $ne: null } } },
      {
        $group: {
          _id: '$user',
          total: { $sum: 1 },
          correct: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } }
        }
      },
      { $sort: { correct: -1, total: 1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          total: 1,
          correct: 1,
          accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] },
          user: {
            displayName: '$userInfo.displayName',
            avatarUrl: '$userInfo.avatarUrl'
          }
        }
      }
    ]);
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;
