import axios from 'axios';
import { logger } from '../middleware/errorHandler.js';
import Race from '../models/Race.js';
import Driver from '../models/Driver.js';
import Constructor from '../models/Constructor.js';
import { seedFromXlsx } from '../scripts/seedFromXlsx.js';
import { recalculateAllStandings } from './f1SyncService.js';
import { getIO } from '../socket/socketManager.js';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000/api/sync';

export async function syncSchedule(year = 2025) {
  try {
    const { data } = await axios.get(`${PYTHON_API}/schedule?year=${year}`);
    let count = 0;
    if (data.status === 'success' && data.schedule) {
      for (const event of data.schedule) {
        await Race.findOneAndUpdate(
          { round: event.round },
          {
            round: event.round,
            grandPrixName: event.grandPrixName,
            venue: event.venue,
            date: event.date
            // Not overwriting status and results if they exist
          },
          { upsert: true, new: true }
        );
        count++;
      }
    }
    logger.info(`Synced ${count} races from FastF1 Schedule.`);
    return count;
  } catch (error) {
    logger.error('Failed to sync schedule via Python microservice: ' + error.message);
    throw error;
  }
}

export async function fetchRichEntityInfo() {
  try {
    const drivers = await Driver.find();
    let updatedDrivers = 0;
    for (const d of drivers) {
      const { data: wikiData } = await axios.post(`${PYTHON_API}/wikipedia`, {
        query: d.fullName + " racing driver",
        type: "driver"
      });
      if (wikiData.status === 'success' && wikiData.data.description) {
        d.description = wikiData.data.description;
        await d.save();
        updatedDrivers++;
      }
    }

    const constructors = await Constructor.find();
    let updatedConstructors = 0;
    for (const c of constructors) {
      const { data: wikiData } = await axios.post(`${PYTHON_API}/wikipedia`, {
        query: c.teamName + " Formula One team",
        type: "team"
      });
      if (wikiData.status === 'success' && wikiData.data.description) {
        c.description = wikiData.data.description;
        await c.save();
        updatedConstructors++;
      }
    }
    
    logger.info(`Fetched Wiki info for ${updatedDrivers} drivers and ${updatedConstructors} constructors.`);
    return { drivers: updatedDrivers, constructors: updatedConstructors };
  } catch (error) {
    logger.error('Failed to sync Wikipedia info: ' + error.message);
    return { drivers: 0, constructors: 0 };
  }
}

export async function syncAllFromInternet(options, customXlsxPath = null) {
  logger.info('Starting external sync with options: ' + JSON.stringify(options));
  const summary = {
    scheduleUpdates: 0,
    wikiUpdates: { drivers: 0, constructors: 0 },
    seedResults: null,
    errors: []
  };

  try {
    if (options.syncSchedule) {
      summary.scheduleUpdates = await syncSchedule(2025); // You can make this dynamic if needed
    }

    if (options.fetchWikiInfo) {
      summary.wikiUpdates = await fetchRichEntityInfo();
    }

    if (options.process2026 && customXlsxPath) {
      summary.seedResults = await seedFromXlsx(customXlsxPath);
      logger.info('Processed custom 2026 Excel data.');
    }

    // Only recalculate standings dynamically if we didn't just hard-seed absolute points/ranks from the 2026 Excel file.
    if (!options.process2026) {
      await recalculateAllStandings();
    }

    const io = getIO();
    if (io) {
      io.emit('data_refreshed', { message: 'Internet Sync Complete', summary });
      io.emit('admin-broadcast', { message: 'Live data updated from the internet!', timestamp: new Date().toISOString() });
    }

    return summary;
  } catch (error) {
    logger.error('SyncAllFromInternet Error: ' + error.message);
    throw error;
  }
}
