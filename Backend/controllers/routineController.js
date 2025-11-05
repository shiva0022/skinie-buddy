import Routine from '../models/Routine.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateSkincareRoutine } from '../services/geminiService.js';

// @desc    Get all routines for user
// @route   GET /api/routines
// @access  Private
export const getRoutines = async (req, res, next) => {
  try {
    const { type, isActive } = req.query;

    const query = { user: req.user._id };

    if (type) {
      query.type = type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const routines = await Routine.find(query)
      .populate('steps.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routines.length,
      data: { routines }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single routine
// @route   GET /api/routines/:id
// @access  Private
export const getRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id).populate('steps.product');

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership
    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this routine'
      });
    }

    res.status(200).json({
      success: true,
      data: { routine }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new routine
// @route   POST /api/routines
// @access  Private
export const createRoutine = async (req, res, next) => {
  try {
    // Verify all products belong to user
    const productIds = req.body.steps.map(step => step.product);
    const products = await Product.find({
      _id: { $in: productIds },
      user: req.user._id
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found or not authorized'
      });
    }

    const routine = await Routine.create({
      ...req.body,
      user: req.user._id
    });

    const populatedRoutine = await Routine.findById(routine._id).populate('steps.product');

    res.status(201).json({
      success: true,
      message: 'Routine created successfully',
      data: { routine: populatedRoutine }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update routine
// @route   PUT /api/routines/:id
// @access  Private
export const updateRoutine = async (req, res, next) => {
  try {
    let routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership
    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this routine'
      });
    }

    routine = await Routine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('steps.product');

    res.status(200).json({
      success: true,
      message: 'Routine updated successfully',
      data: { routine }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
// @access  Private
export const deleteRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership
    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this routine'
      });
    }

    await Routine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Routine deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark routine as completed
// @route   POST /api/routines/:id/complete
// @access  Private
export const completeRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership
    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this routine'
      });
    }

    routine.lastCompleted = new Date();
    routine.completionCount += 1;
    await routine.save();

    res.status(200).json({
      success: true,
      message: 'Routine marked as completed',
      data: { routine }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI routine based on products using Gemini AI
// @route   POST /api/routines/generate
// @access  Private
export const generateRoutine = async (req, res, next) => {
  try {
    const { type } = req.body; // 'morning' or 'night'

    if (!type || !['morning', 'night'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Please specify routine type: morning or night'
      });
    }

    // Get user's products
    const products = await Product.find({
      user: req.user._id,
      isActive: true
    });

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products found. Please add products first.'
      });
    }

    // Get user profile for personalization
    const user = await User.findById(req.user._id);

    // Check if existing routine exists and delete it
    await Routine.deleteMany({
      user: req.user._id,
      type: type,
      isAIGenerated: true
    });

    try {
      // Generate routine using Gemini AI
      const aiRoutineData = await generateSkincareRoutine({
        products: products,
        type: type,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns
      });

      // Map AI-generated steps to actual products
      const steps = [];
      for (const aiStep of aiRoutineData.steps) {
        // Find matching product by name (case-insensitive)
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

      if (steps.length === 0) {
        // Fallback to simple logic if no products matched
        return await generateRoutineFallback(req, res, next, products, type);
      }

      // Create routine with AI data
      const routine = await Routine.create({
        user: req.user._id,
        name: `AI Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Routine`,
        type,
        steps,
        isAIGenerated: true,
        compatibilityWarnings: aiRoutineData.compatibilityWarnings || []
      });

      const populatedRoutine = await Routine.findById(routine._id).populate('steps.product');

      res.status(201).json({
        success: true,
        message: 'AI routine generated successfully',
        data: { 
          routine: populatedRoutine,
          aiTips: aiRoutineData.tips || []
        }
      });
    } catch (aiError) {
      // If Gemini API fails, fallback to rule-based generation
      console.log('ℹ️ Using fallback routine generation:', aiError.message);
      return await generateRoutineFallback(req, res, next, products, type);
    }
  } catch (error) {
    next(error);
  }
};

// Fallback routine generation (rule-based)
const generateRoutineFallback = async (req, res, next, products, type) => {
  try {
    const routineOrder = {
      morning: ['Cleanser', 'Toner', 'Serum', 'Eye Cream', 'Moisturizer', 'Sunscreen'],
      night: ['Cleanser', 'Exfoliant', 'Toner', 'Serum', 'Treatment', 'Eye Cream', 'Moisturizer', 'Oil']
    };

    const order = routineOrder[type] || routineOrder.morning;
    const steps = [];
    let stepNumber = 1;

    // Match products to routine order
    for (const productType of order) {
      const product = products.find(p => p.type === productType);
      if (product) {
        steps.push({
          stepNumber: stepNumber++,
          product: product._id,
          instruction: `Apply ${product.name} gently to clean skin`,
          waitTime: productType === 'Serum' || productType === 'Treatment' ? 2 : 0
        });
      }
    }

    if (steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not generate routine with available products'
      });
    }

    // Check for compatibility warnings (simplified)
    const compatibilityWarnings = [];
    const hasRetinol = products.some(p => 
      p.keyIngredients?.some(i => i.name.toLowerCase().includes('retinol'))
    );
    const hasVitaminC = products.some(p => 
      p.keyIngredients?.some(i => i.name.toLowerCase().includes('vitamin c'))
    );

    if (hasRetinol && hasVitaminC && type === 'morning') {
      compatibilityWarnings.push('⚠️ Retinol and Vitamin C may cause irritation when used together in the morning.');
    }

    // Create routine
    const routine = await Routine.create({
      user: req.user._id,
      name: `Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Routine`,
      type,
      steps,
      isAIGenerated: true,
      compatibilityWarnings
    });

    const populatedRoutine = await Routine.findById(routine._id).populate('steps.product');

    res.status(201).json({
      success: true,
      message: 'Routine generated successfully (using fallback logic)',
      data: { routine: populatedRoutine }
    });
  } catch (error) {
    throw error;
  }
};
