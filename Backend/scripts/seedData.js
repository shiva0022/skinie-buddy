import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Routine from '../models/Routine.js';
import Streak from '../models/Streak.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Routine.deleteMany({}),
      Streak.deleteMany({})
    ]);

    // Create demo user
    console.log('👤 Creating demo user...');
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@skiniebuddy.com',
      password: 'password123',
      skinType: 'combination',
      skinConcerns: ['acne', 'aging', 'dark-spots']
    });

    // Create demo products
    console.log('📦 Creating demo products...');
    const products = await Product.insertMany([
      {
        user: user._id,
        name: 'Gentle Foam Cleanser',
        brand: 'CeraVe',
        type: 'Cleanser',
        usage: 'both',
        compatibility: 'good',
        ingredients: ['Ceramides', 'Hyaluronic Acid', 'Niacinamide'],
        rating: 4.5
      },
      {
        user: user._id,
        name: 'Niacinamide 10% + Zinc 1%',
        brand: 'The Ordinary',
        type: 'Serum',
        usage: 'both',
        compatibility: 'good',
        keyIngredients: [
          { name: 'Niacinamide', concentration: '10%' },
          { name: 'Zinc', concentration: '1%' }
        ],
        rating: 4.3
      },
      {
        user: user._id,
        name: 'Hyaluronic Acid 2% + B5',
        brand: 'The Ordinary',
        type: 'Hydrator',
        usage: 'both',
        compatibility: 'good',
        keyIngredients: [
          { name: 'Hyaluronic Acid', concentration: '2%' }
        ],
        rating: 4.7
      },
      {
        user: user._id,
        name: 'Retinol 0.5% in Squalane',
        brand: 'The Ordinary',
        type: 'Treatment',
        usage: 'night',
        compatibility: 'warning',
        compatibilityNotes: 'Do not use with Vitamin C or acids',
        keyIngredients: [
          { name: 'Retinol', concentration: '0.5%' }
        ],
        rating: 4.4
      },
      {
        user: user._id,
        name: 'Daily Moisturizing Lotion SPF 30',
        brand: 'CeraVe',
        type: 'Moisturizer',
        usage: 'morning',
        compatibility: 'good',
        ingredients: ['Ceramides', 'Hyaluronic Acid', 'SPF 30'],
        rating: 4.6
      },
      {
        user: user._id,
        name: 'PM Facial Moisturizing Lotion',
        brand: 'CeraVe',
        type: 'Moisturizer',
        usage: 'night',
        compatibility: 'good',
        ingredients: ['Ceramides', 'Hyaluronic Acid', 'Niacinamide'],
        rating: 4.5
      }
    ]);

    // Create demo routines
    console.log('📋 Creating demo routines...');
    const morningRoutine = await Routine.create({
      user: user._id,
      name: 'Morning Routine',
      type: 'morning',
      steps: [
        {
          stepNumber: 1,
          product: products[0]._id, // Cleanser
          instruction: 'Apply to damp face, massage gently, rinse thoroughly',
          waitTime: 0
        },
        {
          stepNumber: 2,
          product: products[2]._id, // Hyaluronic Acid
          instruction: 'Apply 2-3 drops to damp skin',
          waitTime: 1
        },
        {
          stepNumber: 3,
          product: products[1]._id, // Niacinamide
          instruction: 'Apply 4-5 drops, avoiding eye area',
          waitTime: 2
        },
        {
          stepNumber: 4,
          product: products[4]._id, // Moisturizer SPF
          instruction: 'Apply generously as final step',
          waitTime: 0
        }
      ],
      isAIGenerated: false
    });

    const nightRoutine = await Routine.create({
      user: user._id,
      name: 'Night Routine',
      type: 'night',
      steps: [
        {
          stepNumber: 1,
          product: products[0]._id, // Cleanser
          instruction: 'Apply to damp face, massage gently, rinse thoroughly',
          waitTime: 0
        },
        {
          stepNumber: 2,
          product: products[2]._id, // Hyaluronic Acid
          instruction: 'Apply 2-3 drops to damp skin',
          waitTime: 1
        },
        {
          stepNumber: 3,
          product: products[3]._id, // Retinol
          instruction: 'Apply pea-sized amount (start 2-3x per week)',
          waitTime: 3
        },
        {
          stepNumber: 4,
          product: products[5]._id, // Night Moisturizer
          instruction: 'Apply generously as final step',
          waitTime: 0
        }
      ],
      isAIGenerated: false,
      compatibilityWarnings: [
        'Retinol should be used gradually. Start with 2-3 times per week.'
      ]
    });

    // Create demo streak
    console.log('🔥 Creating demo streak...');
    await Streak.create({
      user: user._id,
      currentStreak: 5,
      longestStreak: 12,
      lastLoginDate: new Date(),
      totalLogins: 15,
      loginHistory: [
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), routineCompleted: true },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), routineCompleted: true },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), routineCompleted: false },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), routineCompleted: true },
        { date: new Date(), routineCompleted: false }
      ],
      achievements: [
        { type: 'first-login', unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        { type: 'week-streak', unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ]
    });

    console.log('✅ Seed data created successfully!');
    console.log('\n📧 Demo User Credentials:');
    console.log('   Email: demo@skiniebuddy.com');
    console.log('   Password: password123');
    console.log(`\n✨ Created:`);
    console.log(`   - 1 user`);
    console.log(`   - ${products.length} products`);
    console.log(`   - 2 routines (morning & night)`);
    console.log(`   - 1 streak record`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
