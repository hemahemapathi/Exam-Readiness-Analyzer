import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['streak', 'hours', 'sessions', 'subjects'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const Achievement = mongoose.model('Achievement', achievementSchema);
export const UserStats = mongoose.model('UserStats', userStatsSchema);