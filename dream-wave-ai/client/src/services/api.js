import axios from 'axios';

// Always use Vite proxy in dev (VITE_API_URL empty = use relative /api path)
// In production, VITE_API_URL is set to the deployed backend URL
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 60000 });

// Attach JWT
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
    if (err.response?.status === 503) {
      err.userMessage = err.response.data?.message || 'AI service temporarily unavailable.';
    }
    if (!err.response) {
      err.userMessage = 'Cannot connect to server. Is the backend running on port 5001?';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const register = d => api.post('/auth/register', d);
export const login    = d => api.post('/auth/login', d);
export const loginAA  = d => api.post('/auth/login-aa', d);
export const getMe    = ()  => api.get('/auth/me');

// ── User ──────────────────────────────────────────────────────────────────
export const updateMe          = d  => api.put('/user/me', d);
export const awardPoints       = t  => api.post('/user/award', { trigger: t });
export const updateLoginStreak = () => api.post('/user/login-streak');
export const getGamification   = () => api.get('/user/gamification');
export const getUserMemory     = () => api.get('/user/memory');
export const patchUserMemory   = d  => api.patch('/user/memory', d);

// ── Goals Engine (NEW) ────────────────────────────────────────────────────
export const createGoal       = d  => api.post('/goals', d);
export const getUserGoals     = (params) => api.get('/goals', { params });
export const getGoal          = id => api.get(`/goals/${id}`);
export const updateGoal       = (id, d) => api.put(`/goals/${id}`, d);
export const deleteGoal       = id => api.delete(`/goals/${id}`);
export const regenerateGoalRoadmap = id => api.post(`/goals/${id}/regenerate`);

// ── Roadmap Engine ────────────────────────────────────────────────────────
export const generateRoadmap  = d  => api.post('/roadmap/generate', d);
// Direct generation by title+category (no pre-existing goal required)
export const generateRoadmapByTitle = (goalTitle, category) =>
  api.post('/roadmap/generate', { goalTitle, category });
export const listRoadmaps     = (params) => api.get('/roadmap/list', { params });
export const getRoadmap       = id => api.get(`/roadmap/${id}`);
export const regenerateRoadmap = id => api.post(`/roadmap/${id}/regenerate`);
export const deleteRoadmap    = id => api.delete(`/roadmap/${id}`);
export const updateRoadmapTask = (id, phaseIdx, taskIdx, d) =>
  api.patch(`/roadmap/${id}/phase/${phaseIdx}/task/${taskIdx}`, d);

// ── Task Engine ───────────────────────────────────────────────────────────
export const generateTasks         = d  => api.post('/tasks/generate', d);
export const generateTasksFromRoadmap = d => api.post('/tasks/generate-from-roadmap', d);
export const listTasks             = (params) => api.get('/tasks/list', { params });
export const completeTask          = id => api.put(`/tasks/complete/${id}`);
export const uncompleteTask        = id => api.put(`/tasks/uncomplete/${id}`);
export const getGoalProgress       = goalId => api.get(`/tasks/progress/${goalId}`);

// ── Learning Engine (NEW) ─────────────────────────────────────────────────
export const generateQuiz      = d  => api.post('/learn/quiz/generate', d);
export const submitQuiz        = d  => api.post('/learn/quiz/submit', d);
export const getQuizHistory    = (params) => api.get('/learn/quiz/history', { params });
export const generateAnimation = d  => api.post('/learn/animation', d);
export const buildResume       = ()  => api.post('/learn/resume/build');
export const getResume         = ()  => api.get('/learn/resume');
export const getDayContent     = (goalId, day) => api.get(`/learn/day/${goalId}/${day}`);
export const getLearningProgress = goalId => api.get(`/learn/progress/${goalId}`);
export const getSkillGap       = d  => api.post('/learn/skill-gap', d);
export const getLearningDashboard = () => api.get('/learn/dashboard');

// ── Training System ───────────────────────────────────────────────────────────
export const startTraining       = goalId => api.post(`/training/start/${goalId}`);
export const getTrainingStatus   = goalId => api.get(`/training/status/${goalId}`);
export const getTodayContent     = goalId => api.get(`/training/day/${goalId}`);
export const completeTrainingDay = goalId => api.post(`/training/complete-day/${goalId}`);
export const completeSkill       = goalId => api.post(`/training/complete-skill/${goalId}`);
export const getCertificates     = ()     => api.get('/training/certificates');
export const getAllSkills         = goalId => api.get(`/training/all-skills/${goalId}`);
// ── Goal Chat (legacy) ────────────────────────────────────────────────────
export const startGoalChat    = ()           => api.post('/goal/start');
export const continueGoalChat = (sid, msg)   => api.post('/goal/continue', { sessionId: sid, userMessage: msg });
export const saveGoal         = sid          => api.post('/goal/save', { sessionId: sid });
export const getGoalHistory   = ()           => api.get('/goal/history');

// ── AI ────────────────────────────────────────────────────────────────────
export const askAI              = (msg, hist, memCtx = '') =>
  api.post('/ai/chat', { message: memCtx ? `${msg}${memCtx}` : msg, history: hist });
export const generateAIReport   = (goal, level, interests) =>
  api.post('/ai/report', { goal, level, interests });
export const generateLearningPlan = (goal, days, level) =>
  api.post('/ai/learning-plan', { goal, days, level });
export const generateSmartDay   = (goal, day, level, completed) =>
  api.post('/ai/smart-day', { goal, day, level, completedTopics: completed });
export const generateVideoScenes = topic => api.post('/ai/video-scenes', { topic });
export const generateVideoPrompt = (topic, style) => api.post('/ai/video-prompt', { topic, style });

// ── Krishna AI ────────────────────────────────────────────────────────────
export const askKrishna = (message, action = 'MENTOR', userData = {}) =>
  api.post('/krishna', { message, action, userData });

// ── Mentor ────────────────────────────────────────────────────────────────
export const askMentor = msg => api.post('/mentor', { message: msg });

// ── Reports ───────────────────────────────────────────────────────────────
export const generateReport = sid => api.post('/report/generate', { sessionId: sid });
export const listReports    = ()  => api.get('/report/list');

// ── Books ─────────────────────────────────────────────────────────────────
export const getBooks          = goal    => api.get(`/books/${encodeURIComponent(goal)}`);
export const searchBooks       = q       => api.get(`/books/search?q=${encodeURIComponent(q)}`);
export const filterBooks       = (s, l)  => api.get(`/books/filter?subject=${encodeURIComponent(s)}&level=${encodeURIComponent(l)}`);
export const recommendBooks    = goal    => api.post('/books/recommend', { goal });
export const googleBooksSearch = q       => api.get(`/books/google?q=${encodeURIComponent(q)}`);

// ── Daily Life ────────────────────────────────────────────────────────────
export const askDailyLife = (msg, cat) => api.post('/daily-life', { message: msg, category: cat });

// ── Community ─────────────────────────────────────────────────────────────
export const createPost     = (content, type) => api.post('/community/post', { content, type });
export const getFeed        = ()               => api.get('/community/feed');
export const likePost       = id              => api.put(`/community/like/${id}`);
export const addComment     = (id, text)      => api.post(`/community/comment/${id}`, { text });
export const connectUser    = aaId            => api.post('/community/connect', { aaId });
export const getConnections = ()              => api.get('/community/connections');

export default api;
