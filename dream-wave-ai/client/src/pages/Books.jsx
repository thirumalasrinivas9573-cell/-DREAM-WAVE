import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LEVEL_COLOR = { Beginner: 'emerald', Intermediate: 'amber', Advanced: 'red' };
const CAT_COLOR   = { Technical: 'violet', Mindset: 'pink', Career: 'blue', Finance: 'emerald' };

export default function Books() {
  const { user } = useAuth();
  const [goal, setGoal]     = useState(user?.goal || '');
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const fetch = async () => {
    if (!goal.trim()) { setError('Enter a goal first'); return; }
    setError(''); setLoading(true); setBooks([]);
    try {
      const { data } = await api.get(`/books/${encodeURIComponent(goal.trim())}`);
      setBooks(data.books || []);
    } catch { setError('Failed to fetch books. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">📖 Book Recommendations</h1>
        <p className="text-white/40 text-sm mt-1">AI-curated books based on your career goal</p>
      </div>

      <div className="glass rounded-2xl p-5 mb-6 flex gap-3 flex-wrap">
        <input value={goal} onChange={e => setGoal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetch()}
          placeholder="Enter your career goal (e.g. Software Engineer)"
          className="input-field flex-1 text-sm min-w-48" />
        <button onClick={fetch} disabled={loading} className="btn-primary px-6 whitespace-nowrap">
          {loading ? '⏳ Loading...' : '🔍 Get Books'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-violet-300 text-sm">Finding the best books for you...</p>
        </div>
      )}

      <AnimatePresence>
        {books.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((b, i) => {
              const lc = LEVEL_COLOR[b.level] || 'violet';
              const cc = CAT_COLOR[b.category] || 'violet';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-3xl">📚</div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${lc}-500/20 text-${lc}-300 border border-${lc}-500/30`}>{b.level}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${cc}-500/20 text-${cc}-300 border border-${cc}-500/30`}>{b.category}</span>
                      {b.free && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Free</span>}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm leading-tight">{b.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">by {b.author}</p>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed flex-1">{b.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
