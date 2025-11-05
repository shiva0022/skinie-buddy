import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: [
      'Cleanser',
      'Toner',
      'Serum',
      'Moisturizer',
      'Sunscreen',
      'Treatment',
      'Mask',
      'Eye Cream',
      'Exfoliant',
      'Oil',
      'Essence',
      'Hydrator',
      'Other'
    ]
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  keyIngredients: [{
    name: String,
    concentration: String
  }],
  usage: {
    type: String,
    enum: ['morning', 'night', 'both', 'as-needed'],
    default: 'both'
  },
  compatibility: {
    type: String,
    enum: ['good', 'warning', 'error'],
    default: 'good'
  },
  compatibilityNotes: {
    type: String,
    maxlength: [500, 'Compatibility notes cannot exceed 500 characters']
  },
  purchaseDate: Date,
  expiryDate: Date,
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  size: {
    value: Number,
    unit: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
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
productSchema.index({ user: 1, isActive: 1 });
productSchema.index({ user: 1, type: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
