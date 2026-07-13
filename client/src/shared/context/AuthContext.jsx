import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { authApi } from '../services/api'

const AuthContext = createContext()
const REMEMBER_KEY = 'dw_remember_email'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((token, refreshToken, nextUser, rememberEmail) => {
    if (token) localStorage.setItem('token', token)
    // Refresh primarily lives in HttpOnly cookie; keep local copy for SPA refresh fallback
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    if (nextUser) setUser(nextUser)
    if (rememberEmail) localStorage.setItem(REMEMBER_KEY, rememberEmail)
    else if (rememberEmail === null) localStorage.removeItem(REMEMBER_KEY)
  }, [])

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem('token')
      try {
        if (token) {
          const res = await api.get('/auth/me')
          setUser(res.data.user)
        } else {
          // Cookie-based refresh (withCredentials) or body fallback
          const { data } = await authApi.refresh({})
          persistSession(data.token, data.refreshToken, data.user)
        }
      } catch {
        try {
          const refresh = localStorage.getItem('refreshToken')
          if (refresh) {
            const { data } = await authApi.refresh({ refreshToken: refresh })
            persistSession(data.token, data.refreshToken, data.user)
          } else {
            clearLocalSession()
          }
        } catch {
          clearLocalSession()
        }
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [persistSession, clearLocalSession])

  const login = async (emailOrPhone, password, portal, options = {}) => {
    const body = {
      identifier: emailOrPhone,
      email: String(emailOrPhone || '').includes('@') ? emailOrPhone : undefined,
      phone: String(emailOrPhone || '').includes('@') ? undefined : emailOrPhone,
      password,
      remember: options.remember !== false,
    }
    if (portal) body.portal = portal
    if (options.otpChannel) body.otpChannel = options.otpChannel
    else if (portal === 'institution' || portal === 'company') body.otpChannel = 'email'
    const { data } = await api.post('/auth/login', body)
    if (data.requiresOtp) return data
    if (data.token) {
      persistSession(
        data.token,
        data.refreshToken,
        data.user,
        options.remember && String(emailOrPhone).includes('@') ? emailOrPhone : null,
      )
    }
    return data
  }

  const verifyLoginEmailOtp = async (challengeToken, otp, rememberEmail, remember = true) => {
    const { data } = await authApi.verifyLoginEmailOtp({
      challengeToken,
      otp,
      remember,
    })
    persistSession(data.token, data.refreshToken, data.user, rememberEmail)
    return data
  }

  const verifyPhoneOtp = async (payload, rememberEmail, remember = true) => {
    const { data } = await authApi.verifyPhoneOtp({ ...payload, remember })
    if (data.token) persistSession(data.token, data.refreshToken, data.user, rememberEmail)
    return data
  }

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password })
    // No session until email OTP verification
    return data
  }

  const logout = async (allSessions = false) => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      await authApi.logout({ refreshToken, allSessions })
    } catch { /* ignore */ }
    clearLocalSession()
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))
  const rememberedEmail = () => localStorage.getItem(REMEMBER_KEY) || ''

  const listSessions = () => authApi.listSessions()
  const revokeSession = (id) => authApi.revokeSession(id)
  const revokeAllSessions = () => authApi.revokeAllSessions()

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout, updateUser, applySession: persistSession,
      verifyLoginEmailOtp, verifyPhoneOtp, rememberedEmail,
      listSessions, revokeSession, revokeAllSessions,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
