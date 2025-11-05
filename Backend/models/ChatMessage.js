import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  context: {
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    routines: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine'
    }]
  },
  metadata: {
    tokens: Number,
    model: String,
    responseTime: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
chatMessageSchema.index({ user: 1, createdAt: -1 });

// Keep only last 100 messages per user
chatMessageSchema.statics.cleanupOldMessages = async function(userId, limit = 100) {
  const messages = await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(limit)
    .select('_id');
  
  const idsToDelete = messages.map(m => m._id);
  
  if (idsToDelete.length > 0) {
    await this.deleteMany({ _id: { $in: idsToDelete } });
  }
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
