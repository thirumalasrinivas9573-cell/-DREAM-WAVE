import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const STEPS = [
  'Analyzing your career goal...',
  'Researching industry trends...',
  'Building your learning roadmap...',
  'Compiling salary & growth data...',
  'Writing case studies...',
  'Generating your PDF report...'
];

export default function Report() {
  const [sessions, setSessions]   = useState([]);
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [stepIdx, setStepIdx]     = useState(0);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  useEffect(() => {
    // Load completed goal sessions
    api.get('/goal/history').then(r => setSessions(r.data.sessions || [])).catch(() => {});
    // Load existing reports
    api.get('/report/list').then(r => setReports(r.data.reports || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setStepIdx(i => (i + 1) % STEPS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [loading]);

  const generate = async () => {
    if (!selectedSession) { setError('Please select a goal session first'); return; }
    setError(''); setLoading(true); setResult(null); setStepIdx(0);
    try {
      const { data } = await api.post('/report/generate', { sessionId: selectedSession });
      setResult(data);
      // Refresh reports list
      api.get('/report/list').then(r => setReports(r.data.reports || [])).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Report generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">📊 Career R&D Report</h1>
        <p className="text-white/40 text-sm mt-1">Generate a detailed 10–12 page career research report powered by AI</p>
      </div>

      {/* Generate section */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Generate New Report</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-white/50 text-sm">Complete the AI Goal Chat first to generate a report.</p>
            <a href="/dashboard/goal" className="inline-block mt-3 text-violet-400 text-sm hover:text-violet-300 underline">
              Go to Set Goal →
            </a>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="text-white/60 text-sm font-medium block mb-2">Select your goal session</label>
              <select
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                className="input-field text-sm"
                disabled={loading}
              >
                <option value="">— Choose a session —</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.goal || 'Goal session'} — {new Date(s.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <button onClick={generate} disabled={loading || !selectedSession} className="btn-primary w-full">
              {loading ? 'Generating...' : '✨ Generate Report'}
            </button>
          </>
        )}
      </div>

      {/* Loading animation */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl p-8 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={stepIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} className="text-violet-300 font-semibold text-sm">
                {STEPS[stepIdx]}
              </motion.p>
            </AnimatePresence>
            <p className="text-white/30 text-xs mt-2">This may take 30–60 seconds</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= stepIdx ? 'w-6 bg-violet-500' : 'w-2 bg-white/10'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success result */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600/20 to-violet-600/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">✅</div>
            <div>
              <p className="font-bold text-white">Report Generated!</p>
              <p className="text-white/50 text-xs">{result.sections} sections · PDF ready</p>
            </div>
          </div>
          <a href={result.reportUrl} target="_blank" rel="noreferrer"
            className="btn-primary w-full text-center block">
            📥 Download PDF Report
          </a>
        </motion.div>
      )}

      {/* Past reports */}
      {reports.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Your Reports</h2>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">{r.goal || 'Career Report'}</p>
                  <p className="text-xs text-white/40">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <a href={r.reportUrl} target="_blank" rel="noreferrer"
                  className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-lg hover:bg-violet-600/30 transition-colors">
                  📥 Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
