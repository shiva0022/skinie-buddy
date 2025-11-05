import express from 'express';
import { body } from 'express-validator';
import { getChatHistory, sendMessage, clearHistory } from '../controllers/chatController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters')
];

// All routes are protected
router.use(protect);

router.get('/history', getChatHistory);
router.post('/message', messageValidation, validate, sendMessage);
router.delete('/history', clearHistory);

export default router;
