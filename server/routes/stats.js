import { Router } from 'express';
import Driver from '../models/Driver.js';
import Race from '../models/Race.js';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';
const router = Router();

// GET /api/v1/stats/overview — Computed season stats
router.get('/overview', async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ rank: 1 });
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

// GET /api/v1/stats/leaderboard — Public Prediction Leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaderboard = await Prediction.aggregate([
      // 1. Group by User ID and calculate stats
      {
        $group: {
          _id: '$user',
          totalPredictions: { $sum: 1 },
          correct: {
            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
          },
          wrong: {
            $sum: { $cond: [{ $eq: ['$isCorrect', false] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$isCorrect', null] }, 1, 0] }
          },
          // Weighted scoring
          totalPoints: {
            $sum: {
              $cond: [
                { $eq: ['$isCorrect', true] },
                {
                  $switch: {
                    branches: [
                      { case: { $in: ['$category', ['CRAZY_CALL', 'P_WHAT', 'GOOD_SURPRISE', 'BIG_FLOP']] }, then: 10 },
                      { case: { $in: ['$category', ['GP_POLE', 'SPRINT_WIN', 'SPRINT_POLE']] }, then: 5 },
                      { case: { $in: ['$category', ['GP_WINNER', 'PODIUM_P1', 'PODIUM_P2', 'PODIUM_P3']] }, then: 3 }
                    ],
                    default: 1
                  }
                },
                0
              ]
            }
          }
        }
      },
      // 2. Calculate accuracy percentage
      {
        $addFields: {
          accuracyScore: {
            $cond: [
              { $gt: ['$totalPredictions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$correct', '$totalPredictions'] }, 100] }, 0] },
              0
            ]
          }
        }
      },
      // 3. Join with Users collection to get profile info
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      // 4. Flatten the array created by $lookup
      {
        $unwind: '$userInfo'
      },
      // 5. Structure the final output
      {
        $project: {
          _id: 0,
          userId: '$_id',
          displayName: '$userInfo.displayName',
          avatarUrl: '$userInfo.avatarUrl',
          totalPredictions: 1,
          correct: 1,
          wrong: 1,
          pending: 1,
          accuracyScore: 1,
          totalPoints: 1
        }
      },
      // 6. Sort by Points, then by Accuracy
      {
        $sort: { totalPoints: -1, accuracyScore: -1 }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;
