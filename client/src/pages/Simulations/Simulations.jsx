import { useState, useEffect } from 'react';
import { examService } from '../../services';
import { useToast } from '../../context/ToastContext';
import './Simulations.css';

export default function Simulations() {
  const { success, error: showError } = useToast();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simForm, setSimForm] = useState({ additionalHours: '', targetDays: '' });
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      loadSimulations();
    }
  }, [selectedExam]);

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const loadExams = async () => {
    try {
      const res = await examService.getAll();
      setExams(res.data.exams);
      if (res.data.exams.length > 0) {
        setSelectedExam(res.data.exams[0]);
      }
    } catch (error) {
      showError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const loadSimulations = async () => {
    if (!selectedExam) return;
    try {
      const res = await examService.getById(selectedExam._id);
      console.log('Full exam object:', res.data.exam);
      console.log('Simulations array:', res.data.exam.simulations);
      console.log('LastSimulation:', res.data.exam.lastSimulation);
      const exam = res.data.exam;
      
      // Load all simulations from simulations array
      if (exam.simulations && exam.simulations.length > 0) {
        console.log('Found simulations:', exam.simulations);
        setSimulations([...exam.simulations].reverse()); // Show newest first
      } else if (exam.lastSimulation) {
        console.log('Found lastSimulation:', exam.lastSimulation);
        setSimulations([exam.lastSimulation]);
      } else {
        console.log('No simulations found');
        setSimulations([]);
      }
    } catch (error) {
      console.error('Load simulations error:', error);
      setSimulations([]);
    }
  };

  const runSimulation = async () => {
    if (!selectedExam) return;
    const hours = parseInt(simForm.additionalHours);
    const days = parseInt(simForm.targetDays);
    
    if (!hours || !days || hours <= 0 || days <= 0) {
      showError('Please enter valid positive numbers for both fields');
      return;
    }
    
    setSimulating(true);
    try {
      console.log('Running simulation for exam:', selectedExam._id);
      const res = await examService.simulate(selectedExam._id, {
        additionalHours: hours,
        targetDays: days
      });
      console.log('Simulation response:', res.data);
      success('Simulation completed successfully');
      // Reload simulations immediately
      await loadSimulations();
      setSimForm({ additionalHours: '', targetDays: '' });
    } catch (error) {
      console.error('Simulation error:', error);
      showError('Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="simulations-page">
      <h1>Simulations</h1>
      
      <div className="exam-selector">
        <label>Select Exam:</label>
        <select 
          value={selectedExam?._id || ''} 
          onChange={(e) => setSelectedExam(exams.find(exam => exam._id === e.target.value))}
        >
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>{exam.name}</option>
          ))}
        </select>
      </div>
      
      {selectedExam && (
        <>
          <div className="simulate-section">
            <h2>Run New Simulation</h2>
            <div className="sim-form">
              <div className="form-group">
                <label>Additional Study Hours</label>
                <input
                  type="number"
                  placeholder="e.g., 20"
                  value={simForm.additionalHours}
                  onChange={(e) => setSimForm({ ...simForm, additionalHours: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Target Days</label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={simForm.targetDays}
                  onChange={(e) => setSimForm({ ...simForm, targetDays: e.target.value })}
                />
              </div>
              <button 
                onClick={runSimulation} 
                disabled={simulating || !simForm.additionalHours || !simForm.targetDays}
              >
                {simulating ? 'Simulating...' : 'Simulate'}
              </button>
            </div>
          </div>

          <div className="simulations-list">
            <h2>Your Simulations</h2>
            {simulations.length === 0 ? (
              <p>No simulations run yet. Create your first simulation above!</p>
            ) : (
              simulations.map((sim, index) => (
                <div key={index} className="simulation-card">
                  <div className="sim-header">
                    <h3>Simulation #{simulations.length - index}</h3>
                    <div className="header-right">
                      <span className="sim-date">{sim.createdAt ? new Date(sim.createdAt).toLocaleDateString() : 'Today'}</span>
                      <button className="expand-btn" onClick={() => toggleCard(index)}>
                        {expandedCards[index] ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                  <div className="sim-details">
                    <p><strong>Exam:</strong> {sim.examName || selectedExam?.name}</p>
                    <p><strong>Study Hours:</strong> {sim.studyHours || 'N/A'}h | <strong>Target Days:</strong> {sim.targetDays || 'N/A'} days</p>
                  </div>
                  <div className="sim-results">
                    <div className="result-item">
                      <span className="label">Projected Score:</span>
                      <span className="value">{sim.projectedScore}%</span>
                    </div>
                    <div className="result-item">
                      <span className="label">Improvement:</span>
                      <span className="value">+{sim.improvement}%</span>
                    </div>
                  </div>
                  {expandedCards[index] && (
                    <div className="recommendations">
                      <strong>Recommendations:</strong>
                      <ul>
                        {sim.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}