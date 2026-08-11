import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { roadmapApi } from '../services/endpoints';
import type { Roadmap } from '../types';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selected, setSelected] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { career: '', level: 'beginner' },
  });

  const load = async () => {
    const { data } = await roadmapApi.list();
    setRoadmaps(data.data.roadmaps);
    if (!selected && data.data.roadmaps[0]) setSelected(data.data.roadmaps[0]);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const generate = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const { data } = await roadmapApi.generate(values);
      setSelected(data.data.roadmap);
      reset();
      await load();
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Learning Roadmap</h1>
        <p className="mt-1 text-slate-500">Generate a path, track skills, and complete timeline phases.</p>
      </div>

      <form onSubmit={generate} className="card-surface flex flex-wrap gap-3">
        <input className="input-field min-w-[220px] flex-1" placeholder="Target career (e.g. Frontend Engineer)" {...register('career', { required: true })} />
        <select className="input-field w-40" {...register('level')}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Generating…' : 'Generate path'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {roadmaps.map((r) => (
          <button
            key={r._id}
            type="button"
            onClick={() => setSelected(r)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              selected?._id === r._id ? 'bg-wave-600 text-white' : 'bg-white dark:bg-slate-900'
            }`}
          >
            {r.career}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card-surface lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold">{selected.title}</h2>
                <p className="mt-1 text-slate-500">{selected.description}</p>
              </div>
              <button
                type="button"
                className="text-sm text-rose-600"
                onClick={async () => {
                  await roadmapApi.remove(selected._id);
                  setSelected(null);
                  await load();
                }}
              >
                Delete
              </button>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>Overall progress</span>
                <span>{selected.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-wave-600" style={{ width: `${selected.progress}%` }} />
              </div>
            </div>
            <ol className="mt-6 space-y-4">
              {selected.timeline.map((phase) => (
                <li key={phase._id || phase.phase} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 text-left"
                    onClick={() =>
                      phase._id &&
                      roadmapApi.togglePhase(selected._id, phase._id).then(async () => {
                        const { data } = await roadmapApi.list();
                        const updated = data.data.roadmaps.find((r) => r._id === selected._id);
                        if (updated) setSelected(updated);
                        setRoadmaps(data.data.roadmaps);
                      })
                    }
                  >
                    <div>
                      <p className="font-semibold">
                        Phase {phase.phase}: {phase.title}
                      </p>
                      <p className="text-sm text-slate-500">{phase.duration}</p>
                      <p className="mt-2 text-sm">{phase.topics?.join(' · ')}</p>
                    </div>
                    <span className={`rounded-lg px-2 py-1 text-xs ${phase.completed ? 'bg-wave-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {phase.completed ? 'Done' : 'Open'}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="card-surface">
            <h3 className="font-display text-xl font-bold">Skills</h3>
            <ul className="mt-4 space-y-4">
              {selected.skills.map((skill) => (
                <li key={skill._id || skill.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-slate-500">{skill.level}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={skill.progress}
                    className="w-full accent-wave-600"
                    onChange={(e) => {
                      if (!skill._id) return;
                      const progress = Number(e.target.value);
                      roadmapApi.updateSkill(selected._id, skill._id, { progress }).then(async () => {
                        const { data } = await roadmapApi.list();
                        const updated = data.data.roadmaps.find((r) => r._id === selected._id);
                        if (updated) setSelected(updated);
                      });
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
