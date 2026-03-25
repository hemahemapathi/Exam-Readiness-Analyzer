import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
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
  totalTopics: {
    type: Number,
    required: true,
    min: 1
  },
  completedTopics: {
    type: Number,
    default: 0,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  examWeightage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  fileName: {
    type: String
  },
  filePath: {
    type: String
  },
  topics: [{
    name: String,
    completed: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  }]
}, {
  timestamps: true
});

subjectSchema.virtual('completionPercentage').get(function() {
  return this.totalTopics > 0 ? (this.completedTopics / this.totalTopics) * 100 : 0;
});

export default mongoose.model('Subject', subjectSchema);