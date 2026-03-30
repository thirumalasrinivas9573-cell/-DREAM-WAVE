import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await register({ name: form.name, email: form.email, password: form.password });
      saveAuth(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌊</div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Dream Wave AI
          </h1>
          <p className="text-white/40 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">Full Name</label>
            <input name="name" type="text" value={form.name} onChange={handle}
              className="input-field" placeholder="Your name" required />
          </div>
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              className="input-field" placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div>
            <label className="text-white/60 text-sm font-medium block mb-1.5">Confirm Password</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handle}
              className="input-field" placeholder="Repeat password" required minLength={6} />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
