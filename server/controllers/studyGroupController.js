import StudyGroup from '../models/StudyGroup.js';
import { UserStats } from '../models/Achievement.js';

const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createStudyGroup = async (req, res) => {
  try {
    const { name, description, subjects } = req.body;
    
    const studyGroup = await StudyGroup.create({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }],
      subjects: subjects || [],
      inviteCode: generateInviteCode()
    });

    await studyGroup.populate('members.user', 'name email');
    res.status(201).json({ success: true, studyGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudyGroups = async (req, res) => {
  try {
    const studyGroups = await StudyGroup.find({
      'members.user': req.user.id,
      isActive: true
    }).populate('members.user', 'name email').populate('subjects', 'name');

    res.json({ success: true, studyGroups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinStudyGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const studyGroup = await StudyGroup.findOne({ inviteCode, isActive: true });
    if (!studyGroup) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    const isMember = studyGroup.members.some(m => m.user.toString() === req.user.id);
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    studyGroup.members.push({ user: req.user.id });
    await studyGroup.save();
    await studyGroup.populate('members.user', 'name email');

    res.json({ success: true, studyGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudyGroup = async (req, res) => {
  try {
    console.log('Delete request for group:', req.params.id);
    console.log('User ID:', req.user.id);
    
    const result = await StudyGroup.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    console.log('Delete result:', result ? 'Success' : 'Not found');
    
    if (!result) {
      return res.status(404).json({ message: 'Study group not found or not authorized' });
    }

    console.log('Study group deleted successfully');
    res.json({ success: true, message: 'Study group deleted successfully' });
  } catch (error) {
    console.error('Delete study group error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserStats.find()
      .populate('userId', 'name email')
      .sort({ totalPoints: -1 })
      .limit(10);

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};