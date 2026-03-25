import express from 'express';
import { createStudyGroup, getStudyGroups, joinStudyGroup, getLeaderboard, deleteStudyGroup } from '../controllers/studyGroupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getStudyGroups).post(createStudyGroup);
router.post('/join', joinStudyGroup);
router.delete('/:id', deleteStudyGroup);
router.get('/leaderboard', getLeaderboard);

export default router;