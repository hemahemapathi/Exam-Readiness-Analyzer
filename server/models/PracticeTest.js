import mongoose from 'mongoose';

const practiceTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true
    },
    correctAnswer: {
      type: Number,
      required: true
    },
    userAnswer: {
      type: Number,
      default: -1
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    subject: String,
    questionNumber: Number,
    timeSpent: Number
  }],
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'skipped', 'abandoned'],
    default: 'in-progress'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export default mongoose.model('PracticeTest', practiceTestSchema);