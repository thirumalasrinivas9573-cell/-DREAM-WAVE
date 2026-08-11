import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsApi } from '../services/endpoints';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

type Form = z.infer<typeof schema>;

export default function ContactPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setError('');
    try {
      await settingsApi.contact(values);
      setDone(true);
      reset();
    } catch {
      setError('Failed to send message');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold">Contact</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Questions, partnerships, or support — send a note.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="glass mt-8 rounded-3xl p-8">
        {done && <p className="mb-4 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800">Message sent.</p>}
        {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
        <label className="block text-sm font-medium">Name</label>
        <input className="input-field mt-1" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        <label className="mt-4 block text-sm font-medium">Email</label>
        <input className="input-field mt-1" type="email" {...register('email')} />
        {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
        <label className="mt-4 block text-sm font-medium">Message</label>
        <textarea className="input-field mt-1 min-h-32" {...register('message')} />
        {errors.message && <p className="text-xs text-rose-600">{errors.message.message}</p>}
        <button className="btn-primary mt-6" disabled={isSubmitting}>
          Send message
        </button>
      </form>
    </div>
  );
}
