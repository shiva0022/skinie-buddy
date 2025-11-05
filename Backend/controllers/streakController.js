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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak) {
      streak = await Streak.create({
        user: req.user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
        totalLogins: 1,
        loginHistory: [{ date: today, routineCompleted: true }]
      });
    } else {
      // Check if already completed today
      const todayEntry = streak.loginHistory.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });

      if (todayEntry) {
        // Mark today as completed
        todayEntry.routineCompleted = true;
      } else {
        // Add new entry for today
        const lastLogin = new Date(streak.lastLoginDate);
        lastLogin.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - lastLogin.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day
          streak.currentStreak += 1;
          if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
          }
        } else if (diffDays > 1) {
          // Streak broken
          streak.currentStreak = 1;
        }
        // If diffDays === 0, same day, don't update streak
        
        streak.lastLoginDate = today;
        streak.totalLogins += 1;
        streak.loginHistory.push({ date: today, routineCompleted: true });
        
        // Keep only last 90 days of history
        if (streak.loginHistory.length > 90) {
          streak.loginHistory = streak.loginHistory.slice(-90);
        }
        
        // Check for achievements
        streak.checkAchievements();
      }
      
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
