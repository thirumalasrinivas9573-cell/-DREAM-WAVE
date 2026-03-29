# Dream Wave AI 🌊

AI-powered career guidance platform with roadmap, reports, mentor, tasks, and community.

## Tech Stack
- **Frontend:** React + Vite + Tailwind + Framer Motion
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **AI:** OpenAI GPT-4o-mini
- **Storage:** Firebase Firestore

---

## Local Development

### 1. Backend
```bash
cd server
npm install
# Edit .env with your credentials
node server.js
# → http://localhost:5001
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
# → http://localhost:5174
```

---

## Deploy to Production

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `dream-wave-ai/server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables in Render dashboard:
   ```
   MONGODB_URL=your_mongodb_atlas_url
   JWT_SECRET=your_secret
   OPENAI_API_KEY=your_openai_key
   FIREBASE_PROJECT_ID=aa-dream-wave-19b94
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   NODE_ENV=production
   ```
6. Deploy → copy your URL: `https://dream-wave-ai-backend.onrender.com`

### Frontend → Netlify

1. Create `client/.env.production`:
   ```
   VITE_API_URL=https://dream-wave-ai-backend.onrender.com
   ```
2. Build:
   ```bash
   cd client
   npm run build
   ```
3. Go to [netlify.com](https://netlify.com) → New site → Deploy manually
4. Drag & drop the `client/dist/` folder
5. Done → your frontend URL is live

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login (email) |
| POST | /api/auth/login-aa | No | Login (AA ID) |
| GET | /api/auth/me | Yes | Get profile |
| POST | /api/goal/start | Yes | Start AI goal chat |
| POST | /api/goal/continue | Yes | Continue chat |
| GET | /api/goal/history | Yes | Past sessions |
| POST | /api/report/generate | Yes | Generate PDF report |
| GET | /api/report/download/:file | No | Download PDF |
| POST | /api/roadmap/generate | Yes | Generate roadmap |
| POST | /api/tasks/generate | Yes | Generate tasks |
| PUT | /api/tasks/complete/:id | Yes | Complete task |
| GET | /api/books/:goal | Yes | Book recommendations |
| POST | /api/daily-life | Yes | Daily life AI |
| POST | /api/mentor | Yes | Krishna mentor AI |
| POST | /api/community/post | Yes | Create post |
| GET | /api/community/feed | Yes | Community feed |
| POST | /api/community/connect | Yes | Connect by AA ID |
| GET | /health | No | Health check |
