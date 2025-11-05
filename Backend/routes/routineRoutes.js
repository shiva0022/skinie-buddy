import express from 'express';
import { body } from 'express-validator';
import {
  getRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  completeRoutine,
  generateRoutine
} from '../controllers/routineController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const routineValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Routine name is required'),
  body('type')
    .notEmpty().withMessage('Routine type is required')
    .isIn(['morning', 'night', 'weekly', 'custom']).withMessage('Invalid routine type'),
  body('steps')
    .isArray({ min: 1 }).withMessage('At least one step is required'),
  body('steps.*.product')
    .notEmpty().withMessage('Product ID is required for each step')
];

// All routes are protected
router.use(protect);

router.route('/')
  .get(getRoutines)
  .post(routineValidation, validate, createRoutine);

router.post('/generate', generateRoutine);

router.route('/:id')
  .get(getRoutine)
  .put(updateRoutine)
  .delete(deleteRoutine);

router.post('/:id/complete', completeRoutine);

export default router;
