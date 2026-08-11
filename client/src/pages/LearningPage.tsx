import { useEffect, useState } from 'react';
import { learningApi } from '../services/endpoints';
import type { Skill, StudyPlan } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';

export default function LearningPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [gaps, setGaps] = useState<Skill[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<
    { title: string; skill: string; credentialId?: string }[]
  >([]);
  const [learningStreak, setLearningStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [mastery, setMastery] = useState(20);
  const [topic, setTopic] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quiz, setQuiz] = useState<{
    _id: string;
    questions: { question: string; options: string[]; answer: string }[];
  } | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await learningApi.dashboard();
      setSkills(data.data.skills || []);
      setPlans(data.data.plans || []);
      setGaps(data.data.gaps || []);
      setRecommendations(data.data.recommendations || []);
      setCertificates(data.data.certificates || []);
      setLearningStreak(data.data.learningStreak || 0);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load learning dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <CardSkeleton rows={8} />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning Hub"
        description="Skill gaps, study plans, quizzes, certificates, and streaks."
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Learning streak', value: learningStreak },
          { label: 'Skills', value: skills.length },
          { label: 'Active plans', value: plans.length },
          { label: 'Certificates', value: certificates.length },
        ].map((c) => (
          <div key={c.label} className="card-surface">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-wave-700 dark:text-wave-300">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-3">
          <h2 className="font-display text-xl font-bold">Add / update skill</h2>
          <Input label="Skill name" value={skillName} onChange={(e) => setSkillName(e.target.value)} />
          <label className="block text-sm">
            Mastery: {mastery}%
            <input
              type="range"
              min={0}
              max={100}
              value={mastery}
              className="mt-1 w-full accent-wave-600"
              onChange={(e) => setMastery(Number(e.target.value))}
            />
          </label>
          <Button
            onClick={async () => {
              if (!skillName) return;
              await learningApi.upsertSkill({ name: skillName, mastery });
              setSkillName('');
              await load();
            }}
          >
            Save skill
          </Button>
          <ul className="mt-4 space-y-2">
            {skills.map((s) => (
              <li key={s._id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <div className="flex justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span>{s.mastery}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-wave-600" style={{ width: `${s.mastery}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-surface space-y-3">
          <h2 className="font-display text-xl font-bold">Skill gaps & recommendations</h2>
          {gaps.length ? (
            <ul className="space-y-2 text-sm">
              {gaps.map((g) => (
                <li key={g._id} className="rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                  {g.name} — {g.mastery}% / target {g.targetMastery}%
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No gaps yet" description="Add skills below 80% mastery to see gaps." />
          )}
          <ul className="mt-4 space-y-2 text-sm text-wave-800 dark:text-wave-200">
            {recommendations.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-surface space-y-3">
        <h2 className="font-display text-xl font-bold">AI study plan</h2>
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-md"
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. System Design"
          />
          <div className="flex items-end">
            <Button
              onClick={async () => {
                if (!topic) return;
                await learningApi.createStudyPlan({ topic, days: 14 });
                setTopic('');
                await load();
              }}
            >
              Generate plan
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-xs text-slate-500">{p.progress}% complete</p>
              <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
                {p.schedule?.slice(0, 7).map((d) => (
                  <li key={d._id || d.day}>
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => d._id && learningApi.toggleDay(p._id, d._id).then(load)}
                    >
                      {d.completed ? '✓' : '○'} Day {d.day}: {d.focus}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface space-y-3">
        <h2 className="font-display text-xl font-bold">AI quiz generator</h2>
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-md"
            label="Quiz topic"
            value={quizTopic}
            onChange={(e) => setQuizTopic(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              onClick={async () => {
                if (!quizTopic) return;
                const { data } = await learningApi.createQuiz({ topic: quizTopic });
                setQuiz(data.data.quiz);
                setAnswers(Array(data.data.quiz.questions.length).fill(''));
                setScore(null);
              }}
            >
              Generate quiz
            </Button>
          </div>
        </div>
        {quiz && (
          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <div key={q.question} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>
                <Select
                  className="mt-2"
                  value={answers[i] || ''}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                >
                  <option value="">Select answer</option>
                  {q.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
            <Button
              onClick={async () => {
                const { data } = await learningApi.submitQuiz(quiz._id, answers);
                setScore(`${data.data.score}/${data.data.total}`);
              }}
            >
              Submit quiz
            </Button>
            {score && <Alert tone="success">Score: {score}</Alert>}
          </div>
        )}
      </section>

      <section className="card-surface">
        <h2 className="font-display text-xl font-bold">Certificates</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {certificates.map((c) => (
            <li key={c.credentialId || c.title} className="rounded-xl bg-wave-50 px-3 py-2 dark:bg-wave-950/40">
              {c.title} · {c.credentialId}
            </li>
          ))}
          {!certificates.length && <li className="text-slate-500">Reach 90% mastery on a skill to earn a certificate.</li>}
        </ul>
      </section>
    </div>
  );
}
