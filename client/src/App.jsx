import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Subjects from './pages/Subjects/Subjects';
import StudySessions from './pages/StudySession/StudySessions';
import Exams from './pages/Exams/Exams';
import ExamDetail from './pages/ExamDetail/ExamDetail';
import Plans from './pages/Plans/Plans';
import Simulations from './pages/Simulations/Simulations';
import StudyGroups from './pages/StudyGroups/StudyGroups';
import PracticeTests from './pages/PracticeTests/PracticeTests';
import Profile from './pages/Profile/Profile';
import Reports from './pages/Reports/Reports';
import './App.css';
import './blue-theme.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/study-sessions" element={<ProtectedRoute><StudySessions /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
      <Route path="/exams/:id" element={<ProtectedRoute><ExamDetail /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="/simulations" element={<ProtectedRoute><Simulations /></ProtectedRoute>} />
      <Route path="/study-groups" element={<ProtectedRoute><StudyGroups /></ProtectedRoute>} />
      <Route path="/practice-tests" element={<ProtectedRoute><PracticeTests /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}