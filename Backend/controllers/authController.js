import User from '../models/User.js';
import Streak from '../models/Streak.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create initial streak record
    const streak = await Streak.create({
      user: user._id,
      currentStreak: 1,
      longestStreak: 1,
      lastLoginDate: new Date(),
      totalLogins: 1,
      loginHistory: [{ date: new Date(), routineCompleted: false }],
      achievements: [{ type: 'first-login', unlockedAt: new Date() }]
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          skinType: user.skinType,
          skinConcerns: user.skinConcerns
        },
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('User found, comparing password...');

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('Password match successful for:', email);

    // Update streak
    let streak = await Streak.findOne({ user: user._id });
    if (!streak) {
      // Create streak if doesn't exist
      streak = await Streak.create({
        user: user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: new Date(),
        totalLogins: 1,
        loginHistory: [{ date: new Date(), routineCompleted: false }]
      });
    } else {
      streak.updateStreak();
      await streak.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          skinType: user.skinType,
          skinConcerns: user.skinConcerns
        },
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const streak = await Streak.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        streak: streak ? {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          totalLogins: streak.totalLogins,
          achievements: streak.achievements
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
