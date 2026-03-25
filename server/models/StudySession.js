import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  hoursStudied: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  topicsCompleted: [{
    topicName: String,
    timeSpent: Number,
    confidence: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  overallConfidence: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  notes: String,
  mood: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor', 'Terrible'],
    default: 'Average'
  },
  burnoutIndicators: {
    fatigue: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    motivation: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    focus: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('StudySession', studySessionSchema);