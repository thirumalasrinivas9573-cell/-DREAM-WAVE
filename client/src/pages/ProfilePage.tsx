import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="page-title">Profile</h1>
      <div className="card-surface">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-wave-500 to-cyan-500 text-2xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-display text-2xl font-bold">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">AAID</dt>
            <dd className="font-semibold">{user.aaid}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Plan</dt>
            <dd className="font-semibold capitalize">{user.plan}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Level</dt>
            <dd className="font-semibold">{user.level}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Credits</dt>
            <dd className="font-semibold">{user.credits}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">Bio</dt>
            <dd className="font-semibold">{user.bio || 'No bio yet'}</dd>
          </div>
        </dl>
        <Link to="/settings" className="btn-primary mt-6 inline-flex">
          Edit in Settings
        </Link>
      </div>
    </div>
  );
}
