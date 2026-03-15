import { Router } from 'express';
import Driver from '../models/Driver.js';

const router = Router();

// GET /api/v1/drivers — All drivers sorted by points desc
router.get('/', async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ rank: 1 });
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/drivers/:id — Single driver by ID
router.get('/:id', async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

export default router;
