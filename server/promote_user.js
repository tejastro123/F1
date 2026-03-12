import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from './models/User.js';

async function promoteUser() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env');
    
    await mongoose.connect(uri);
    const result = await User.updateOne(
        { email: 'tejas.mellimpudi@gmail.com' },
        { role: 'admin' }
    );
    
    if (result.matchedCount > 0) {
      console.log('Successfully promoted tejas.mellimpudi@gmail.com to admin.');
    } else {
      console.log('User not found.');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

promoteUser();
