import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { goalsApi } from '../services/endpoints';
import type { Goal } from '../types';
import { formatDate, priorityColor } from '../utils/cn';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';
import { ConfirmDialog } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      targetDate: '',
      milestone: '',
    },
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await goalsApi.list();
      setGoals(r.data.data.goals);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load goals'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        priority: values.priority as Goal['priority'],
        targetDate: values.targetDate || undefined,
        milestones: values.milestone ? [{ title: values.milestone, completed: false }] : [],
      };
      if (editing) await goalsApi.update(editing._id, payload);
      else await goalsApi.create(payload);
      reset();
      setEditing(null);
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not save goal'
      );
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Goal Manager"
        description="Create goals, track milestones, and watch progress climb."
      />

      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={onSubmit} className="card-surface grid gap-3 md:grid-cols-2">
        <Input label="Title" placeholder="Goal title" required {...register('title', { required: true })} />
        <Input label="Category" placeholder="Category" {...register('category')} />
        <Textarea label="Description" className="md:col-span-2" {...register('description')} />
        <Select label="Priority" {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Input label="Target date" type="date" {...register('targetDate')} />
        <Input
          label="First milestone"
          className="md:col-span-2"
          placeholder="Optional"
          {...register('milestone')}
        />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" loading={saving}>
            {editing ? 'Update goal' : 'Create goal'}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                reset();
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !goals.length ? (
        <EmptyState
          title="No goals yet"
          description="Create your first goal to start tracking milestones."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((g) => (
            <article key={g._id} className="card-surface">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold">{g.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{g.description || 'No description'}</p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${priorityColor(g.priority)}`}>
                  {g.priority}
                </span>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{g.status}</span>
                  <span>{g.progress}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                  role="progressbar"
                  aria-valuenow={g.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${g.title} progress`}
                >
                  <div className="h-full bg-wave-600 transition-all" style={{ width: `${g.progress}%` }} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">Target: {formatDate(g.targetDate)}</p>
              <ul className="mt-4 space-y-2">
                {g.milestones?.map((m) => (
                  <li key={m._id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => m._id && goalsApi.toggleMilestone(g._id, m._id).then(load)}
                      aria-pressed={m.completed}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          m.completed ? 'border-wave-600 bg-wave-600 text-white' : 'border-slate-300'
                        }`}
                        aria-hidden
                      >
                        {m.completed ? '✓' : ''}
                      </span>
                      {m.title}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setEditing(g);
                    reset({
                      title: g.title,
                      description: g.description || '',
                      category: g.category || 'general',
                      priority: g.priority,
                      targetDate: g.targetDate?.slice(0, 10) || '',
                      milestone: '',
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="text-rose-600"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Delete goal',
                      message: `Delete "${g.title}" permanently?`,
                      confirmLabel: 'Delete',
                    });
                    if (ok) await goalsApi.remove(g._id).then(load);
                  }}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
