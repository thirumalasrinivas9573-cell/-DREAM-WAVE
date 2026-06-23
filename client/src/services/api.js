import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
// Local dev  → Vite proxy forwards /api → http://localhost:5001  (no CORS issues)
// Production → VITE_API_URL env var set in Netlify dashboard
//              e.g. https://dream-wave-api.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,            // 90s — AI roadmap calls can take time
  withCredentials: false,    // JWT is in Authorization header, not cookies
})

// ── Attach JWT to every request ───────────────────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  err => Promise.reject(err)
)

// ── Handle global errors ──────────────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    // Session expired → force re-login
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  signup:   (data) => api.post('/auth/signup', data),
  register: (data) => api.post('/auth/signup', data), // alias
  me:       ()     => api.get('/auth/me'),
}

// ── Goals ─────────────────────────────────────────────────────────────────────
export const goalApi = {
  getAll:       ()         => api.get('/goals'),
  create:       (data)     => api.post('/goals', data),
  update:       (id, data) => api.put(`/goals/${id}`, data),
  delete:       (id)       => api.delete(`/goals/${id}`),
  generatePlan: (id)       => api.post(`/goals/${id}/ai-plan`),
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskApi = {
  getAll:   ()         => api.get('/tasks'),
  create:   (data)     => api.post('/tasks', data),
  update:   (id, data) => api.put(`/tasks/${id}`, data),
  delete:   (id)       => api.delete(`/tasks/${id}`),
  generate: (data)     => api.post('/tasks/generate-from-roadmap', data),
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapApi = {
  get:      (goalId) => api.get(`/roadmap/${goalId}`),
  generate: (data)   => api.post('/roadmap/generate', data),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportApi = {
  getAll:   ()     => api.get('/report'),
  generate: (data) => api.post('/report', data),
  download: (id)   => api.get(`/report/${id}/download`, { responseType: 'blob' }),
}

// ── Mentor (AI chat) ──────────────────────────────────────────────────────────
export const mentorApi = {
  chat:    (message, mode = 'general') => api.post('/mentor/chat', { message, mode }),
  history: ()        => api.get('/mentor/history'),
  clear:   ()        => api.delete('/mentor/history'),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}

// ── Community ─────────────────────────────────────────────────────────────────
export const communityApi = {
  getPosts:   ()     => api.get('/community'),
  createPost: (data) => api.post('/community', data),
  likePost:   (id)   => api.put(`/community/${id}/like`),
  deletePost: (id)   => api.delete(`/community/${id}`),
}

// ── Books ─────────────────────────────────────────────────────────────────────
export const booksApi = {
  getAll:    ()     => api.get('/books'),
  recommend: (data) => api.post('/books/recommend', data),
}

// ── Daily ─────────────────────────────────────────────────────────────────────
export const dailyApi = {
  get:     ()     => api.get('/daily'),
  getPost: (data) => api.post('/daily', data),
}
export const lessonApi = {
  generate:     (data) => api.post('/lesson/generate', data),
  videoScript:  (data) => api.post('/lesson/video-script', data),
  suggestions:  ()     => api.get('/lesson/suggestions'),
}
