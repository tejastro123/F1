import axios from 'axios';
import cron from 'node-cron';
import Race from '../models/Race.js';
import Driver from '../models/Driver.js';
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
    logger.info('Starting F1 API sync...');
    
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

    // Sync Driver Standings if any races were updated
    if (updatedCount > 0) {
      await syncDriverStandings();
      
      const io = getIO();
      if (io) {
        io.emit('data_refreshed', { message: 'Live data synced from F1 API' });
      }
      logger.info(`F1 Sync complete. ${updatedCount} new races ingested.`);
    } else {
      logger.info('F1 Sync complete. No new race data to process.');
    }

  } catch (error) {
    logger.error(`F1 API Sync Failed: ${error.message}`);
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
        { fullName },     // Assuming name matches exactly. A robust system uses driverIds.
        { points, wins, rank },
        { new: true }
      );
    }
  } catch (error) {
    logger.error(`Standings Sync Failed: ${error.message}`);
  }
}

/**
 * Initialize the cron jobs
 */
export function initCronJobs() {
  // Run every hour on weekends (Saturday & Sunday) during the F1 season
  // Minute 0, Hour *, Day of Month *, Month *, Day of Week 0,6
  cron.schedule('0 * * * 0,6', () => {
    logger.info('Running scheduled F1 data sync (Weekend Webhook)...');
    syncLatestRaceResults();
  });
  
  logger.info('⏰ F1 Sync Webhook cron jobs initialized.');
}
