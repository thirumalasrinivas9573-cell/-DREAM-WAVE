import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

const features = [
  { title: 'AI Mentor', body: 'Chat with a mentor that remembers context, accepts files, and guides your next move.' },
  { title: 'Goals & Tasks', body: 'Track milestones, priorities, and due dates in one calm operating system.' },
  { title: 'Learning Roadmaps', body: 'Generate skill timelines tailored to the career you are building toward.' },
  { title: 'Reports & Insights', body: 'Export PDF performance reports with charts that show real progress.' },
];

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    perks: ['AI Mentor chat', 'Goals & tasks', 'Books library', 'Community access'],
  },
  {
    name: 'Pro',
    price: '$12',
    perks: ['Unlimited roadmaps', 'PDF reports', 'Priority mentor', 'Advanced analytics'],
    featured: true,
  },
  {
    name: 'Teams',
    price: '$29',
    perks: ['Admin controls', 'Shared progress', 'Seat management', 'Priority support'],
  },
];

const faqs = [
  {
    q: 'Does Dream Wave work without an OpenAI key?',
    a: 'Yes. The mentor and generators use a high-quality local fallback when OPENAI_API_KEY is not set.',
  },
  {
    q: 'Can I export reports as PDF?',
    a: 'Yes. Generate a report from the Reports page and download a branded PDF instantly.',
  },
  {
    q: 'Is my data secured?',
    a: 'Passwords are hashed, APIs are JWT-protected, and admin routes require an admin role.',
  },
  {
    q: 'Is it mobile friendly?',
    a: 'The entire app is responsive with a mobile navigation drawer and touch-friendly controls.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.25),_transparent_55%)]" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Dream Wave <span className="text-wave-600">AI</span>
            </p>
            <h1 className="max-w-xl text-xl font-medium text-slate-700 dark:text-slate-200 sm:text-2xl">
              The calm operating system for ambitious careers.
            </h1>
            <p className="mt-4 max-w-lg text-slate-600 dark:text-slate-400">
              Mentor chat, goals, roadmaps, books, and reports — designed as one composition, not a cluttered dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="btn-primary">
                Start free <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-ghost">
                Explore features
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="glass relative overflow-hidden rounded-[2rem] p-6 md:p-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl bg-gradient-to-br from-wave-700 via-wave-600 to-cyan-500 p-6 text-white shadow-2xl"
              >
                <div className="mb-6 flex items-center gap-2 text-sm opacity-90">
                  <Sparkles size={16} /> Live mentor session
                </div>
                <p className="font-display text-2xl font-bold">Ship one skill this week.</p>
                <p className="mt-3 text-sm text-teal-50/90">
                  Break your goal into milestones, schedule deep work, and let Dream Wave keep you honest.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs">
                  {['Goals', 'Roadmap', 'Reports'].map((label) => (
                    <div key={label} className="rounded-xl bg-white/15 px-2 py-3 backdrop-blur">
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/30 blur-3xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Built for focused growth</h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          Every module connects — mentor advice becomes goals, goals become tasks, progress becomes reports.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-display text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Pricing</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400">Start free. Upgrade when your practice needs more depth.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 ${
                plan.featured
                  ? 'bg-gradient-to-b from-wave-700 to-wave-900 text-white shadow-xl'
                  : 'glass'
              }`}
            >
              <p className="text-sm uppercase tracking-wide opacity-80">{plan.name}</p>
              <p className="mt-2 font-display text-4xl font-bold">
                {plan.price}
                {plan.price !== 'Free' && <span className="text-base font-medium opacity-80">/mo</span>}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check size={16} className={plan.featured ? 'text-teal-200' : 'text-wave-600'} />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-8 inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  plan.featured ? 'bg-white text-wave-800' : 'btn-primary'
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold">FAQ</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item, idx) => {
            const panelId = `faq-panel-${idx}`;
            const expanded = openFaq === idx;
            return (
              <div key={item.q} className="glass rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpenFaq(expanded ? null : idx)}
                  className="w-full p-5 text-left"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  id={`faq-button-${idx}`}
                >
                  <p className="font-semibold">{item.q}</p>
                </button>
                {expanded && (
                  <p
                    id={panelId}
                    role="region"
                    aria-labelledby={`faq-button-${idx}`}
                    className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400"
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="glass overflow-hidden rounded-[2rem] px-8 py-12 text-center">
          <h2 className="font-display text-3xl font-bold">Ready to ride the wave?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Create your account and open your first mentor conversation in under a minute.
          </p>
          <Link to="/signup" className="btn-primary mt-6">
            Create account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} Dream Wave AI · <Link to="/contact">Contact</Link>
      </footer>
    </div>
  );
}
