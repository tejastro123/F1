import { Router } from 'express';
import Poll from '../models/Poll.js';
import LiveUpdate from '../models/LiveUpdate.js';
import { broadcast } from '../socket/socketManager.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// --- POLLS ---

// POST /api/v1/live/polls — Create a poll (Admin only)
router.post('/polls', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const poll = await Poll.create(req.body);
    broadcast('poll-created', poll);
    res.status(201).json(poll);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/live/polls/active — Get current active poll
router.get('/polls/active', async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(poll);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/live/polls/:id/vote — Vote in a poll
router.post('/polls/:id/vote', async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll || !poll.isActive) return res.status(404).json({ error: 'Poll not found or inactive' });
    
    poll.options[optionIndex].votes += 1;
    await poll.save();
    
    broadcast('poll-updated', poll);
    res.json(poll);
  } catch (error) {
    next(error);
  }
});

// --- SECTOR FEED ---

// POST /api/v1/live/updates — Create a live update (Admin only)
router.post('/updates', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const update = await LiveUpdate.create(req.body);
    broadcast('live-update', update);
    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/live/updates — Get recent updates
router.get('/updates', async (req, res, next) => {
  try {
    const updates = await LiveUpdate.find().sort({ timestamp: -1 }).limit(50);
    res.json(updates);
  } catch (error) {
    next(error);
  }
});

// --- TRACK CONDITIONS ---

// POST /api/v1/live/track-condition — Update track conditions (Admin only)
router.post('/track-condition', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  broadcast('track-update', req.body);
  res.json({ success: true, data: req.body });
});

export default router;
