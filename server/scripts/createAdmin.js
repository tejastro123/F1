import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/User.js';

async function createAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in environment');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const email = 'admin@f1.com';
    const plainPassword = 'admin'; // DO NOT use this in real production without changing!

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const admin = new User({
      email,
      passwordHash,
      role: 'admin'
    });

    await admin.save();
    console.log(`✅ Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
