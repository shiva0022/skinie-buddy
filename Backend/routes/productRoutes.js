import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  body('brand')
    .trim()
    .notEmpty().withMessage('Brand name is required')
    .isLength({ max: 50 }).withMessage('Brand name cannot exceed 50 characters'),
  body('type')
    .notEmpty().withMessage('Product type is required')
    .isIn([
      'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Treatment',
      'Mask', 'Eye Cream', 'Exfoliant', 'Oil', 'Essence', 'Hydrator', 'Other'
    ]).withMessage('Invalid product type'),
  body('usage')
    .optional()
    .isIn(['morning', 'night', 'both', 'as-needed']).withMessage('Invalid usage value'),
  body('compatibility')
    .optional()
    .isIn(['good', 'warning', 'error']).withMessage('Invalid compatibility value')
];

// All routes are protected
router.use(protect);

router.route('/')
  .get(getProducts)
  .post(productValidation, validate, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
