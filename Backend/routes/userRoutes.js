import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile, deleteAccount } from '../controllers/userController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('skinType')
    .optional()
    .isIn(['dry', 'oily', 'combination', 'sensitive', 'normal', 'not-specified'])
    .withMessage('Invalid skin type'),
  body('skinConcerns')
    .optional()
    .isArray().withMessage('Skin concerns must be an array'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system']).withMessage('Invalid theme preference')
];

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.delete('/account', deleteAccount);

export default router;
