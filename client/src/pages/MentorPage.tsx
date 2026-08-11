import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mentorApi, aiApi } from '../services/endpoints';
import type { AiMode, Conversation } from '../types';
import { Download, Paperclip, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { Markdown } from '../components/common/Markdown';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { ConfirmDialog } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';
import api from '../services/api';

/** Single conversation authority for Dream Wave AI (Chat model via /api/mentor). */
export default function MentorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [modes, setModes] = useState<AiMode[]>([]);
  const [mode, setMode] = useState('mentor');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [sending, setSending] = useState(false);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const debouncedQ = useDebounce(q, 300);
  const bottomRef = useRef<HTMLDivElement>(null);
  const deepLinkHandled = useRef(false);
  const { confirm, dialogProps } = useConfirm();

  const loadList = async () => {
    const { data } = await mentorApi.list(debouncedQ ? { q: debouncedQ } : undefined);
    setConversations(data.data.conversations);
  };

  const openConversation = async (id: string) => {
    const { data } = await mentorApi.get(id);
    setActive(data.data.conversation);
    if (data.data.conversation.mode) setMode(data.data.conversation.mode);
  };

  useEffect(() => {
    aiApi.modes().then((r) => setModes(r.data.data.modes)).catch(() => undefined);
  }, []);

  useEffect(() => {
    loadList().catch(() => setError('Failed to load chats'));
  }, [debouncedQ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages]);

  // Deep-link from AI Modes: /mentor?c=<id> or /mentor?mode=<mode>
  useEffect(() => {
    if (deepLinkHandled.current) return;
    const c = searchParams.get('c');
    const modeParam = searchParams.get('mode');
    if (!c && !modeParam) return;
    deepLinkHandled.current = true;

    (async () => {
      try {
        if (modeParam) setMode(modeParam);
        if (c) {
          await openConversation(c);
          await loadList();
        }
      } catch {
        setError('Could not open linked conversation');
      } finally {
        setSearchParams({}, { replace: true });
      }
    })();
  }, [searchParams, setSearchParams]);

  const createNew = async () => {
    const { data } = await mentorApi.create({ title: 'New conversation', mode });
    await loadList();
    setActive(data.data.conversation);
  };

  const send = async () => {
    if (!active || (!message.trim() && !files?.length)) return;
    setSending(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('content', message);
      form.append('mode', mode);
      if (files) Array.from(files).forEach((f) => form.append('files', f));
      const { data } = await mentorApi.send(active._id, form);
      setActive(data.data.conversation);
      setMessage('');
      setFiles(null);
      await loadList();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  const exportChat = async () => {
    if (!active) return;
    const res = await api.get(`/mentor/${active._id}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.title || 'chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <aside className="card-surface flex w-full flex-col lg:w-80">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">AI Chat</h1>
          <button
            type="button"
            className="rounded-lg bg-wave-600 p-2 text-white"
            onClick={createNew}
            aria-label="New chat"
          >
            <Plus size={16} />
          </button>
        </div>
        <Input
          aria-label="Search chats"
          placeholder="Search chats…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-3"
        />
        <div className="flex-1 space-y-2 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => openConversation(c._id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                active?._id === c._id ? 'bg-wave-600 text-white' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <p className="truncate font-semibold">{c.title}</p>
              <p className="truncate opacity-70">
                {c.mode || 'mentor'} · {c.preview}
              </p>
            </button>
          ))}
          {!conversations.length && <p className="text-sm text-slate-500">No conversations yet.</p>}
        </div>
      </aside>

      <div className="card-surface flex min-h-0 flex-1 flex-col">
        {error && (
          <Alert tone="error" className="mb-3">
            {error}
          </Alert>
        )}
        {!active ? (
          <EmptyState
            title="Start a conversation"
            description="One chat history for all AI modes — search, rename, export, and file uploads."
            actionLabel="New chat"
            onAction={createNew}
          />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="min-w-0 flex-1 truncate font-semibold">{active.title}</h2>
              <select
                className="input-field w-auto"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                aria-label="AI mode"
              >
                {modes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Rename chat"
                onClick={async () => {
                  const title = window.prompt('Rename chat', active.title);
                  if (title) {
                    await mentorApi.rename(active._id, { title });
                    await openConversation(active._id);
                    await loadList();
                  }
                }}
              >
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Export chat" onClick={exportChat}>
                <Download size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Delete chat"
                className="text-rose-600"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Delete chat',
                    message: 'Delete this conversation?',
                    confirmLabel: 'Delete',
                  });
                  if (ok) {
                    await mentorApi.remove(active._id);
                    setActive(null);
                    await loadList();
                  }
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {active.messages?.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user' ? 'ml-auto bg-wave-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <Markdown content={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="mt-3 flex items-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <label className="cursor-pointer rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                <Paperclip size={16} />
                <span className="sr-only">Attach files</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.txt,.md,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setFiles(e.target.files)}
                />
              </label>
              <textarea
                className="input-field min-h-[44px] flex-1 resize-none"
                placeholder="Message your AI…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button aria-label="Send message" loading={sending} onClick={send}>
                <Send size={16} />
              </Button>
            </div>
            {files?.length ? <p className="mt-2 text-xs text-slate-500">{files.length} file(s) attached</p> : null}
          </>
        )}
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
