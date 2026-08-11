import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { aiApi, mentorApi } from '../services/endpoints';
import type { AiMode } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { CardSkeleton } from '../components/ui/Spinner';
import { Markdown } from '../components/common/Markdown';
import { MessageSquareText, Sparkles } from 'lucide-react';

/**
 * AI Modes catalog — durable conversations live in Mentor (/mentor).
 * Quick try is explicitly ephemeral and does not create Chat history.
 */
export default function AIStudioPage() {
  const navigate = useNavigate();
  const [modes, setModes] = useState<AiMode[]>([]);
  const [mode, setMode] = useState('mentor');
  const [prompt, setPrompt] = useState('');
  const [ephemeralReply, setEphemeralReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [trying, setTrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiApi
      .modes()
      .then((r) => {
        setModes(r.data.data.modes);
        if (r.data.data.modes[0]) setMode(r.data.data.modes[0].id);
      })
      .catch(() => setError('Failed to load AI modes'))
      .finally(() => setLoading(false));
  }, []);

  const selected = modes.find((m) => m.id === mode);

  const openInMentor = async () => {
    setOpening(true);
    setError(null);
    setEphemeralReply('');
    try {
      const title = selected ? `${selected.label} chat` : 'New conversation';
      const { data } = await mentorApi.create({ title, mode });
      const id = data.data.conversation._id;
      if (prompt.trim()) {
        const form = new FormData();
        form.append('content', prompt.trim());
        form.append('mode', mode);
        await mentorApi.send(id, form);
      }
      navigate(`/mentor?c=${id}`);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not open chat'
      );
    } finally {
      setOpening(false);
    }
  };

  const tryEphemeral = async () => {
    if (!prompt.trim()) return;
    setTrying(true);
    setError(null);
    try {
      const { data } = await aiApi.quick({ mode, prompt });
      setEphemeralReply(data.data.reply);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'AI request failed'
      );
    } finally {
      setTrying(false);
    }
  };

  if (loading) return <CardSkeleton rows={6} />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Modes"
        description="Pick a specialized engine, then continue in AI Chat — one conversation history for the whole product."
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modes.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => {
              setMode(m.id);
              setEphemeralReply('');
            }}
            className={`card-surface text-left transition hover:-translate-y-0.5 ${
              mode === m.id ? 'ring-2 ring-wave-500' : ''
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-wave-600">
              <Sparkles size={16} />
              <span className="font-display font-bold">{m.label}</span>
            </div>
            <p className="text-xs text-slate-500">{m.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="card-surface space-y-3">
        <Textarea
          label={`First message · ${selected?.label || mode}`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Optional — saved in AI Chat when you continue…"
          className="min-h-32"
        />
        <div className="flex flex-wrap gap-2">
          <Button loading={opening} onClick={openInMentor}>
            <MessageSquareText size={16} className="mr-1.5" />
            Continue in AI Chat
          </Button>
          <Button variant="ghost" loading={trying} disabled={!prompt.trim()} onClick={tryEphemeral}>
            Quick try (not saved)
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Durable threads, search, export, and uploads live in AI Chat. Quick try never writes history.
        </p>
      </div>

      {ephemeralReply && (
        <div className="card-surface border border-amber-200 dark:border-amber-900">
          <h2 className="mb-1 font-display text-xl font-bold">Ephemeral response</h2>
          <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">Not saved to your chat history.</p>
          <Markdown content={ephemeralReply} />
        </div>
      )}
    </div>
  );
}
