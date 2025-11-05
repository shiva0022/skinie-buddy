import mongoose from 'mongoose';

const routineStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  instruction: {
    type: String,
    maxlength: [500, 'Instruction cannot exceed 500 characters']
  },
  waitTime: {
    type: Number, // in minutes
    default: 0
  }
});

const routineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Routine name is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['morning', 'night', 'weekly', 'custom']
  },
  steps: [routineStepSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  compatibilityWarnings: [{
    type: String
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  lastCompleted: Date,
  completionCount: {
    type: Number,
    default: 0
  },
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

// Index for faster queries
routineSchema.index({ user: 1, type: 1, isActive: 1 });

// Calculate estimated duration before saving
routineSchema.pre('save', function(next) {
  if (this.steps && this.steps.length > 0) {
    this.estimatedDuration = this.steps.reduce((total, step) => {
      return total + (step.waitTime || 0);
    }, 0) + (this.steps.length * 2); // Add 2 minutes per step for application
  }
  next();
});

const Routine = mongoose.model('Routine', routineSchema);

export default Routine;
