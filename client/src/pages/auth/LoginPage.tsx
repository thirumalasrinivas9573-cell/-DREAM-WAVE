import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
  portal: z.enum(['student', 'institution', 'company']),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { portal: 'student' },
  });

  const onSubmit = async (values: Form) => {
    setError('');
    try {
      const { data } = await authApi.login(values);
      setSession(data.token, data.data.user);
      if (data.data.portal === 'institution' || data.data.portal === 'company') {
        navigate('/institution');
      } else {
        navigate('/dashboard');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Login failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full rounded-3xl p-8" noValidate>
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Log in to Dream Wave AI</p>
        {error && (
          <Alert tone="error" className="mt-4">
            {error}
          </Alert>
        )}
        <div className="mt-6 space-y-4">
          <Select label="Portal" error={errors.portal?.message} {...register('portal')}>
            <option value="student">Student</option>
            <option value="institution">Institution</option>
            <option value="company">Company</option>
          </Select>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        <Button className="mt-6 w-full" loading={isSubmitting} type="submit">
          Log in
        </Button>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="text-wave-600">
            Forgot password?
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/signup" className="text-wave-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
