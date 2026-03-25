import { useState, useEffect } from 'react';
import { examService } from '../../services';
import { useToast } from '../../context/ToastContext';
import './Plans.css';

export default function Plans() {
  const { success, error: showError } = useToast();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [planType, setPlanType] = useState('weekly');
  const [expandedPlans, setExpandedPlans] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [showPlanTypeModal, setShowPlanTypeModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      loadPlans();
    }
  }, [selectedExam]);

  const viewPlan = (plan, type) => {
    setSelectedPlan({ plan, type });
    setShowModal(true);
  };

  const handlePlanTypeSelect = (type) => {
    setPlanType(type);
    setShowPlanTypeModal(false);
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    setShowExamModal(false);
  };

  const generateDetailedPlan = (plan, type) => {
    if (type === 'monthly') {
      const days = [];
      const activities = [
        'Deep study & concept building', 'Practice & problem solving', 'Review & memorization',
        'Mock tests & assessment', 'Revision & doubt clearing', 'Group study & discussion'
      ];
      
      for (let day = 1; day <= 30; day++) {
        const weekIndex = Math.floor((day - 1) / 7);
        const week = plan[weekIndex] || plan[0];
        const activity = activities[day % activities.length];
        
        days.push({
          day,
          focus: day <= 10 ? 'Foundation Building' : day <= 20 ? 'Practice & Application' : 'Revision & Testing',
          activity,
          subjects: week.subjects?.map(s => ({
            ...s,
            hours: Math.ceil(s.hours / 7) + (day % 3), // Vary hours
            activity: day % 2 === 0 ? 'Theory' : 'Practice'
          })) || [],
          totalHours: Math.ceil((week.totalHours || 8) / 7) + (day % 2)
        });
      }
      return days;
    } else if (type === 'weekly') {
      const days = [];
      const dailyFocus = [
        'New concepts & theory', 'Practice problems', 'Review & revision',
        'Mock tests', 'Doubt clearing', 'Group study', 'Self assessment'
      ];
      
      plan.forEach((week, weekIndex) => {
        for (let day = 1; day <= 7; day++) {
          days.push({
            week: week.week,
            day,
            dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1],
            focus: dailyFocus[day - 1],
            subjects: week.subjects?.map(s => ({
              ...s,
              hours: Math.ceil(s.hours / 7) + (day % 2),
              activity: day <= 3 ? 'Learning' : day <= 5 ? 'Practice' : 'Review'
            })) || [],
            totalHours: Math.ceil((week.totalHours || 8) / 7) + (day % 3)
          });
        }
      });
      return days;
    } else if (type === '10days') {
      const days = [];
      const activities = [
        'Intensive learning', 'Problem solving', 'Concept revision',
        'Practice tests', 'Weak area focus', 'Mock exams'
      ];
      
      for (let day = 1; day <= 10; day++) {
        const week = plan[0] || {};
        days.push({
          day,
          focus: day <= 4 ? 'Intensive Learning' : day <= 7 ? 'Practice & Testing' : 'Final Revision',
          activity: activities[day % activities.length],
          subjects: week.subjects?.map(s => ({
            ...s,
            hours: Math.ceil(s.hours / 3) + (day % 2),
            priority: day <= 3 ? 'High' : day <= 7 ? 'Medium' : 'Critical'
          })) || [],
          totalHours: 6 + (day % 3)
        });
      }
      return days;
    }
    return plan;
  };

  const togglePlanExpansion = (index) => {
    setExpandedPlans(prev => ({
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

  const loadPlans = async () => {
    if (!selectedExam) return;
    try {
      const res = await examService.getById(selectedExam._id);
      if (res.data.exam.allPlans) {
        setAllPlans(res.data.exam.allPlans);
      } else {
        setAllPlans([]);
      }
    } catch (error) {
      setAllPlans([]);
    }
  };

  const generatePlan = async () => {
    if (!selectedExam) return;
    setGenerating(true);
    try {
      const res = await examService.generateWeeklyPlan(selectedExam._id);
      const planData = res.data.weeklyPlan;
      
      // Transform plan based on selected type
      let transformedPlan;
      if (planType === 'monthly') {
        transformedPlan = transformToMonthlyPlan(planData);
      } else if (planType === '10days') {
        transformedPlan = transformTo10DaysPlan(planData);
      } else {
        transformedPlan = planData;
      }
      
      const newPlan = { plan: transformedPlan, type: planType, createdAt: new Date() };
      
      // Save to database
      await examService.savePlan(selectedExam._id, newPlan);
      
      setAllPlans(prev => [newPlan, ...prev]);
      setPlans([transformedPlan]);
      success(`${planType} plan generated successfully`);
    } catch (error) {
      showError('Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const transformToMonthlyPlan = (weeklyPlan) => {
    return [{
      week: 1,
      focus: 'Month 1: Complete Coverage & Practice',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalHours: weeklyPlan.reduce((total, week) => total + week.totalHours, 0),
      subjects: weeklyPlan[0]?.subjects?.map(s => ({
        ...s,
        hours: s.hours * 4 // Monthly hours
      })) || []
    }];
  };

  const transformTo10DaysPlan = (weeklyPlan) => {
    const plan = [];
    for (let day = 1; day <= 10; day += 3) {
      plan.push({
        week: Math.ceil(day / 3),
        focus: `Days ${day}-${Math.min(day + 2, 10)}: ${day <= 5 ? 'Learning' : 'Practice'}`,
        startDate: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + Math.min(day + 2, 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalHours: 8,
        subjects: weeklyPlan[0]?.subjects?.map(s => ({
          ...s,
          hours: Math.ceil(s.hours / 2)
        })) || []
      });
    }
    return plan;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="plans-page">
      <h1>Study Plans</h1>
      
      <div className="exam-selector">
        <label>Select Exam:</label>
        <select 
          className="desktop-select"
          value={selectedExam?._id || ''} 
          onChange={(e) => setSelectedExam(exams.find(exam => exam._id === e.target.value))}
        >
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>{exam.name}</option>
          ))}
        </select>
        
        <button 
          className="mobile-select"
          onClick={() => setShowExamModal(true)}
        >
          {selectedExam?.name || 'Select Exam'}
        </button>
      </div>
      
      {selectedExam && (
        <>
          <div className="generate-section">
            <h2>Generate New Plan</h2>
            <div className="plan-options">
              <select 
                className="desktop-select"
                value={planType} 
                onChange={(e) => setPlanType(e.target.value)}
              >
                <option value="weekly">Weekly Plan</option>
                <option value="10days">10 Days Plan</option>
                <option value="monthly">Monthly Plan</option>
                <option value="custom">Custom Plan</option>
              </select>
              
              <button 
                className="mobile-select"
                onClick={() => setShowPlanTypeModal(true)}
              >
                {planType === 'weekly' ? 'Weekly Plan' : 
                 planType === '10days' ? '10 Days Plan' : 
                 planType === 'monthly' ? 'Monthly Plan' : 'Custom Plan'}
              </button>
              
              <button onClick={generatePlan} disabled={generating}>
                {generating ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </div>

          <div className="plans-list">
            <h2>Your Plans</h2>
            {allPlans.length === 0 ? (
              <p>No plans generated yet. Create your first plan above!</p>
            ) : (
              allPlans.map((planItem, index) => (
                <div key={index} className="plan-list-item">
                  <div className="plan-info">
                    <h3>{planItem.type === 'monthly' ? 'Monthly' : planItem.type === '10days' ? '10 Days' : 'Weekly'} Plan</h3>
                    <p>Created: {new Date(planItem.createdAt).toLocaleDateString()}</p>
                    <p>{planItem.plan?.length || 0} periods • {planItem.plan?.reduce((total, week) => total + (week.totalHours || 0), 0) || 0}h total</p>
                  </div>
                  <button 
                    className="view-btn" 
                    onClick={() => viewPlan(planItem.plan, planItem.type)}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Modal */}
          {showModal && selectedPlan && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedPlan.type === 'monthly' ? 'Monthly' : selectedPlan.type === '10days' ? '10 Days' : 'Weekly'} Plan Details</h2>
                  <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
                </div>
                <div className="modal-body">
                  {selectedPlan.type === 'monthly' ? (
                    <div className="daily-plan">
                      {generateDetailedPlan(selectedPlan.plan, selectedPlan.type).map((day, i) => (
                        <div key={i} className="day-item">
                          <h4>Day {day.day}: {day.focus}</h4>
                          <p><strong>Activity:</strong> {day.activity} | <strong>Total Hours:</strong> {day.totalHours}h</p>
                          <div className="day-subjects">
                            {day.subjects?.map((subject, j) => (
                              <span key={j} className="subject-tag">
                                {subject.name} - {subject.activity} ({subject.hours}h)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedPlan.type === 'weekly' ? (
                    <div className="weekly-daily-plan">
                      {generateDetailedPlan(selectedPlan.plan, selectedPlan.type).map((day, i) => (
                        <div key={i} className="day-item">
                          <h4>Week {day.week} - Day {day.day} ({day.dayName})</h4>
                          <p><strong>Focus:</strong> {day.focus} | <strong>Total Hours:</strong> {day.totalHours}h</p>
                          <div className="day-subjects">
                            {day.subjects?.map((subject, j) => (
                              <span key={j} className="subject-tag">
                                {subject.name} - {subject.activity} ({subject.hours}h)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedPlan.type === '10days' ? (
                    <div className="daily-plan">
                      {generateDetailedPlan(selectedPlan.plan, selectedPlan.type).map((day, i) => (
                        <div key={i} className="day-item">
                          <h4>Day {day.day}: {day.focus}</h4>
                          <p><strong>Activity:</strong> {day.activity} | <strong>Total Hours:</strong> {day.totalHours}h</p>
                          <div className="day-subjects">
                            {day.subjects?.map((subject, j) => (
                              <span key={j} className="subject-tag">
                                {subject.name} - {subject.priority} priority ({subject.hours}h)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="weekly-plan">
                      {Array.isArray(selectedPlan.plan) ? selectedPlan.plan.map((week, i) => (
                        <div key={i} className="week-detail">
                          <h4>Week {week.week}: {week.focus}</h4>
                          <p>{week.startDate} to {week.endDate} | {week.totalHours}h total</p>
                          <div className="subjects">
                            {week.subjects?.map((subject, j) => (
                              <div key={j} className="subject-detail">
                                <strong>{subject.name}</strong> - {subject.hours}h ({subject.priority} priority)
                                <ul>
                                  {subject.tasks?.map((task, k) => <li key={k}>{task}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )) : <p>No plan data available</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Mobile Exam Selection Modal */}
          {showExamModal && (
            <div className="modal-overlay" onClick={() => setShowExamModal(false)}>
              <div className="plan-type-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Select Exam</h3>
                <div className="plan-type-options">
                  {exams.map(exam => (
                    <button key={exam._id} onClick={() => handleExamSelect(exam)}>
                      📚 {exam.name}
                    </button>
                  ))}
                </div>
                <button className="cancel-btn" onClick={() => setShowExamModal(false)}>Cancel</button>
              </div>
            </div>
          )}
          
          {/* Mobile Plan Type Modal */}
          {showPlanTypeModal && (
            <div className="modal-overlay" onClick={() => setShowPlanTypeModal(false)}>
              <div className="plan-type-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Select Plan Type</h3>
                <div className="plan-type-options">
                  <button onClick={() => handlePlanTypeSelect('weekly')}>📅 Weekly Plan</button>
                  <button onClick={() => handlePlanTypeSelect('10days')}>⚡ 10 Days Plan</button>
                  <button onClick={() => handlePlanTypeSelect('monthly')}>📆 Monthly Plan</button>
                  <button onClick={() => handlePlanTypeSelect('custom')}>⚙️ Custom Plan</button>
                </div>
                <button className="cancel-btn" onClick={() => setShowPlanTypeModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}