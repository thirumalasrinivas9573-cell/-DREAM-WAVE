import { useEffect, useState } from 'react';
import { communityApi } from '../services/endpoints';
import type { Post } from '../types';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/cn';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Textarea, Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';
import { ConfirmDialog } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';
import { SecureImage } from '../components/common/SecureImage';

export default function CommunityPage() {
  const user = useAuthStore((s) => s.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await communityApi.list();
      setPosts(r.data.data.posts);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load community'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const form = new FormData();
      form.append('content', content);
      if (image) form.append('image', image);
      await communityApi.create(form);
      setContent('');
      setImage(null);
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to create post'
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Community" description="Share wins, ask questions, cheer each other on." />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="card-surface space-y-3">
        <Textarea
          label="New post"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            aria-label="Attach image"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <Button className="ml-auto" loading={posting} onClick={create}>
            Post
          </Button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton rows={4} />
      ) : !posts.length ? (
        <EmptyState title="No posts yet" description="Be the first to share something." />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const liked = post.likes.some((id) => String(id) === String(user?.id));
            return (
              <article key={post._id} className="card-surface">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-wave-600 font-bold text-white"
                      aria-hidden
                    >
                      {post.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{post.user?.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  {(String(post.user?._id) === String(user?.id) || user?.role === 'admin') && (
                    <button
                      type="button"
                      aria-label="Delete post"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Delete post',
                          message: 'Delete this post permanently?',
                          confirmLabel: 'Delete',
                        });
                        if (ok) await communityApi.remove(post._id).then(load);
                      }}
                    >
                      <Trash2 size={16} className="text-rose-600" />
                    </button>
                  )}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm">{post.content}</p>
                {post.image && (
                  <SecureImage
                    src={post.image}
                    alt={`Image attached to post by ${post.user?.name || 'user'}`}
                    className="mt-3 max-h-80 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                )}
                <div className="mt-4 flex gap-4 text-sm">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 ${liked ? 'text-rose-600' : ''}`}
                    aria-pressed={liked}
                    aria-label={liked ? 'Unlike post' : 'Like post'}
                    onClick={() => communityApi.like(post._id).then(load)}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} aria-hidden /> {post.likes.length}
                  </button>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <MessageCircle size={16} aria-hidden /> {post.comments.length}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {post.comments.map((c) => (
                    <li
                      key={c._id || c.createdAt}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                    >
                      <strong>{c.user?.name}:</strong> {c.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Input
                    aria-label="Write a comment"
                    placeholder="Write a comment…"
                    value={commentDrafts[post._id] || ''}
                    onChange={(e) => setCommentDrafts((d) => ({ ...d, [post._id]: e.target.value }))}
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      communityApi.comment(post._id, commentDrafts[post._id] || '').then(() => {
                        setCommentDrafts((d) => ({ ...d, [post._id]: '' }));
                        load();
                      })
                    }
                  >
                    Reply
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
