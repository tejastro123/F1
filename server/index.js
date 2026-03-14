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

import MongoStore from 'connect-mongo';

const app = express();
app.set('trust proxy', 1);

// We need two separate server instances if they listen on different ports
const apiServer = createServer(app);
const wsApp = express(); // Minimal express app for WS if needed, or just a raw server
const wsServer = createServer(wsApp);

// Socket.io - Bound to the dedicated WS server (Port 5001)
const io = new Server(wsServer, {
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

// Production-ready session storage with connect-mongo
app.use(
  session({
    secret: process.env.JWT_SECRET || 'f1backupsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ... (routes remain the same)
app.use('/api/v1/auth', authRouter);
app.use(rateLimiter);
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/constructors', constructorsRouter);
app.use('/api/v1/races', racesRouter);
app.use('/api/v1/predictions', predictionsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/stream', streamRouter);
app.use('/api/v1/live', liveRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('🏎  Connected to MongoDB');
    // Start background F1 Data workers
    initCronJobs();
    
    // Attach Socket.io to main API server for production connectivity (resolvers 404)
    io.attach(apiServer);

    // API Server on Port 5000
    apiServer.listen(PORT, () => {
      logger.info(`🏁 F1 2026 API running on port ${PORT}`);
    });

    // WebSocket Hub on Port 5001 (Section 3.1 compliance)
    wsServer.listen(WS_PORT, () => {
      logger.info(`📡 WebSocket Hub running on port ${WS_PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Server initialization failed:', err.message);
    process.exit(1);
  });

export default app;
