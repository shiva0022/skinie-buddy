import Streak from '../models/Streak.js';

// @desc    Get user streak
// @route   GET /api/streaks
// @access  Private
export const getStreak = async (req, res, next) => {
  try {
    let streak = await Streak.findOne({ user: req.user._id });

    if (!streak) {
      // Create initial streak
      streak = await Streak.create({
        user: req.user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: new Date(),
        totalLogins: 1,
        loginHistory: [{ date: new Date(), routineCompleted: false }]
      });
    }

    res.status(200).json({
      success: true,
      data: { streak }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update/refresh user streak
// @route   POST /api/streaks/update
// @access  Private
export const updateStreak = async (req, res, next) => {
  try {
    let streak = await Streak.findOne({ user: req.user._id });

    if (!streak) {
      streak = await Streak.create({
        user: req.user._id,
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

    res.status(200).json({
      success: true,
      message: 'Streak updated successfully',
      data: { streak }
    });
  } catch (error) {
    next(error);
  }
};
