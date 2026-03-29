import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [mode, setMode]   = useState('email'); // 'email' | 'aa'
  const [form, setForm]   = useState({ email: '', aaId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let data;
      if (mode === 'email') {
        ({ data } = await login({ email: form.email, password: form.password }));
      } else {
        ({ data } = await axios.post('/api/auth/login-aa', { aaId: form.aaId, password: form.password }));
      }
      saveAuth(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌊</div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Dream Wave AI
          </h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
          <button type="button" onClick={() => setMode('email')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode==='email' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'}`}>
            Email
          </button>
          <button type="button" onClick={() => setMode('aa')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode==='aa' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'}`}>
            AA ID
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'email' ? (
            <div>
              <label className="text-white/60 text-sm font-medium block mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input-field" placeholder="you@example.com" required />
            </div>
          ) : (
            <div>
              <label className="text-white/60 text-sm font-medium block mb-1.5">AA ID</label>
              <input name="aaId" type="text" value={form.aaId} onChange={handle}
                className="input-field" placeholder="e.g. AA123456" required />
            </div>
          )}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              className="input-field" placeholder="••••••••" required />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          No account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
