/**
 * Shared portal authentication hook — Student / Institution / Company.
 * Same backend; portal-scoped redirects and role checks.
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import {
  clearOtpChallenge,
  getSelectedPortal,
  loadOtpChallenge,
  portalDashboard,
  portalSignupPath,
  saveOtpChallenge,
  setSelectedPortal,
  wrongPortalMessage,
} from './portalSession'

export default function usePortalAuth(portalProp) {
  const portal = getSelectedPortal(portalProp) || portalProp
  const {
    login,
    verifyLoginEmailOtp,
    verifyPhoneOtp,
    goToPortal,
    logout,
    rememberedEmail,
  } = useAuth()

  const [identifier, setIdentifier] = useState(rememberedEmail())
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(rememberedEmail()))
  const [otpChannel, setOtpChannel] = useState(
    portal === 'student' ? 'email' : 'email', // all portals support both; default email
  )
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('credentials')
  const [challenge, setChallenge] = useState(null)
  const [otp, setOtp] = useState('')
  const [forgot, setForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [signupCta, setSignupCta] = useState(null)

  // Lock portal for this login surface (survives refresh)
  useEffect(() => {
    if (portalProp) setSelectedPortal(portalProp)
  }, [portalProp])

  // Restore OTP challenge after refresh
  useEffect(() => {
    const saved = loadOtpChallenge()
    if (!saved || saved.portal !== portal) return
    setChallenge(saved)
    setStep('otp')
    setIdentifier(saved.identifier || '')
    setOtpChannel(saved.otpChannel || 'email')
    setInfo(saved.info || '')
    setRemember(Boolean(saved.remember))
  }, [portal])

  const dashboardPath = portalDashboard(portal)

  const finishLogin = useCallback(async (data) => {
    const token = data?.token || data?.accessToken
    if (!token) {
      setError('Login succeeded but no session token was returned. Try again.')
      setLoading(false)
      return
    }
    const role = data.user?.role || data.role
    if (portal && role && role !== portal) {
      await logout()
      clearOtpChallenge()
      setSignupCta(portalSignupPath(portal))
      setError(wrongPortalMessage(portal, [role]))
      setLoading(false)
      setStep('credentials')
      return
    }
    if (portal && !role) {
      await logout()
      clearOtpChallenge()
      setSignupCta(portalSignupPath(portal))
      setError(wrongPortalMessage(portal, []))
      setLoading(false)
      return
    }
    clearOtpChallenge()
    setSignupCta(null)
    setSelectedPortal(portal)
    goToPortal(data.user, dashboardPath)
  }, [portal, dashboardPath, goToPortal, logout])

  const handleCredentials = async (e) => {
    e?.preventDefault?.()
    setError(''); setInfo(''); setSignupCta(null); setLoading(true)
    try {
      let channel = otpChannel
      let data
      try {
        data = await login(identifier, password, portal, { otpChannel: channel, remember })
      } catch (err) {
        // Mobile OTP unavailable → fall back to email OTP (same portal)
        if (err.response?.data?.code === 'PHONE_REQUIRED' && channel === 'phone') {
          channel = 'email'
          setOtpChannel('email')
          data = await login(identifier, password, portal, { otpChannel: 'email', remember })
        } else {
          throw err
        }
      }
      if (data.requiresOtp) {
        const nextInfo = data.requiresEmailOtp || data.otpChannel === 'email'
          ? `Code sent to ${data.email || identifier}`
          : `Code sent to ${data.phoneMasked || 'your phone'}`
        const challengePayload = {
          ...data,
          portal,
          identifier,
          remember,
          otpChannel: data.otpChannel || channel,
          info: nextInfo,
        }
        setChallenge(challengePayload)
        saveOtpChallenge(challengePayload)
        setStep('otp')
        setInfo(nextInfo)
        return
      }
      await finishLogin(data)
    } catch (err) {
      const payload = err.response?.data || {}
      const msg = payload.message
      const code = payload.code
      if (code === 'WRONG_PORTAL') {
        setError(msg || wrongPortalMessage(portal, payload.existingRoles || [payload.role]))
        setSignupCta(payload.signupPath || portalSignupPath(portal))
      } else {
        setError(msg || 'Invalid email/mobile or password.')
        setSignupCta(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e) => {
    e?.preventDefault?.()
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setError(''); setLoading(true)
    try {
      const rememberEmail = remember && String(identifier).includes('@') ? identifier : null
      const channel = challenge?.otpChannel || otpChannel
      let data
      if (challenge?.requiresEmailOtp || channel === 'email') {
        data = await verifyLoginEmailOtp(
          challenge.challengeToken,
          otp,
          rememberEmail,
          remember,
          portal,
        )
      } else {
        data = await verifyPhoneOtp({
          code: otp,
          challengeToken: challenge.challengeToken,
        }, rememberEmail, remember, portal)
      }
      await finishLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e?.preventDefault?.()
    setError(''); setLoading(true)
    try {
      await authApi.forgotPassword({
        email: resetEmail || (String(identifier).includes('@') ? identifier : ''),
        portal,
      })
      setInfo('If an account exists, a reset code was sent to your email.')
      setForgot('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e?.preventDefault?.()
    setError(''); setLoading(true)
    try {
      await authApi.resetPassword({
        email: resetEmail || identifier,
        otp: resetOtp,
        password: newPassword,
        portal,
      })
      setInfo('Password updated. Sign in with your new password.')
      setForgot(false)
      setStep('credentials')
      clearOtpChallenge()
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  const backToCredentials = () => {
    setStep('credentials')
    setOtp('')
    setError('')
    setChallenge(null)
    clearOtpChallenge()
  }

  return {
    portal,
    dashboardPath,
    identifier, setIdentifier,
    password, setPassword,
    remember, setRemember,
    otpChannel, setOtpChannel,
    error, setError,
    info, setInfo,
    loading,
    step,
    challenge,
    otp, setOtp,
    forgot, setForgot,
    resetEmail, setResetEmail,
    resetOtp, setResetOtp,
    newPassword, setNewPassword,
    handleCredentials,
    handleOtp,
    handleForgot,
    handleReset,
    backToCredentials,
    signupCta,
  }
}
