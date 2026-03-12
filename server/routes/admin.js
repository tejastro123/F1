import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import { seedFromXlsx } from '../scripts/seedFromXlsx.js';
import Driver from '../models/Driver.js';
import Race from '../models/Race.js';
import Prediction from '../models/Prediction.js';
import { broadcast } from '../socket/socketManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// All admin routes require admin privileges
router.use(adminAuthMiddleware);

// Configure multer for xlsx upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'F1_2026_PRO.xlsx');
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/v1/admin/upload — Upload Excel and re-seed
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const results = await seedFromXlsx(req.file.path);
    broadcast('data-updated', { message: 'Data has been updated', results });
    res.json({ message: 'Seed complete', results });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/races/:id — Update a race result
router.patch('/races/:id', async (req, res, next) => {
  try {
    const { p1Winner, p2, p3, sprintWinner, status } = req.body;
    const update = {};
    if (p1Winner !== undefined) update.p1Winner = p1Winner;
    if (p2 !== undefined) update.p2 = p2;
    if (p3 !== undefined) update.p3 = p3;
    if (sprintWinner !== undefined) update.sprintWinner = sprintWinner;
    if (status !== undefined) update.status = status;

    const race = await Race.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!race) return res.status(404).json({ error: 'Race not found' });

    broadcast('race-updated', race);
    res.json(race);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/drivers/:id — Update driver stats
router.patch('/drivers/:id', async (req, res, next) => {
  try {
    const { points, wins, podiums } = req.body;
    const update = {};
    if (points !== undefined) update.points = points;
    if (wins !== undefined) update.wins = wins;
    if (podiums !== undefined) update.podiums = podiums;

    const driver = await Driver.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    broadcast('driver-updated', driver);
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/predictions — Fetch all predictions across all users
router.get('/predictions', async (req, res, next) => {
  try {
    const predictions = await Prediction.find()
      .populate('user', 'displayName email avatarUrl')
      .sort({ round: -1, createdAt: -1 });
    res.json(predictions);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/download — Download the current Excel file
router.get('/download', (req, res, next) => {
  try {
    const filePath = path.resolve(__dirname, '../../data/F1_2026_PRO.xlsx');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Excel file not found.' });
    }
    res.download(filePath, 'F1_2026_PRO.xlsx');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/admin/broadcast — Send Socket.io broadcast
router.post('/broadcast', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required.' });

  broadcast('admin-broadcast', {
    message,
    timestamp: new Date().toISOString(),
  });

  res.json({ message: 'Broadcast sent', broadcastMessage: message });
});

export default router;
