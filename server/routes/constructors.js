import { Router } from 'express';
import Constructor from '../models/Constructor.js';
import { cache } from '../middleware/cacheMiddleware.js';

const router = Router();

// GET /api/v1/constructors — All constructors sorted by points desc
router.get('/', cache(300), async (req, res, next) => {
  try {
    const constructors = await Constructor.find().sort({ rank: 1 });
    res.json(constructors);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/constructors/:id — Single constructor by ID
router.get('/:id', async (req, res, next) => {
  try {
    const constructor = await Constructor.findById(req.params.id);
    if (!constructor) {
      return res.status(404).json({ error: 'Constructor not found' });
    }
    res.json(constructor);
  } catch (error) {
    next(error);
  }
});

export default router;
