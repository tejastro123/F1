import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { syncRaceSchedule, syncDriverStandings, syncConstructorStandings, syncLatestRaceResults } from '../services/f1SyncService.js';
import { logger } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for testing...');

    logger.info('Testing syncRaceSchedule...');
    await syncRaceSchedule();

    logger.info('Testing syncDriverStandings...');
    await syncDriverStandings();

    logger.info('Testing syncConstructorStandings...');
    await syncConstructorStandings();

    logger.info('Testing syncLatestRaceResults...');
    await syncLatestRaceResults();

    logger.info('Test sync complete.');
    process.exit(0);
  } catch (err) {
    logger.error('Test sync failed:', err.message);
    process.exit(1);
  }
};

runTest();
