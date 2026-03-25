import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { studySessionService, examService, subjectService } from '../../services';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Calendar, TrendingUp, BookOpen, Clock, Target } from 'lucide-react';
import './Reports.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const { error: showError } = useToast();
  const [period, setPeriod] = useState('daily');
  const [studySessions, setStudySessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      const [sessionsRes, examsRes, subjectsRes] = await Promise.all([
        studySessionService.getAll(),
        examService.getAll(),
        subjectService.getAll()
      ]);
      
      const sessions = sessionsRes.data.studySessions;
      const examsData = examsRes.data.exams;
      const subjectsData = subjectsRes.data.subjects;
      
      console.log('Loaded data:', {
        sessions: sessions.length,
        exams: examsData.length,
        subjects: subjectsData.length
      });
      console.log('Exams data:', examsData);
      console.log('Sessions data:', sessions);
      console.log('First session:', sessions[0]);
      console.log('Session subjectId:', sessions[0]?.subjectId);
      
      setStudySessions(sessions);
      setExams(examsData);
      setSubjects(subjectsData);
      
      // Calculate analytics with the loaded data
      const subjectData = {};
      sessions.forEach(s => {
        if (!s.subjectId || !s.subjectId.name) return;
        const subjectName = s.subjectId.name;
        if (!subjectData[subjectName]) {
          subjectData[subjectName] = { name: subjectName, hours: 0, sessions: 0 };
        }
        subjectData[subjectName].hours += s.hoursStudied;
        subjectData[subjectName].sessions += 1;
      });
      
      console.log('Subject data:', subjectData);
      
      const totalHours = sessions.reduce((sum, s) => sum + s.hoursStudied, 0);
      const avgConfidence = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.overallConfidence, 0) / sessions.length 
        : 0;
      
      const analyticsData = {
        subjectDistribution: Object.values(subjectData),
        totalSessions: sessions.length,
        totalHours: totalHours.toFixed(1),
        avgConfidence: avgConfidence.toFixed(1),
        totalExams: examsData.length
      };
      
      console.log('Analytics data:', analyticsData);
      setAnalytics(analyticsData);
      
      calculateAnalytics(sessions, period);
    } catch (err) {
      console.error('Load data error:', err);
      showError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions, periodType) => {
    const now = new Date();
    let data = [];

    if (periodType === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const daySessions = sessions.filter(s => 
          new Date(s.date).toISOString().split('T')[0] === dateStr
        );
        
        data.push({
          label: dayName,
          sessions: daySessions.length,
          hours: daySessions.reduce((sum, s) => sum + s.hoursStudied, 0),
          confidence: daySessions.length > 0 ? daySessions.reduce((sum, s) => sum + s.overallConfidence, 0) / daySessions.length : 0
        });
      }
    } else if (periodType === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekSessions = sessions.filter(s => {
          const sessionDate = new Date(s.date);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        });
        
        data.push({
          label: `Week ${4 - i}`,
          sessions: weekSessions.length,
          hours: weekSessions.reduce((sum, s) => sum + s.hoursStudied, 0),
          confidence: weekSessions.length > 0 ? weekSessions.reduce((sum, s) => sum + s.overallConfidence, 0) / weekSessions.length : 0
        });
      }
    } else if (periodType === 'monthly') {
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        
        const monthSessions = sessions.filter(s => {
          const sessionDate = new Date(s.date);
          return sessionDate.getMonth() === month.getMonth() && 
                 sessionDate.getFullYear() === month.getFullYear();
        });
        
        data.push({
          label: monthName,
          sessions: monthSessions.length,
          hours: monthSessions.reduce((sum, s) => sum + s.hoursStudied, 0),
          confidence: monthSessions.length > 0 ? monthSessions.reduce((sum, s) => sum + s.overallConfidence, 0) / monthSessions.length : 0
        });
      }
    }

    setAnalytics(prev => ({
      ...prev,
      chartData: data
    }));
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Subject', 'Hours Studied', 'Confidence', 'Topics Completed'];
    const rows = studySessions.map(session => [
      new Date(session.date).toLocaleDateString(),
      session.subjectId?.name || 'N/A',
      session.hoursStudied,
      session.overallConfidence,
      session.topicsCompleted?.join('; ') || 'None'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-sessions-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const downloadExamsCSV = () => {
    const headers = ['Exam Name', 'Date', 'Type', 'Readiness Score', 'Subjects'];
    const rows = exams.map(exam => [
      exam.name,
      new Date(exam.examDate).toLocaleDateString(),
      exam.examType,
      exam.readinessScore?.overall || 0,
      exam.subjects?.map(s => s.name).join('; ') || 'None'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exams-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading Reports...</p></div>;

  return (
    <div className="reports-page container-fluid px-2 px-md-4">
      <div className="reports-header row align-items-center mb-3 mb-md-4">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <h1>Reports & Analytics</h1>
        </div>
        <div className="col-12 col-md-6">
          <div className="download-buttons d-flex flex-column flex-sm-row gap-2">
            <button onClick={downloadCSV} className="btn-download">
              <Download size={18} />
              Download Study Sessions
            </button>
            <button onClick={downloadExamsCSV} className="btn-download">
              <Download size={18} />
              Download Exams
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-summary row g-2 g-md-3 mb-3 mb-md-4">
        <div className="col-6 col-md-3">
          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={24} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Total Study Hours</span>
              <span className="summary-value">{analytics?.totalHours || 0}h</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="summary-card">
            <div className="summary-icon">
              <BookOpen size={24} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Study Sessions</span>
              <span className="summary-value">{analytics?.totalSessions || 0}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="summary-card">
            <div className="summary-icon">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Avg Confidence</span>
              <span className="summary-value">{analytics?.avgConfidence || 0}%</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="summary-card">
            <div className="summary-icon">
              <Target size={24} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Total Exams</span>
              <span className="summary-value">{analytics?.totalExams || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid row g-2 g-md-3 mb-3 mb-md-4">
        <div className="col-12 col-lg-6">
          <div className="chart-section">
            <div className="chart-header">
              <h2>Study Hours Trend</h2>
              <div className="period-selector">
                <button 
                  className={period === 'daily' ? 'period-btn active' : 'period-btn'}
                  onClick={() => setPeriod('daily')}
                >
                  Daily
                </button>
                <button 
                  className={period === 'weekly' ? 'period-btn active' : 'period-btn'}
                  onClick={() => setPeriod('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={period === 'monthly' ? 'period-btn active' : 'period-btn'}
                  onClick={() => setPeriod('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.chartData || []}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="chart-section">
            <div className="chart-header">
              <h2>Subject Distribution</h2>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.subjectDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {analytics?.subjectDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section mb-3 mb-md-4">
        <div className="chart-header">
          <h2>Confidence Level Trend</h2>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={3} name="Confidence %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="records-section mb-3 mb-md-4">
        <h2>Study Sessions Records</h2>
        <div className="records-table-container">
          <table className="records-table table table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Hours</th>
                <th>Confidence</th>
                <th>Topics</th>
              </tr>
            </thead>
            <tbody>
              {studySessions.map(session => (
                <tr key={session._id}>
                  <td>{new Date(session.date).toLocaleDateString()}</td>
                  <td>{session.subjectId?.name || 'N/A'}</td>
                  <td>{session.hoursStudied}h</td>
                  <td>
                    <span className="confidence-badge">{session.overallConfidence}%</span>
                  </td>
                  <td>{session.topicsCompleted?.length || 0} topics</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="records-section mb-3 mb-md-4">
        <h2>Exams Records</h2>
        <div className="records-table-container">
          <table className="records-table table table-hover">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Readiness</th>
                <th>Subjects</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam._id}>
                  <td>{exam.name}</td>
                  <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                  <td>{exam.examType}</td>
                  <td>
                    <span className={`readiness-badge ${
                      exam.readinessScore?.overall >= 75 ? 'badge-good' : 
                      exam.readinessScore?.overall >= 50 ? 'badge-average' : 'badge-poor'
                    }`}>
                      {exam.readinessScore?.overall || 0}%
                    </span>
                  </td>
                  <td>{exam.subjects?.length || 0} subjects</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
