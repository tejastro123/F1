import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from './models/User.js';

async function checkAdmins() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env');
    
    await mongoose.connect(uri);
    const admins = await User.find({ role: 'admin' });
    
    console.log('--- Admin Users ---');
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach(u => {
        console.log(`Email: ${u.email} | Role: ${u.role}`);
      });
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkAdmins();
