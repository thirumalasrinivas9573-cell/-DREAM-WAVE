import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, orgsApi } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email(),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });

type Form = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState('');
  const [inviteOrg, setInviteOrg] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await orgsApi.previewInvite(inviteToken);
        if (cancelled) return;
        setInviteOrg(data.data.organization.name);
        setValue('email', data.data.email);
      } catch {
        if (!cancelled) setError('This invite link is invalid or expired');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteToken, setValue]);

  const onSubmit = async (values: Form) => {
    setError('');
    try {
      const { data } = await authApi.signup({
        name: values.name,
        email: values.email,
        password: values.password,
        ...(inviteToken ? { inviteToken } : {}),
      });
      setSession(data.token, data.data.user);
      navigate('/dashboard');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Signup failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full rounded-3xl p-8" noValidate>
        <h1 className="font-display text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">
          {inviteOrg ? `Join ${inviteOrg} on Dream Wave AI` : 'Join Dream Wave AI'}
        </p>
        {error && (
          <Alert tone="error" className="mt-4">
            {error}
          </Alert>
        )}
        {inviteOrg && !error && (
          <Alert tone="success" className="mt-4">
            You&apos;re accepting an organization invite for {inviteOrg}.
          </Alert>
        )}
        <div className="mt-6 space-y-4">
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
            readOnly={Boolean(inviteToken && inviteOrg)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="Min 8 characters with a letter and number"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register('confirm')}
          />
        </div>
        <Button className="mt-6 w-full" loading={isSubmitting} type="submit">
          Sign up
        </Button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-wave-600">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
