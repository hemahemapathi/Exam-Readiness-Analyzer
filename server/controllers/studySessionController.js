import StudySession from '../models/StudySession.js';
import Subject from '../models/Subject.js';
import { UserStats, Achievement } from '../models/Achievement.js';
import moment from 'moment';

const updateUserStats = async (userId, hoursStudied) => {
  let userStats = await UserStats.findOne({ userId });
  if (!userStats) {
    userStats = await UserStats.create({ userId });
  }

  const today = moment().startOf('day');
  const lastStudy = userStats.lastStudyDate ? moment(userStats.lastStudyDate).startOf('day') : null;
  
  if (!lastStudy || today.diff(lastStudy, 'days') === 1) {
    userStats.currentStreak += 1;
    userStats.longestStreak = Math.max(userStats.longestStreak, userStats.currentStreak);
  } else if (today.diff(lastStudy, 'days') > 1) {
    userStats.currentStreak = 1;
  }

  userStats.totalHours += hoursStudied;
  userStats.totalSessions += 1;
  userStats.lastStudyDate = new Date();
  userStats.totalPoints += Math.floor(hoursStudied * 10) + (userStats.currentStreak * 5);

  await userStats.save();
  await checkAchievements(userId, userStats);
};

const checkAchievements = async (userId, stats) => {
  const achievements = [];
  
  if (stats.currentStreak === 7) {
    achievements.push({ type: 'streak', name: 'Week Warrior', description: '7 day study streak', points: 50 });
  }
  if (stats.totalHours >= 100) {
    achievements.push({ type: 'hours', name: 'Century Club', description: '100 hours studied', points: 100 });
  }
  if (stats.totalSessions >= 50) {
    achievements.push({ type: 'sessions', name: 'Dedicated Learner', description: '50 study sessions', points: 75 });
  }

  for (const achievement of achievements) {
    const exists = await Achievement.findOne({ userId, name: achievement.name });
    if (!exists) {
      await Achievement.create({ userId, ...achievement });
      stats.totalPoints += achievement.points;
    }
  }
  
  await stats.save();
};

export const createStudySession = async (req, res) => {
  try {
    const { 
      subjectId, 
      hoursStudied, 
      topicsCompleted, 
      overallConfidence, 
      notes, 
      mood, 
      burnoutIndicators 
    } = req.body;

    // Verify subject belongs to user
    const subject = await Subject.findOne({ 
      _id: subjectId, 
      userId: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const studySession = await StudySession.create({
      userId: req.user.id,
      subjectId,
      hoursStudied,
      topicsCompleted: topicsCompleted || [],
      overallConfidence,
      notes,
      mood,
      burnoutIndicators
    });

    await studySession.populate('subjectId', 'name');
    await updateUserStats(req.user.id, hoursStudied);
    res.status(201).json({ success: true, studySession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudySessions = async (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;
    
    let filter = { userId: req.user.id };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const studySessions = await StudySession.find(filter)
      .populate('subjectId', 'name')
      .sort({ date: -1 });

    res.json({ success: true, studySessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudySession = async (req, res) => {
  try {
    const studySession = await StudySession.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('subjectId', 'name');

    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    res.json({ success: true, studySession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudySession = async (req, res) => {
  try {
    const studySession = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('subjectId', 'name');

    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    res.json({ success: true, studySession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudySession = async (req, res) => {
  try {
    const studySession = await StudySession.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    res.json({ success: true, message: 'Study session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudyStats = async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);
    const startDate = moment().subtract(days, 'days').startOf('day');

    const studySessions = await StudySession.find({
      userId: req.user.id,
      date: { $gte: startDate.toDate() }
    }).populate('subjectId', 'name');

    // Calculate statistics
    const totalHours = studySessions.reduce((sum, session) => sum + session.hoursStudied, 0);
    const avgHoursPerDay = totalHours / days;
    
    const subjectStats = {};
    studySessions.forEach(session => {
      if (!session.subjectId) return;
      const subjectName = session.subjectId.name;
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          hours: 0,
          sessions: 0,
          avgConfidence: 0
        };
      }
      subjectStats[subjectName].hours += session.hoursStudied;
      subjectStats[subjectName].sessions += 1;
      subjectStats[subjectName].avgConfidence += session.overallConfidence;
    });

    // Calculate averages
    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].avgConfidence = 
        subjectStats[subject].avgConfidence / subjectStats[subject].sessions;
    });

    const dailyHours = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const dayHours = studySessions
        .filter(session => moment(session.date).format('YYYY-MM-DD') === date)
        .reduce((sum, session) => sum + session.hoursStudied, 0);
      dailyHours.push({ date, hours: dayHours });
    }

    res.json({
      success: true,
      stats: {
        totalHours: Math.round(totalHours * 100) / 100,
        avgHoursPerDay: Math.round(avgHoursPerDay * 100) / 100,
        totalSessions: studySessions.length,
        subjectStats,
        dailyHours
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
};