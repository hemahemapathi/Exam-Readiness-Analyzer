import PracticeTest from '../models/PracticeTest.js';
import Exam from '../models/Exam.js';
import Subject from '../models/Subject.js';

const questionBank = {
  Mathematics: {
    easy: [
      {
        question: "What is 15 + 27?",
        options: ["42", "41", "43", "40"],
        correctAnswer: 0
      },
      {
        question: "What is the square root of 64?",
        options: ["8", "6", "7", "9"],
        correctAnswer: 0
      },
      {
        question: "What is 12 × 8?",
        options: ["96", "88", "104", "92"],
        correctAnswer: 0
      }
    ],
    medium: [
      {
        question: "Solve for x: 2x + 5 = 15",
        options: ["5", "10", "7", "3"],
        correctAnswer: 0
      },
      {
        question: "What is the area of a circle with radius 5?",
        options: ["25π", "10π", "5π", "15π"],
        correctAnswer: 0
      },
      {
        question: "If f(x) = 2x + 3, what is f(4)?",
        options: ["11", "9", "10", "8"],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: "Find the derivative of f(x) = x³ + 2x² - 5x + 1",
        options: ["3x² + 4x - 5", "x² + 4x - 5", "3x² + 2x - 5", "3x² + 4x + 5"],
        correctAnswer: 0
      },
      {
        question: "Solve the quadratic equation: x² - 5x + 6 = 0",
        options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 2, -3"],
        correctAnswer: 0
      }
    ]
  },
  Science: {
    easy: [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "H2SO4"],
        correctAnswer: 0
      },
      {
        question: "How many bones are in the adult human body?",
        options: ["206", "205", "207", "204"],
        correctAnswer: 0
      },
      {
        question: "What planet is closest to the Sun?",
        options: ["Mercury", "Venus", "Earth", "Mars"],
        correctAnswer: 0
      }
    ],
    medium: [
      {
        question: "What is Newton's second law of motion?",
        options: ["F = ma", "F = mv", "F = m/a", "F = ma²"],
        correctAnswer: 0
      },
      {
        question: "What is the pH of pure water?",
        options: ["7", "6", "8", "0"],
        correctAnswer: 0
      },
      {
        question: "Which organelle is known as the powerhouse of the cell?",
        options: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: "What is the molecular formula for glucose?",
        options: ["C6H12O6", "C6H6O6", "C12H22O11", "C2H6O"],
        correctAnswer: 0
      },
      {
        question: "According to Heisenberg's uncertainty principle, what cannot be simultaneously determined?",
        options: ["Position and momentum", "Energy and time", "Mass and velocity", "Force and acceleration"],
        correctAnswer: 0
      }
    ]
  },
  Physics: {
    easy: [
      {
        question: "What is the unit of force?",
        options: ["Newton", "Joule", "Watt", "Pascal"],
        correctAnswer: 0
      },
      {
        question: "What is the speed of light in vacuum?",
        options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁷ m/s", "3 × 10⁹ m/s"],
        correctAnswer: 0
      }
    ],
    medium: [
      {
        question: "What is the formula for kinetic energy?",
        options: ["½mv²", "mv²", "½m²v", "m²v²"],
        correctAnswer: 0
      },
      {
        question: "What is Ohm's law?",
        options: ["V = IR", "V = I/R", "V = I + R", "V = I - R"],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: "What is the Schrödinger equation used for?",
        options: ["Quantum mechanics", "Relativity", "Thermodynamics", "Electromagnetism"],
        correctAnswer: 0
      }
    ]
  },
  Chemistry: {
    easy: [
      {
        question: "What is the atomic number of carbon?",
        options: ["6", "12", "8", "14"],
        correctAnswer: 0
      },
      {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correctAnswer: 0
      }
    ],
    medium: [
      {
        question: "What is the molecular weight of water (H2O)?",
        options: ["18 g/mol", "16 g/mol", "20 g/mol", "22 g/mol"],
        correctAnswer: 0
      },
      {
        question: "What type of bond exists in a water molecule?",
        options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: "What is the hybridization of carbon in methane (CH4)?",
        options: ["sp³", "sp²", "sp", "sp³d"],
        correctAnswer: 0
      }
    ]
  },
  Biology: {
    easy: [
      {
        question: "What is the basic unit of life?",
        options: ["Cell", "Tissue", "Organ", "Organism"],
        correctAnswer: 0
      },
      {
        question: "Which blood type is known as the universal donor?",
        options: ["O negative", "AB positive", "A positive", "B negative"],
        correctAnswer: 0
      }
    ],
    medium: [
      {
        question: "What is the process by which plants make their own food?",
        options: ["Photosynthesis", "Respiration", "Transpiration", "Fermentation"],
        correctAnswer: 0
      },
      {
        question: "How many chambers does a human heart have?",
        options: ["4", "2", "3", "6"],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: "What is the role of ribosomes in protein synthesis?",
        options: ["Translation", "Transcription", "Replication", "Mutation"],
        correctAnswer: 0
      }
    ]
  }
};

const generateQuestions = (subjects, difficulty, count = 10) => {
  console.log('Generating questions for subjects:', subjects.map(s => s.name));
  console.log('Difficulty:', difficulty, 'Count:', count);
  
  const questions = [];
  const availableSubjects = subjects.filter(s => questionBank[s.name]);
  
  console.log('Available subjects in question bank:', availableSubjects.map(s => s.name));
  
  if (availableSubjects.length === 0) {
    console.log('No subjects found in question bank, using generic questions');
    return generateGenericQuestions(subjects, difficulty, count);
  }

  for (let i = 0; i < count; i++) {
    const subject = availableSubjects[i % availableSubjects.length];
    const subjectQuestions = questionBank[subject.name][difficulty] || questionBank[subject.name].medium || questionBank[subject.name].easy;
    
    if (subjectQuestions && subjectQuestions.length > 0) {
      const questionIndex = Math.floor(Math.random() * subjectQuestions.length);
      const selectedQuestion = subjectQuestions[questionIndex];
      
      questions.push({
        question: selectedQuestion.question,
        options: selectedQuestion.options,
        correctAnswer: selectedQuestion.correctAnswer,
        subject: subject.name,
        questionNumber: i + 1
      });
    } else {
      console.log(`No questions found for ${subject.name} at ${difficulty} level`);
      questions.push({
        question: `Sample ${difficulty} question ${i + 1} about ${subject.name}`,
        options: [
          `Correct answer for ${subject.name}`,
          `Option B for ${subject.name}`,
          `Option C for ${subject.name}`,
          `Option D for ${subject.name}`
        ],
        correctAnswer: 0,
        subject: subject.name,
        questionNumber: i + 1
      });
    }
  }
  
  console.log('Final questions generated:', questions.length);
  return questions;
};

const generateGenericQuestions = (subjects, difficulty, count) => {
  console.log('Generating generic questions');
  const questions = [];
  for (let i = 0; i < count; i++) {
    const subject = subjects[i % subjects.length];
    questions.push({
      question: `Sample ${difficulty} question ${i + 1} about ${subject.name}`,
      options: [
        `Correct answer for ${subject.name}`,
        `Option B for ${subject.name}`,
        `Option C for ${subject.name}`,
        `Option D for ${subject.name}`
      ],
      correctAnswer: 0,
      subject: subject.name,
      questionNumber: i + 1
    });
  }
  console.log('Generated generic questions:', questions.length);
  return questions;
};

export const createPracticeTest = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User:', req.user?.id);
    
    const { examId, difficulty = 'medium', questionCount = 10 } = req.body;
    
    if (!examId) {
      console.log('Missing examId');
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    console.log('Looking for exam:', examId);
    const exam = await Exam.findOne({ _id: examId, userId: req.user.id })
      .populate('subjects.subjectId');
    
    console.log('Found exam:', exam ? 'Yes' : 'No');
    console.log('Exam subjects:', exam?.subjects);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get subject details with topics
    const subjectIds = exam.subjects
      .filter(s => s.subjectId && s.subjectId._id)
      .map(s => s.subjectId._id);
    console.log('Subject IDs:', subjectIds);
    
    if (subjectIds.length === 0) {
      // If no subjects found, use default subjects from question bank
      const defaultSubjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology'];
      const questions = [];
      const usedQuestions = new Set();
      
      for (let i = 0; i < questionCount; i++) {
        const subjectName = defaultSubjects[i % defaultSubjects.length];
        const subjectQuestions = questionBank[subjectName][difficulty] || questionBank[subjectName].medium;
        
        if (subjectQuestions && subjectQuestions.length > 0) {
          let attempts = 0;
          let selectedQuestion;
          let questionKey;
          
          do {
            const questionIndex = Math.floor(Math.random() * subjectQuestions.length);
            selectedQuestion = subjectQuestions[questionIndex];
            questionKey = `${subjectName}-${selectedQuestion.question}`;
            attempts++;
          } while (usedQuestions.has(questionKey) && attempts < 10);
          
          if (!usedQuestions.has(questionKey)) {
            usedQuestions.add(questionKey);
            questions.push({
              question: selectedQuestion.question,
              options: selectedQuestion.options,
              correctAnswer: selectedQuestion.correctAnswer,
              subject: subjectName,
              questionNumber: i + 1
            });
          }
        }
      }
      
      const timeLimit = Math.max(questionCount * 1, 5); // 1 minute per question, minimum 5 minutes
      const practiceTest = await PracticeTest.create({
        userId: req.user.id,
        examId,
        questions,
        totalQuestions: questionCount,
        timeLimit,
        difficulty
      });

      console.log('Created practice test with default questions:', practiceTest._id);
      return res.status(201).json({ success: true, practiceTest });
    }
    
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    console.log('Found subjects:', subjects.length);

    if (subjects.length === 0) {
      return res.status(400).json({ message: 'No subjects found for this exam' });
    }

    const questions = generateQuestions(subjects, difficulty, questionCount);
    console.log('Generated questions:', questions.length);
    
    const timeLimit = Math.max(questionCount * 1, 5); // 1 minute per question, minimum 5 minutes

    const practiceTest = await PracticeTest.create({
      userId: req.user.id,
      examId,
      questions,
      totalQuestions: questionCount,
      timeLimit,
      difficulty
    });

    console.log('Created practice test:', practiceTest._id);
    res.status(201).json({ success: true, practiceTest });
  } catch (error) {
    console.error('Practice test creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const submitPracticeTest = async (req, res) => {
  try {
    console.log('Full request body:', req.body);
    const { answers, timeTaken, status } = req.body;
    console.log('Extracted values:', { answers: answers?.length, timeTaken, status });
    
    const practiceTest = await PracticeTest.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!practiceTest) {
      return res.status(404).json({ message: 'Practice test not found' });
    }

    let correctAnswers = 0;
    practiceTest.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      question.userAnswer = userAnswer;
      question.isCorrect = userAnswer === question.correctAnswer;
      if (question.isCorrect) correctAnswers++;
    });

    practiceTest.score = Math.round((correctAnswers / practiceTest.totalQuestions) * 100);
    practiceTest.timeTaken = timeTaken;
    practiceTest.status = status === 'skipped' ? 'skipped' : 'completed';

    console.log('About to save with status:', practiceTest.status);
    const savedTest = await practiceTest.save();
    console.log('Saved test status:', savedTest.status);
    res.json({ success: true, practiceTest: savedTest });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePracticeTest = async (req, res) => {
  try {
    console.log('Deleting practice test:', req.params.id);
    console.log('User ID:', req.user.id);
    
    const practiceTest = await PracticeTest.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!practiceTest) {
      console.log('Practice test not found');
      return res.status(404).json({ message: 'Practice test not found' });
    }

    console.log('Practice test deleted successfully');
    res.json({ success: true, message: 'Practice test deleted successfully' });
  } catch (error) {
    console.error('Delete practice test error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPracticeTests = async (req, res) => {
  try {
    const practiceTests = await PracticeTest.find({ userId: req.user.id })
      .populate('examId', 'name')
      .sort({ createdAt: -1 });

    console.log('Retrieved tests:', practiceTests.map(t => ({ id: t._id, status: t.status })));
    res.json({ success: true, practiceTests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};