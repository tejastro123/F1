# 🏎 F1 2026 Season Tracker

A production-grade, full-stack Formula 1 2026 Season Tracker built on the **MERN stack**.

![F1 2026](https://img.shields.io/badge/F1-2026-E10600?style=for-the-badge&logo=f1&logoColor=white)

![MERN](https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge)

## ✨ Features

- **Driver & Constructor Standings** — Live championship tables with animated points bars
- **Race Calendar** — 24-race grid with podium results and countdown timers
- **Prediction Tracker** — Track your pre-race predictions with accuracy scoring
- **Stats & Analytics** — Points gap charts, wins distribution, team radar comparisons
- **Live Feed** — Real-time Socket.io broadcast updates from the admin panel
- **Admin Panel** — JWT-protected dashboard for managing all data
- **Excel Upload** — Drag-and-drop `.xlsx` import with full database re-seeding
- **Dark/Light Theme** — Toggle between F1 dark mode and light mode
- **Fully Responsive** — Mobile (375px), Tablet (768px), Desktop (1440px)

## 🛠 Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 18, Vite, TailwindCSS v3, Framer Motion, Recharts |
| Backend  | Node.js 20+, Express.js, Mongoose, Socket.io            |
| Database | MongoDB (Atlas or local)                                |
| Auth     | JWT (access + refresh tokens), bcryptjs                 |
| Data     | xlsx package for Excel parsing                          |

## 📁 Project Structure

```bash
f1-tracker-2026/
├── client/                    ← Vite + React frontend
│   ├── src/
│   │   ├── components/        ← Reusable UI components
│   │   ├── pages/             ← Public route pages
│   │   ├── admin/             ← Admin panel pages
│   │   ├── context/           ← AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/             ← Custom data hooks
│   │   ├── services/          ← Axios API instance
│   │   ├── utils/             ← Team colors, date formatting
│   │   └── App.jsx            ← Router + providers
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                    ← Express + MongoDB backend
│   ├── models/                ← Mongoose schemas
│   ├── routes/                ← API route handlers
│   ├── middleware/             ← Auth, rate limit, error handler
│   ├── scripts/               ← Excel seed script
│   ├── socket/                ← Socket.io manager
│   └── index.js               ← Server entry point
├── data/
│   └── F1_2026_PRO.xlsx       ← Source data file
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values:
# MONGODB_URI=mongodb://localhost:27017/f1tracker2026
# JWT_SECRET=your_secret_here
# JWT_REFRESH_SECRET=your_refresh_secret_here
# PORT=5000
# CLIENT_ORIGIN=http://localhost:5173
# ADMIN_SEED_KEY=your_admin_key_here
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

### 4. Run the Application

```bash
# Terminal 1 — Start the backend
cd server && npm run dev

# Terminal 2 — Start the frontend
cd client && npm run dev
```

Visit **<http://localhost:5173>** 🏁

### 5. Create an Admin User

```bash
# Using Node.js REPL or a script:
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

Then login at **/admin/login** with:

- Email: `admin@f1tracker.com`
- Password: `admin123`

## 📡 API Endpoints

### Public

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/api/v1/drivers`               | All drivers (sorted by points) |
| GET    | `/api/v1/drivers/:id`           | Single driver                  |
| GET    | `/api/v1/constructors`          | All constructors               |
| GET    | `/api/v1/races`                 | Full race calendar             |
| GET    | `/api/v1/races/latest`          | Most recent completed race     |
| GET    | `/api/v1/races/next`            | Next upcoming race             |
| GET    | `/api/v1/predictions`           | Predictions (?round=N)         |
| GET    | `/api/v1/stats/overview`        | Season statistics              |

### Admin (JWT Required)

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/v1/auth/login`            | Login               |
| POST   | `/api/v1/admin/upload`          | Upload Excel file   |
| PATCH  | `/api/v1/admin/races/:id`       | Update race result  |
| PATCH  | `/api/v1/admin/drivers/:id`     | Update driver stats |
| PATCH  | `/api/v1/admin/predictions/:id` | Mark prediction     |
| POST   | `/api/v1/admin/broadcast`       | Send live broadcast |

## 🌐 Deployment

### Backend → Render.com

1. Push `server/` to GitHub
2. Create a Web Service on Render
3. Set start command: `node server/index.js`
4. Add all `.env` variables

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import in Vercel (framework: Vite)
3. Set `VITE_API_URL` to your Render URL

### Database → MongoDB Atlas

1. Create a free M0 cluster
2. Whitelist Render IP (or 0.0.0.0/0)
3. Copy connection string to `MONGODB_URI`

---

Built for F1 fans, by F1 fans. 🏁
