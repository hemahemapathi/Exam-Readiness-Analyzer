import express from 'express';
import { createPracticeTest, submitPracticeTest, getPracticeTests, deletePracticeTest } from '../controllers/practiceTestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Practice test routes working', user: req.user?.id });
});

router.route('/').get(getPracticeTests).post(createPracticeTest);
router.put('/:id/submit', submitPracticeTest);
router.delete('/:id', deletePracticeTest);

export default router;