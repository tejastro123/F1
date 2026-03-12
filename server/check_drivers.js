import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from './models/Driver.js';

dotenv.config();

async function checkDrivers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const drivers = await Driver.find({});
  console.log('Driver Numbers:');
  drivers.forEach(d => {
    console.log(`${d.fullName}: ${d.driverNumber}`);
  });
  process.exit(0);
}

checkDrivers();
