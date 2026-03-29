import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Key } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    aaid: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isAAIDLogin, setIsAAIDLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const credentials = isAAIDLogin 
      ? { aaid: formData.aaid }
      : { email: formData.email, password: formData.password }

    const result = await login(credentials, isAAIDLogin)
    
    if (result.success) {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">DW</span>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setIsAAIDLogin(false)}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                !isAAIDLogin
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Email Login
            </button>
            <button
              onClick={() => setIsAAIDLogin(true)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                isAAIDLogin
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              AAID Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isAAIDLogin ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AAID
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="aaid"
                    value={formData.aaid}
                    onChange={handleChange}
                    placeholder="Enter your AAID"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="input-field pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
