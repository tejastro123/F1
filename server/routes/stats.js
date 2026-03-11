import { Router } from 'express';
import Driver from '../models/Driver.js';
import Race from '../models/Race.js';

const router = Router();

// GET /api/v1/stats/overview — Computed season stats
router.get('/overview', async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ points: -1 });
    const races = await Race.find();

    const leader = drivers[0] || null;
    const completedRaces = races.filter(r => r.status === 'completed');
    const upcomingRaces = races.filter(r => r.status === 'upcoming');
    const totalPointsDistributed = drivers.reduce((sum, d) => sum + d.points, 0);

    res.json({
      leaderName: leader ? leader.fullName : 'N/A',
      leaderPoints: leader ? leader.points : 0,
      leaderTeam: leader ? leader.team : 'N/A',
      racesDone: completedRaces.length,
      racesRemaining: upcomingRaces.length,
      totalRaces: races.length,
      totalPointsDistributed,
      totalDrivers: drivers.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
