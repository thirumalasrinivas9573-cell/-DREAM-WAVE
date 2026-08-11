# Dream Wave AI

Production-ready AI career mentor platform with goals, tasks, learning roadmaps, books, community, reports (PDF), and an admin panel.

## Canonical architecture

**Ship only from:**

| Path | Role |
|------|------|
| `client/` | Web SPA (React 19 + TypeScript + Vite) |
| `server/` | API (Express + MongoDB) — **excluding** `server/src/mj/` |

**Quarantined (do not run or import):** `dream-wave-ai/**`, `server/src/mj/**`  
**Separate lane:** `mobile/**`

See [ARCHITECTURE_BOUNDARIES.md](./ARCHITECTURE_BOUNDARIES.md). Verify with:

```bash
npm run arch:verify
```

### Tests & merge gate

```bash
npm test          # API smoke
npm run ci        # arch:verify → test → client build (required before merge)
```

CI runs the same gate on push/PR via [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).  
Release steps: [docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md).

API smoke suite: health, auth, assets, billing/Stripe, organizations. Uses MongoMemoryServer when available; otherwise `server/.env` `MONGODB_URI` with isolated DB `dreamwave_smoke_test`. Override with `TEST_MONGODB_URI`. Set `PREFER_MEMORY_MONGO=1` in CI.

Tenancy: [docs/ORG_TENANCY.md](./docs/ORG_TENANCY.md).

## Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Zustand, React Router, Framer Motion, Recharts, Axios, React Hook Form, Zod
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, private authenticated uploads, PDFKit, OpenAI (optional fallback)

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a cloud URI)

### Install

```bash
npm run install:all
```

### Configure

```bash
cp .env.example server/.env
# edit server/.env — set MONGODB_URI, JWT_SECRET, optional OPENAI_API_KEY
# set ADMIN_EMAIL to the email you will sign up with to receive admin role
```

### Run

```bash
npm run dev
```

- Client: http://localhost:5173  
- API: http://localhost:5000/api/health  

### Production build

```bash
npm run build
npm start
```

Serve the client `client/dist` with any static host (Netlify/Vercel) and point `VITE_API_URL` at your API. Or reverse-proxy `/api` to the Express server (user files are served only via authenticated `GET /api/assets/:filename`).

## Features

| Area | Capabilities |
|------|----------------|
| Landing | Animated hero, glassmorphism, dark/light mode, pricing, FAQ, contact |
| Auth | Signup, login, JWT, forgot/reset password, profile |
| Dashboard | Stats, Recharts activity, AI suggestions, calendar snapshot, notifications |
| AI Mentor | Chat history, markdown replies, file/image upload |
| Goals | CRUD, milestones, progress |
| Tasks | Priorities, due dates, list + calendar views |
| Roadmap | AI-generated paths, skills, timeline phases |
| Books | Categories, search, bookmarks, reading progress |
| Reports | Analytics charts, generate report, PDF download |
| Community | Posts, likes, comments |
| Settings | Theme, language, security, delete account |
| Admin | Users, roles/plans, analytics, reports |

## API overview

- `POST /api/auth/signup|login` · `POST /api/auth/forgot-password` · `PUT /api/auth/reset-password/:token`
- `GET/POST /api/goals` · `GET/POST /api/tasks` · `POST /api/roadmap/generate`
- `GET/POST /api/mentor` · `POST /api/mentor/:id/messages`
- `GET /api/books` · `POST /api/reports/generate` · `GET /api/reports/:id/pdf`
- `GET/POST /api/community` · `GET /api/dashboard/stats`
- `GET /api/admin/dashboard` (admin role)

## Admin access

Sign up with the email matching `ADMIN_EMAIL` in `server/.env` (default `admin@dreamwave.ai`), or promote a user via MongoDB / admin panel once an admin exists.

## What's new in 2.1

- **AI Studio** — 18 specialized AI modes (mentor, career, study, roadmap, research, PDF, notes, quiz, resume, interview, coding, daily, goals, habits, motivation, books, project, time)
- **AI Chat** — single conversation history for all modes (search, rename, export, uploads); AI Modes launches into Chat
- **Learning Hub** — skills, gaps, study plans, quizzes, certificates, learning streaks
- **Productivity** — calendar events, habits, Pomodoro, focus mode, AI daily planner
- **Document AI** — PDF/DOCX/PPT/image upload, summarize, notes, quizzes, Q&A
- **Chat upgrades** — search, rename, export markdown, modes, syntax highlighting
- **Security** — access + refresh tokens, httpOnly cookies, email verification, session management
- **Billing foundation** — plan catalog (`free` / `pro` / `team`), entitlements service, AI credit gate, Stripe Checkout/Portal/webhooks when env configured
- **Resume Builder** — AI-assisted resume improvement
- **DB** — indexes, aggregation-ready analytics, `server/utils/backup.sh`

## Security

- JWT access (15m) + refresh (7d) with hashed session store; refresh in httpOnly cookie only
- Private user assets via `/api/assets/:filename` (auth + ownership)
- bcrypt password hashing (cost 12) with stronger password policy
- Zod validation on auth and core write endpoints
- Helmet, CORS allowlist, compression, rate limits (global + auth + contact + AI)
- Mass-assignment protection via field whitelists
- Centralized error handler with structured JSON logging
- Environment validation at boot (`config/env.js`)

## License

MIT
