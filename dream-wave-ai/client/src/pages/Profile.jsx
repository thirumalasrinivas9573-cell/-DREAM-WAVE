import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../services/api';

const LEVEL_LABELS = {
  1: 'Beginner', 2: 'Explorer', 4: 'Learner',
  6: 'Achiever', 8: 'Expert', 10: 'Master'
};

function getLevelLabel(level) {
  const keys = [10, 8, 6, 4, 2, 1];
  for (const k of keys) { if (level >= k) return LEVEL_LABELS[k]; }
  return 'Beginner';
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-xs text-violet-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:   user?.name  || '',
    bio:    user?.bio   || '',
    goal:   user?.goal  || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [copied, setCopied]   = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const { data } = await updateMe(form);
      setUser(data.user);
      setMsg('✅ Profile updated!');
      setEditing(false);
    } catch (err) {
      setMsg(err.response?.data?.message || '❌ Update failed');
    } finally { setSaving(false); }
  };

  const copyAaId = () => {
    navigator.clipboard.writeText(user?.aaId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const level     = user?.level || 1;
  const levelLabel = getLevelLabel(level);
  const streakPct  = Math.min(((user?.streak || 0) / 100) * 100, 100);
  const initials   = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 max-w-2xl mx-auto">

      {/* Header card */}
      <div className="glass rounded-3xl p-6 mb-6 relative overflow-hidden">
        {/* bg glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/40" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-2xl font-black text-white border-2 border-violet-500/40">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{user?.name}</h1>
            <p className="text-white/40 text-sm truncate">{user?.email}</p>
            {user?.bio && <p className="text-white/60 text-sm mt-1 leading-relaxed">{user.bio}</p>}

            {/* AA ID */}
            <button onClick={copyAaId}
              className="mt-2 flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1.5 hover:bg-violet-500/20 transition-colors group">
              <span className="font-mono text-violet-400 text-sm font-bold">{user?.aaId}</span>
              <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">
                {copied ? '✅ Copied!' : '📋 Copy'}
              </span>
            </button>
          </div>

          {/* Level badge */}
          <div className="flex-shrink-0 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-amber-400">{level}</span>
              <span className="text-xs text-amber-400/60">LVL</span>
            </div>
            <p className="text-xs text-white/40 mt-1">{levelLabel}</p>
          </div>
        </div>

        {/* Goal */}
        {user?.goal && (
          <div className="relative mt-4 bg-white/5 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="text-sm text-white/70">{user.goal}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon="🔥" label="Streak" value={user?.streak || 0} sub="/ 100 → credit" />
        <StatCard icon="💰" label="Credits" value={user?.credits || 0} />
        <StatCard icon="⭐" label="Level" value={level} sub={levelLabel} />
      </div>

      {/* Streak bar */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>🔥 Streak to next credit</span>
          <span>{user?.streak || 0} / 100</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            animate={{ width: `${streakPct}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>

      {/* Edit / View */}
      {!editing ? (
        <button onClick={() => { setEditing(true); setMsg(''); setForm({ name: user?.name || '', bio: user?.bio || '', goal: user?.goal || '', avatar: user?.avatar || '' }); }}
          className="btn-primary w-full">
          ✏️ Edit Profile
        </button>
      ) : (
        <form onSubmit={save} className="glass rounded-2xl p-5 space-y-4">
          <p className="text-sm font-bold text-white/70">Edit Profile</p>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Display Name</label>
            <input name="name" value={form.name} onChange={handle}
              className="input-field text-sm" placeholder="Your name" required />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handle}
              className="input-field text-sm resize-none" rows={2}
              placeholder="Tell something about yourself..." maxLength={200} />
            <p className="text-xs text-white/20 mt-1 text-right">{form.bio.length}/200</p>
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Career Goal</label>
            <input name="goal" value={form.goal} onChange={handle}
              className="input-field text-sm" placeholder="e.g. Software Engineer" />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Avatar URL</label>
            <input name="avatar" value={form.avatar} onChange={handle}
              className="input-field text-sm" placeholder="https://..." />
            <p className="text-xs text-white/20 mt-1">Paste any image URL</p>
          </div>

          {msg && (
            <p className={`text-sm px-3 py-2 rounded-lg border ${msg.startsWith('✅') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
              {msg}
            </p>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="flex-1 text-sm glass rounded-xl py-3 text-white/50 hover:text-white/80 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Member since */}
      <p className="text-center text-xs text-white/20 mt-6">
        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'recently'}
      </p>
    </motion.div>
  );
}
