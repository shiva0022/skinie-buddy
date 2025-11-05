import Product from '../models/Product.js';
import Routine from '../models/Routine.js';
import User from '../models/User.js';
import { generateSkincareRoutine } from '../services/geminiService.js';

// Helper function to auto-regenerate routines
const autoRegenerateRoutines = async (userId) => {
  try {
    // Get user's active products
    const products = await Product.find({
      user: userId,
      isActive: true
    });

    // Need at least 3 products to generate routines
    if (products.length < 3) {
      console.log('⚠️ Not enough products to auto-regenerate routines');
      return { regenerated: false, reason: 'insufficient_products' };
    }

    // Get user profile
    const user = await User.findById(userId);

    // Get existing routines
    const existingRoutines = await Routine.find({
      user: userId,
      isAIGenerated: true
    });

    let regeneratedCount = 0;
    const routineTypes = ['morning', 'night'];

    for (const type of routineTypes) {
      try {
        // Generate routine with AI
        const aiRoutineData = await generateSkincareRoutine({
          products: products,
          type: type,
          skinType: user.skinType,
          skinConcerns: user.skinConcerns
        });

        // Map AI-generated steps to actual products
        const steps = [];
        for (const aiStep of aiRoutineData.steps) {
          const matchingProduct = products.find(p => 
            p.name.toLowerCase() === aiStep.productName.toLowerCase() ||
            aiStep.productName.toLowerCase().includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(aiStep.productName.toLowerCase())
          );

          if (matchingProduct) {
            steps.push({
              stepNumber: aiStep.stepNumber,
              product: matchingProduct._id,
              instruction: aiStep.instruction,
              waitTime: aiStep.waitTime || 0
            });
          }
        }

        if (steps.length > 0) {
          // Delete existing routine of this type
          await Routine.deleteMany({
            user: userId,
            type: type,
            isAIGenerated: true
          });

          // Create new routine
          await Routine.create({
            user: userId,
            name: `AI Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Routine`,
            type,
            steps,
            isAIGenerated: true,
            compatibilityWarnings: aiRoutineData.compatibilityWarnings || []
          });

          regeneratedCount++;
        }
      } catch (aiError) {
        console.log(`⚠️ Could not regenerate ${type} routine:`, aiError.message);
      }
    }

    return {
      regenerated: true,
      count: regeneratedCount,
      message: `${regeneratedCount} routine(s) regenerated`
    };
  } catch (error) {
    console.error('❌ Error auto-regenerating routines:', error.message);
    return { regenerated: false, error: error.message };
  }
};

// @desc    Get all products for user
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
  try {
    const { type, isActive, search } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (type) {
      query.type = type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this product'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      user: req.user._id
    });

    // Auto-regenerate routines in the background
    autoRegenerateRoutines(req.user._id).then(result => {
      if (result.regenerated) {
        console.log(`✨ Auto-regenerated ${result.count} routine(s) after adding product`);
      }
    }).catch(err => {
      console.error('⚠️ Background routine regeneration failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { 
        product,
        autoRegenerate: true // Signal to frontend that routines are being regenerated
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If product type, usage, or active status changed, auto-regenerate routines
    const significantChange = req.body.type || req.body.usage !== undefined || req.body.isActive !== undefined;
    
    if (significantChange) {
      autoRegenerateRoutines(req.user._id).then(result => {
        if (result.regenerated) {
          console.log(`✨ Auto-regenerated ${result.count} routine(s) after updating product`);
        }
      }).catch(err => {
        console.error('⚠️ Background routine regeneration failed:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { 
        product,
        autoRegenerate: significantChange
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Import Routine model
    const Routine = (await import('../models/Routine.js')).default;

    // Find all routines that use this product
    const routinesWithProduct = await Routine.find({
      user: req.user._id,
      'steps.product': req.params.id
    });

    // Remove the product from routines or delete routines with too few steps
    for (const routine of routinesWithProduct) {
      // Filter out steps with this product
      routine.steps = routine.steps.filter(
        step => step.product.toString() !== req.params.id
      );

      if (routine.steps.length === 0) {
        // Delete routine if no steps left
        await Routine.findByIdAndDelete(routine._id);
      } else {
        // Renumber steps
        routine.steps.forEach((step, index) => {
          step.stepNumber = index + 1;
        });
        await routine.save();
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    // Auto-regenerate routines in the background
    autoRegenerateRoutines(req.user._id).then(result => {
      if (result.regenerated) {
        console.log(`✨ Auto-regenerated ${result.count} routine(s) after deleting product`);
      }
    }).catch(err => {
      console.error('⚠️ Background routine regeneration failed:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        routinesAffected: routinesWithProduct.length,
        autoRegenerate: true // Signal to frontend that routines are being regenerated
      }
    });
  } catch (error) {
    next(error);
  }
};
