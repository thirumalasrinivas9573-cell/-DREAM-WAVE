import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orgsApi } from '../../services/endpoints';
import { PageHeader } from '../../components/common/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/cn';

type OverviewData = {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    createdAt?: string;
  } | null;
  membershipCounts: {
    total: number;
    owners: number;
    admins: number;
    members: number;
  };
  pendingInvites: number;
  totals: {
    goalsTotal: number;
    goalsCompleted: number;
    tasksTotal: number;
    tasksDone: number;
    documents: number;
    habitsActive: number;
    skills: number;
    studyPlans: number;
    roadmaps: number;
    chats: number;
    creditsRemaining: number;
  };
  memberActivity: {
    membershipId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      plan?: string;
      credits: number;
    } | null;
    goals: number;
    tasks: number;
    joinedAt?: string;
  }[];
  viewerRole: string | null;
};

export default function InstitutionPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [noOrg, setNoOrg] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    setNoOrg(false);
    try {
      const me = await orgsApi.me();
      const org = me.data.data.organization;
      const role = me.data.data.membership?.role;
      if (!org) {
        setNoOrg(true);
        setData(null);
        return;
      }
      if (role !== 'owner' && role !== 'admin') {
        setForbidden(true);
        setData(null);
        return;
      }
      const overview = await orgsApi.overview(org.id);
      setData(overview.data.data);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setForbidden(true);
        setData(null);
      } else {
        setError(
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Could not load institution overview'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Institution" description="Organization cohort overview" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (noOrg) {
    return (
      <div className="space-y-6">
        <PageHeader title="Institution" description="Organization cohort overview" />
        <EmptyState
          title="No organization yet"
          description="Create an organization in Settings to unlock the institution console."
          actionLabel="Go to Settings"
          onAction={() => navigate('/settings')}
        />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Institution" description="Organization cohort overview" />
        <Alert tone="error">
          Only organization owners and admins can view the institution overview. Ask an admin if you
          need access.
        </Alert>
      </div>
    );
  }

  if (error || !data?.organization) {
    return (
      <div className="space-y-6">
        <PageHeader title="Institution" description="Organization cohort overview" />
        <Alert tone="error">{error || 'Overview unavailable'}</Alert>
        <Button onClick={load}>Retry</Button>
      </div>
    );
  }

  const { organization, membershipCounts, pendingInvites, totals, memberActivity } = data;

  const cards = [
    { label: 'Members', value: membershipCounts.total },
    { label: 'Pending invites', value: pendingInvites },
    { label: 'Goals', value: `${totals.goalsCompleted}/${totals.goalsTotal}` },
    { label: 'Tasks done', value: `${totals.tasksDone}/${totals.tasksTotal}` },
    { label: 'Documents', value: totals.documents },
    { label: 'Skills', value: totals.skills },
    { label: 'Roadmaps', value: totals.roadmaps },
    { label: 'AI chats', value: totals.chats },
    { label: 'Credits left', value: totals.creditsRemaining },
    { label: 'Active habits', value: totals.habitsActive },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={organization.name}
        description={`Institution overview · ${organization.slug} · ${organization.plan} plan`}
        actions={
          <Link to="/settings">
            <Button variant="ghost">Manage roster & invites</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card-surface">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-wave-700 dark:text-wave-300">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <section className="card-surface">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Member activity</h2>
          <p className="text-sm text-slate-500">
            {membershipCounts.owners} owner · {membershipCounts.admins} admin ·{' '}
            {membershipCounts.members} member
          </p>
        </div>
        {memberActivity.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Invite students from Settings → Organization."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 font-medium text-slate-500">Name</th>
                  <th className="font-medium text-slate-500">Email</th>
                  <th className="font-medium text-slate-500">Role</th>
                  <th className="font-medium text-slate-500">Goals</th>
                  <th className="font-medium text-slate-500">Tasks</th>
                  <th className="font-medium text-slate-500">Credits</th>
                  <th className="font-medium text-slate-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {memberActivity.map((row) => (
                  <tr
                    key={row.membershipId}
                    className="border-b border-slate-100 dark:border-slate-800/80"
                  >
                    <td className="py-2.5 font-medium">{row.user?.name || '—'}</td>
                    <td className="text-slate-500">{row.user?.email || '—'}</td>
                    <td className="capitalize">{row.role}</td>
                    <td>{row.goals}</td>
                    <td>{row.tasks}</td>
                    <td>{row.user?.credits ?? 0}</td>
                    <td className="text-slate-500">
                      {row.joinedAt ? formatDate(row.joinedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
