import { useState, useEffect } from 'react';
import { practiceTestService, examService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Clock, Target, Play, Trash2 } from 'lucide-react';
import './PracticeTests.css';

export default function PracticeTests() {
  const { success, error: showError } = useToast();
  const [practiceTests, setPracticeTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [skippedTests, setSkippedTests] = useState([]);
  const [activeTab, setActiveTab] = useState('completed');
  const [exams, setExams] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    examId: '',
    difficulty: '',
    questionCount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitTest = async () => {
    if (!currentTest) return;
    
    try {
      const timeTaken = (currentTest.timeLimit * 60) - timeLeft;
      const answerArray = currentTest.questions.map((_, index) => answers[index] ?? -1);
      
      await practiceTestService.submit(currentTest._id, {
        answers: answerArray,
        timeTaken
      });
      
      success('Test submitted successfully!');
      setCurrentTest(null);
      setAnswers({});
      setTimeLeft(0);
      loadData();
    } catch (error) {
      showError('Failed to submit test');
    }
  };

  useEffect(() => {
    let timer;
    if (currentTest && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentTest, timeLeft]);

  const loadData = async () => {
    try {
      const [testsRes, examsRes] = await Promise.all([
        practiceTestService.getAll(),
        examService.getAll()
      ]);
      const allTests = testsRes.data.practiceTests;
      console.log('All tests:', allTests.map(t => ({ id: t._id, status: t.status })));
      setPracticeTests(allTests);
      const completed = allTests.filter(test => test.status === 'completed');
      const skipped = allTests.filter(test => test.status === 'skipped');
      console.log('Completed tests:', completed.length, 'Skipped tests:', skipped.length);
      setCompletedTests(completed);
      setSkippedTests(skipped);
      setExams(examsRes.data.exams);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const res = await practiceTestService.create(formData);
      setCurrentTest(res.data.practiceTest);
      setTimeLeft(res.data.practiceTest.timeLimit * 60);
      setAnswers({});
      setShowCreateForm(false);
      success('Practice test started!');
    } catch (error) {
      showError('Failed to create practice test');
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSkipTest = async () => {
    setShowSkipConfirm(true);
  };

  const confirmSkip = async () => {
    try {
      const answerArray = currentTest.questions.map((_, index) => answers[index] ?? -1);
      const submitData = {
        answers: answerArray,
        timeTaken: (currentTest.timeLimit * 60) - timeLeft,
        status: 'skipped'
      };
      console.log('Skipping test with data:', submitData);
      await practiceTestService.submit(currentTest._id, submitData);
      success('Test skipped successfully!');
      setCurrentTest(null);
      setAnswers({});
      setTimeLeft(0);
      setShowSkipConfirm(false);
      loadData();
    } catch (error) {
      console.error('Skip error:', error);
      showError('Failed to skip test');
    }
  };



  const handleDeleteTest = async (testId) => {
    setSelectedTest(null);
    setShowDeleteConfirm(testId);
  };

  const handleViewTest = (test) => {
    if (test.status === 'completed') {
      setSelectedTest(test);
    }
  };

  const confirmDelete = async () => {
    try {
      console.log('Attempting to delete test:', showDeleteConfirm);
      const response = await practiceTestService.delete(showDeleteConfirm);
      console.log('Delete response:', response);
      success('Practice test deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete practice test');
    } finally {
      setShowDeleteConfirm(null);
      setSelectedTest(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  if (currentTest) {
    return (
      <div className="practice-test-active">
        <div className="test-header">
          <h2>Practice Test</h2>
          <div className="test-info">
            <span className="time-left">
              <Clock size={16} /> {formatTime(timeLeft)}
            </span>
            <span className="progress">
              {Object.keys(answers).length}/{currentTest.totalQuestions}
            </span>
          </div>
        </div>

        <div className="questions-container">
          {currentTest.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <h3>Question {qIndex + 1}</h3>
              <p className="question-text">{question.question}</p>
              <div className="options">
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} className="option-label">
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="test-actions">
          <button className="btn-secondary" onClick={handleSkipTest}>
            Skip Test
          </button>
          <button className="btn-primary" onClick={handleSubmitTest}>
            Submit Test
          </button>
        </div>

        {showSkipConfirm && (
          <div className="modal-overlay" onClick={() => setShowSkipConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Skip Test</h3>
              <p>Are you sure you want to skip this test? Your current answers will be submitted.</p>
              <div className="modal-actions">
                <button className="btn-primary" onClick={confirmSkip}>Yes, Skip</button>
                <button className="btn-secondary" onClick={() => setShowSkipConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="practice-tests-page">
      <div className="page-header">
        <h1>Practice Tests</h1>
        <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
          <Play size={16} /> Start New Test
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`ta ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Tests ({completedTests.length})
          </button>
          <button 
            className={`tab ${activeTab === 'skipped' ? 'active' : ''}`}
            onClick={() => setActiveTab('skipped')}
          >
            Skipped Tests ({skippedTests.length})
          </button>
        </div>
      </div>

      <div className="tests-grid">
        {(activeTab === 'completed' ? completedTests : skippedTests).map(test => (
          <div 
            key={test._id} 
            className={`test-card ${test.status === 'completed' ? 'clickable' : ''}`}
            onClick={() => handleViewTest(test)}
          >
            <div className="test-header">
              <h3>{test.examId?.name}</h3>
              <span className={`status-badge ${test.status}`}>
                {test.status}
              </span>
            </div>
            <div className="test-stats">
              <div className="stat">
                <Target size={16} />
                <span>Score: {test.score}%</span>
              </div>
              <div className="stat">
                <Clock size={16} />
                <span>Time: {Math.floor(test.timeTaken / 60)}m</span>
              </div>
            </div>
            <div className="test-details">
              <p>Questions: {test.totalQuestions}</p>
              <p>Difficulty: {test.difficulty}</p>
              <p>Date: {new Date(test.createdAt).toLocaleDateString()}</p>
              <button 
                className="btn-danger btn-small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTest(test._id);
                }}
                title="Delete test"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTest && (
        <div className="modal-overlay" onClick={() => setSelectedTest(null)}>
          <div className="modal-content test-details-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              Test Results - {selectedTest.examId?.name}
              <button className="close-button" onClick={() => setSelectedTest(null)}>
                ×
              </button>
            </h3>
            <div className="test-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{selectedTest.score}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Correct:</span>
                  <span className="stat-value correct">{selectedTest.questions?.filter(q => q.isCorrect).length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Wrong:</span>
                  <span className="stat-value wrong">{selectedTest.questions?.filter(q => !q.isCorrect && q.userAnswer !== undefined).length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unanswered:</span>
                  <span className="stat-value unanswered">{selectedTest.questions?.filter(q => q.userAnswer === undefined || q.userAnswer === -1).length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">{Math.floor(selectedTest.timeTaken / 60)}m {selectedTest.timeTaken % 60}s</span>
                </div>
              </div>
            </div>
            <div className="questions-review">
              <h4>Question Review</h4>
              <div className="questions-list">
                {selectedTest.questions?.map((question, index) => (
                  <div key={index} className={`question-review ${question.isCorrect ? 'correct' : question.userAnswer === -1 ? 'unanswered' : 'wrong'}`}>
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <span className={`result-badge ${question.isCorrect ? 'correct' : question.userAnswer === -1 ? 'unanswered' : 'wrong'}`}>
                        {question.isCorrect ? '✓' : question.userAnswer === -1 ? '—' : '✗'}
                      </span>
                    </div>
                    <p className="question-text">{question.question}</p>
                    <div className="answer-options">
                      {question.options?.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`option ${
                            optIndex === question.correctAnswer ? 'correct-answer' : 
                            optIndex === question.userAnswer ? 'user-answer' : ''
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedTest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Practice Test</h3>
            <p>Are you sure you want to delete this practice test?</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={confirmDelete}>Yes, Delete</button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Practice Test</h3>
            <form onSubmit={handleCreateTest}>
              <div className="form-group">
                <label>Select Exam</label>
                <select
                  value={formData.examId}
                  onChange={(e) => setFormData({...formData, examId: e.target.value})}
                  required
                >
                  <option value="">Choose an exam</option>
                  {exams.map(exam => (
                    <option key={exam._id} value={exam._id}>{exam.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  required
                >
                  <option value="">Choose your level</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Questions</label>
                <input
                  type="number"
                  placeholder="Enter number of questions"
                  min="5"
                  max="50"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Start Test</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}