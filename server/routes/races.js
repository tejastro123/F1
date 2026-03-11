import { Router } from 'express';
import Race from '../models/Race.js';

const router = Router();

// GET /api/v1/races — Full 24-race calendar
router.get('/', async (req, res, next) => {
  try {
    const races = await Race.find().sort({ round: 1 });
    res.json(races);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/races/latest — Most recently completed race
router.get('/latest', async (req, res, next) => {
  try {
    const race = await Race.findOne({ status: 'completed' }).sort({ round: -1 });
    if (!race) {
      return res.status(404).json({ error: 'No completed races found' });
    }
    res.json(race);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/races/next — Next upcoming race
router.get('/next', async (req, res, next) => {
  try {
    const race = await Race.findOne({ status: 'upcoming' }).sort({ round: 1 });
    if (!race) {
      return res.status(404).json({ error: 'No upcoming races found' });
    }
    res.json(race);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/races/:id — Single race by ID
router.get('/:id', async (req, res, next) => {
  try {
    const race = await Race.findById(req.params.id);
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    res.json(race);
  } catch (error) {
    next(error);
  }
});

export default router;
