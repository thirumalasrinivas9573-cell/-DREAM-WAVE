import { useEffect, useState } from 'react';
import { habitsApi, plannerApi } from '../services/endpoints';
import type { Habit, PlannerEvent } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';
import { Markdown } from '../components/common/Markdown';
import { useAuthStore } from '../store/authStore';

export default function ProductivityPage() {
  const focusDefault = useAuthStore((s) => s.user?.preferences?.focusMinutes || 25);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [dailyPlan, setDailyPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [seconds, setSeconds] = useState(focusDefault * 60);
  const [running, setRunning] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, o] = await Promise.all([habitsApi.list(), plannerApi.overview()]);
      setHabits(h.data.data.habits);
      setEvents(o.data.data.daily || []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load productivity data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (loading) return <CardSkeleton rows={6} />;

  return (
    <div className={`space-y-8 ${focusMode ? 'fixed inset-0 z-50 overflow-auto bg-ink-950 p-6 text-white' : ''}`}>
      <PageHeader
        title="Productivity"
        description="Smart calendar, habits, Pomodoro, and focus mode."
        actions={
          <Button variant={focusMode ? 'primary' : 'ghost'} onClick={() => setFocusMode((v) => !v)}>
            {focusMode ? 'Exit focus' : 'Focus mode'}
          </Button>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-surface">
          <h2 className="font-display text-xl font-bold">Pomodoro</h2>
          <p className="mt-6 text-center font-display text-5xl font-bold tabular-nums">
            {mm}:{ss}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => setRunning(true)}>Start</Button>
            <Button variant="ghost" onClick={() => setRunning(false)}>
              Pause
            </Button>
            <Button
              variant="subtle"
              onClick={() => {
                setRunning(false);
                setSeconds(focusDefault * 60);
              }}
            >
              Reset
            </Button>
          </div>
        </section>

        <section className="card-surface space-y-3 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold">Today&apos;s calendar</h2>
            <Button
              size="sm"
              onClick={async () => {
                const { data } = await plannerApi.generateDaily();
                setDailyPlan(data.data.plan);
              }}
            >
              AI daily plan
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Event title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
            <Input
              label="Start"
              type="datetime-local"
              value={eventStart}
              onChange={(e) => setEventStart(e.target.value)}
            />
          </div>
          <Button
            onClick={async () => {
              if (!eventTitle || !eventStart) return;
              await plannerApi.create({
                title: eventTitle,
                start: new Date(eventStart).toISOString(),
                type: 'task',
              });
              setEventTitle('');
              setEventStart('');
              await load();
            }}
          >
            Add event
          </Button>
          <ul className="mt-3 space-y-2">
            {events.map((e) => (
              <li key={e._id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <strong>{e.title}</strong> · {new Date(e.start).toLocaleString()}
              </li>
            ))}
            {!events.length && (
              <EmptyState title="No events today" description="Add a block or generate an AI plan." />
            )}
          </ul>
          {dailyPlan && (
            <div className="mt-4 rounded-xl border border-wave-200 p-3 dark:border-wave-900">
              <Markdown content={dailyPlan} />
            </div>
          )}
        </section>
      </div>

      <section className="card-surface space-y-3">
        <h2 className="font-display text-xl font-bold">Habit tracker</h2>
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-sm"
            label="New habit"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              onClick={async () => {
                if (!habitTitle) return;
                await habitsApi.create({ title: habitTitle });
                setHabitTitle('');
                await load();
              }}
            >
              Add habit
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {habits.map((h) => {
            const today = new Date().toISOString().slice(0, 10);
            const done = h.completions?.some((c) => c.date === today && c.completed);
            return (
              <button
                key={h._id}
                type="button"
                onClick={() => habitsApi.toggle(h._id).then(load)}
                className={`rounded-2xl border p-4 text-left transition ${
                  done
                    ? 'border-wave-500 bg-wave-50 dark:bg-wave-950/40'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                aria-pressed={!!done}
              >
                <p className="font-semibold">{h.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Streak {h.streak} · Best {h.bestStreak}
                </p>
                <p className="mt-2 text-sm">{done ? '✓ Done today' : 'Tap to complete'}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
