import { useEffect, useState } from 'react';
import { adminApi } from '../../services/endpoints';
import { formatDate } from '../../utils/cn';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<unknown[]>([]);
  const [q, setQ] = useState('');

  const load = async () => {
    const [d, u, r] = await Promise.all([
      adminApi.dashboard(),
      adminApi.users(q || undefined),
      adminApi.reports(),
    ]);
    setAnalytics(d.data.data.analytics);
    setUsers(u.data.data.users);
    setReports(r.data.data.reports);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const cards = [
    { label: 'Users', value: analytics?.users },
    { label: 'Admins', value: analytics?.admins },
    { label: 'Pro plans', value: analytics?.proUsers },
    { label: 'Posts', value: analytics?.posts },
    { label: 'Goals', value: analytics?.goals },
    { label: 'Reports', value: analytics?.reports },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Admin Panel</h1>
        <p className="mt-1 text-slate-500">User management, analytics, and reports.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card-surface">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-wave-700 dark:text-wave-300">
              {String(c.value ?? '—')}
            </p>
          </div>
        ))}
      </div>

      <section className="card-surface">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            className="input-field max-w-sm"
            placeholder="Search users…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <button type="button" className="btn-primary" onClick={load}>
            Search
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 dark:border-slate-900">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 dark:border-slate-700"
                      value={u.role}
                      onChange={(e) => adminApi.updateUser(u._id, { role: e.target.value }).then(load)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 dark:border-slate-700"
                      value={u.plan}
                      onChange={(e) => adminApi.updateUser(u._id, { plan: e.target.value }).then(load)}
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                    </select>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="text-rose-600"
                      onClick={() => adminApi.deleteUser(u._id).then(load)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-surface">
        <h2 className="font-display text-xl font-bold">Recent reports</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(reports as { _id: string; title: string; createdAt: string; user?: { name: string } }[]).map((r) => (
            <li key={r._id} className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <span>
                {r.title} · {r.user?.name || 'User'}
              </span>
              <span className="text-slate-400">{formatDate(r.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
