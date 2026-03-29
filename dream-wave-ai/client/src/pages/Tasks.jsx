import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const { user, setUser } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [goal, setGoal]     = useState(user?.goal || '');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    setLoading(true);
    try { const { data } = await api.get('/tasks/list'); setTasks(data.tasks || []); }
    catch {} finally { setLoading(false); }
  };

  const generate = async () => {
    if (!goal.trim()) return;
    setGenLoading(true);
    try {
      const { data } = await api.post('/tasks/generate', { goal });
      setTasks(prev => [...data.tasks, ...prev]);
    } catch {} finally { setGenLoading(false); }
  };

  const complete = async (id) => {
    try {
      const { data } = await api.put(`/tasks/complete/${id}`);
      setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: true } : t));
      if (setUser) setUser(u => ({ ...u, streak: data.streak, credits: data.credits }));
    } catch {}
  };

  const pending   = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  const streakPct = Math.min(((user?.streak || 0) / 100) * 100, 100);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">✅ Daily Tasks</h1>
        <p className="text-white/40 text-sm mt-1">Complete tasks to earn streak points and credits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Streak', value: user?.streak || 0, icon: '🔥', max: 100 },
          { label: 'Credits', value: user?.credits || 0, icon: '💰' },
          { label: 'Done Today', value: completed.length, icon: '✅' }
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Streak bar */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>🔥 Streak Progress</span>
          <span>{user?.streak || 0} / 100 → 1 Credit</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            animate={{ width: `${streakPct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Generate */}
      <div className="glass rounded-xl p-4 mb-6 flex gap-3 flex-wrap">
        <input value={goal} onChange={e => setGoal(e.target.value)}
          placeholder="Your goal (e.g. Software Engineer)"
          className="input-field flex-1 text-sm min-w-40" />
        <button onClick={generate} disabled={genLoading || !goal.trim()} className="btn-primary px-5 whitespace-nowrap text-sm">
          {genLoading ? '⏳ Generating...' : '✨ Generate Tasks'}
        </button>
      </div>

      {/* Pending tasks */}
      {loading ? (
        <div className="text-center py-8"><div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Pending ({pending.length})</p>
              <div className="space-y-3">
                <AnimatePresence>
                  {pending.map(t => (
                    <motion.div key={t._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="glass rounded-xl p-4 flex items-start gap-3">
                      <button onClick={() => complete(t._id)}
                        className="w-6 h-6 rounded-full border-2 border-violet-500/50 hover:border-violet-400 hover:bg-violet-500/20 flex-shrink-0 mt-0.5 transition-all" />
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{t.title}</p>
                        {t.description && <p className="text-white/50 text-xs mt-0.5">{t.description}</p>}
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">{t.type}</span>
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">+{t.points} pts</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Completed ({completed.length})</p>
              <div className="space-y-2">
                {completed.map(t => (
                  <div key={t._id} className="glass rounded-xl p-3 flex items-center gap-3 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-white/60 line-through">{t.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && !loading && (
            <div className="text-center py-12 text-white/30">
              <div className="text-4xl mb-3">📋</div>
              <p>No tasks yet. Generate some above!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
