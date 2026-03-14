import axios from 'axios';
import cron from 'node-cron';
import Race from '../models/Race.js';
import Driver from '../models/Driver.js';
import Constructor from '../models/Constructor.js';
import Prediction from '../models/Prediction.js';
import { getIO } from '../socket/socketManager.js';
import { logger } from '../middleware/errorHandler.js';

// Ergast API Base URL (or OpenF1 if preferred)
const ERGAST_API = 'http://ergast.com/api/f1/current';

/**
 * Score pending predictions for a completed session (Quali, Sprint, or Race)
 */
async function scorePredictions(raceRound, results, sessionType = 'race') {
  try {
    const predictions = await Prediction.find({ round: raceRound, isCorrect: null });
    if (predictions.length === 0) return;

    // Helper to get full name
    const getName = (driver) => `${driver.givenName} ${driver.familyName}`;

    let scoredCount = 0;
    for (const pred of predictions) {
      const { category, prediction } = pred;
      let actual = 'TBD';
      let isCorrect = false;
      let shouldScore = false;

      switch (category) {
        case 'GP_WINNER':
        case 'PODIUM_P1':
          if (sessionType === 'race') {
            actual = getName(results[0].Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'PODIUM_P2':
          if (sessionType === 'race' && results.length >= 2) {
            actual = getName(results[1].Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'PODIUM_P3':
          if (sessionType === 'race' && results.length >= 3) {
            actual = getName(results[2].Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'GP_POLE':
          if (sessionType === 'qualifying') {
            actual = getName(results[0].Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'SPRINT_WIN':
          if (sessionType === 'sprint') {
            actual = getName(results[0].Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'SPRINT_POLE':
          if (sessionType === 'sprint_qualifying') {
            actual = getName(results[0].Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'GOOD_SURPRISE':
          if (sessionType === 'race') {
            // Find driver who gained most positions
            const gainer = results.reduce((prev, curr) => {
              const prevGain = parseInt(prev.grid) - parseInt(prev.position);
              const currGain = parseInt(curr.grid) - parseInt(curr.position);
              return currGain > prevGain ? curr : prev;
            });
            actual = getName(gainer.Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'BIG_FLOP':
          if (sessionType === 'race') {
            // Find driver who lost most positions
            const loser = results.reduce((prev, curr) => {
              const prevLoss = parseInt(prev.position) - parseInt(prev.grid);
              const currLoss = parseInt(curr.position) - parseInt(curr.grid);
              return currLoss > prevLoss ? curr : prev;
            });
            actual = getName(loser.Driver);
            isCorrect = prediction.toLowerCase() === actual.toLowerCase();
            shouldScore = true;
          }
          break;
        case 'P_WHAT':
          if (sessionType === 'race') {
            // Check if predicted driver finished P11-P20
            const driverResult = results.find(r => getName(r.Driver).toLowerCase() === prediction.toLowerCase());
            if (driverResult) {
              const pos = parseInt(driverResult.position);
              actual = `P${pos}`;
              isCorrect = pos >= 11 && pos <= 20;
              shouldScore = true;
            }
          }
          break;
        case 'CRAZY_CALL':
          if (sessionType === 'race') {
            // Logic: Predicted driver wins but started P10+
            const winner = results[0];
            actual = getName(winner.Driver);
            const startedP10Plus = parseInt(winner.grid) >= 10;
            isCorrect = (prediction.toLowerCase() === actual.toLowerCase()) && startedP10Plus;
            shouldScore = true;
          }
          break;
      }

      if (shouldScore) {
        pred.actualResult = actual;
        pred.isCorrect = isCorrect;
        await pred.save();
        scoredCount++;
      }
    }
    
    if (scoredCount > 0) {
      logger.info(`Scored ${scoredCount} predictions for Round ${raceRound} (${sessionType})`);
    }
  } catch (error) {
    logger.error(`Error scoring predictions for Round ${raceRound}: ${error.message}`);
  }
}

/**
 * Fetch Qualifying results
 */
export async function syncQualifyingResults() {
  try {
    const { data } = await axios.get(`${ERGAST_API}/qualifying.json?limit=1000`);
    const races = data.MRData.RaceTable.Races;
    for (const race of races) {
      if (race.QualifyingResults) {
        await scorePredictions(parseInt(race.round), race.QualifyingResults, 'qualifying');
      }
    }
  } catch (error) {
    logger.error(`Qualifying Sync Failed: ${error.message}`);
  }
}

/**
 * Fetch Sprint results
 */
export async function syncSprintResults() {
  try {
    const { data } = await axios.get(`${ERGAST_API}/sprint.json?limit=1000`);
    const races = data.MRData.RaceTable.Races;
    for (const race of races) {
      if (race.SprintResults) {
        await scorePredictions(parseInt(race.round), race.SprintResults, 'sprint');
      }
    }
  } catch (error) {
    logger.error(`Sprint Sync Failed: ${error.message}`);
  }
}

/**
 * Fetch the latest race results from Ergast and update the local DB
 */
export async function syncLatestRaceResults() {
  try {
    logger.info('Starting F1 results sync...');
    
    // Sync Quali and Sprint first
    await syncQualifyingResults();
    await syncSprintResults();

    const { data } = await axios.get(`${ERGAST_API}/results.json?limit=1000`);
    
    const racesData = data.MRData.RaceTable.Races;
    if (!racesData || racesData.length === 0) {
      logger.info('No completed races found in the API yet.');
      return;
    }

    let updatedCount = 0;

    for (const raceData of racesData) {
      const round = parseInt(raceData.round);
      const results = raceData.Results;
      
      if (!results || results.length < 3) continue;

      // Update the Race document
      const raceDoc = await Race.findOne({ round });
      if (raceDoc && raceDoc.status !== 'completed') {
        raceDoc.status = 'completed';
        raceDoc.p1Winner = `${results[0].Driver.givenName} ${results[0].Driver.familyName}`;
        raceDoc.p2 = `${results[1].Driver.givenName} ${results[1].Driver.familyName}`;
        raceDoc.p3 = `${results[2].Driver.givenName} ${results[2].Driver.familyName}`;
        await raceDoc.save();
        
        // Score the predictions
        await scorePredictions(round, results, 'race');
        updatedCount++;
      }
    }

    // Sync Standings if any races were updated
    if (updatedCount > 0) {
      await syncDriverStandings();
      await syncConstructorStandings();
      
      notifyClients('Live results synced from F1 API');
      logger.info(`F1 Results sync complete. ${updatedCount} races updated.`);
    } else {
      logger.info('F1 Results sync complete. No new data.');
    }

  } catch (error) {
    logger.error(`F1 Results Sync Failed: ${error.message}`);
  }
}

/**
 * Fetch championship standings and update Driver points in DB
 */
export async function syncDriverStandings() {
  try {
    const { data } = await axios.get(`${ERGAST_API}/driverStandings.json`);
    const standingsList = data.MRData.StandingsTable.StandingsLists[0];
    
    if (!standingsList || !standingsList.DriverStandings) return;

    for (const st of standingsList.DriverStandings) {
      const fullName = `${st.Driver.givenName} ${st.Driver.familyName}`;
      const points = parseFloat(st.points);
      const wins = parseInt(st.wins);
      const rank = parseInt(st.position);

      await Driver.findOneAndUpdate(
        { fullName },
        { points, wins, rank },
        { new: true }
      );
    }
    logger.info('Driver standings synced.');
  } catch (error) {
    logger.error(`Driver Standings Sync Failed: ${error.message}`);
  }
}

/**
 * Fetch constructor standings and update in DB
 */
export async function syncConstructorStandings() {
  try {
    const { data } = await axios.get(`${ERGAST_API}/constructorStandings.json`);
    const standingsList = data.MRData.StandingsTable.StandingsLists[0];
    
    if (!standingsList || !standingsList.ConstructorStandings) return;

    for (const st of standingsList.ConstructorStandings) {
      const teamName = st.Constructor.name;
      const points = parseFloat(st.points);
      const wins = parseInt(st.wins);
      const rank = parseInt(st.position);

      await Constructor.findOneAndUpdate(
        { teamName },
        { points, wins, rank },
        { new: true }
      );
    }
    logger.info('Constructor standings synced.');
  } catch (error) {
    logger.error(`Constructor Standings Sync Failed: ${error.message}`);
  }
}

/**
 * Fetch the full season schedule and update Race documents
 */
export async function syncRaceSchedule() {
  try {
    logger.info('Syncing F1 season schedule...');
    const { data } = await axios.get(`${ERGAST_API}.json`);
    const races = data.MRData.RaceTable.Races;

    if (!races) return;

    for (const raceData of races) {
      const round = parseInt(raceData.round);
      const updateData = {
        grandPrixName: raceData.raceName,
        venue: raceData.Circuit.circuitName,
        date: raceData.date,
        sessions: {
          race: raceData.time ? `${raceData.date}T${raceData.time}` : `${raceData.date}T15:00:00Z`
        }
      };

      // Add other session times if available (Ergast sometimes provides them)
      if (raceData.FirstPractice) updateData.sessions.fp1 = `${raceData.FirstPractice.date}T${raceData.FirstPractice.time}`;
      if (raceData.SecondPractice) updateData.sessions.fp2 = `${raceData.SecondPractice.date}T${raceData.SecondPractice.time}`;
      if (raceData.ThirdPractice) updateData.sessions.fp3 = `${raceData.ThirdPractice.date}T${raceData.ThirdPractice.time}`;
      if (raceData.Qualifying) updateData.sessions.qualifying = `${raceData.Qualifying.date}T${raceData.Qualifying.time}`;
      if (raceData.Sprint) updateData.sessions.sprintRace = `${raceData.Sprint.date}T${raceData.Sprint.time}`;

      await Race.findOneAndUpdate(
        { round },
        updateData,
        { upsert: true, new: true }
      );
    }
    
    notifyClients('Race schedule updated');
    logger.info('F1 Schedule sync complete.');
  } catch (error) {
    logger.error(`F1 Schedule Sync Failed: ${error.message}`);
  }
}

/**
 * Utility to emit socket event
 */
function notifyClients(message) {
  const io = getIO();
  if (io) {
    io.emit('data_refreshed', { message });
  }
}

/**
 * Initialize the cron jobs
 */
export function initCronJobs() {
  // 1. Daily Sync (Standings & Schedule) - Runs at midnight
  cron.schedule('0 0 * * *', () => {
    logger.info('Starting daily F1 metadata sync...');
    syncRaceSchedule();
    syncDriverStandings();
    syncConstructorStandings();
  });

  // 2. Weekend Results Sync - Every hour on Saturday & Sunday
  cron.schedule('0 * * * 0,6', () => {
    logger.info('Running weekend results sync...');
    syncLatestRaceResults();
  });

  // 3. Post-Race Intensive Sync - Every 10 mins on Sunday afternoons (13:00 to 18:00)
  // This helps catch live result updates quickly after a GP ends.
  cron.schedule('*/10 13-18 * * 0', () => {
    logger.info('Running intensive post-race results check...');
    syncLatestRaceResults();
  });
  
  // Initial sync on startup to ensure data is fresh
  syncRaceSchedule();
  syncDriverStandings();
  syncConstructorStandings();
  syncLatestRaceResults();

  logger.info('⏰ F1 Sync Webhook cron jobs initialized.');
}
