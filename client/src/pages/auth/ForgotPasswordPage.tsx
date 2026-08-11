import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import { useState } from 'react';

const schema = z.object({ email: z.string().email() });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setError('');
    try {
      await authApi.forgotPassword(values.email);
      setDone(true);
    } catch {
      setError('Could not send reset email');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full rounded-3xl p-8">
        <h1 className="font-display text-3xl font-bold">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">We will email you a reset link.</p>
        {done ? (
          <p className="mt-6 rounded-xl bg-teal-50 px-3 py-3 text-sm text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
            If that email exists, a reset link was sent. Check your inbox (and server console if SMTP is not configured).
          </p>
        ) : (
          <>
            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
            <label className="mt-6 block text-sm font-medium">Email</label>
            <input className="input-field mt-1" type="email" {...register('email')} />
            <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
              Send reset link
            </button>
          </>
        )}
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-wave-600">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
