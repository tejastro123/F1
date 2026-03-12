import axios from 'axios';
import cron from 'node-cron';
import Race from '../models/Race.js';
import Driver from '../models/Driver.js';
import Prediction from '../models/Prediction.js';
import { getIo } from '../socket/socketManager.js';
import { logger } from '../middleware/errorHandler.js';

// Ergast API Base URL (or OpenF1 if preferred)
const ERGAST_API = 'http://ergast.com/api/f1/current';

/**
 * Score pending predictions for a completed race
 */
async function scorePredictions(raceRound, results) {
  try {
    const predictions = await Prediction.find({ round: raceRound, isCorrect: null });
    
    // Extrack P1-P3 from the results array (results is sorted by finishing position 1, 2, 3...)
    const p1FullName = `${results[0].Driver.givenName} ${results[0].Driver.familyName}`;
    // We strictly score the 'P1 (Winner)' category from the PredictionModal here
    
    let scoredCount = 0;
    for (const pred of predictions) {
      if (pred.category === 'P1 (Winner)') {
        // Did they guess the P1 winner correctly?
        const isCorrect = pred.prediction.toLowerCase() === p1FullName.toLowerCase();
        
        pred.actualResult = p1FullName;
        pred.isCorrect = isCorrect;
        await pred.save();
        scoredCount++;
      }
    }
    
    logger.info(`Scored ${scoredCount} predictions for Round ${raceRound}`);
  } catch (error) {
    logger.error(`Error scoring predictions for Round ${raceRound}: ${error.message}`);
  }
}

/**
 * Fetch the latest race results from Ergast and update the local DB
 */
export async function syncLatestRaceResults() {
  try {
    logger.info('Starting F1 API sync...');
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
        
        // Score the predictions now that the race is officially over
        await scorePredictions(round, results);
        updatedCount++;
      }
    }

    // Sync Driver Standings if any races were updated
    if (updatedCount > 0) {
      await syncDriverStandings();
      
      // Notify all connected clients via Socket.io that data has refreshed!
      const io = getIo();
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
