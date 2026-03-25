import express from 'express';
import { 
  createSubject, 
  getSubjects, 
  getSubject, 
  updateSubject, 
  deleteSubject,
  updateTopicProgress,
  addTopic,
  upload
} from '../controllers/subjectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(upload.single('file'), createSubject);

router.route('/:id')
  .get(getSubject)
  .put(upload.single('file'), updateSubject)
  .delete(deleteSubject);

router.put('/:id/topics/progress', updateTopicProgress);
router.post('/:id/topics', addTopic);

export default router;