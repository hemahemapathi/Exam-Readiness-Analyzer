import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    
    try {
      // API call would go here
      success('Profile updated successfully');
      setIsEditing(false);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error('Failed to update profile');
    }
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      <div className="profile-card">
        {!isEditing ? (
          <>
            <div className="profile-info">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <p>Student Account</p>
                <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{ background: '#f9fafb', color: '#6b7280' }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password to change password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
