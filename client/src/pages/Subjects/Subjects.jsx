import { useState, useEffect } from 'react';
import { subjectService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Edit, Trash2 } from 'lucide-react';
import './Subjects.css';

export default function Subjects() {
  const { success, error: showError } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    totalTopics: '',
    difficulty: '',
    priority: '',
    examWeightage: 0,
    file: null
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data.subjects);
    } catch (error) {
      showError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('totalTopics', formData.totalTopics);
      submitData.append('difficulty', formData.difficulty || 'Medium');
      submitData.append('priority', formData.priority || 'Medium');
      submitData.append('examWeightage', formData.examWeightage);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      if (editingSubject) {
        await subjectService.update(editingSubject._id, submitData);
        success('Subject updated successfully');
      } else {
        await subjectService.create(submitData);
        success('Subject created successfully');
      }
      setShowForm(false);
      setEditingSubject(null);
      setFormData({ name: '', totalTopics: '', difficulty: '', priority: '', examWeightage: 0, file: null });
      loadSubjects();
    } catch (error) {
      showError(`Failed to ${editingSubject ? 'update' : 'create'} subject`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteSubjectId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await subjectService.delete(deleteSubjectId);
      success('Subject deleted successfully');
      loadSubjects();
    } catch (error) {
      showError('Failed to delete subject');
    }
    setShowConfirmDelete(false);
    setDeleteSubjectId(null);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      totalTopics: subject.totalTopics,
      difficulty: subject.difficulty,
      priority: subject.priority,
      examWeightage: subject.examWeightage,
      file: null
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

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setShowDetailsModal(true);
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading Subjects...</p></div>;

  return (
    <div className="subjects-page">
      <div className="subjects-header">
        <h1>Subjects</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Subject Name *</label>
            <input
              type="text"
              placeholder="e.g., Mathematics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Topics *</label>
            <input
              type="number"
              placeholder="Enter total topics"
              value={formData.totalTopics}
              onChange={(e) => setFormData({ ...formData, totalTopics: e.target.value ? parseInt(e.target.value) : '' })}
              required
            />
          </div>
          <div className="form-group">
            <label>Difficulty Level</label>
            <select
              className="desktop-select"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option value="">Choose difficulty level</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <button type="button" className="mobile-select-btn" onClick={() => openModal('difficulty')}>
              {formData.difficulty || 'Choose difficulty level'}
            </button>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              className="desktop-select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="">Choose priority level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button type="button" className="mobile-select-btn" onClick={() => openModal('priority')}>
              {formData.priority || 'Choose priority level'}
            </button>
          </div>
          <div className="form-group">
            <label>Exam Weightage (%)</label>
            <input
              type="number"
              placeholder="Enter exam weightage"
              value={formData.examWeightage}
              onChange={(e) => setFormData({ ...formData, examWeightage: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Subject File (Optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            />
            {formData.file && (
              <p className="file-info">Selected: {formData.file.name}</p>
            )}
          </div>
          <button type="submit" className="btn-success" disabled={submitting}>
            {submitting ? (editingSubject ? 'Updating...' : 'Creating...') : (editingSubject ? 'Update Subject' : 'Create Subject')}
          </button>
        </form>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select {modalType === 'difficulty' ? 'Difficulty Level' : 'Priority'}</h3>
            <div className="modal-options">
              {modalType === 'difficulty' ? (
                <>
                  <button onClick={() => selectOption('Easy')}>Easy</button>
                  <button onClick={() => selectOption('Medium')}>Medium</button>
                  <button onClick={() => selectOption('Hard')}>Hard</button>
                </>
              ) : (
                <>
                  <button onClick={() => selectOption('Low')}>Low</button>
                  <button onClick={() => selectOption('Medium')}>Medium</button>
                  <button onClick={() => selectOption('High')}>High</button>
                </>
              )}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Subject</h3>
            <p>Are you sure you want to delete this subject?</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
              <button className="btn-secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedSubject && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content subject-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSubject.name}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="subject-details">
              <div className="detail-item">
                <span className="label">Difficulty Level:</span>
                <span className="value">{selectedSubject.difficulty}</span>
              </div>
              <div className="detail-item">
                <span className="label">Priority:</span>
                <span className="value">{selectedSubject.priority}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Topics:</span>
                <span className="value">{selectedSubject.totalTopics}</span>
              </div>
              <div className="detail-item">
                <span className="label">Completed Topics:</span>
                <span className="value">{selectedSubject.completedTopics || 0}</span>
              </div>
              <div className="detail-item">
                <span className="label">Progress:</span>
                <span className="value">{Math.round(((selectedSubject.completedTopics || 0) / selectedSubject.totalTopics) * 100)}%</span>
              </div>
              <div className="detail-item">
                <span className="label">Exam Weightage:</span>
                <span className="value">{selectedSubject.examWeightage}%</span>
              </div>
              {selectedSubject.fileName && (
                <div className="detail-item">
                  <span className="label">Attached File:</span>
                  <span className="value file-link">
                    📎 {selectedSubject.fileName}
                    <a 
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${selectedSubject.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="download-btn"
                    >
                      View/Download
                    </a>
                  </span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Created:</span>
                <span className="value">{new Date(selectedSubject.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="subjects-grid">
          {subjects.map(subject => (
            <div key={subject._id} className="subject-card" onClick={() => handleSubjectClick(subject)}>
              <h3>{subject.name}</h3>
              <p>Difficulty: {subject.difficulty}</p>
              <p>Priority: {subject.priority}</p>
              <p>Progress: {subject.completedTopics}/{subject.totalTopics}</p>
              <p>Weightage: {subject.examWeightage}%</p>
              {subject.fileName && (
                <p className="file-attached">📎 {subject.fileName}</p>
              )}
              <div className="subject-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn-icon-edit" onClick={() => handleEdit(subject)}>
                  <Edit size={16} />
                </button>
                <button className="btn-icon-danger" onClick={() => handleDelete(subject._id)}>
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