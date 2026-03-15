import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import errorHandler, { logger } from './middleware/errorHandler.js';
import { initSocket } from './socket/socketManager.js';
import { initCronJobs } from './services/f1SyncService.js';

// Route imports
import driversRouter from './routes/drivers.js';
import constructorsRouter from './routes/constructors.js';
import racesRouter from './routes/races.js';
import predictionsRouter from './routes/predictions.js';
import statsRouter from './routes/stats.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import streamRouter from './routes/stream.js';
import liveRouter from './routes/live.js';
import newsRouter from './routes/news.js';
import oracleRouter from './routes/oracle.js';

const app = express();
app.set('trust proxy', 1); // Enable proxy support for Render/Vercel
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initSocket(io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Sessions are required by passport-google-oauth20
app.use(
  session({
    secret: process.env.JWT_SECRET || 'f1backupsecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Auth routes mounted BEFORE global rate limiter (refresh/logout/google need to be exempt)
app.use('/api/v1/auth', authRouter);

// Global rate limiter (applies to all routes below)
app.use(rateLimiter);

// API Routes
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/constructors', constructorsRouter);
app.use('/api/v1/races', racesRouter);
app.use('/api/v1/predictions', predictionsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/stream', streamRouter);
app.use('/api/v1/live', liveRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/oracle', oracleRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB & start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('🏎  Connected to MongoDB');
    
    // Start background F1 Data workers
    initCronJobs();
    
    httpServer.listen(PORT, () => {
      logger.info(`🏁 F1 2026 API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

export default app;
