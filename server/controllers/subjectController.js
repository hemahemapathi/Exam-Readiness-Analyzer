import Subject from '../models/Subject.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/subjects';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const createSubject = async (req, res) => {
  try {
    const { name, totalTopics, difficulty, priority, examWeightage, topics } = req.body;
    
    const subjectData = {
      userId: req.user.id,
      name,
      totalTopics,
      difficulty,
      priority,
      examWeightage,
      topics: topics || []
    };

    if (req.file) {
      subjectData.fileName = req.file.originalname;
      subjectData.filePath = req.file.path;
    }
    
    const subject = await Subject.create(subjectData);
    res.status(201).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.fileName = req.file.originalname;
      updateData.filePath = req.file.path;
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTopicProgress = async (req, res) => {
  try {
    const { topicId, completed, confidence } = req.body;
    
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topic = subject.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const wasCompleted = topic.completed;
    topic.completed = completed;
    topic.confidence = confidence;

    // Update completed topics count
    if (completed && !wasCompleted) {
      subject.completedTopics += 1;
    } else if (!completed && wasCompleted) {
      subject.completedTopics -= 1;
    }

    await subject.save();
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTopic = async (req, res) => {
  try {
    const { name, confidence } = req.body;
    
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.topics.push({ name, confidence: confidence || 3 });
    subject.totalTopics = subject.topics.length;
    
    await subject.save();
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};