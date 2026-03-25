import { useState, useEffect } from 'react';
import { studyGroupService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Users, Plus, Trophy, Trash2 } from 'lucide-react';
import './StudyGroups.css';

export default function StudyGroups() {
  const { success, error: showError } = useToast();
  const [studyGroups, setStudyGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsRes, leaderRes] = await Promise.all([
        studyGroupService.getAll(),
        studyGroupService.getLeaderboard()
      ]);
      setStudyGroups(groupsRes.data.studyGroups);
      setLeaderboard(leaderRes.data.leaderboard);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await studyGroupService.create(formData);
      success('Study group created successfully');
      setShowForm(false);
      setFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      showError('Failed to create study group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      await studyGroupService.join(inviteCode);
      success('Joined study group successfully');
      setShowJoinForm(false);
      setInviteCode('');
      loadData();
    } catch (error) {
      showError('Failed to join study group');
    }
  };

  const handleDeleteGroup = (groupId) => {
    setShowDeleteConfirm(groupId);
  };

  const confirmDelete = async () => {
    try {
      await studyGroupService.delete(showDeleteConfirm);
      success('Study group deleted successfully');
      loadData();
    } catch (error) {
      showError('Failed to delete study group');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="study-groups-page">
      <div className="page-header">
        <h1>Study Groups</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowJoinForm(true)}>
            Join Group
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Create Group
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="groups-section">
          <h2>My Groups</h2>
          {studyGroups.length === 0 ? (
            <p className="empty-state">No study groups yet. Create or join one!</p>
          ) : (
            <div className="groups-list">
              {studyGroups.map(group => (
                <div key={group._id} className="group-card">
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    <span className="member-count">
                      <Users size={16} /> {group.members.length}
                    </span>
                  </div>
                  <p>{group.description}</p>
                  <div className="group-footer">
                    <span className="invite-code">Code: {group.inviteCode}</span>
                    <button 
                      className="btn-danger btn-small" 
                      onClick={() => handleDeleteGroup(group._id)}
                      title="Delete group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="leaderboard-section">
          <h2><Trophy size={20} /> Leaderboard</h2>
          <div className="leaderboard">
            {leaderboard.map((user, index) => (
              <div key={user._id} className={`leaderboard-item rank-${index + 1}`}>
                <span className="rank">#{index + 1}</span>
                <span className="name">{user.userId?.name}</span>
                <span className="points">{user.totalPoints}pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Study Group</h3>
            <p>Are you sure you want to delete this study group? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={confirmDelete}>Yes, Delete</button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Study Group</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinForm && (
        <div className="modal-overlay" onClick={() => setShowJoinForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Join Study Group</h3>
            <form onSubmit={handleJoinGroup}>
              <input
                type="text"
                placeholder="Enter Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Join</button>
                <button type="button" className="btn-secondary" onClick={() => setShowJoinForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}