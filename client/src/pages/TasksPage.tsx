import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { tasksApi } from '../services/endpoints';
import type { Task } from '../types';
import { formatDate, priorityColor, cn } from '../utils/cn';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';
import { ConfirmDialog } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialogProps } = useConfirm();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' },
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await tasksApi.list();
      setTasks(r.data.data.tasks);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load tasks'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      const key = t.dueDate ? t.dueDate.slice(0, 10) : 'No date';
      map[key] = map[key] || [];
      map[key].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await tasksApi.create({
        title: values.title,
        description: values.description,
        priority: values.priority as Task['priority'],
        dueDate: values.dueDate || undefined,
        status: values.status as Task['status'],
      });
      reset();
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not create task'
      );
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Task Manager"
        description="Priorities, due dates, and a calendar view."
        actions={
          <div className="flex gap-2" role="group" aria-label="View mode">
            <Button
              variant={view === 'list' ? 'subtle' : 'ghost'}
              size="sm"
              type="button"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              List
            </Button>
            <Button
              variant={view === 'calendar' ? 'subtle' : 'ghost'}
              size="sm"
              type="button"
              aria-pressed={view === 'calendar'}
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
          </div>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={onSubmit} className="card-surface grid gap-3 md:grid-cols-2">
        <Input label="Title" placeholder="Task title" required {...register('title', { required: true })} />
        <Input label="Due date" type="date" {...register('dueDate')} />
        <Textarea label="Description" className="md:col-span-2" {...register('description')} />
        <Select label="Priority" {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Select label="Status" {...register('status')}>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </Select>
        <Button className="md:col-span-2" type="submit">
          Add task
        </Button>
      </form>

      {loading ? (
        <CardSkeleton rows={4} />
      ) : !tasks.length ? (
        <EmptyState title="No tasks" description="Add a task with a due date to fill your calendar." />
      ) : view === 'list' ? (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t._id} className="card-surface flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => tasksApi.toggle(t._id).then(load)}
                aria-label={t.status === 'done' ? `Mark ${t.title} incomplete` : `Complete ${t.title}`}
                aria-pressed={t.status === 'done'}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md border',
                  t.status === 'done' ? 'border-wave-600 bg-wave-600 text-white' : 'border-slate-300'
                )}
              >
                {t.status === 'done' ? '✓' : ''}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn('font-semibold', t.status === 'done' && 'line-through opacity-60')}>{t.title}</p>
                <p className="text-sm text-slate-500">
                  Due {formatDate(t.dueDate)} · {t.status.replace('_', ' ')}
                </p>
              </div>
              <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${priorityColor(t.priority)}`}>
                {t.priority}
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="text-rose-600"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Delete task',
                    message: `Delete "${t.title}"?`,
                    confirmLabel: 'Delete',
                  });
                  if (ok) await tasksApi.remove(t._id).then(load);
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {byDate.map(([date, items]) => (
            <div key={date} className="card-surface">
              <h3 className="font-display font-bold">{date === 'No date' ? date : formatDate(date)}</h3>
              <ul className="mt-3 space-y-2">
                {items.map((t) => (
                  <li key={t._id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => tasksApi.toggle(t._id).then(load)}
                    >
                      {t.status === 'done' ? '✓ ' : '○ '}
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
