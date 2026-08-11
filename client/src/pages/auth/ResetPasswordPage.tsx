import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });

type Form = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    if (!token) return;
    setError('');
    try {
      const { data } = await authApi.resetPassword(token, values.password);
      setSession(data.token!, data.data!.user);
      navigate('/dashboard');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Reset failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full rounded-3xl p-8" noValidate>
        <h1 className="font-display text-3xl font-bold">Reset password</h1>
        {error && (
          <Alert tone="error" className="mt-4">
            {error}
          </Alert>
        )}
        <div className="mt-6 space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm"
            type="password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register('confirm')}
          />
        </div>
        <Button className="mt-6 w-full" loading={isSubmitting} type="submit">
          Update password
        </Button>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-wave-600">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
