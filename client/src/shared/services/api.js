import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
// Local dev  → Vite proxy forwards /api → http://127.0.0.1:5001  (no CORS issues)
// Production → VITE_API_URL env var set in Netlify dashboard
//              e.g. https://dream-wave-api.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,            // 90s — AI roadmap calls can take time
  withCredentials: true,     // HttpOnly refresh cookie
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

let refreshing = null
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      const url = String(original?.url || '')
      const isAuth = /\/auth\//.test(url)
      const refresh = localStorage.getItem('refreshToken')
      if (!isAuth) {
        original._retry = true
        try {
          refreshing = refreshing || api.post('/auth/refresh', refresh ? { refreshToken: refresh } : {})
          const { data } = await refreshing
          refreshing = null
          localStorage.setItem('token', data.token)
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.token}`
          return api(original)
        } catch {
          refreshing = null
        }
      }
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      const path = window.location.pathname
      if (!path.includes('/login') && !path.includes('/signup')) {
        const dest = path.startsWith('/institution') || path.startsWith('/college') ? '/institution/login'
          : path.startsWith('/company') ? '/company/login'
          : '/student/login'
        window.location.href = dest
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:      (data) => api.post('/auth/login', data),
  signup:     (data) => api.post('/auth/signup', data),
  register:   (data) => api.post('/auth/signup', data),
  registerVerified: (data) => api.post('/auth/register-verified', data),
  me:         ()     => api.get('/auth/me'),
  onboarding: (data) => api.post('/auth/onboarding', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp:      (data) => api.post('/auth/verify-otp', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  resendOtp:      (data) => api.post('/auth/resend-otp', data),
  sendPhoneOtp:   (data) => api.post('/auth/send-phone-otp', data),
  verifyPhoneOtp: (data) => api.post('/auth/verify-phone-otp', data),
  portalInit:        (data) => api.post('/auth/portal/init', data),
  portalSendPhone:   (data) => api.post('/auth/portal/send-phone', data),
  portalVerifyPhone: (data) => api.post('/auth/portal/verify-phone', data),
  portalComplete:    (data) => api.post('/auth/portal/complete', data),
  portalResendPhone: (data) => api.post('/auth/portal/resend-phone', data),
  verifyLoginEmailOtp: (data) => api.post('/auth/verify-login-email-otp', data),
  refresh: (data) => api.post('/auth/refresh', data || {}),
  logout: (data) => api.post('/auth/logout', data || {}),
  listSessions: () => api.get('/auth/sessions'),
  revokeSession: (id) => api.delete(`/auth/sessions/${id}`),
  revokeAllSessions: () => api.delete('/auth/sessions'),
}

const crud = (base) => ({
  list: (params) => api.get(base, { params }),
  create: (data) => api.post(base, data),
  update: (id, data) => api.put(`${base}/${id}`, data),
  delete: (id) => api.delete(`${base}/${id}`),
})

export const institutionApi = {
  bootstrap: (data) => api.post('/institution/bootstrap', data),
  getMine: () => api.get('/institution/me'),
  updateMine: (data) => api.put('/institution/me', data),
  dashboard: () => api.get('/institution/dashboard'),
  analytics: () => api.get('/institution/analytics'),
  publicList: (params) => api.get('/institution/public', { params }),
  publicProfile: (slug) => api.get(`/institution/public/${slug}`),
  departments: crud('/institution/departments'),
  courses: { ...crud('/institution/courses'), insights: (id) => api.get(`/institution/courses/${id}/insights`) },
  faculty: crud('/institution/faculty'),
  students: crud('/institution/students'),
  placements: crud('/institution/placements'),
  events: crud('/institution/events'),
  promotions: crud('/institution/promotions'),
  gallery: { list: (p) => api.get('/institution/gallery', { params: p }), create: (d) => api.post('/institution/gallery', d), delete: (id) => api.delete(`/institution/gallery/${id}`) },
  admissions: { ...crud('/institution/admissions') },
  certificates: { list: (p) => api.get('/institution/certificates', { params: p }), create: (d) => api.post('/institution/certificates', d) },
}

export const companyApi = {
  bootstrap: (data) => api.post('/company/bootstrap', data),
  getMine: () => api.get('/company/me'),
  updateMine: (data) => api.put('/company/me', data),
  dashboard: () => api.get('/company/dashboard'),
  analytics: () => api.get('/company/analytics'),
  publicList: (params) => api.get('/company/public', { params }),
  publicProfile: (slug) => api.get(`/company/public/${slug}`),
  departments: crud('/company/departments'),
  jobs: crud('/company/jobs'),
  internships: crud('/company/internships'),
  employees: crud('/company/employees'),
  events: crud('/company/events'),
  promotions: crud('/company/promotions'),
  gallery: { list: (p) => api.get('/company/gallery', { params: p }), create: (d) => api.post('/company/gallery', d), delete: (id) => api.delete(`/company/gallery/${id}`) },
  certificates: { list: (p) => api.get('/company/certificates', { params: p }), create: (d) => api.post('/company/certificates', d) },
  applications: { list: (p) => api.get('/company/applications', { params: p }), update: (id, d) => api.put(`/company/applications/${id}`, d) },
}

export const discoveryApi = {
  feed: (params) => api.get('/discovery/feed', { params }),
  featured: () => api.get('/discovery/featured'),
  promotion: (id) => api.get(`/discovery/promotions/${id}`),
}

export const searchApi = {
  global: (q) => api.get('/search', { params: { q } }),
}

export const libraryApi = {
  list: (params) => api.get('/library/books', { params }),
  get: (id) => api.get(`/library/books/${id}`),
  pdfUrl: (id) => `${BASE_URL}/library/books/${id}/pdf`,
  progress: (id) => api.get(`/library/books/${id}/progress`),
  saveProgress: (id, data) => api.put(`/library/books/${id}/progress`, data),
  continueReading: () => api.get('/library/continue'),
  summary: (id) => api.get(`/library/books/${id}/summary`),
  createBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.put(`/library/books/${id}`, data),
}

export const interactionApi = {
  follow: (data) => api.post('/interaction/follow', data),
  bookmark: (data) => api.post('/interaction/bookmark', data),
  applyJob: (id, data) => api.post(`/interaction/jobs/${id}/apply`, data),
  applyInternship: (id, data) => api.post(`/interaction/internships/${id}/apply`, data),
  createReview: (data) => api.post('/interaction/reviews', data),
  getReviews: (params) => api.get('/interaction/reviews', { params }),
  myFollows: () => api.get('/interaction/follows'),
  myBookmarks: () => api.get('/interaction/bookmarks'),
  myApplications: () => api.get('/interaction/applications'),
  status: (params) => api.get('/interaction/status', { params }),
  applyAdmission: (id, data) => api.post(`/interaction/institutions/${id}/apply`, data),
}

export const adminApi = {
  overview: () => api.get('/admin/overview'),
  institutions: (params) => api.get('/admin/institutions', { params }),
  approveInstitution: (id) => api.patch(`/admin/institutions/${id}/approve`),
  suspendInstitution: (id) => api.patch(`/admin/institutions/${id}/suspend`),
  companies: (params) => api.get('/admin/companies', { params }),
  approveCompany: (id) => api.patch(`/admin/companies/${id}/approve`),
  suspendCompany: (id) => api.patch(`/admin/companies/${id}/suspend`),
  promotions: () => api.get('/admin/promotions'),
  approvePromotion: (id) => api.patch(`/admin/promotions/${id}/approve`),
  reviews: () => api.get('/admin/reviews'),
  moderateReview: (id, data) => api.patch(`/admin/reviews/${id}`, data),
  suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`),
  books: () => api.get('/admin/books'),
  reports: () => api.get('/admin/reports'),
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
  get:         ()     => api.get('/profile'),
  update:      (data) => api.put('/profile', data),
  certificate: (data) => api.post('/profile/certificate', data),
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
