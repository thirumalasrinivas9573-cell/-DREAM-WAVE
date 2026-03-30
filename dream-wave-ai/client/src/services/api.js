import axios from 'axios';

// In production: set VITE_API_URL to your Render backend URL
// e.g. https://dream-wave-ai-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';  // dev: Vite proxy handles /api → localhost:5001

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Global error handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Attach a readable message for AI quota errors
    if (err.response?.status === 503) {
      err.userMessage = err.response.data?.message || 'AI service temporarily unavailable. Please try again later.';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// ── User ──
export const getMe    = ()     => api.get('/auth/me');
export const updateMe = (data) => api.put('/user/me', data);

// ── Goal Chat ──
export const startGoalChat    = ()                       => api.post('/goal/start');
export const continueGoalChat = (sessionId, userMessage) => api.post('/goal/continue', { sessionId, userMessage });
export const saveGoal         = (sessionId)              => api.post('/goal/save', { sessionId });
export const getGoalHistory   = ()                       => api.get('/goal/history');

// ── Report ──
export const generateReport = (sessionId) => api.post('/report/generate', { sessionId });
export const listReports    = ()           => api.get('/report/list');

// ── Roadmap ──
export const generateRoadmap = (sessionId) => api.post('/roadmap/generate', { sessionId });
export const listRoadmaps    = ()           => api.get('/roadmap/list');
export const getRoadmap      = (id)         => api.get(`/roadmap/${id}`);

// ── Tasks ──
export const generateTasks = (goal) => api.post('/tasks/generate', { goal });
export const listTasks     = ()     => api.get('/tasks/list');
export const completeTask  = (id)   => api.put(`/tasks/complete/${id}`);

// ── Books ──
export const getBooks = (goal) => api.get(`/books/${encodeURIComponent(goal)}`);

// ── Daily Life ──
export const askDailyLife = (message, category) => api.post('/daily-life', { message, category });

// ── Mentor ──
export const askMentor = (message) => api.post('/mentor', { message });

// ── Community ──
export const createPost      = (content, type)  => api.post('/community/post', { content, type });
export const getFeed         = ()               => api.get('/community/feed');
export const likePost        = (id)             => api.put(`/community/like/${id}`);
export const addComment      = (id, text)       => api.post(`/community/comment/${id}`, { text });
export const connectUser     = (aaId)           => api.post('/community/connect', { aaId });
export const getConnections  = ()               => api.get('/community/connections');

export default api;
