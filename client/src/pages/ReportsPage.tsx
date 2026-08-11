import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { reportsApi, dashboardApi } from '../services/endpoints';
import api from '../services/api';
import type { DashboardStats, Report } from '../types';
import { formatDate } from '../utils/cn';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);

  const load = async () => {
    const [r, s] = await Promise.all([reportsApi.list(), dashboardApi.stats()]);
    setReports(r.data.data.reports);
    setStats(s.data.data.stats);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await reportsApi.generate({ title: 'Performance Report' });
      setSelected(data.data.report);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (id: string) => {
    const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamwave-report-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = [
    { name: 'Goals', value: stats?.goalsTotal || 0 },
    { name: 'Tasks done', value: stats?.tasksDone || 0 },
    { name: 'Roadmap %', value: stats?.roadmapProgress || 0 },
    { name: 'Reports', value: stats?.reports || 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="mt-1 text-slate-500">Analytics, charts, and PDF export.</p>
        </div>
        <button type="button" className="btn-primary" disabled={loading} onClick={generate}>
          {loading ? 'Generating…' : 'Generate report'}
        </button>
      </div>

      <div className="card-surface">
        <h2 className="font-display text-xl font-bold">Performance overview</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#0d9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {reports.map((r) => (
            <button
              key={r._id}
              type="button"
              onClick={() => setSelected(r)}
              className={`card-surface w-full text-left ${selected?._id === r._id ? 'ring-2 ring-wave-500' : ''}`}
            >
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-slate-500">{formatDate(r.createdAt)}</p>
            </button>
          ))}
          {!reports.length && <p className="text-sm text-slate-500">No reports yet. Generate your first one.</p>}
        </div>

        {selected && (
          <div className="card-surface">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl font-bold">{selected.title}</h2>
              <button type="button" className="btn-primary" onClick={() => downloadPdf(selected._id)}>
                Download PDF
              </button>
            </div>
            <div className="mt-6 space-y-5">
              {selected.sections?.map((s) => (
                <div key={s.title}>
                  <h3 className="font-semibold text-wave-700 dark:text-wave-300">{s.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
