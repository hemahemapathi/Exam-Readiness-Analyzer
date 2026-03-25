import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService, subjectService } from '../../services';
import { useToast } from '../../context/ToastContext';
import './ExamDetail.css';

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [exam, setExam] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [simForm, setSimForm] = useState({ additionalHours: '', targetDays: '' });

  useEffect(() => {
    if (id) {
      loadExam();
      loadStoredData();
    }
  }, [id]);

  const loadStoredData = async () => {
    try {
      // Load stored simulation and weekly plan
      const [simRes, planRes] = await Promise.all([
        examService.getSimulation(id).catch(() => null),
        examService.getWeeklyPlan(id).catch(() => null)
      ]);
      
      if (simRes?.data?.simulation) {
        setSimulation(simRes.data.simulation);
      }
      if (planRes?.data?.weeklyPlan) {
        setWeeklyPlan(planRes.data.weeklyPlan);
      }
    } catch (error) {
      // Ignore errors for optional data
    }
  };

  const loadExam = async () => {
    try {
      const res = await examService.getById(id);
      setExam(res.data.exam);
    } catch (error) {
      showError('Failed to load exam details');
    } finally {
      setLoading(false);
    }
  };

  const getReadinessStatus = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  };

  const getScoreClass = (score) => {
    if (score >= 75) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
  };

  const calculateReadiness = async () => {
    setCalculating(true);
    try {
      const res = await examService.calculateReadiness(id);
      console.log('Readiness response:', res.data);
      setReadiness(res.data.readiness);
      success('Readiness calculated successfully');
      await loadExam(); // Reload exam data
    } catch (error) {
      console.error('Calculate readiness error:', error);
      showError('Failed to calculate readiness');
    } finally {
      setCalculating(false);
    }
  };

  const loadWeeklyPlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await examService.generateWeeklyPlan(id);
      setWeeklyPlan(res.data.weeklyPlan);
      success('Weekly plan generated successfully');
    } catch (error) {
      showError('Failed to generate weekly plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  const runSimulation = async () => {
    console.log('Starting simulation with:', simForm);
    
    const hours = parseInt(simForm.additionalHours);
    const days = parseInt(simForm.targetDays);
    
    if (!hours || !days || hours <= 0 || days <= 0) {
      showError('Please enter valid positive numbers for both fields');
      return;
    }
    
    setSimulating(true);
    try {
      console.log('Calling simulate API for exam:', id);
      const res = await examService.simulate(id, {
        additionalHours: hours,
        targetDays: days
      });
      console.log('Simulation response:', res.data);
      setSimulation(res.data.simulation);
      success('Simulation completed successfully');
    } catch (error) {
      console.error('Simulation error:', error);
      showError(`Failed to run simulation: ${error.response?.data?.message || error.message}`);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading Exam Details...</p></div>;
  if (!exam) return <div className="loading">Exam not found</div>;

  const daysRemaining = Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/exams')}>← Back</button>
      <h1>{exam.name}</h1>
      <div className="exam-info">
        <p>Date: {new Date(exam.examDate).toLocaleDateString()}</p>
        <p>Days Remaining: {daysRemaining}</p>
        <p>Total Marks: {exam.totalMarks}</p>
        <p>Passing Marks: {exam.passingMarks}</p>
      </div>

      <div className="readiness-section">
        <div className="readiness-header">
          <h2>Readiness Score: {readiness?.overall || exam.readinessScore?.overall || 0}%</h2>
          <button className="btn-calculate" onClick={calculateReadiness} disabled={calculating}>
            {calculating ? 'Calculating...' : 'Calculate Readiness'}
          </button>
        </div>
        
        {readiness && (
          <div className="readiness-details">
            <h3>Subject-wise Readiness</h3>
            {readiness.subjectWise?.map(s => (
              <div key={s.subjectId} className="subject-item">
                <div className="subject-info">
                  <span className="subject-name">{s.name}</span>
                  <span className="subject-score">{s.score}%</span>
                </div>
                <div className="subject-breakdown">
                  <span>Completion: {s.breakdown?.completion || 0}%</span>
                  <span>Confidence: {s.breakdown?.confidence || 0}%</span>
                  <span>Consistency: {s.breakdown?.consistency || 0}%</span>
                </div>
              </div>
            ))}
            
            <div className="other-info">
              <p><strong>Burnout Risk:</strong> {readiness.burnoutRisk?.risk || 'Low'}</p>
              
              <div className="recommendations">
                <strong>Recommendations:</strong>
                <ul>
                  {readiness.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="simulation-section">
        <h2>Study Scenario Simulation</h2>
        
        {exam.lastSimulation ? (
          <div className="recent-result">
            <div>
              <h4>Recent Simulation:</h4>
              <p>Projected Score: <strong>{exam.lastSimulation.projectedScore}%</strong> | Improvement: <strong>+{exam.lastSimulation.improvement}%</strong></p>
            </div>
            <button className="btn-view-all" onClick={() => navigate('/simulations')}>View All Simulations</button>
          </div>
        ) : (
          <div className="no-data">
            <p>No simulations yet.</p>
            <button className="btn-view-all" onClick={() => navigate('/simulations')}>Create Simulation</button>
          </div>
        )}
      </div>

      <div className="weekly-plan-section">
        <h2>Weekly Study Plan</h2>
        
        {exam.weeklyPlan ? (
          <div className="recent-result">
            <div>
              <h4>Current Plan:</h4>
              <p>{exam.weeklyPlan.length} weeks planned | Latest: {exam.weeklyPlan[0]?.focus}</p>
            </div>
            <button className="btn-view-all" onClick={() => navigate('/plans')}>View All Plans</button>
          </div>
        ) : (
          <div className="no-data">
            <p>No study plan yet.</p>
            <button className="btn-view-all" onClick={() => navigate('/plans')}>Create Plan</button>
          </div>
        )}
        
        {exam.weeklyPlan && (
          <div className="plan-preview">
            <h4>Plan Preview (First 2 weeks):</h4>
            {exam.weeklyPlan.slice(0, 2).map(week => (
              <div key={week.week} className="week-card-mini">
                <strong>Week {week.week}:</strong> {week.focus} ({week.totalHours}h)
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}