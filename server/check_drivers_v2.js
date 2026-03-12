import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Driver from './models/Driver.js';

async function checkDrivers() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env');
    
    await mongoose.connect(uri);
    const drivers = await Driver.find({});
    
    console.log('--- Driver Report ---');
    if (drivers.length === 0) {
        console.log('No drivers found in collection.');
    }
    drivers.forEach(d => {
      console.log(`${d.fullName} | Number: ${d.driverNumber} | Team: ${d.team}`);
    });
    console.log('---------------------');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDrivers();
