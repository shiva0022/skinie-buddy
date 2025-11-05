import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    routineCompleted: {
      type: Boolean,
      default: false
    }
  }],
  totalLogins: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: {
      type: String,
      enum: ['first-login', 'week-streak', 'month-streak', 'hundred-days', 'year-streak']
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to update streak
streakSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastLogin = new Date(this.lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastLogin.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, no update needed
    return this;
  } else if (diffDays === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Streak broken
    this.currentStreak = 1;
  }
  
  this.lastLoginDate = today;
  this.totalLogins += 1;
  this.loginHistory.push({ date: today, routineCompleted: false });
  
  // Keep only last 90 days of history
  if (this.loginHistory.length > 90) {
    this.loginHistory = this.loginHistory.slice(-90);
  }
  
  // Check for achievements
  this.checkAchievements();
  
  return this;
};

// Method to check and unlock achievements
streakSchema.methods.checkAchievements = function() {
  const achievementTypes = {
    'first-login': 1,
    'week-streak': 7,
    'month-streak': 30,
    'hundred-days': 100,
    'year-streak': 365
  };
  
  for (const [type, days] of Object.entries(achievementTypes)) {
    const hasAchievement = this.achievements.some(a => a.type === type);
    
    if (!hasAchievement && this.currentStreak >= days) {
      this.achievements.push({ type, unlockedAt: new Date() });
    }
  }
};

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;
