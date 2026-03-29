import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const CATS = [
  { id: 'cooking',      icon: '🍳', label: 'Cooking',      placeholder: 'e.g. Quick healthy breakfast with eggs and oats' },
  { id: 'fitness',      icon: '💪', label: 'Fitness',      placeholder: 'e.g. 30-min home workout for beginners' },
  { id: 'yoga',         icon: '🧘', label: 'Yoga',         placeholder: 'e.g. Morning yoga routine for stress relief' },
  { id: 'lifestyle',    icon: '🌿', label: 'Lifestyle',    placeholder: 'e.g. How to build a productive morning routine' },
  { id: 'productivity', icon: '⚡', label: 'Productivity', placeholder: 'e.g. How to stay focused while studying' },
  { id: 'general',      icon: '✨', label: 'General',      placeholder: 'Ask anything about daily life...' }
];

export default function DailyLife() {
  const [cat, setCat]       = useState('cooking');
  const [input, setInput]   = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);

  const current = CATS.find(c => c.id === cat);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/daily-life', { message: msg, category: cat });
      setMessages(m => [...m, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, could not get a response. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-black text-white">🌿 Daily Life AI</h1>
        <p className="text-white/40 text-sm mt-1">Your personal AI for cooking, fitness, yoga, and lifestyle</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-4 flex-shrink-0">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              cat === c.id ? 'bg-violet-600 text-white' : 'glass text-white/50 hover:text-white/80'
            }`}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-10 text-white/30">
            <div className="text-4xl mb-2">{current.icon}</div>
            <p className="text-sm">Ask me anything about {current.label.toLowerCase()}!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0">{current.icon}</div>
                  <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{m.text}</div>
                </div>
              )}
              {m.role === 'user' && (
                <div className="max-w-[75%] bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white">{m.text}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm">{current.icon}</div>
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: d+'ms' }} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={current.placeholder}
          className="input-field flex-1 text-sm" />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-5 text-sm">Send</button>
      </div>
    </div>
  );
}
