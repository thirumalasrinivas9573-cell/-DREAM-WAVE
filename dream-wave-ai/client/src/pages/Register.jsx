import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';

export default function Register() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', goal: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('Name, email and password are required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      const res = await registerApi(form);
      saveAuth(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.userMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0B0F19' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
            🌊
          </div>
          <h1 className="text-2xl font-bold text-white">Dream Wave AI</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Start your AI-powered journey</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(59,130,246,0.15)' }}>
          <h2 className="text-lg font-bold text-white mb-5">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Full Name *</label>
              <input className="input-dark" placeholder="Your name"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Email *</label>
              <input type="email" className="input-dark" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Password *</label>
              <input type="password" className="input-dark" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Your Goal <span style={{ color: '#475569' }}>(optional)</span>
              </label>
              <input className="input-dark" placeholder="e.g. Become a Full Stack Developer"
                value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-neon w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />
                  Creating account...
                </span>
              ) : '🚀 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: '#3b82f6' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
