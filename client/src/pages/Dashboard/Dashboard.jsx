import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { examService, studySessionService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { error: showError } = useToast();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsRes, statsRes] = await Promise.all([
        examService.getAll(),
        studySessionService.getStats(7)
      ]);
      setExams(examsRes.data.exams);
      setStats(statsRes.data.stats);
    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading Dashboard...</p></div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3>Total Study Hours (7 days)</h3>
            <p className="stat-value">{stats?.totalHours || 0}h</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3>Avg Hours/Day</h3>
            <p className="stat-value">{stats?.avgHoursPerDay?.toFixed(1) || 0}h</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3>Total Sessions</h3>
            <p className="stat-value">{stats?.totalSessions || 0}</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3>Upcoming Exams</h3>
            <p className="stat-value">{exams.length}</p>
          </div>
        </div>
      </div>

      {stats?.dailyHours && (
        <div className="chart-container">
          <h3>Daily Study Hours</h3>
          <div style={{ width: '100%', overflowX: 'hidden' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyHours} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="exams-list">
        <h3>Your Exams</h3>
        {exams.length === 0 ? (
          <div className="empty-state">
            <p>No exams created yet.</p>
            <Link to="/exams" className="btn-primary">Create Your First Exam</Link>
          </div>
        ) : (
          <div className="row g-3">
            {exams.map(exam => {
              const daysRemaining = Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24));
              const readiness = exam.readinessScore?.overall || 0;
              return (
                <div key={exam._id} className="col-12 col-md-6 col-lg-4">
                  <div className="exam-card-dashboard">
                  <div className="exam-card-header">
                    <h4>{exam.name}</h4>
                    <span className={`readiness-badge ${readiness >= 75 ? 'badge-good' : readiness >= 50 ? 'badge-average' : 'badge-poor'}`}>
                      {readiness}%
                    </span>
                  </div>
                  <div className="exam-card-body">
                    <div className="exam-info-row">
                      <span className="info-label">📅 Date:</span>
                      <span className="info-value">{new Date(exam.examDate).toLocaleDateString()}</span>
                    </div>
                    <div className="exam-info-row">
                      <span className="info-label">⏰ Days Left:</span>
                      <span className={`info-value ${daysRemaining <= 7 ? 'text-urgent' : ''}`}>{daysRemaining} days</span>
                    </div>
                    <div className="exam-info-row">
                      <span className="info-label">📊 Type:</span>
                      <span className="info-value">{exam.examType}</span>
                    </div>
                  </div>
                  <div className="exam-card-footer">
                    <span className={`status-text ${readiness >= 75 ? 'status-good' : readiness >= 50 ? 'status-average' : 'status-poor'}`}>
                      {readiness >= 75 ? '✓ Well Prepared' : readiness >= 50 ? '⚠ Needs Work' : '⚠ Critical'}
                    </span>
                    <Link to={`/exams/${exam._id}`} className="view-details-btn">View Details</Link>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}