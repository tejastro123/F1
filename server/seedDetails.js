import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from './models/Driver.js';
import Race from './models/Race.js';

dotenv.config();

const driversData = [
  {
    fullName: 'Max Verstappen',
    driverNumber: 1,
    bio: 'Max Verstappen is a three-time Formula 1 World Champion, known for his aggressive racing style and exceptional car control. Born into a racing family, he became the youngest driver to compete in F1 at age 17.',
    achievements: [
      '3x Formula 1 World Champion (2021, 2022, 2023)',
      'Youngest ever F1 race winner (18 years, 228 days)',
      'Most wins in a single season (19 wins in 2023)'
    ],
    careerStats: { wins: 54, podiums: 98, poles: 32, championships: 3 },
    photoUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png'
  },
  {
    fullName: 'Lewis Hamilton',
    driverNumber: 44,
    bio: 'Sir Lewis Hamilton is arguably the greatest F1 driver of all time, holding the record for most wins, poles, and podium finishes. A vocal advocate for diversity and environmental issues, his legacy transcends the track.',
    achievements: [
      '7x Formula 1 World Champion (Record shared with Michael Schumacher)',
      'Most Career Wins (103+)',
      'Most Career Pole Positions (104+)'
    ],
    careerStats: { wins: 103, podiums: 197, poles: 104, championships: 7 },
    photoUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png'
  }
];

const racesData = [
  {
    grandPrixName: 'Bahrain Grand Prix',
    circuitDetails: {
      description: 'The Bahrain International Circuit is a modern classic located in the heart of the Sakhir desert.',
      history: 'Opened in 2004, it was the first Formula 1 race to be held in the Middle East. It has since become a staple of the calendar, often serving as the season opener under stunning floodlights.',
      length: '5.412 km',
      turns: 15,
      lapRecord: { time: '1:31.447', driver: 'Pedro de la Rosa', year: '2005' }
    }
  },
  {
    grandPrixName: 'Monaco Grand Prix',
    circuitDetails: {
      description: 'The Circuit de Monaco is the ultimate test of precision and bravery, winding through the narrow streets of Monte Carlo.',
      history: 'Part of the inaugural 1950 F1 season, Monaco is the jewel in the crown of motorsport. It requires absolute focus, with almost no room for error between the barriers and the harbor.',
      length: '3.337 km',
      turns: 19,
      lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: '2021' }
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const d of driversData) {
      await Driver.findOneAndUpdate({ fullName: d.fullName }, d, { upsert: true });
      console.log(`Updated driver: ${d.fullName}`);
    }

    for (const r of racesData) {
      await Race.findOneAndUpdate({ grandPrixName: r.grandPrixName }, r, { upsert: true });
      console.log(`Updated race: ${r.grandPrixName}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
