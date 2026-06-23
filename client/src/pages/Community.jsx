import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { communityApi } from '../services/api'

const TAGS = ['Achievement', 'Goals', 'Books', 'Habits', 'General']

const timeAgo = (d) => {
  const s = Date.now() - new Date(d).getTime()
  if (s < 60000) return 'just now'
  if (s < 3600000) return `${Math.floor(s/60000)}m ago`
  if (s < 86400000) return `${Math.floor(s/3600000)}h ago`
  return `${Math.floor(s/86400000)}d ago`
}

export default function Community() {
  const { user } = useAuth()
  const [posts, setPosts]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [content, setContent] = useState('')
  const [tag, setTag]       = useState('General')
  const [posting, setPost]  = useState(false)

  useEffect(() => {
    communityApi.getPosts()
      .then(r => setPosts(r.data.posts || []))
      .catch(() => {}).finally(() => setLoad(false))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setPost(true)
    try {
      const { data } = await communityApi.createPost({ content: content.trim(), tag })
      setPosts(p => [data.post, ...p]); setContent('')
    } catch {} setPost(false)
  }

  const like = async (id) => {
    setPosts(p => p.map(post => post._id === id ? { ...post, likeCount: (post.likeCount||0)+1, likedByMe: true } : post))
    try { await communityApi.likePost(id) } catch {}
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>💬 <span className="gradient-text">Community</span></h1>
        <p>Share wins, ask questions, and grow together with fellow Dream Wave members</p>
      </div>

      {/* Create post */}
      <div className="card card-purple" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, color: 'white', fontSize: '0.9rem' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <form onSubmit={submit} style={{ flex: 1 }}>
            <textarea className="textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Share a win, ask a question, or inspire the community... 🌊" rows={3} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TAGS.map(t => (
                  <button key={t} type="button" onClick={() => setTag(t)} style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${tag===t?'var(--purple)':'var(--border)'}`, background: tag===t?'rgba(139,92,246,0.12)':'transparent', color: tag===t?'var(--purple-light)':'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, transition: 'var(--t)', fontFamily: 'inherit' }}>{t}</button>
                ))}
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={posting||!content.trim()}>
                {posting ? <div className="spinner" style={{ borderTopColor: 'white', width: 13, height: 13 }} /> : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts */}
      {loading ? [...Array(3)].map((_,i) => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 12 }} />) :
      posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', border: '1px dashed var(--border-purple)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
          <h2 className="gradient-text" style={{ marginBottom: 8 }}>No posts yet</h2>
          <p>Be the first to share something with the community!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}>
                <div className="card">
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, color: 'white', fontSize: '0.9rem' }}>
                      {post.authorInitials || post.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{post.authorName || 'Anonymous'}</span>
                          {post.tag && post.tag !== 'General' && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{post.tag}</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.68, marginBottom: 10, whiteSpace: 'pre-line' }}>{post.content}</p>
                      <div style={{ display: 'flex', gap: 14 }}>
                        <button onClick={() => !post.likedByMe && like(post._id)} style={{ background: 'transparent', border: 'none', cursor: post.likedByMe ? 'default' : 'pointer', color: post.likedByMe ? '#F87171' : 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: 5, alignItems: 'center', fontFamily: 'inherit', transition: 'var(--t)' }}>
                          {post.likedByMe ? '❤️' : '🤍'} {post.likeCount || 0}
                        </button>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💬 {post.comments?.length || 0} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Layout>
  )
}
