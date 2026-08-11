import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardApi } from '../services/endpoints';
import type { DashboardStats, NotificationItem } from '../types';
import { formatDate } from '../utils/cn';
import { PageHeader } from '../components/common/PageHeader';
import { Alert } from '../components/ui/Alert';
import { CardSkeleton } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, sug, n] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.suggestions(),
        dashboardApi.notifications(),
      ]);
      setStats(s.data.data.stats);
      setSuggestions(sug.data.data.suggestions);
      setNotifications(n.data.data.notifications);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    { label: 'Active goals', value: stats?.goalsActive ?? '—', to: '/goals' },
    { label: 'Tasks done', value: stats?.tasksDone ?? '—', to: '/tasks' },
    { label: 'Roadmap %', value: stats ? `${stats.roadmapProgress}%` : '—', to: '/roadmap' },
    { label: 'Streak', value: stats?.streak ?? '—', to: '/dashboard' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your progress pulse for today." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} rows={1} />
          ))}
        </div>
        <CardSkeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <Alert tone="error">{error}</Alert>
        <Button onClick={load}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Your progress pulse for today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="card-surface transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-wave-500"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-wave-700 dark:text-wave-300">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Weekly activity</h2>
          <p className="sr-only">
            Chart of tasks completed over the last seven days.
            {(stats?.weeklyActivity || []).map((d) => `${d.date}: ${d.count}`).join('. ')}
          </p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weeklyActivity || []}>
                <defs>
                  <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0d9488" fill="url(#waveFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface">
          <h2 className="font-display text-xl font-bold">AI suggestions</h2>
          <ul className="mt-4 space-y-3">
            {suggestions.map((s) => (
              <li
                key={s}
                className="rounded-xl bg-wave-50 px-3 py-3 text-sm text-wave-900 dark:bg-wave-950/40 dark:text-wave-100"
              >
                {s}
              </li>
            ))}
            {!suggestions.length && (
              <li className="text-sm text-slate-500">No suggestions yet — create a goal to get started.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Calendar snapshot</h2>
            <Link to="/tasks" className="text-sm text-wave-600">
              Open tasks
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Overdue: <strong>{stats?.tasksOverdue ?? 0}</strong> · Open: <strong>{stats?.tasksTodo ?? 0}</strong> ·
            Completed this week: <strong>{stats?.tasksCompletedThisWeek ?? 0}</strong>
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs" role="list" aria-label="Month day markers">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="rounded-lg bg-slate-100 py-2 font-semibold dark:bg-slate-800">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1;
              const active = stats?.weeklyActivity?.some(
                (w) => Number(w.date.slice(-2)) === day && w.count > 0
              );
              return (
                <div
                  key={day}
                  role="listitem"
                  className={`rounded-lg py-2 ${active ? 'bg-wave-600 text-white' : 'bg-white dark:bg-slate-900'}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-surface">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Notifications</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                dashboardApi.markAllRead().then(() => setNotifications((n) => n.map((x) => ({ ...x, read: true }))))
              }
            >
              Mark all read
            </Button>
          </div>
          <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`rounded-xl border px-3 py-3 text-sm ${
                  n.read
                    ? 'border-transparent bg-slate-50 dark:bg-slate-900'
                    : 'border-wave-200 bg-wave-50 dark:border-wave-900 dark:bg-wave-950/30'
                }`}
              >
                <p className="font-semibold">{n.title}</p>
                <p className="text-slate-500">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
              </li>
            ))}
            {!notifications.length && (
              <EmptyState title="No notifications" description="You are all caught up." />
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
