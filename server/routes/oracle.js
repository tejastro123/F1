import { Router } from 'express';
import { getNextRacePrediction } from '../services/mlService.js';
import { cache } from '../middleware/cacheMiddleware.js';

const router = Router();

// GET /api/v1/oracle/prediction
router.get('/prediction', cache(3600), async (req, res, next) => {
  try {
    const report = await getNextRacePrediction();
    res.json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
