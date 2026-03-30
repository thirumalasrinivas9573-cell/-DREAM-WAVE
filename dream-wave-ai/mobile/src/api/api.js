import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Change this to your Render backend URL after deploying ──
export const BASE_URL = 'https://dream-wave-3.onrender.com';
// For local dev: 'http://192.168.x.x:5000'  (use your machine's LAN IP, not localhost)

const api = axios.create({ baseURL: `${BASE_URL}/api` });

api.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const register   = (d)    => api.post('/auth/register', d);
export const login      = (d)    => api.post('/auth/login', d);
export const getMe      = ()     => api.get('/auth/me');
export const updateMe   = (d)    => api.put('/user/me', d);

// ── Goal Chat ──
export const startGoalChat    = ()          => api.post('/goal/start');
export const continueGoalChat = (sid, msg)  => api.post('/goal/continue', { sessionId: sid, userMessage: msg });

// ── Roadmap ──
export const generateRoadmap = (sid) => api.post('/roadmap/generate', { sessionId: sid });
export const listRoadmaps    = ()    => api.get('/roadmap/list');

// ── Report ──
export const generateReport = (sid) => api.post('/report/generate', { sessionId: sid });
export const listReports    = ()    => api.get('/report/list');

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
export const createPost     = (content) => api.post('/community/post', { content });
export const getFeed        = ()        => api.get('/community/feed');
export const likePost       = (id)      => api.put(`/community/like/${id}`);
export const connectUser    = (aaId)    => api.post('/community/connect', { aaId });
export const getConnections = ()        => api.get('/community/connections');

export default api;
