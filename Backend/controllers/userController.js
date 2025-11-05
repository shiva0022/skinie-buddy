import User from '../models/User.js';
import Product from '../models/Product.js';
import Routine from '../models/Routine.js';
import Streak from '../models/Streak.js';
import ChatMessage from '../models/ChatMessage.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, skinType, skinConcerns, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (skinType) updateData.skinType = skinType;
    if (skinConcerns) updateData.skinConcerns = skinConcerns;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      Product.deleteMany({ user: req.user._id }),
      Routine.deleteMany({ user: req.user._id }),
      Streak.findOneAndDelete({ user: req.user._id }),
      ChatMessage.deleteMany({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
