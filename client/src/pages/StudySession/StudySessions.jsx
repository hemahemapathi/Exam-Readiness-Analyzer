import { useState, useEffect } from 'react';
import { studySessionService, subjectService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Trash2, Edit } from 'lucide-react';
import './StudySessions.css';

export default function StudySessions() {
  const { success, error: showError } = useToast();
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, sessionId: null });
  const [formData, setFormData] = useState({
    subjectId: '',
    hoursStudied: 0,
    overallConfidence: 3,
    mood: '',
    burnoutIndicators: { fatigue: 3, motivation: 3, focus: 3 }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, subjectsRes] = await Promise.all([
        studySessionService.getAll(),
        subjectService.getAll()
      ]);
      setSessions(sessionsRes.data.studySessions);
      setSubjects(subjectsRes.data.subjects);
    } catch (error) {
      showError('Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        subjectId: formData.subjectId,
        hoursStudied: Math.min(parseFloat(formData.hoursStudied) || 0, 24),
        overallConfidence: parseInt(formData.overallConfidence) || 3,
        mood: formData.mood || 'Average',
        burnoutIndicators: formData.burnoutIndicators || { fatigue: 3, motivation: 3, focus: 3 }
      };
      
      console.log('Submitting data:', submitData);
      
      if (editingSession) {
        await studySessionService.update(editingSession._id, submitData);
        success('Study session updated successfully');
      } else {
        await studySessionService.create(submitData);
        success('Study session created successfully');
      }
      setShowForm(false);
      setEditingSession(null);
      setFormData({
        subjectId: '',
        hoursStudied: 0,
        overallConfidence: 3,
        mood: '',
        burnoutIndicators: { fatigue: 3, motivation: 3, focus: 3 }
      });
      loadData();
    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
      showError(`Failed to ${editingSession ? 'update' : 'create'} study session`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, sessionId: id });
  };

  const confirmDelete = async () => {
    try {
      await studySessionService.delete(deleteConfirm.sessionId);
      success('Study session deleted successfully');
      loadData();
    } catch (error) {
      showError('Failed to delete study session');
    } finally {
      setDeleteConfirm({ show: false, sessionId: null });
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      subjectId: session.subjectId?._id || '',
      hoursStudied: session.hoursStudied || 0,
      overallConfidence: session.overallConfidence || 3,
      mood: session.mood || '',
      burnoutIndicators: session.burnoutIndicators || { fatigue: 3, motivation: 3, focus: 3 }
    });
    setShowForm(true);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const selectOption = (value) => {
    setFormData({ ...formData, [modalType]: value });
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({
      subjectId: '',
      hoursStudied: 0,
      overallConfidence: 3,
      mood: '',
      burnoutIndicators: { fatigue: 3, motivation: 3, focus: 3 }
    });
  };

  const getSubjectName = (id) => {
    const subject = subjects.find(s => s._id === id);
    return subject ? subject.name : 'Select Subject';
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading Study Sessions...</p></div>;

  return (
    <div className="study-sessions-page">
      <div className="sessions-header">
        <h1>Study Sessions</h1>
        <button className="btn-primary" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ Add Session'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Subject *</label>
            <select
              className="desktop-select"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button type="button" className="mobile-select-btn" onClick={() => openModal('subjectId')}>
              {getSubjectName(formData.subjectId)}
            </button>
          </div>
          <div className="form-group">
            <label>Hours Studied *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              placeholder="e.g., 2.5"
              value={formData.hoursStudied}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value <= 24) {
                  setFormData({ ...formData, hoursStudied: value || 0 });
                }
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Confidence Level (1-5): {formData.overallConfidence}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.overallConfidence}
              onChange={(e) => setFormData({ ...formData, overallConfidence: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Mood</label>
            <select
              className="desktop-select"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
            >
              <option value="">Choose your mood</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
              <option value="Terrible">Terrible</option>
            </select>
            <button type="button" className="mobile-select-btn" onClick={() => openModal('mood')}>
              {formData.mood || 'Choose your mood'}
            </button>
          </div>
          <button type="submit" className="btn-success" disabled={submitting}>
            {submitting ? (editingSession ? 'Updating...' : 'Creating...') : (editingSession ? 'Update Session' : 'Create Session')}
          </button>
        </form>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select {modalType === 'subjectId' ? 'Subject' : 'Mood'}</h3>
            <div className="modal-options">
              {modalType === 'subjectId' ? (
                subjects.map(s => (
                  <button key={s._id} onClick={() => selectOption(s._id)}>{s.name}</button>
                ))
              ) : (
                <>
                  <button onClick={() => selectOption('Excellent')}>Excellent</button>
                  <button onClick={() => selectOption('Good')}>Good</button>
                  <button onClick={() => selectOption('Average')}>Average</button>
                  <button onClick={() => selectOption('Poor')}>Poor</button>
                  <button onClick={() => selectOption('Terrible')}>Terrible</button>
                </>
              )}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ show: false, sessionId: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Study Session</h3>
            <p>Are you sure you want to delete this study session? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
              <button className="btn-secondary" onClick={() => setDeleteConfirm({ show: false, sessionId: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="list">
          {sessions.map(session => (
            <div key={session._id} className="card">
              <div className="card-header">
                <h3>{session.subjectId?.name}</h3>
                <div className="card-actions">
                  <button className="btn-icon-edit" onClick={() => handleEdit(session)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon-danger" onClick={() => handleDelete(session._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p>Hours: {session.hoursStudied}h</p>
              <p>Confidence: {session.overallConfidence}/5</p>
              <p>Mood: {session.mood}</p>
              <p>Date: {new Date(session.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}