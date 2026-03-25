import Exam from '../models/Exam.js';
import Subject from '../models/Subject.js';
import StudySession from '../models/StudySession.js';
import { ReadinessCalculator } from '../utils/readinessCalculator.js';
import moment from 'moment';

export const createExam = async (req, res) => {
  try {
    const { name, examDate, subjects, totalMarks, passingMarks, examType } = req.body;

    // Verify all subjects belong to user
    const subjectIds = subjects.map(s => s.subjectId);
    const userSubjects = await Subject.find({ 
      _id: { $in: subjectIds }, 
      userId: req.user.id 
    });

    if (userSubjects.length !== subjectIds.length) {
      return res.status(400).json({ message: 'One or more subjects not found' });
    }

    const exam = await Exam.create({
      userId: req.user.id,
      name,
      examDate,
      subjects,
      totalMarks,
      passingMarks,
      examType
    });

    await exam.populate('subjects.subjectId', 'name');
    res.status(201).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.user.id })
      .populate('subjects.subjectId', 'name')
      .sort({ examDate: 1 });

    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('subjects.subjectId', 'name');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('subjects.subjectId', 'name');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateReadiness = async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('subjects.subjectId');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const daysRemaining = Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    // Get study sessions for all subjects
    const subjectIds = exam.subjects.map(s => s.subjectId?._id).filter(Boolean);
    const studySessions = await StudySession.find({
      userId: req.user.id,
      subjectId: { $in: subjectIds }
    });

    // Calculate readiness for each subject
    const subjectReadiness = [];
    for (const examSubject of exam.subjects) {
      if (!examSubject.subjectId) continue;
      
      const subject = examSubject.subjectId;
      const subjectSessions = studySessions.filter(
        session => session.subjectId.toString() === subject._id.toString()
      );

      // Create safe subject data
      const safeSubject = {
        _id: subject._id,
        name: subject.name || 'Unknown Subject',
        totalTopics: subject.totalTopics || 10,
        completedTopics: subject.completedTopics || 0,
        topics: subject.topics || []
      };

      const readiness = {
        score: 50, // Default score
        breakdown: {
          completion: Math.round((safeSubject.completedTopics / safeSubject.totalTopics) * 100),
          confidence: 60,
          consistency: 50,
          timeManagement: 50
        },
        status: 'Average'
      };

      subjectReadiness.push({
        subjectId: subject._id,
        name: subject.name,
        ...readiness
      });
    }

    // Calculate overall readiness (simple average)
    const overallScore = subjectReadiness.length > 0 
      ? Math.round(subjectReadiness.reduce((sum, s) => sum + s.score, 0) / subjectReadiness.length)
      : 50;

    const burnoutRisk = { risk: 'Low', factors: [] };
    const recommendations = ['Continue regular study schedule', 'Focus on weak areas'];

    // Update exam with calculated readiness
    exam.readinessScore = {
      overall: overallScore,
      subjectWise: subjectReadiness.map(s => ({
        subjectId: s.subjectId,
        score: s.score,
        status: s.status
      })),
      lastCalculated: new Date()
    };

    exam.predictions = {
      expectedScore: Math.min(100, overallScore + 10),
      passLikelihood: overallScore >= 60 ? 85 : overallScore * 1.2,
      riskFactors: [],
      recommendations
    };

    await exam.save();

    res.json({
      success: true,
      readiness: {
        overall: overallScore,
        subjectWise: subjectReadiness,
        daysRemaining,
        burnoutRisk,
        recommendations,
        predictions: exam.predictions
      }
    });
  } catch (error) {
    console.error('Calculate readiness error:', error);
    res.status(500).json({ message: 'Failed to calculate readiness', error: error.message });
  }
};

export const simulateScenario = async (req, res) => {
  try {
    const { additionalHours, targetDays } = req.body;
    
    if (!additionalHours || !targetDays) {
      return res.status(400).json({ message: 'Additional hours and target days are required' });
    }
    
    console.log('Request body:', req.body);
    console.log('Additional hours:', additionalHours);
    console.log('Target days:', targetDays);
    
    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const currentScore = exam.readinessScore?.overall || 50;
    const hoursPerDay = parseInt(additionalHours) / parseInt(targetDays);
    
    console.log('Parsed values - Hours:', parseInt(additionalHours), 'Days:', parseInt(targetDays));
    
    // Simple improvement calculation
    let improvement = Math.min(25, hoursPerDay * 3);
    const projectedScore = Math.min(100, currentScore + improvement);

    const recommendations = [
      // Study intensity based
      hoursPerDay > 8 ? 'Reduce daily hours to prevent burnout' : hoursPerDay < 2 ? 'Increase daily study time for better results' : 'Maintain current study pace',
      
      // Performance based
      projectedScore > 85 ? 'Excellent progress! Focus on maintaining consistency' : 
      projectedScore > 70 ? 'Good improvement, target weak subject areas' : 
      projectedScore > 55 ? 'Moderate progress, increase practice sessions' : 
      'Intensive revision needed across all topics',
      
      // Random varied recommendations
      Math.random() > 0.5 ? 'Create summary notes for quick revision' : 'Practice past exam papers regularly',
      Math.random() > 0.5 ? 'Form study groups for better understanding' : 'Use active recall techniques while studying',
      Math.random() > 0.5 ? 'Take mock tests to improve time management' : 'Focus on conceptual clarity over memorization'
    ];

    const simulation = {
      projectedScore: Math.round(projectedScore),
      improvement: Math.round(improvement),
      recommendations: recommendations.slice(0, 3), // Take first 3
      createdAt: new Date()
    };

    // Store simulation in exam
    const simulationData = {
      projectedScore: simulation.projectedScore,
      improvement: simulation.improvement,
      recommendations: simulation.recommendations,
      createdAt: simulation.createdAt,
      examName: exam.name,
      studyHours: parseInt(additionalHours),
      targetDays: parseInt(targetDays)
    };
    
    console.log('Simulation data to store:', simulationData);
    
    // Add to simulations array
    exam.simulations = exam.simulations || [];
    exam.simulations.push(simulationData);
    
    // Mark the simulations field as modified for Mongoose
    exam.markModified('simulations');
    
    console.log('Simulations array after push:', exam.simulations);
    console.log('Array length:', exam.simulations.length);
    
    // Also keep as lastSimulation for backward compatibility
    exam.lastSimulation = simulationData;
    
    console.log('Storing simulation:', simulationData);
    await exam.save();
    console.log('Exam saved successfully');

    res.json({ success: true, simulation });
  } catch (error) {
    console.error('Simulate scenario error:', error);
    res.status(500).json({ message: 'Failed to run simulation', error: error.message });
  }
};

export const getWeeklyPlan = async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('subjects.subjectId');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Return existing plan if available
    if (exam.weeklyPlan) {
      return res.json({ success: true, weeklyPlan: exam.weeklyPlan });
    }

    res.json({ success: true, weeklyPlan: null });
  } catch (error) {
    console.error('Get weekly plan error:', error);
    res.status(500).json({ message: 'Failed to get weekly plan', error: error.message });
  }
};

export const generateWeeklyPlan = async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('subjects.subjectId');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const daysRemaining = Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));

    const weeklyPlan = [];
    
    for (let week = 1; week <= Math.min(weeksRemaining, 4); week++) {
      const weekPlan = {
        week,
        startDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + week * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subjects: [],
        totalHours: 0,
        focus: week <= 2 ? 'Content Coverage' : 'Revision & Practice'
      };

      // Get subject names
      const subjects = exam.subjects.slice(0, 3).map((s, index) => {
        const hours = [12, 8, 6][index] || 4;
        weekPlan.totalHours += hours;
        return {
          name: s.subjectId?.name || `Subject ${index + 1}`,
          hours,
          priority: ['High', 'Medium', 'Low'][index] || 'Low',
          tasks: week <= 2 ? 
            ['Complete remaining topics', 'Practice problems', 'Make notes'] :
            ['Revision', 'Mock tests', 'Doubt clearing']
        };
      });

      weekPlan.subjects = subjects;
      weeklyPlan.push(weekPlan);
    }

    // Store plan in exam
    exam.weeklyPlan = weeklyPlan;
    await exam.save();

    res.json({ success: true, weeklyPlan });
  } catch (error) {
    console.error('Generate weekly plan error:', error);
    res.status(500).json({ message: 'Failed to generate weekly plan', error: error.message });
  }
};

export const savePlan = async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const planData = req.body;
    console.log('Saving plan data:', planData);
    
    // Initialize allPlans if it doesn't exist
    exam.allPlans = exam.allPlans || [];
    exam.allPlans.unshift(planData);
    
    // Keep only last 10 plans
    if (exam.allPlans.length > 10) {
      exam.allPlans = exam.allPlans.slice(0, 10);
    }
    
    exam.markModified('allPlans');
    console.log('Saving exam with plans:', exam.allPlans.length);
    await exam.save();
    console.log('Plan saved successfully');

    res.json({ success: true, message: 'Plan saved successfully' });
  } catch (error) {
    console.error('Save plan error:', error);
    res.status(500).json({ message: 'Failed to save plan', error: error.message });
  }
};