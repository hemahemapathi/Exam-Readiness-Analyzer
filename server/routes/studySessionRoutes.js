import express from 'express';
import { 
  createStudySession, 
  getStudySessions, 
  getStudySession, 
  updateStudySession, 
  deleteStudySession,
  getStudyStats
} from '../controllers/studySessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getStudySessions)
  .post(createStudySession);

router.get('/stats', getStudyStats);

router.route('/:id')
  .get(getStudySession)
  .put(updateStudySession)
  .delete(deleteStudySession);

export default router;