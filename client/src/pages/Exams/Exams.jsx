import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examService, subjectService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Trash2, Edit } from 'lucide-react';
import './Exams.css';

export default function Exams() {
  const { success, error: showError } = useToast();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingExam, setEditingExam] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, examId: null });
  const [formData, setFormData] = useState({
    name: '',
    examDate: '',
    subjects: [],
    totalMarks: '',
    passingMarks: '',
    examType: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsRes, subjectsRes] = await Promise.all([
        examService.getAll(),
        subjectService.getAll()
      ]);
      setExams(examsRes.data.exams);
      setSubjects(subjectsRes.data.subjects);
    } catch (error) {
      showError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks) || 100,
        passingMarks: parseInt(formData.passingMarks) || 40,
        examType: formData.examType || 'Final'
      };
      
      if (editingExam) {
        await examService.update(editingExam._id, submitData);
        success('Exam updated successfully');
      } else {
        await examService.create(submitData);
        success('Exam created successfully');
      }
      setShowForm(false);
      setEditingExam(null);
      setFormData({
        name: '',
        examDate: '',
        subjects: [],
        totalMarks: '',
        passingMarks: '',
        examType: ''
      });
      loadData();
    } catch (error) {
      showError(`Failed to ${editingExam ? 'update' : 'create'} exam`);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const selectOption = (value) => {
    setFormData({ ...formData, [modalType]: value });
    setShowModal(false);
  };

  const toggleSubjectModal = (subjectId) => {
    toggleSubject(subjectId);
  };

  const toggleSubject = (subjectId) => {
    const exists = formData.subjects.find(s => s.subjectId === subjectId);
    if (exists) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(s => s.subjectId !== subjectId)
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, { subjectId, weightage: 100 }]
      });
    }
  };

  const handleDelete = (id, e) => {
    e.preventDefault();
    setDeleteConfirm({ show: true, examId: id });
  };

  const confirmDelete = async () => {
    try {
      await examService.delete(deleteConfirm.examId);
      success('Exam deleted successfully');
      loadData();
    } catch (error) {
      showError('Failed to delete exam');
    } finally {
      setDeleteConfirm({ show: false, examId: null });
    }
  };

  const handleEdit = (exam, e) => {
    e.preventDefault();
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      examDate: exam.examDate,
      subjects: exam.subjects || [],
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      examType: exam.examType
    });
    setShowForm(true);
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading Exams...</p></div>;

  return (
    <div className="exams-page">
      <div className="exams-header">
        <h1>Exams</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Exam'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Exam Name *</label>
            <input
              type="text"
              placeholder="e.g., Final Mathematics Exam"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Exam Date & Time *</label>
            <input
              className="desktop-datetime"
              type="datetime-local"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              required
            />
            <button type="button" className="mobile-select-btn" onClick={() => openModal('examDate')}>
              {formData.examDate ? new Date(formData.examDate).toLocaleString() : 'Select Date & Time'}
            </button>
          </div>
          <div className="form-group">
            <label>Total Marks</label>
            <input
              type="number"
              placeholder="Enter total marks"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value ? parseInt(e.target.value) : '' })}
            />
          </div>
          <div className="form-group">
            <label>Passing Marks</label>
            <input
              type="number"
              placeholder="Enter passing marks"
              value={formData.passingMarks}
              onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value ? parseInt(e.target.value) : '' })}
            />
          </div>
          <div className="form-group">
            <label>Exam Type</label>
            <select
              className="desktop-select"
              value={formData.examType}
              onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
            >
              <option value="">Choose exam type</option>
              <option value="Final">Final</option>
              <option value="Midterm">Midterm</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
            </select>
            <button type="button" className="mobile-select-btn" onClick={() => openModal('examType')}>
              {formData.examType || 'Choose exam type'}
            </button>
          </div>
          
          <div className="form-group">
            <label>Select Subjects *</label>
            <div className="checkbox-group desktop-checkbox">
              {subjects.map(subject => (
                <label key={subject._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.subjects.some(s => s.subjectId === subject._id)}
                    onChange={() => toggleSubject(subject._id)}
                  />
                  {subject.name}
                </label>
              ))}
            </div>
            <button type="button" className="mobile-select-btn" onClick={() => openModal('subjects')}>
              {formData.subjects.length > 0 ? `${formData.subjects.length} subjects selected` : 'Select Subjects'}
            </button>
          </div>
          
          <button type="submit" className="btn-success" disabled={submitting}>
            {submitting ? (editingExam ? 'Updating...' : 'Creating...') : (editingExam ? 'Update Exam' : 'Create Exam')}
          </button>
        </form>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select {modalType === 'examType' ? 'Exam Type' : modalType === 'examDate' ? 'Date & Time' : 'Subjects'}</h3>
            <div className="modal-options">
              {modalType === 'examType' ? (
                <>
                  <button onClick={() => selectOption('Final')}>Final</button>
                  <button onClick={() => selectOption('Midterm')}>Midterm</button>
                  <button onClick={() => selectOption('Quiz')}>Quiz</button>
                  <button onClick={() => selectOption('Assignment')}>Assignment</button>
                </>
              ) : modalType === 'examDate' ? (
                <>
                  <div className="modal-date-time-group">
                    <label>Date</label>
                    <input
                      type="date"
                      className="modal-datetime-input"
                      value={formData.examDate ? formData.examDate.split('T')[0] : ''}
                      onChange={(e) => {
                        const time = formData.examDate ? formData.examDate.split('T')[1] : '00:00';
                        setFormData({ ...formData, examDate: `${e.target.value}T${time}` });
                      }}
                    />
                  </div>
                  <div className="modal-date-time-group">
                    <label>Time</label>
                    <input
                      type="time"
                      className="modal-datetime-input"
                      value={formData.examDate ? formData.examDate.split('T')[1] : ''}
                      onChange={(e) => {
                        const date = formData.examDate ? formData.examDate.split('T')[0] : new Date().toISOString().split('T')[0];
                        setFormData({ ...formData, examDate: `${date}T${e.target.value}` });
                      }}
                    />
                  </div>
                </>
              ) : (
                subjects.map(subject => (
                  <label key={subject._id} className="modal-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.subjects.some(s => s.subjectId === subject._id)}
                      onChange={() => toggleSubjectModal(subject._id)}
                    />
                    {subject.name}
                  </label>
                ))
              )}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              {modalType === 'subjects' ? 'Done' : modalType === 'examDate' ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ show: false, examId: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Exam</h3>
            <p>Are you sure you want to delete this exam? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
              <button className="btn-secondary" onClick={() => setDeleteConfirm({ show: false, examId: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="grid">
          {exams.map(exam => (
            <div key={exam._id} className="card exam-card-wrapper">
              <Link to={`/exams/${exam._id}`} className="exam-card-link">
                <h3>{exam.name}</h3>
                <p>Date: {new Date(exam.examDate).toLocaleDateString()}</p>
                <p>Type: {exam.examType}</p>
                <p>Readiness: {exam.readinessScore?.overall || 0}%</p>
                <p className={`status-${exam.readinessScore?.overall >= 75 ? 'good' : exam.readinessScore?.overall >= 50 ? 'average' : 'poor'}`}>
                  {exam.readinessScore?.overall >= 75 ? 'Good' : exam.readinessScore?.overall >= 50 ? 'Average' : 'Needs Work'}
                </p>
              </Link>
              <div className="exam-actions">
                <button className="btn-icon-edit" onClick={(e) => handleEdit(exam, e)}>
                  <Edit size={16} />
                </button>
                <button className="btn-icon-danger exam-delete-btn" onClick={(e) => handleDelete(exam._id, e)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}