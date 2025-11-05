import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const testLogin = async () => {
  await connectDB();

  // List all users
  console.log('\n📋 All users in database:');
  const users = await User.find({}).select('name email createdAt');
  console.log(users);

  // Test login with a specific email
  const testEmail = process.argv[2] || 'testuser@example.com';
  const testPassword = process.argv[3] || 'test123456';

  console.log(`\n🔐 Testing login for: ${testEmail}`);

  const user = await User.findOne({ email: testEmail }).select('+password');
  
  if (!user) {
    console.log('❌ User not found!');
    console.log('💡 Available users:', users.map(u => u.email));
  } else {
    console.log('✅ User found:', user.name, user.email);
    
    const isMatch = await user.comparePassword(testPassword);
    if (isMatch) {
      console.log('✅ Password match successful!');
    } else {
      console.log('❌ Password does not match!');
    }
  }

  process.exit(0);
};

testLogin();
