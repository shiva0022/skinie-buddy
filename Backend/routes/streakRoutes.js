import express from 'express';
import { getStreak, updateStreak } from '../controllers/streakController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getStreak);
router.post('/update', updateStreak);

export default router;
