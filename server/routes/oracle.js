import { Router } from 'express';
import { getNextRacePrediction } from '../services/mlService.js';

const router = Router();

// GET /api/v1/oracle/prediction
router.get('/prediction', async (req, res, next) => {
  try {
    const report = await getNextRacePrediction();
    res.json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
