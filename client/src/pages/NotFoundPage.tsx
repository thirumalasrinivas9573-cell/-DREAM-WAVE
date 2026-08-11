import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-extrabold text-wave-600">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        The page you requested does not exist or was moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button>Go home</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
