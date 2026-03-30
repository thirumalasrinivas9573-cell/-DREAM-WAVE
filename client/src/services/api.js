import axios from 'axios'

// In development, prefer relative /api so Vite proxy applies.
// In production builds, set VITE_API_URL to your backend origin.
const API_BASE_URL = import.meta.env.PROD && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : ''

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  signup: (userData) => api.post('/api/auth/signup', userData),
  aaidLogin: (credentials) => api.post('/api/auth/aaid-login', credentials),
  getMe: () => api.get('/api/auth/me')
}

// Goal APIs
export const goalAPI = {
  createGoal: (goalData) => api.post('/api/goals', goalData),
  getGoals: () => api.get('/api/goals'),
  getGoal: (id) => api.get(`/api/goals/${id}`)
}

// Report APIs
export const reportAPI = {
  generateReport: (goalData) => api.post('/api/report', goalData),
  getReports: () => api.get('/api/report'),
  downloadPDF: (id) => api.get(`/api/report/${id}/download`, { responseType: 'blob' })
}

// Roadmap APIs
export const roadmapAPI = {
  generateRoadmap: (data) => api.post('/api/roadmap', data)
}

// Books APIs
export const booksAPI = {
  searchBooks: (query, category) => api.get('/api/books', { params: { query, category } })
}

// Tasks APIs
export const taskAPI = {
  getTasks: () => api.get('/api/tasks'),
  createTask: (taskData) => api.post('/api/tasks', taskData),
  completeTask: (id, answer) => api.post(`/api/tasks/${id}/complete`, { answer }),
  generateTask: (data) => api.post('/api/tasks/generate', data)
}

// Daily Life APIs
export const dailyAPI = {
  getAdvice: (data) => api.post('/api/daily', data)
}

// Mentor APIs
export const mentorAPI = {
  getAdvice: (query) => api.post('/api/mentor', { query })
}

// Community APIs
export const communityAPI = {
  getPosts: () => api.get('/api/community/posts'),
  createPost: (data) => api.post('/api/community/posts', data),
  likePost: (id) => api.post(`/api/community/posts/${id}/like`),
  commentPost: (id, content) => api.post(`/api/community/posts/${id}/comment`, { content }),
  getFriends: () => api.get('/api/community/friends'),
  addFriend: (id) => api.post(`/api/community/friends/${id}`)
}

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  updateProfile: (data) => api.put('/api/profile', data),
  uploadImage: (formData) => api.post('/api/profile/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateCertificate: (data) => api.post('/api/profile/certificate', data)
}

// Connectivity test API
export const testAPI = {
  ping: () => api.get('/api/test')
}

export default api
