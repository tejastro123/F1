# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Installation
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd client && npm install
```

### Running the Application
```bash
# Terminal 1 — Start backend (with hot reload)
cd server && npm run dev

# Terminal 2 — Start frontend (with hot reload)
cd client && npm run dev
```
Frontend runs at <http://localhost:5173>. Backend API runs at <http://localhost:5000>.

### Production Builds
```bash
# Build client for production
cd client && npm run build

# Preview production build locally
cd client && npm run preview

# Start server in production mode
cd server && npm start
```

### Database Operations
```bash
# Seed database from Excel file
cd server && npm run seed

# Create admin user (run in server directory)
node -e "
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import User from './models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
const hash = await bcrypt.hash('admin123', 10);
await User.create({ email: 'admin@f1tracker.com', passwordHash: hash, role: 'admin' });
console.log('Admin created!');
process.exit(0);
"
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` & `JWT_REFRESH_SECRET` — for authentication
- `PORT` — server port (default: 5000)
- `CLIENT_ORIGIN` — allowed CORS origin (default: http://localhost:5173)
- `VITE_API_URL` — frontend API URL
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `VITE_LIVEKIT_URL` — for WebRTC streaming

## Architecture Overview

### Backend (server/)

**Entry Point**: `index.js`
- Sets up Express server with middleware chain
- Configures CORS, helmet, sessions, passport
- Socket.io integration via `socket/socketManager.js`
- MongoDB connection with automatic cron job initialization

**Route Structure**: All routes under `/api/v1/` with clear separation:
- `drivers.js`, `constructors.js`, `races.js` — public F1 data
- `predictions.js`, `stats.js` — user predictions and analytics
- `auth.js` — JWT login, logout, refresh, Google OAuth
- `admin.js` — protected admin operations (upload, updates)
- `stream.js`, `live.js` — LiveKit WebRTC streaming endpoints
- `news.js`, `oracle.js` — additional features

**Models** (Mongoose):
- `Driver.js`, `Constructor.js`, `Race.js`, `Prediction.js`, `User.js`
- `LiveUpdate.js`, `News.js`, `Poll.js`

**Middleware**:
- `authMiddleware.js` — JWT verification for protected routes
- `adminAuthMiddleware.js` — admin role checking
- `rateLimiter.js` — global rate limiting (excludes auth routes)
- `errorHandler.js` — centralized error handling with Winston logging

**Services**:
- `f1SyncService.js` — cron jobs for F1 data synchronization
- `mlService.js` — machine learning predictions

**Socket**: `socket/socketManager.js` — Socket.io event handlers for real-time features

**Scripts**:
- `seedFromXlsx.js` — bulk import from `data/F1_2026_PRO.xlsx`
- `createAdmin.js` — admin user creation utility
- `updateRaceDates.js`, `updateXlsxDates.js` — data maintenance

### Frontend (client/)

**Entry Point**: `main.jsx` → renders `App.jsx`

**App.jsx Architecture**:
- Provider stack: `ThemeProvider` → `AuthProvider` → `SocketProvider` → `DataCacheProvider`
- `BrowserRouter` with lazy-loaded route segmentation
- Page-level animations using Framer Motion (`PageTransition` component)
- Global `Navbar` and `LiveBanner` components

**Routing**:
- Public pages: `/`, `/drivers`, `/drivers/:id`, `/constructors`, `/constructors/:id`, `/calendar`, `/predictions`, `/leaderboard`, `/stats`, `/live`, `/news`, `/oracle`
- Admin pages: `/admin/login`, `/admin/dashboard`, `/admin/upload`, `/admin/races`, `/admin/drivers`, `/admin/predictions`, `/admin/broadcast`, `/admin/live`
- All admin routes wrapped in `ProtectedRoute` HOC

**Contexts**:
- `AuthContext.jsx` — authentication state, login/logout, JWT management (stores access + refresh tokens in localStorage)
- `SocketContext.jsx` — Socket.io client instance
- `ThemeContext.jsx` — dark/light theme toggle (F1-themed colors)
- `DataCacheContext.jsx` — API data caching layer

**Hooks**:
- `useData.jsx` — reusable data fetching with caching
- `useCountdown.js` — race countdown timers

**Components**:
- `components/` — reusable UI: `ui.jsx` (spinner, etc.), `Live/*` (streaming features), `CircuitDetailModal.jsx`, `PredictionModal.jsx`, `ShareCard.jsx`, etc.
- `admin/` — admin panel pages (all lazy-loaded)
- `pages/` — public route page components
- `services/api.js` — Axios instance with base URL from env

**Styling**:
- TailwindCSS v3 with custom F1 team colors in `utils/teamColors.js`
- `tailwind.config.js` for theme customization
- Dark mode support via `ThemeProvider`

**Streaming**:
- Uses `livekit-client` and `@livekit/components-react` for WebRTC
- Components in `components/Live/` handle player, polls, reactions, sector feed

## Data Flow Patterns

- **API Calls**: Axios instance from `services/api.js` with interceptors for auth headers
- **Authentication**: JWT access token in Authorization header; refresh token flow via `/api/v1/auth/refresh`
- **Real-time**: Socket.io for live updates; LiveKit for video streaming
- **Admin Actions**: Excel upload via `multer` → `/api/v1/admin/upload` → `seedFromXlsx.js` logic
- **Caching**: `DataCacheContext` provides memoized fetches to reduce API calls

## Important Conventions

- API routes use RESTful patterns; all responses are JSON
- Errors are handled centrally; Winston logger on backend
- Frontend uses React 18 with lazy loading and suspense boundaries
- Environment variables: `.env` at root, loaded by both server and client (VITE_ prefix for client)
- Admin routes strictly enforce both authentication AND admin role
- Socket events are namespaced and documented in `socket/socketManager.js`

## Testing Notes

No test framework currently configured. If adding tests:
- Backend: Consider Jest or Vitest for API routes and services
- Frontend: React Testing Library with Vitest
- Integration tests should hit a real MongoDB instance (not mocks) for data accuracy

## Deployment Notes

- Backend: Deploy `server/` to Render.com or similar; start command: `node server/index.js`
- Frontend: Deploy `client/` to Vercel; set `VITE_API_URL` to backend URL
- Database: MongoDB Atlas recommended; whitelist deployment IPs
- LiveKit: Cloud or self-hosted; set `VITE_LIVEKIT_URL` and API credentials

## Environment-Specific Behaviors

- Development: Vite HMR, Node watch mode, local MongoDB
- Production: CORS restricted to `CLIENT_ORIGIN`, sessions require secure config
- `NODE_ENV=production` affects logging verbosity and cache headers
