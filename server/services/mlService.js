import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Spawns the Python ML engine to generate predictions.
 */
export async function getNextRacePrediction() {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // Assumes python is in PATH
    const scriptPath = path.join(__dirname, '../scripts/oracle_ml.py');

    const process = spawn(pythonPath, [scriptPath]);
    
    let resultData = '';
    let errorData = '';

    process.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Python ML Process Failed: ${errorData}`);
        return reject(new Error('Machine Intelligence Offline: Computation Error'));
      }

      try {
        const prediction = JSON.parse(resultData);
        if (prediction.error) {
          return reject(new Error(prediction.error));
        }
        resolve(prediction);
      } catch (e) {
        logger.error(`Failed to parse ML output: ${e.message}`);
        reject(new Error('Data Corruption: Signal Fragmented'));
      }
    });
  });
}
