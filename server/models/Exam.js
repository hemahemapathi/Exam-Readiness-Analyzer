import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  examDate: {
    type: Date,
    required: true
  },
  subjects: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    weightage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  totalMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 40
  },
  examType: {
    type: String,
    enum: ['Final', 'Midterm', 'Quiz', 'Assignment', 'Other'],
    default: 'Final'
  },
  readinessScore: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    subjectWise: [{
      subjectId: mongoose.Schema.Types.ObjectId,
      score: Number,
      status: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Needs Improvement', 'Critical']
      }
    }],
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  predictions: {
    expectedScore: Number,
    passLikelihood: Number,
    riskFactors: [String],
    recommendations: [String]
  },
  lastSimulation: {
    projectedScore: Number,
    improvement: Number,
    recommendations: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    examName: String,
    studyHours: Number,
    targetDays: Number
  },
  simulations: [{
    projectedScore: Number,
    improvement: Number,
    recommendations: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    examName: String,
    studyHours: Number,
    targetDays: Number
  }],
  weeklyPlan: [{
    week: Number,
    startDate: String,
    endDate: String,
    focus: String,
    totalHours: Number,
    subjects: [{
      name: String,
      hours: Number,
      priority: String,
      tasks: [String]
    }]
  }],
  allPlans: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
}, {
  timestamps: true
});

examSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const examDate = new Date(this.examDate);
  const diffTime = examDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export default mongoose.model('Exam', examSchema);