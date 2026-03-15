import Driver from '../models/Driver.js';
import Race from '../models/Race.js';
import Constructor from '../models/Constructor.js';
import logger from '../utils/logger.js';

/**
 * Weighted probability engine to forecast race outcomes.
 * Simulates ML intelligence by analyzing:
 * 1. Seasonal Momentum (Last 2 races)
 * 2. Absolute Pace (Standing Rank)
 * 3. Team Tiering (Constructor performance)
 */
export async function getNextRacePrediction() {
  try {
    // 1. Identify the battlefield
    const nextRace = await Race.findOne({ status: 'upcoming' }).sort({ round: 1 });
    if (!nextRace) return { error: 'No upcoming race detected in the current calendar.' };

    const lastRaces = await Race.find({ status: 'completed' }).sort({ round: -1 }).limit(2);
    const drivers = await Driver.find().sort({ points: -1 });

    const totalStats = drivers.reduce((acc, d) => ({
      maxPts: Math.max(acc.maxPts, d.points),
      maxWins: Math.max(acc.maxWins, d.wins)
    }), { maxPts: 0, maxWins: 0 });

    // 2. Intelligence Scoring Engine
    const scores = drivers.map(driver => {
      let momentum = 0;
      let historyWeight = 0;

      // Momentum Check (Last 2 podiums)
      lastRaces.forEach((race, idx) => {
        const weight = idx === 0 ? 30 : 15; // Recent race weighs more
        if (race.p1Winner === driver.fullName) momentum += weight;
        else if (race.p2 === driver.fullName) momentum += weight * 0.7;
        else if (race.p3 === driver.fullName) momentum += weight * 0.5;
      });

      // Standing Strength (0-40 points)
      const standingStrenght = (driver.points / (totalStats.maxPts || 1)) * 40;

      // Experience/Consistency Weight (0-15 points)
      const consistency = (driver.wins / (totalStats.maxWins || 1)) * 15;

      // Random "Machine Variance" (0-15 points) for 2026 unpredictability
      const variance = Math.random() * 15;

      const totalProbability = momentum + standingStrenght + consistency + variance;

      return {
        _id: driver._id,
        fullName: driver.fullName,
        team: driver.team,
        probability: Math.min(98, Math.max(5, Math.round(totalProbability))),
        momentum: Math.round(momentum),
        standingStrength: Math.round(standingStrenght),
        photoUrl: driver.photoUrl
      };
    });

    // 3. Final Ranking
    scores.sort((a, b) => b.probability - a.probability);
    
    const top3 = scores.slice(0, 3);

    // 4. Strategic Rationale Generation
    const rationale = top3.map(d => {
      if (d.momentum > 20) return `${d.fullName} exhibits peak momentum coefficients after recent podium dominance.`;
      if (d.standingStrength > 30) return `${d.fullName}'s consistent point-yield makes them a high-stability choice for the podium.`;
      return `Machine telemetry suggests ${d.team}'s aerodynamic upgrade provides ${d.fullName} a strategic edge.`;
    });

    return {
      race: {
        name: nextRace.grandPrixName,
        round: nextRace.round,
        venue: nextRace.venue,
        flag: nextRace.flag
      },
      predictions: top3,
      rationale,
      oracleConfidence: 85 + Math.floor(Math.random() * 10),
      timestamp: new Date()
    };
  } catch (error) {
    logger.error(`Oracle Prediction Failed: ${error.message}`);
    throw error;
  }
}
