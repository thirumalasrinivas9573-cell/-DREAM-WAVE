import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBooks, searchBooks, filterBooks, recommendBooks, awardPoints, googleBooksSearch } from '../services/api';

// ── Constants ──────────────────────────────────────────────────────────────
const SUBJECTS = ['', 'CSE', 'ECE', 'Mechanical', 'Civil', 'MBA', 'Medicine', 'Law', 'Design', 'Data Science', 'AI/ML'];
const LEVELS   = ['', 'Beginner', 'Intermediate', 'Advanced'];
const RECENTLY_VIEWED_KEY = 'dw_recently_viewed_books';
const MAX_RECENT = 6;

const LEVEL_STYLE = {
  Beginner:     { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
  Intermediate: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
  Advanced:     { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5' },
};
const CAT_STYLE = {
  Technical: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#c4b5fd' },
  Mindset:   { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', text: '#f9a8d4' },
  Career:    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' },
  Finance:   { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
};

// ── Recently viewed helpers ────────────────────────────────────────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'); }
  catch { return []; }
}
function addRecent(book) {
  const list = getRecent().filter(b => b.title !== book.title);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([book, ...list].slice(0, MAX_RECENT)));
}

// ── BookCard ───────────────────────────────────────────────────────────────
function BookCard({ book, index, onView }) {
  const ls = LEVEL_STYLE[book.level] || LEVEL_STYLE.Beginner;
  const cs = CAT_STYLE[book.category] || CAT_STYLE.Technical;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group cursor-default"
      style={{ boxShadow: '0 2px 20px rgba(124,58,237,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.18)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 20px rgba(124,58,237,0.06)'}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-3xl select-none">📚</div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
            style={{ background: ls.bg, borderColor: ls.border, color: ls.text }}>
            {book.level}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
            style={{ background: cs.bg, borderColor: cs.border, color: cs.text }}>
            {book.category}
          </span>
          {book.free && (
            <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
              style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              Free
            </span>
          )}
        </div>
      </div>

      {/* Title + author */}
      <div>
        <p className="font-bold text-white text-sm leading-snug">{book.title}</p>
        <p className="text-white/40 text-xs mt-0.5">by {book.author}</p>
        {book.subject && <p className="text-white/30 text-xs mt-0.5">📌 {book.subject}</p>}
      </div>

      <p className="text-white/60 text-xs leading-relaxed flex-1">{book.description}</p>

      {/* Open Book button */}
      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={() => { addRecent(book); onView(book); }}
        className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.25)',
          color: '#c4b5fd',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.28)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; }}
      >
        📖 Open Book
      </motion.button>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Books() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlTopic = searchParams.get('topic') || '';

  const [mode, setMode]         = useState('recommend');
  const [goalInput, setGoalInput] = useState(urlTopic || user?.goal || '');
  const [searchQ, setSearchQ]   = useState('');
  const [googleQ, setGoogleQ]   = useState('');
  const [subject, setSubject]   = useState('');
  const [level, setLevel]       = useState('');
  const [books, setBooks]       = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState('');
  const [gError, setGError]     = useState('');
  const [recent, setRecent]     = useState(getRecent);
  const [viewed, setViewed]     = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Client-side filter on returned books
  const [filterLevel, setFilterLevel] = useState('');
  const [filterCat, setFilterCat]     = useState('');

  // Auto-recommend if topic comes from URL
  useEffect(() => {
    if (!urlTopic) return;
    setGoalInput(urlTopic);
    setMode('recommend');
  }, []); // eslint-disable-line

  const displayed = books.filter(b => {
    if (filterLevel && b.level !== filterLevel) return false;
    if (filterCat   && b.category !== filterCat) return false;
    return true;
  });

  const run = useCallback(async (overrideGoal) => {
    const effectiveGoal = overrideGoal || goalInput;
    setError(''); setLoading(true); setBooks([]);
    try {
      let data;
      if (mode === 'recommend') {
        if (!effectiveGoal.trim()) { setError('Enter a goal first'); setLoading(false); return; }
        ({ data } = await recommendBooks(effectiveGoal.trim()));
      } else if (mode === 'search') {
        if (!searchQ.trim()) { setError('Enter a search term'); setLoading(false); return; }
        ({ data } = await searchBooks(searchQ.trim()));
      } else {
        if (!subject && !level) { setError('Select subject or level'); setLoading(false); return; }
        ({ data } = await filterBooks(subject, level));
      }
      setBooks(data.books || []);
      if ((data.books || []).length === 0) setError('No books found. Try a different query.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch books. Try again.');
    } finally { setLoading(false); }
  }, [mode, goalInput, searchQ, subject, level]);

  // Auto-run once when arriving with ?topic= URL param
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (urlTopic && !autoRanRef.current) {
      autoRanRef.current = true;
      run(urlTopic);
    }
  }, [run]); // eslint-disable-line

  const runGoogle = useCallback(async () => {
    if (!googleQ.trim()) { setGError('Enter a search term'); return; }
    setGError(''); setGLoading(true); setGoogleBooks([]);
    try {
      const { data } = await googleBooksSearch(googleQ.trim());
      setGoogleBooks(data.books || []);
      if ((data.books || []).length === 0) setGError('No books found. Try a different keyword.');
    } catch (err) {
      setGError('Google Books search failed. Try again.');
    } finally { setGLoading(false); }
  }, [googleQ]);

  const handleView = (book) => {
    setViewed(book);
    setRecent(getRecent());
    // Award points for opening a book (fire and forget)
    awardPoints('book_opened').catch(() => {});
  };

  const TABS = [
    { id: 'recommend', label: '🤖 AI Recommend' },
    { id: 'search',    label: '🔍 AI Search' },
    { id: 'filter',    label: '🎛️ Filter' },
    { id: 'google',    label: '🌐 Google Books' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white">📖 Smart Books</h1>
        <p className="text-white/40 text-sm mt-1">AI-powered search, filter, and recommendations</p>
      </motion.div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 glass rounded-2xl mb-5 w-fit">
        {TABS.map(t => (
          <motion.button key={t.id} onClick={() => { setMode(t.id); setBooks([]); setError(''); }}
            whileTap={{ scale: 0.96 }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === t.id
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white/80'
            }`}>
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="glass rounded-2xl p-5 mb-5">

          {mode === 'recommend' && (
            <div className="flex gap-3 flex-wrap">
              <input value={goalInput} onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()}
                placeholder="e.g. I want to become a software engineer"
                className="input-field flex-1 text-sm min-w-48" />
              <button onClick={run} disabled={loading} className="btn-primary px-6 whitespace-nowrap text-sm">
                {loading ? '⏳ Loading...' : '✨ Recommend'}
              </button>
            </div>
          )}

          {mode === 'search' && (
            <div className="flex gap-3 flex-wrap">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()}
                placeholder="Search by title or subject (e.g. Python, Data Structures)"
                className="input-field flex-1 text-sm min-w-48" />
              <button onClick={run} disabled={loading} className="btn-primary px-6 whitespace-nowrap text-sm">
                {loading ? '⏳ Searching...' : '🔍 Search'}
              </button>
            </div>
          )}

          {mode === 'filter' && (
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-36">
                <label className="text-xs text-white/40 mb-1.5 block">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field text-sm py-2.5">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s || 'All Subjects'}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-36">
                <label className="text-xs text-white/40 mb-1.5 block">Level</label>
                <select value={level} onChange={e => setLevel(e.target.value)} className="input-field text-sm py-2.5">
                  {LEVELS.map(l => <option key={l} value={l}>{l || 'All Levels'}</option>)}
                </select>
              </div>
              <button onClick={run} disabled={loading} className="btn-primary px-6 whitespace-nowrap text-sm h-[46px]">
                {loading ? '⏳ Filtering...' : '🎛️ Apply'}
              </button>
            </div>
          )}

          {mode === 'google' && (
            <div className="flex gap-3 flex-wrap">
              <input value={googleQ} onChange={e => setGoogleQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runGoogle()}
                placeholder="Search any book (e.g. Clean Code, Atomic Habits, Python)"
                className="input-field flex-1 text-sm min-w-48" />
              <button onClick={runGoogle} disabled={gLoading} className="btn-primary px-6 whitespace-nowrap text-sm">
                {gLoading ? '⏳ Searching...' : '🌐 Search'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
          {error}
        </motion.p>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-violet-300 text-sm">Finding the best books for you...</p>
        </div>
      )}

      {/* Client-side filter strip (shown when books loaded) */}
      {books.length > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex gap-2 flex-wrap mb-4 items-center">
          <span className="text-xs text-white/30">Filter results:</span>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            className="text-xs bg-white/5 border border-violet-500/20 rounded-lg px-2 py-1.5 text-white/70 outline-none">
            <option value="">All Levels</option>
            {LEVELS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="text-xs bg-white/5 border border-violet-500/20 rounded-lg px-2 py-1.5 text-white/70 outline-none">
            <option value="">All Categories</option>
            {['Technical','Mindset','Career','Finance'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-xs text-white/30 ml-auto">{displayed.length} book{displayed.length !== 1 ? 's' : ''}</span>
        </motion.div>
      )}

      {/* Book grid */}
      <AnimatePresence>
        {displayed.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {displayed.map((b, i) => (
              <BookCard key={`${b.title}-${i}`} book={b} index={i} onView={handleView} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Google Books Results ── */}
      {mode === 'google' && (
        <>
          {gError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              {gError}
            </motion.p>
          )}
          {gLoading && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-violet-300 text-sm">Searching Google Books...</p>
            </div>
          )}
          {googleBooks.length > 0 && !gLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {googleBooks.map((b, i) => (
                <motion.div key={b.id || i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group"
                  style={{ boxShadow: '0 2px 20px rgba(124,58,237,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 20px rgba(124,58,237,0.06)'}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

                  <div className="flex gap-3">
                    {b.image ? (
                      <img src={b.image} alt={b.title}
                        className="w-16 h-20 object-cover rounded-lg flex-shrink-0 border border-violet-500/20" />
                    ) : (
                      <div className="w-16 h-20 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        📚
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-snug line-clamp-2">{b.title}</p>
                      <p className="text-white/40 text-xs mt-1">by {b.author}</p>
                      {b.year && <p className="text-white/30 text-xs">{b.year}{b.publisher ? ` · ${b.publisher}` : ''}</p>}
                    </div>
                  </div>

                  <p className="text-white/60 text-xs leading-relaxed flex-1">{b.description}</p>

                  <div className="flex gap-2">
                    {b.preview ? (
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => { setPreviewUrl(b.preview); awardPoints('book_opened').catch(() => {}); }}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                        👁️ Preview
                      </motion.button>
                    ) : (
                      <div className="flex-1 py-2 rounded-xl text-xs font-semibold text-white/30 text-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        No Preview
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          {googleBooks.length === 0 && !gLoading && googleQ && !gError && (
            <div className="text-center py-12 text-white/30">
              <div className="text-4xl mb-3">🌐</div>
              <p>Search for any book using Google Books above.</p>
            </div>
          )}
        </>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreviewUrl(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-3xl overflow-hidden w-full max-w-4xl"
              style={{ height: '80vh', boxShadow: '0 0 60px rgba(124,58,237,0.3)' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-violet-500/20">
                <p className="text-sm font-bold text-white/70">📖 Book Preview</p>
                <button onClick={() => setPreviewUrl(null)}
                  className="text-white/40 hover:text-white transition-colors text-lg">✕</button>
              </div>
              <iframe
                src={previewUrl}
                title="Book Preview"
                className="w-full"
                style={{ height: 'calc(100% - 52px)', border: 'none' }}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently Viewed */}
      {recent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">🕐 Recently Viewed</p>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {recent.map((b, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => setViewed(b)}
                className="glass rounded-xl p-3 flex-shrink-0 w-44 cursor-pointer group">
                <p className="text-xs font-semibold text-white/80 truncate group-hover:text-white transition-colors">{b.title}</p>
                <p className="text-xs text-white/30 truncate mt-0.5">by {b.author}</p>
                <span className="text-xs text-violet-400 mt-1 block">{b.level}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Book detail modal */}
      <AnimatePresence>
        {viewed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setViewed(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-3xl p-6 max-w-md w-full"
              style={{ boxShadow: '0 0 60px rgba(124,58,237,0.3)' }}>
              <div className="text-4xl mb-4">📚</div>
              <h2 className="text-xl font-black text-white mb-1">{viewed.title}</h2>
              <p className="text-white/50 text-sm mb-3">by {viewed.author}</p>
              <p className="text-white/70 text-sm leading-relaxed mb-4">{viewed.description}</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {viewed.level && <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">{viewed.level}</span>}
                {viewed.category && <span className="text-xs px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">{viewed.category}</span>}
                {viewed.free && <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Free</span>}
              </div>
              <button onClick={() => setViewed(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white glass transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
