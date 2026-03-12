import express from 'express';
import { getToken } from '../controllers/streamController.js';

const router = express.Router();

router.post('/token', getToken);

export default router;
