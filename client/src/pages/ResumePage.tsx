import { useEffect, useState } from 'react';
import { resumeApi } from '../services/endpoints';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { CardSkeleton } from '../components/ui/Spinner';
import { Markdown } from '../components/common/Markdown';

export default function ResumePage() {
  const [resume, setResume] = useState<{
    title: string;
    headline: string;
    summary: string;
    skills: string[];
    aiSuggestions?: string;
  } | null>(null);
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    resumeApi
      .get()
      .then((r) => {
        setResume(r.data.data.resume);
        setSkillsText((r.data.data.resume.skills || []).join(', '));
      })
      .catch(() => setError('Failed to load resume'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !resume) return <CardSkeleton rows={6} />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="AI Resume Builder" description="Craft ATS-friendly resumes with AI coaching." />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="card-surface space-y-3">
        <Input
          label="Title"
          value={resume.title}
          onChange={(e) => setResume({ ...resume, title: e.target.value })}
        />
        <Input
          label="Headline"
          value={resume.headline || ''}
          onChange={(e) => setResume({ ...resume, headline: e.target.value })}
        />
        <Textarea
          label="Summary"
          value={resume.summary || ''}
          onChange={(e) => setResume({ ...resume, summary: e.target.value })}
        />
        <Input
          label="Skills (comma separated)"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              await resumeApi.update({
                ...resume,
                skills: skillsText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
              setMessage('Resume saved');
            }}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              const { data } = await resumeApi.improve({ targetRole: resume.headline });
              setResume(data.data.resume);
              setMessage('AI suggestions ready');
            }}
          >
            Improve with AI
          </Button>
        </div>
      </div>

      {resume.aiSuggestions && (
        <div className="card-surface">
          <h2 className="mb-3 font-display text-xl font-bold">AI suggestions</h2>
          <Markdown content={resume.aiSuggestions} />
        </div>
      )}
    </div>
  );
}
