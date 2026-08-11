import { useEffect, useState } from 'react';
import { documentsApi } from '../services/endpoints';
import type { DocItem } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';
import { Markdown } from '../components/common/Markdown';
import { ConfirmDialog } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';
import api from '../services/api';
import { toAssetPath } from '../utils/assets';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selected, setSelected] = useState<DocItem | null>(null);
  const [result, setResult] = useState('');
  const [action, setAction] = useState('summarize');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialogProps } = useConfirm();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await documentsApi.list();
      setDocs(data.data.documents);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load documents'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('title', file.name);
    setBusy(true);
    try {
      const { data } = await documentsApi.upload(form);
      setSelected(data.data.document);
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Upload failed'
      );
    } finally {
      setBusy(false);
    }
  };

  const analyze = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await documentsApi.analyze(selected._id, { action, question });
      setResult(data.data.result);
      setSelected(data.data.document);
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Analysis failed'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CardSkeleton rows={5} />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Document AI"
        description="Upload PDF, DOCX, PPT, or images — summarize, note, quiz, and ask questions."
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="card-surface">
        <Input
          label="Upload document"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt,.md"
          onChange={(e) => upload(e.target.files?.[0] || null)}
        />
        <p className="mt-2 text-xs text-slate-500">Max 25MB. Text is extracted when possible for AI analysis.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          {docs.map((d) => (
            <button
              key={d._id}
              type="button"
              onClick={() => {
                setSelected(d);
                setResult(d.summary || d.notes || '');
              }}
              className={`card-surface w-full text-left ${selected?._id === d._id ? 'ring-2 ring-wave-500' : ''}`}
            >
              <p className="font-semibold">{d.title}</p>
              <p className="text-xs uppercase text-slate-500">
                {d.fileType} · {d.status}
              </p>
            </button>
          ))}
          {!docs.length && <EmptyState title="No documents" description="Upload your first file to begin." />}
        </div>

        <div className="card-surface space-y-3 lg:col-span-2">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold">{selected.title}</h2>
                  <button
                    type="button"
                    className="text-sm text-wave-600 hover:underline"
                    onClick={async () => {
                      const relative = toAssetPath(selected.fileUrl).replace(/^\/api\//, '');
                      const { data } = await api.get(relative, { responseType: 'blob' });
                      const url = URL.createObjectURL(data);
                      window.open(url, '_blank', 'noopener,noreferrer');
                      setTimeout(() => URL.revokeObjectURL(url), 60_000);
                    }}
                  >
                    Open file
                  </button>
                </div>
                <Button
                  variant="ghost"
                  className="text-rose-600"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Delete document',
                      message: 'Remove this document?',
                      confirmLabel: 'Delete',
                    });
                    if (ok) {
                      await documentsApi.remove(selected._id);
                      setSelected(null);
                      setResult('');
                      await load();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
              <Select label="AI action" value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="summarize">Summarize</option>
                <option value="explain">Explain difficult topics</option>
                <option value="notes">Generate notes</option>
                <option value="keypoints">Extract key points</option>
                <option value="ask">Ask a question</option>
              </Select>
              {action === 'ask' && (
                <Textarea label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
              )}
              <div className="flex flex-wrap gap-2">
                <Button loading={busy} onClick={analyze}>
                  Run AI
                </Button>
                <Button
                  variant="ghost"
                  loading={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await documentsApi.quiz(selected._id);
                      setResult('Quiz generated from this document. Open Learning Hub quizzes or re-analyze for notes.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Generate quiz
                </Button>
              </div>
              {result && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <Markdown content={result} />
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Select a document" description="Choose a file from the list to analyze." />
          )}
        </div>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
