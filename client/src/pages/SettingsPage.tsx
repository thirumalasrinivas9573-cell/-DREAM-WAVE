import { useEffect, useState } from 'react';
import { authApi, settingsApi, billingApi, orgsApi } from '../services/endpoints';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';

type SessionRow = { id: string; userAgent?: string; createdAt?: string; expiresAt?: string };

type BillingInfo = {
  entitlements: {
    planId: string;
    label: string;
    credits: number;
    monthlyCredits: number;
    maxUploadMb: number;
    aiCallsRemaining: number;
  };
  catalog: { id: string; label: string; monthlyCredits: number }[];
  stripe: { checkoutEnabled: boolean; note: string };
};

type OrgInfo = {
  organization: { id: string; name: string; slug: string; type?: string; plan: string } | null;
  membership: { role: string } | null;
};

type OrgMemberRow = {
  id: string;
  role: string;
  createdAt?: string;
  user: { id: string; name: string; email: string; aaid?: string; plan?: string } | null;
};

type OrgInviteRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt?: string;
};

export default function SettingsPage() {
  const { user, refreshMe, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'institution' | 'company' | 'team'>('institution');
  const [orgBusy, setOrgBusy] = useState(false);
  const [orgMembers, setOrgMembers] = useState<OrgMemberRow[]>([]);
  const [orgInvites, setOrgInvites] = useState<OrgInviteRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const canManageOrg =
    orgInfo?.membership?.role === 'owner' || orgInfo?.membership?.role === 'admin';

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data } = await authApi.sessions();
      setSessions(data.data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadBilling = async () => {
    try {
      const { data } = await billingApi.plan();
      setBilling(data.data);
    } catch {
      setBilling(null);
    }
  };

  const loadRoster = async (orgId: string) => {
    setMembersLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        orgsApi.members(orgId),
        orgsApi.invites(orgId),
      ]);
      setOrgMembers(membersRes.data.data.members || []);
      setOrgInvites(invitesRes.data.data.invites || []);
    } catch {
      setOrgMembers([]);
      setOrgInvites([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const loadOrg = async () => {
    try {
      const { data } = await orgsApi.me();
      setOrgInfo(data.data);
      const role = data.data.membership?.role;
      if (data.data.organization && (role === 'owner' || role === 'admin')) {
        await loadRoster(data.data.organization.id);
      } else {
        setOrgMembers([]);
        setOrgInvites([]);
      }
    } catch {
      setOrgInfo(null);
      setOrgMembers([]);
      setOrgInvites([]);
    }
  };

  const createOrg = async () => {
    if (!orgName.trim()) return;
    setOrgBusy(true);
    setError('');
    try {
      await orgsApi.create({ name: orgName.trim(), type: orgType });
      setOrgName('');
      setMessage('Organization created');
      await refreshMe();
      await loadOrg();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not create organization'
      );
    } finally {
      setOrgBusy(false);
    }
  };

  const changeMemberRole = async (membershipId: string, role: 'admin' | 'member') => {
    if (!orgInfo?.organization) return;
    setError('');
    try {
      await orgsApi.updateMemberRole(orgInfo.organization.id, membershipId, role);
      setMessage('Member role updated');
      await loadRoster(orgInfo.organization.id);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not update role'
      );
    }
  };

  const removeMember = async (membershipId: string, label: string) => {
    if (!orgInfo?.organization) return;
    const ok = await confirm({
      title: 'Remove member',
      message: `Remove ${label} from this organization?`,
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    try {
      await orgsApi.removeMember(orgInfo.organization.id, membershipId);
      setMessage('Member removed');
      await loadRoster(orgInfo.organization.id);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not remove member'
      );
    }
  };

  const sendOtp = async () => {
    setOtpBusy(true);
    setError('');
    try {
      await authApi.sendOtp();
      setMessage('OTP sent to your email');
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not send OTP'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setOtpBusy(true);
    setError('');
    try {
      await authApi.verifyOtp(otpCode.trim());
      setOtpCode('');
      setMessage('Email verified');
      await refreshMe();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Invalid OTP'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  const inviteMember = async () => {
    if (!orgInfo?.organization || !inviteEmail.trim()) return;
    setInviteBusy(true);
    setError('');
    try {
      const { data } = await orgsApi.addMember(orgInfo.organization.id, {
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteRole('member');
      setMessage(
        data.data.status === 'pending_invite'
          ? 'Invite email sent — they can sign up to join'
          : 'Member added'
      );
      await loadRoster(orgInfo.organization.id);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not add member'
      );
    } finally {
      setInviteBusy(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    if (!orgInfo?.organization) return;
    const ok = await confirm({
      title: 'Revoke invite',
      message: 'Cancel this pending invitation?',
      confirmLabel: 'Revoke',
    });
    if (!ok) return;
    try {
      await orgsApi.revokeInvite(orgInfo.organization.id, inviteId);
      setMessage('Invite revoked');
      await loadRoster(orgInfo.organization.id);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not revoke invite'
      );
    }
  };

  const startCheckout = async (plan: 'pro' | 'team') => {
    setBillingBusy(true);
    setError('');
    try {
      const { data } = await billingApi.checkout(plan);
      if (data.data.url) window.location.href = data.data.url;
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not start checkout'
      );
    } finally {
      setBillingBusy(false);
    }
  };

  const openPortal = async () => {
    setBillingBusy(true);
    setError('');
    try {
      const { data } = await billingApi.portal();
      if (data.data.url) window.location.href = data.data.url;
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not open billing portal'
      );
    } finally {
      setBillingBusy(false);
    }
  };

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setLanguage(user?.preferences?.language || 'en');
    setNotifications(user?.preferences?.notifications ?? true);
  }, [user]);

  useEffect(() => {
    loadSessions();
    loadBilling();
    loadOrg();
  }, []);

  const saveAccount = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await settingsApi.update({ name, bio, language, notifications, theme });
      await authApi.updatePreferences({ theme, language, notifications });
      await refreshMe();
      setMessage('Settings saved');
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setError('');
    setMessage('');
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password updated');
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Password change failed'
      );
    }
  };

  const revokeSession = async (id: string) => {
    const ok = await confirm({
      title: 'Revoke session',
      message: 'Sign out this device/session?',
      confirmLabel: 'Revoke',
    });
    if (!ok) return;
    try {
      await authApi.revokeSession(id);
      setMessage('Session revoked');
      await loadSessions();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to revoke session'
      );
    }
  };

  const deleteAccount = async () => {
    const ok = await confirm({
      title: 'Delete account',
      message: 'This permanently deletes your account and all data. Continue?',
      confirmLabel: 'Delete account',
    });
    if (!ok) return;
    try {
      await settingsApi.deleteAccount(deletePassword);
      logout();
      navigate('/');
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Account deletion failed'
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Settings" description="Theme, language, security, and account." />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <section className="card-surface space-y-3" aria-labelledby="profile-settings">
        <h2 id="profile-settings" className="font-display text-xl font-bold">
          Profile
        </h2>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <p className="text-sm text-slate-500">
          Email: {user?.email} · AAID: {user?.aaid}
        </p>
      </section>

      <section className="card-surface space-y-3" aria-labelledby="email-verify-settings">
        <h2 id="email-verify-settings" className="font-display text-xl font-bold">
          Email verification
        </h2>
        {user?.isEmailVerified ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Email verified</p>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Verify with a 6-digit OTP (also available via the email link sent at signup).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" loading={otpBusy} onClick={sendOtp}>
                Send OTP
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    await authApi.resendVerification();
                    setMessage('Verification link sent');
                  } catch (e: unknown) {
                    setError(
                      (e as { response?: { data?: { message?: string } } })?.response?.data
                        ?.message || 'Could not resend link'
                    );
                  }
                }}
              >
                Resend link
              </Button>
            </div>
            <Input
              label="OTP code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
            />
            <Button loading={otpBusy} disabled={otpCode.trim().length !== 6} onClick={verifyOtp}>
              Verify OTP
            </Button>
          </>
        )}
      </section>

      <section className="card-surface space-y-3" aria-labelledby="pref-settings">
        <h2 id="pref-settings" className="font-display text-xl font-bold">
          Preferences
        </h2>
        <Select
          label="Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
        <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="hi">Hindi</option>
          <option value="fr">French</option>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          Enable in-app notifications
        </label>
        <Button loading={saving} onClick={saveAccount}>
          Save settings
        </Button>
      </section>

      <section className="card-surface space-y-3" aria-labelledby="org-settings">
        <h2 id="org-settings" className="font-display text-xl font-bold">
          Organization
        </h2>
        {orgInfo?.organization ? (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-semibold">{orgInfo.organization.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="font-semibold capitalize">{orgInfo.membership?.role || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Slug</dt>
                <dd className="font-semibold">{orgInfo.organization.slug}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Type</dt>
                <dd className="font-semibold capitalize">
                  {orgInfo.organization.type || 'institution'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Org plan</dt>
                <dd className="font-semibold capitalize">{orgInfo.organization.plan}</dd>
              </div>
            </dl>

            {canManageOrg ? (
              <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Members</h3>
                {membersLoading ? (
                  <p className="text-sm text-slate-500">Loading members…</p>
                ) : orgMembers.length === 0 ? (
                  <p className="text-sm text-slate-500">No members yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orgMembers.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{m.user?.name || 'Unknown'}</p>
                          <p className="truncate text-slate-500">{m.user?.email}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {m.role === 'owner' ? (
                            <span className="capitalize text-slate-600 dark:text-slate-300">
                              owner
                            </span>
                          ) : (
                            <>
                              <Select
                                label=""
                                value={m.role === 'admin' ? 'admin' : 'member'}
                                onChange={(e) =>
                                  changeMemberRole(
                                    m.id,
                                    e.target.value as 'admin' | 'member'
                                  )
                                }
                                className="w-28"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </Select>
                              <Button
                                variant="ghost"
                                className="text-xs text-rose-600"
                                onClick={() =>
                                  removeMember(m.id, m.user?.name || m.user?.email || 'member')
                                }
                              >
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    Existing accounts join immediately. New emails get a signup invite link (14 days).
                  </p>
                  <Input
                    label="Member email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@school.edu"
                  />
                  <Select
                    label="Role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Button
                    loading={inviteBusy}
                    disabled={!inviteEmail.trim()}
                    onClick={inviteMember}
                  >
                    Invite
                  </Button>
                </div>

                {orgInvites.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Pending invites
                    </h3>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orgInvites.map((inv) => (
                        <li
                          key={inv.id}
                          className="flex items-center justify-between gap-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{inv.email}</p>
                            <p className="text-slate-500 capitalize">{inv.role}</p>
                          </div>
                          <Button
                            variant="ghost"
                            className="shrink-0 text-xs"
                            onClick={() => revokeInvite(inv.id)}
                          >
                            Revoke
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="border-t border-slate-200 pt-3 text-sm text-slate-500 dark:border-slate-700">
                You are a member of this organization. Ask an owner or admin to manage the roster.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Create an organization for your school or company. Personal accounts remain supported.
            </p>
            <Input
              label="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme University"
            />
            <Select
              label="Organization type"
              value={orgType}
              onChange={(e) =>
                setOrgType(e.target.value as 'institution' | 'company' | 'team')
              }
            >
              <option value="institution">Institution (school)</option>
              <option value="company">Company</option>
              <option value="team">Team</option>
            </Select>
            <Button loading={orgBusy} disabled={!orgName.trim()} onClick={createOrg}>
              Create organization
            </Button>
          </>
        )}
      </section>

      <section className="card-surface space-y-3" aria-labelledby="billing-settings">
        <h2 id="billing-settings" className="font-display text-xl font-bold">
          Plan & credits
        </h2>
        {billing ? (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Current plan</dt>
                <dd className="font-semibold capitalize">{billing.entitlements.label}</dd>
              </div>
              <div>
                <dt className="text-slate-500">AI credits</dt>
                <dd className="font-semibold">
                  {billing.entitlements.credits} / {billing.entitlements.monthlyCredits}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Upload limit</dt>
                <dd className="font-semibold">{billing.entitlements.maxUploadMb} MB</dd>
              </div>
              <div>
                <dt className="text-slate-500">Checkout</dt>
                <dd className="font-semibold">
                  {billing.stripe.checkoutEnabled ? 'Available' : 'Coming soon'}
                </dd>
              </div>
            </dl>
            <ul className="space-y-1 text-sm text-slate-500">
              {billing.catalog.map((p) => (
                <li key={p.id}>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{p.label}</span>
                  {' — '}
                  {p.monthlyCredits} credits / month
                  {p.id === billing.entitlements.planId ? ' (current)' : ''}
                </li>
              ))}
            </ul>
            {billing.stripe.checkoutEnabled ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {billing.entitlements.planId !== 'pro' && (
                  <Button loading={billingBusy} onClick={() => startCheckout('pro')}>
                    Upgrade to Pro
                  </Button>
                )}
                {billing.entitlements.planId !== 'team' && (
                  <Button
                    variant="ghost"
                    loading={billingBusy}
                    onClick={() => startCheckout('team')}
                  >
                    Upgrade to Team
                  </Button>
                )}
                <Button variant="ghost" loading={billingBusy} onClick={openPortal}>
                  Manage billing
                </Button>
              </div>
            ) : null}
            <p className="text-xs text-slate-500">{billing.stripe.note}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Unable to load plan details.</p>
        )}
      </section>

      <section className="card-surface space-y-3" aria-labelledby="security-settings">
        <h2 id="security-settings" className="font-display text-xl font-bold">
          Security
        </h2>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="Min 8 characters with a letter and number"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button variant="ghost" onClick={changePassword}>
          Change password
        </Button>
      </section>

      <section className="card-surface space-y-3" aria-labelledby="sessions-settings">
        <h2 id="sessions-settings" className="font-display text-xl font-bold">
          Active sessions
        </h2>
        <p className="text-sm text-slate-500">
          Devices signed in with your account. Revoke any session you do not recognize.
        </p>
        {sessionsLoading ? (
          <p className="text-sm text-slate-500">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No active sessions found.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
              >
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{s.userAgent || 'Unknown device'}</p>
                  <p className="text-slate-500">
                    {s.createdAt ? `Started ${new Date(s.createdAt).toLocaleString()}` : 'Active'}
                    {s.expiresAt ? ` · Expires ${new Date(s.expiresAt).toLocaleString()}` : ''}
                  </p>
                </div>
                <Button variant="ghost" className="text-rose-600" onClick={() => revokeSession(s.id)}>
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="card-surface space-y-3 border-rose-200 dark:border-rose-900"
        aria-labelledby="danger-settings"
      >
        <h2 id="danger-settings" className="font-display text-xl font-bold text-rose-600">
          Danger zone
        </h2>
        <Input
          label="Confirm password to delete account"
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />
        <Button variant="danger" onClick={deleteAccount}>
          Delete account
        </Button>
      </section>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
