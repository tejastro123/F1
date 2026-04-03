import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Constructor from '../models/Constructor.js';
import Race from '../models/Race.js';

const router = express.Router();

// Get user's favorites
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites.drivers', 'fullName driverNumber team photoUrl')
      .populate('favorites.constructors', 'name logoUrl')
      .populate('favorites.races', 'grandPrixName round date venue flag');

    res.json({
      drivers: user.favorites.drivers || [],
      constructors: user.favorites.constructors || [],
      races: user.favorites.races || [],
    });
  } catch (err) {
    next(err);
  }
});

// Add a favorite
router.post('/:type/:id', authMiddleware, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const validTypes = ['drivers', 'constructors', 'races'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid favorite type' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Verify the referenced item exists
    let Model;
    switch (type) {
      case 'drivers':
        Model = Driver;
        break;
      case 'constructors':
        Model = Constructor;
        break;
      case 'races':
        Model = Race;
        break;
    }

    const exists = await Model.findById(id);
    if (!exists) {
      return res.status(404).json({ error: `${type.slice(0, -1)} not found` });
    }

    const user = await User.findById(req.user.id);
    if (!user.favorites[type].includes(id)) {
      user.favorites[type].push(id);
      await user.save();
    }

    res.json({ message: `Added to favorites`, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
});

// Remove a favorite
router.delete('/:type/:id', authMiddleware, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const validTypes = ['drivers', 'constructors', 'races'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid favorite type' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const user = await User.findById(req.user.id);
    user.favorites[type] = user.favorites[type].filter(
      favId => favId.toString() !== id
    );
    await user.save();

    res.json({ message: `Removed from favorites`, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
});

// Check if an item is favorited
router.get('/:type/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const validTypes = ['drivers', 'constructors', 'races'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid favorite type' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const user = await User.findById(req.user.id);
    const isFavorited = user.favorites[type].includes(id);

    res.json({ isFavorited });
  } catch (err) {
    next(err);
  }
});

export default router;
