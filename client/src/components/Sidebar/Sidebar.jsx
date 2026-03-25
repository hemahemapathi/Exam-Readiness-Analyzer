import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Clock, Target, User, FileText, LogOut, Menu, X, Calendar, BarChart3, Users, Play } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} onClick={() => isOpen && setIsOpen(false)}>
        <div className="sidebar-header">
          <div className="logo"><BookOpen size={32} /></div>
          <h2>ExamPulse</h2>
        </div>

      <div className="user-info">
        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-details">
          <p className="user-name">{user?.name}</p>
          <p className="user-role">Student</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/subjects" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <BookOpen size={20} />
          <span>Subjects</span>
        </NavLink>

        <NavLink to="/study-sessions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <Clock size={20} />
          <span>Study Sessions</span>
        </NavLink>

        <NavLink to="/exams" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <Target size={20} />
          <span>Exams</span>
        </NavLink>

        <NavLink to="/plans" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <Calendar size={20} />
          <span>Plans</span>
        </NavLink>

        <NavLink to="/simulations" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <BarChart3 size={20} />
          <span>Simulations</span>
        </NavLink>

        <NavLink to="/study-groups" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <Users size={20} />
          <span>Study Groups</span>
        </NavLink>

        <NavLink to="/practice-tests" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <Play size={20} />
          <span>Practice Tests</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={() => setIsOpen(false)}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}