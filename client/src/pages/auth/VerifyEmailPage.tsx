import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing token');
      return;
    }
    authApi
      .verifyEmail(token)
      .then((r) => {
        setStatus('ok');
        setMessage(r.data.message || 'Email verified');
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e?.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="glass w-full rounded-3xl p-8 text-center">
        <h1 className="font-display text-3xl font-bold">Email verification</h1>
        {status === 'loading' && <Spinner className="mt-8" label="Verifying" />}
        {status === 'ok' && (
          <Alert tone="success" className="mt-6">
            {message}
          </Alert>
        )}
        {status === 'error' && (
          <Alert tone="error" className="mt-6">
            {message}
          </Alert>
        )}
        <Link to="/login" className="mt-6 inline-block">
          <Button>Continue to login</Button>
        </Link>
      </div>
    </div>
  );
}
