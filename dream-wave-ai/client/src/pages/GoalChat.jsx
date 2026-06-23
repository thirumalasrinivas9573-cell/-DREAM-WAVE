import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { startGoalChat, continueGoalChat, awardPoints } from '../services/api';
import GoalHistory from '../components/GoalHistory';
import { PointToast } from '../components/GamificationPanel';
import { useDemo } from '../demo/DemoContext';
import { useJourney } from '../context/JourneyContext';
import DemoGoalChat from '../demo/DemoGoalChat';

// ── Typing effect ──────────────────────────────────────────────────────────
function TypingMessage({ text, onDone }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) { clearInterval(id); onDone?.(); }
    }, 14);
    return () => clearInterval(id);
  }, [text]);
  return <span className="whitespace-pre-wrap">{displayed}<span className="animate-pulse opacity-60">|</span></span>;
}

// ── Analysis result card ───────────────────────────────────────────────────
function AnalysisCard({ data }) {
  if (!data) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-2">
      <div className="bg-gradient-to-br from-violet-600/20 to-pink-600/10 border border-violet-500/30 rounded-2xl p-5">
        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">🎯 Career Suggestion</p>
        <p className="text-xl font-black text-white">{data.careerSuggestion}</p>
        {data.alternativeCareers?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {data.alternativeCareers.map(c => (
              <span key={c} className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-400 mb-2">💪 Strengths</p>
          <ul className="space-y-1">{data.strengths?.map(s => <li key={s} className="text-xs text-white/70">• {s}</li>)}</ul>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs font-bold text-amber-400 mb-2">📈 Improve</p>
          <ul className="space-y-1">{data.areasToImprove?.map(a => <li key={a} className="text-xs text-white/70">• {a}</li>)}</ul>
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <p className="text-xs font-bold text-blue-400 mb-1">🗺️ Recommended Path</p>
        <p className="text-sm text-white/80 leading-relaxed">{data.recommendedPath}</p>
        <p className="text-xs text-white/40 mt-2">⏱ Timeline: {data.timelineEstimate}</p>
      </div>
      <div className="glass rounded-xl p-4">
        <p className="text-xs font-bold text-pink-400 mb-2">⚡ First Steps</p>
        <ol className="space-y-1">
          {data.firstSteps?.map((s, i) => (
            <li key={i} className="text-sm text-white/80 flex gap-2">
              <span className="text-pink-400 font-bold">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>
      {data.motivationalMessage && (
        <div className="bg-gradient-to-r from-violet-600/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-pink-300 italic">"{data.motivationalMessage}"</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function GoalChat() {
  const { isDemo } = useDemo();
  if (isDemo) return <DemoGoalChat />;

  const { setGoal: setJourneyGoal } = useJourney();
  const navigate = useNavigate();

  const [messages, setMessages]     = useState([]);
  const [sessionId, setSessionId]   = useState(null);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [inputReady, setInputReady] = useState(false);
  const [step, setStep]             = useState(0);
  const [completed, setCompleted]   = useState(false);
  const [summary, setSummary]       = useState(null);
  const [started, setStarted]       = useState(false);
  const [toast, setToast]           = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addMessage = (role, text, isTyping = false) => {
    setMessages(m => [...m, { role, text, id: Date.now() + Math.random(), isTyping }]);
  };

  const handleStart = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const { data } = await startGoalChat();
      setSessionId(data.sessionId);
      setStep(data.step);
      addMessage('assistant', data.message, true);
    } catch {
      addMessage('assistant', 'Failed to start. Please refresh and try again.');
      setInputReady(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const val = input.trim();
    if (!val || !inputReady || loading || completed) return;

    setInput('');
    setInputReady(false);
    addMessage('user', val);
    setLoading(true);

    try {
      const { data } = await continueGoalChat(sessionId, val);
      setStep(data.step);
      addMessage('assistant', data.message, true);
      if (data.completed) {
        setCompleted(true);
        if (data.summary) setSummary(data.summary);
        // Save goal to journey context
        const goalText = data.summary?.careerSuggestion || data.summary?.recommendedPath || '';
        if (goalText) setJourneyGoal(goalText);
        // Award points for completing goal chat
        awardPoints('goal_created').then(r => {
          setToast({ points: r.data.pointsAwarded, trigger: 'goal_created' });
        }).catch(() => {});
      }
    } catch {
      addMessage('assistant', 'AI is thinking... please try again.');
      setInputReady(true);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(Math.round((step / 5) * 100), 100);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-black text-white">🎯 Set Your Goal</h1>
        <p className="text-white/40 text-sm mt-0.5">AI will guide you through 5 questions to build your career plan</p>
        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <p className="text-xs text-white/30 mt-1">{Math.min(step, 5)} / 5 questions</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
        {/* Start button */}
        {!started && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-5xl">🌊</div>
            <p className="text-white/60 text-sm text-center max-w-xs">
              Ready to discover your career path? Our AI will ask you 5 smart questions.
            </p>
            <button onClick={handleStart} disabled={loading}
              className="btn-primary px-8 py-3">
              {loading ? 'Starting...' : 'Start Goal Chat ✨'}
            </button>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-end gap-2 max-w-[88%]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs flex-shrink-0 mb-0.5">🤖</div>
                  <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-white/90 leading-relaxed">
                    {msg.isTyping && idx === messages.length - 1 && !loading
                      ? <TypingMessage text={msg.text} onDone={() => { setInputReady(!completed); }} />
                      : <span className="whitespace-pre-wrap">{msg.text}</span>
                    }
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="max-w-[75%] bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white">
                  {msg.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading dots */}
        {loading && started && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs">🤖</div>
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Analysis result */}
        {summary && <AnalysisCard data={summary} />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {started && !completed && (
        <div className="flex-shrink-0 flex gap-2 mt-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={!inputReady || loading}
            placeholder={inputReady ? 'Type your answer...' : 'AI is thinking...'}
            className="input-field flex-1 text-sm" />
          <button onClick={handleSend} disabled={!inputReady || !input.trim() || loading}
            className="btn-primary px-5 py-3 text-sm">Send</button>
        </div>
      )}

      {completed && (
        <div className="flex-shrink-0 mt-3 space-y-3">
          <p className="text-emerald-400 text-sm font-semibold text-center">✅ Goal analysis complete! Saved to your profile.</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/dashboard/roadmap')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
              🗺️ View Roadmap
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/dashboard/smart-tasks')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              🚀 Start Learning
            </motion.button>
          </div>
          <div className="text-center">
            <button onClick={() => window.location.reload()} className="text-xs text-white/30 hover:text-white/60 underline">
              Start a new goal chat
            </button>
          </div>
        </div>
      )}

      {/* Past goals with edit/delete/status/progress */}
      <GoalHistory />

      {/* Point toast */}
      <AnimatePresence>
        {toast && <PointToast points={toast.points} trigger={toast.trigger} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
