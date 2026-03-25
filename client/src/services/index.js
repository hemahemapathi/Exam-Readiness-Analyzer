import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const subjectService = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  addTopic: (id, data) => api.post(`/subjects/${id}/topics`, data),
  updateTopicProgress: (id, data) => api.put(`/subjects/${id}/topics/progress`, data)
};

export const studySessionService = {
  getAll: (params) => api.get('/study-sessions', { params }),
  getById: (id) => api.get(`/study-sessions/${id}`),
  create: (data) => api.post('/study-sessions', data),
  update: (id, data) => api.put(`/study-sessions/${id}`, data),
  delete: (id) => api.delete(`/study-sessions/${id}`),
  getStats: (period) => api.get(`/study-sessions/stats?period=${period}`)
};

export const studyGroupService = {
  getAll: () => api.get('/study-groups'),
  create: (data) => api.post('/study-groups', data),
  join: (inviteCode) => api.post('/study-groups/join', { inviteCode }),
  delete: (id) => api.delete(`/study-groups/${id}`),
  getLeaderboard: () => api.get('/study-groups/leaderboard')
};

export const practiceTestService = {
  getAll: () => api.get('/practice-tests'),
  create: (data) => api.post('/practice-tests', data),
  submit: (id, data) => api.put(`/practice-tests/${id}/submit`, data),
  delete: (id) => api.delete(`/practice-tests/${id}`)
};

export const examService = {
  getAll: () => api.get('/exams'),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  calculateReadiness: (id) => api.get(`/exams/${id}/readiness`),
  simulate: (id, data) => api.post(`/exams/${id}/simulate`, data),
  getSimulations: (id) => api.get(`/exams/${id}/simulations`),
  getPlans: (id) => api.get(`/exams/${id}/plans`),
  generatePlan: (id, data) => api.post(`/exams/${id}/plans`, data),
  savePlan: (id, data) => api.post(`/exams/${id}/save-plan`, data),
  getWeeklyPlan: (id) => api.get(`/exams/${id}/weekly-plan`),
  generateWeeklyPlan: (id) => api.post(`/exams/${id}/weekly-plan`)
};