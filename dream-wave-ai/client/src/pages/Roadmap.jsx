import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useJourney } from '../context/JourneyContext';

// ── Small reusable components ──────────────────────────────────────────────
const Badge = ({ text, color = 'violet' }) => {
  const colors = {
    violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    pink:   'bg-pink-500/20 text-pink-300 border-pink-500/30',
    emerald:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
    blue:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
    red:    'bg-red-500/20 text-red-300 border-red-500/30'
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[color] || colors.violet}`}>{text}</span>;
};

const Section = ({ icon, title, children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-5 mb-4">
    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
      <span>{icon}</span>{title}
    </h3>
    {children}
  </motion.div>
);

// ── Main Roadmap page ──────────────────────────────────────────────────────
export default function Roadmap() {
  const [sessions, setSessions]   = useState([]);
  const [roadmaps, setRoadmaps]   = useState([]);
  const [selected, setSelected]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [data, setData]           = useState(null);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('steps');
  const navigate = useNavigate();
  const { journey, setGoal: setJourneyGoal } = useJourney();

  useEffect(() => {
    api.get('/goal/history').then(r => setSessions(r.data.sessions || [])).catch(() => {});
    api.get('/roadmap/list').then(r => setRoadmaps(r.data.roadmaps || [])).catch(() => {});
  }, []);

  const generate = async () => {
    if (!selected) { setError('Select a goal session first'); return; }
    setError(''); setLoading(true); setData(null);
    try {
      const { data: res } = await api.post('/roadmap/generate', { sessionId: selected });
      setData(res);
      // Sync goal to journey context
      if (res.goal && !journey.goal) setJourneyGoal(res.goal);
      api.get('/roadmap/list').then(r => setRoadmaps(r.data.roadmaps || [])).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.');
    } finally { setLoading(false); }
  };

  const loadRoadmap = async (id) => {
    setLoading(true); setData(null); setError('');
    try {
      const { data: res } = await api.get(`/roadmap/${id}`);
      setData({ roadmap: res.roadmap, goal: res.goal });
    } catch { setError('Could not load roadmap'); }
    finally { setLoading(false); }
  };

  const r = data?.roadmap;
  const TABS = ['steps', 'skills', 'courses', 'colleges', 'exams', 'timeline'];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">🗺️ Career Roadmap</h1>
        <p className="text-white/40 text-sm mt-1">AI-generated step-by-step career path with exams, colleges & timeline</p>
      </div>

      {/* Generate panel */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Generate New Roadmap</h2>
        {sessions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/40 text-sm">Complete the AI Goal Chat first.</p>
            <a href="/dashboard/goal" className="text-violet-400 text-sm underline mt-2 inline-block">Go to Set Goal →</a>
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            <select value={selected} onChange={e => setSelected(e.target.value)}
              disabled={loading} className="input-field flex-1 text-sm min-w-48">
              <option value="">— Select goal session —</option>
              {sessions.map(s => (
                <option key={s._id} value={s._id}>
                  {s.goal || 'Goal'} — {new Date(s.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <button onClick={generate} disabled={loading || !selected} className="btn-primary px-6 whitespace-nowrap">
              {loading ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
      </div>

      {/* Past roadmaps */}
      {roadmaps.length > 0 && !data && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Your Roadmaps</h2>
          <div className="space-y-2">
            {roadmaps.map(rm => (
              <button key={rm._id} onClick={() => loadRoadmap(rm._id)}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                <div>
                  <p className="text-sm font-semibold text-white">{rm.goal}</p>
                  <p className="text-xs text-white/40">{new Date(rm.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-violet-400 text-xs">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass rounded-2xl p-10 text-center mb-6">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-violet-300 font-semibold">Building your personalized roadmap...</p>
          <p className="text-white/30 text-xs mt-1">This takes about 20-30 seconds</p>
        </div>
      )}

      {/* Roadmap display */}
      {r && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Goal header */}
          <div className="bg-gradient-to-br from-violet-600/20 to-pink-600/10 border border-violet-500/30 rounded-2xl p-5 mb-5">
            <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-1">Your Career Goal</p>
            <h2 className="text-xl font-black text-white mb-2">{data.goal}</h2>
            <p className="text-white/60 text-sm">{r.currentStage}</p>
            {r.overview && <p className="text-white/50 text-sm mt-2 leading-relaxed">{r.overview}</p>}
            <div className="flex gap-3 mt-4 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/dashboard/smart-tasks')}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                🚀 Start Learning
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/dashboard/books?topic=' + encodeURIComponent(data.goal))}
                className="px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: '#fda4af' }}>
                📖 Recommended Books
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap mb-5 p-1 bg-white/5 rounded-xl">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all min-w-16 ${
                  activeTab === tab ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
                }`}>
                {tab === 'steps' ? '📋 Steps' : tab === 'skills' ? '💪 Skills' : tab === 'courses' ? '📚 Courses' :
                 tab === 'colleges' ? '🏛️ Colleges' : tab === 'exams' ? '📝 Exams' : '📅 Timeline'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>

              {/* STEPS */}
              {activeTab === 'steps' && (
                <div className="space-y-3">
                  {(r.nextSteps || []).map((step, i) => (
                    <div key={i} className="glass rounded-xl p-4 flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {step.step || i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-white text-sm">{step.title}</p>
                          {step.duration && <Badge text={step.duration} color="violet" />}
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                        {/* Start Learning button */}
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          onClick={() => navigate(`/dashboard/smart-tasks?day=${i + 1}&topic=${encodeURIComponent(step.title)}`)}
                          className="mt-3 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
                          🚀 Start Learning →
                        </motion.button>
                      </div>
                    </div>
                  ))}
                  {/* Milestones */}
                  {(r.milestones || []).length > 0 && (
                    <div className="glass rounded-xl p-4 mt-4">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">🏆 Key Milestones</p>
                      <div className="space-y-2">
                        {r.milestones.map((m, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="text-amber-400 mt-0.5">◆</span>
                            <div>
                              <span className="text-white text-sm font-semibold">{m.title}</span>
                              <span className="text-white/40 text-xs ml-2">({m.timeframe})</span>
                              {m.description && <p className="text-white/50 text-xs mt-0.5">{m.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SKILLS */}
              {activeTab === 'skills' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(r.skills || []).map((s, i) => {
                    const priorityColor = s.priority === 'High' ? 'red' : s.priority === 'Medium' ? 'amber' : 'emerald';
                    return (
                      <div key={i} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-white text-sm">{s.name}</p>
                          <Badge text={s.priority || 'Medium'} color={priorityColor} />
                        </div>
                        <Badge text={s.level || 'Beginner'} color="violet" />
                        {s.resources && <p className="text-white/50 text-xs mt-2">📖 {s.resources}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* COURSES */}
              {activeTab === 'courses' && (
                <div className="space-y-3">
                  {(r.courses || []).map((c, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-white/50 text-xs mt-0.5">{c.platform}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {c.cost && <Badge text={c.cost} color={c.cost === 'Free' ? 'emerald' : 'amber'} />}
                          {c.duration && <Badge text={c.duration} color="violet" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COLLEGES */}
              {activeTab === 'colleges' && (
                <div className="space-y-3">
                  {(r.colleges || []).map((c, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-white/50 text-xs mt-0.5">{c.location}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge text={c.type || 'Government'} color={c.type === 'Government' ? 'emerald' : 'blue'} />
                          {c.ranking && <Badge text={`Rank: ${c.ranking}`} color="amber" />}
                        </div>
                      </div>
                      {c.fees && <p className="text-white/40 text-xs mt-2">💰 Fees: {c.fees}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* EXAMS */}
              {activeTab === 'exams' && (
                <div className="space-y-3">
                  {(r.exams || []).map((e, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                        <p className="font-bold text-white text-sm">{e.name}</p>
                        <div className="flex gap-2">
                          <Badge text={e.importance || 'High'} color={e.importance === 'High' ? 'red' : 'amber'} />
                          <Badge text={e.type || 'Entrance'} color="violet" />
                        </div>
                      </div>
                      {e.eligibility && <p className="text-white/50 text-xs">✅ {e.eligibility}</p>}
                      {e.frequency  && <p className="text-white/40 text-xs mt-1">📅 {e.frequency}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-violet-500/30" />
                  <div className="space-y-4 pl-12">
                    {(r.timeline || []).map((t, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-7 w-4 h-4 rounded-full bg-violet-600 border-2 border-violet-400 top-1" />
                        <div className="glass rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge text={t.period} color="violet" />
                          </div>
                          <p className="font-semibold text-white text-sm">{t.focus}</p>
                          {t.goal && <p className="text-white/50 text-xs mt-1">🎯 {t.goal}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Salary + Tips */}
          {(r.salaryProgression || r.tips) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {r.salaryProgression?.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">💰 Salary Progression</p>
                  <div className="space-y-2">
                    {r.salaryProgression.map((s, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-white">{s.stage}</p>
                          <p className="text-xs text-white/40">{s.experience}</p>
                        </div>
                        <Badge text={s.salary} color="emerald" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {r.tips?.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">💡 Pro Tips</p>
                  <ul className="space-y-2">
                    {r.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-white/70 flex gap-2">
                        <span className="text-amber-400 flex-shrink-0">→</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
