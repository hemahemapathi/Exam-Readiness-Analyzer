import express from 'express';
import { 
  createExam, 
  getExams, 
  getExam, 
  updateExam, 
  deleteExam,
  calculateReadiness,
  simulateScenario,
  getWeeklyPlan,
  generateWeeklyPlan,
  savePlan
} from '../controllers/examController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getExams)
  .post(createExam);

router.route('/:id')
  .get(getExam)
  .put(updateExam)
  .delete(deleteExam);

router.get('/:id/readiness', calculateReadiness);
router.post('/:id/simulate', simulateScenario);
router.get('/:id/weekly-plan', getWeeklyPlan);
router.post('/:id/weekly-plan', generateWeeklyPlan);
router.post('/:id/save-plan', savePlan);

export default router;