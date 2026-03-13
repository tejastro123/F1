import mongoose from 'mongoose';
import Race from './models/Race.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function listRaces() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const races = await Race.find({}, 'grandPrixName');
    console.log(JSON.stringify(races.map(r => r.grandPrixName)));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}
listRaces();
