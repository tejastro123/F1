import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Spawns the Python ML engine to generate predictions.
 * Tries 'python3' first (standard for Render/Linux) then fallbacks to 'python'.
 */
export async function getNextRacePrediction() {
  const scriptPath = path.join(__dirname, '../scripts/oracle_ml.py');
  
  const runPython = (cmd) => {
    return new Promise((resolve, reject) => {
      const process = spawn(cmd, [scriptPath]);
      let resultData = '';
      let errorData = '';

      process.stdout.on('data', (data) => { resultData += data.toString(); });
      process.stderr.on('data', (data) => { errorData += data.toString(); });

      process.on('close', (code) => {
        if (code !== 0) {
          return reject({ code, errorData });
        }
        try {
          const prediction = JSON.parse(resultData);
          resolve(prediction);
        } catch (e) {
          reject({ code: -1, errorData: 'JSON_PARSE_ERROR', detail: resultData });
        }
      });

      process.on('error', (err) => {
        reject({ code: -2, errorData: err.message });
      });
    });
  };

  try {
    // Try python3 first (Render/Linux standard)
    return await runPython('python3');
  } catch (err3) {
    if (err3.code === -2 || err3.code === 127) { // Command not found
      try {
        // Fallback to python (Windows/Some Linux)
        return await runPython('python');
      } catch (err) {
        logger.error(`Oracle ML Final Failure: ${err.errorData || 'Unknown Error'}`);
        throw new Error('Machine Intelligence Offline: Engine Not Found');
      }
    }
    logger.error(`Oracle ML Logic Failure: ${err3.errorData || 'Unknown Error'}`);
    throw new Error('Machine Intelligence Offline: Computation Error');
  }
}
