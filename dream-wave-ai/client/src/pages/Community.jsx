import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Avatar({ name, size = 8 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('feed');
  const [posts, setPosts]       = useState([]);
  const [connections, setConns] = useState([]);
  const [postText, setPostText] = useState('');
  const [aaInput, setAaInput]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    api.get('/community/feed').then(r => setPosts(r.data.posts || [])).catch(() => {});
    api.get('/community/connections').then(r => setConns(r.data.connections || [])).catch(() => {});
  }, []);

  const createPost = async () => {
    if (!postText.trim()) return;
    try {
      const { data } = await api.post('/community/post', { content: postText });
      setPosts(p => [data.post, ...p]);
      setPostText('');
    } catch { setMsg('Failed to post'); }
  };

  const like = async (id) => {
    try {
      const { data } = await api.put(`/community/like/${id}`);
      setPosts(p => p.map(post => post._id === id ? { ...post, likes: Array(data.likes).fill(null) } : post));
    } catch {}
  };

  const connect = async () => {
    if (!aaInput.trim()) return;
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/community/connect', { aaId: aaInput });
      setMsg(`✅ Connected with ${data.friend?.name || aaInput}!`);
      setAaInput('');
      api.get('/community/connections').then(r => setConns(r.data.connections || [])).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.message || 'Connection failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">👥 Community</h1>
        <p className="text-white/40 text-sm mt-1">Connect, share, and grow together</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5">
        {['feed','connect'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'}`}>
            {t === 'feed' ? '📰 Feed' : '🤝 Connect'}
          </button>
        ))}
      </div>

      {/* FEED */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {/* Create post */}
          <div className="glass rounded-2xl p-4">
            <div className="flex gap-3 mb-3">
              <Avatar name={user?.name} />
              <textarea value={postText} onChange={e => setPostText(e.target.value)}
                placeholder="Share your progress, achievement, or thought..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 resize-none"
                rows={2} maxLength={500} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/30">{postText.length}/500</span>
              <button onClick={createPost} disabled={!postText.trim()} className="btn-primary px-4 py-2 text-sm">Post</button>
            </div>
          </div>

          {/* Posts */}
          <AnimatePresence>
            {posts.map(p => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={p.userId?.name} />
                  <div>
                    <p className="font-semibold text-white text-sm">{p.userId?.name || 'User'}</p>
                    <p className="text-xs text-white/40">{p.userId?.aaId} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  {p.type === 'achievement' && <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">🏆 Achievement</span>}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-3">{p.content}</p>
                <div className="flex gap-4">
                  <button onClick={() => like(p._id)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-pink-400 transition-colors">
                    <span>❤️</span><span>{p.likes?.length || 0}</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <span>💬</span><span>{p.comments?.length || 0}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {posts.length === 0 && <div className="text-center py-10 text-white/30"><div className="text-4xl mb-2">📰</div><p>No posts yet. Be the first!</p></div>}
        </div>
      )}

      {/* CONNECT */}
      {tab === 'connect' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-sm font-bold text-white/70 mb-3">Connect by AA ID</p>
            <div className="flex gap-3">
              <input value={aaInput} onChange={e => setAaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && connect()}
                placeholder="Enter AA ID (e.g. AA123456)"
                className="input-field flex-1 text-sm" />
              <button onClick={connect} disabled={loading || !aaInput.trim()} className="btn-primary px-5 text-sm whitespace-nowrap">
                {loading ? '...' : 'Connect'}
              </button>
            </div>
            {msg && <p className={`text-sm mt-2 ${msg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
            <p className="text-xs text-white/30 mt-2">Your AA ID: <span className="font-mono text-violet-400">{user?.aaId}</span></p>
          </div>

          {connections.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Your Connections ({connections.length})</p>
              <div className="space-y-3">
                {connections.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar name={c?.name} />
                    <div>
                      <p className="font-semibold text-white text-sm">{c?.name}</p>
                      <p className="text-xs text-white/40">{c?.aaId} {c?.goal ? `· ${c.goal}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
