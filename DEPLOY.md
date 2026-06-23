# Dream Wave AI — Deployment Guide

## Prerequisites
- GitHub account
- MongoDB Atlas account (free tier works)
- Render account (free tier for backend)
- Vercel or Netlify account (free tier for frontend)

---

## Step 1 — Fix MongoDB Atlas

Your cluster is likely paused. Do this first:

1. Go to https://cloud.mongodb.com
2. Find your `AaDreamWave` cluster
3. If it shows "Paused" → click **Resume**
4. Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Test locally: `cd server && node server.js` — you should see `MongoDB connected`

---

## Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/dream-wave-ai.git
git push -u origin main
```

---

## Step 3 — Deploy Backend (Render)

1. Go to https://render.com → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
4. Add Environment Variables:
   ```
   PORT=5001
   NODE_ENV=production
   MONGODB_URL=mongodb+srv://dreamadmin:Aashu2102@aadreamwave.fh06ya6.mongodb.net/?retryWrites=true&w=majority&appName=AaDreamWave
   JWT_SECRET=dreamwave_super_secret_key_2024
   OPENAI_API_KEY=sk-proj-...your key...
   CLIENT_URL=https://your-app.vercel.app
   ```
5. Click **Deploy** — note the URL (e.g. `https://dreamwave-api.onrender.com`)

---

## Step 4 — Deploy Frontend (Vercel)

1. Go to https://vercel.com → New Project → Import your GitHub repo
2. Settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   ```
   VITE_API_URL=https://dreamwave-api.onrender.com
   ```
4. Click **Deploy**

---

## Step 5 — Update CORS

Once you have your Vercel URL, update `CLIENT_URL` in Render's environment variables to match:
```
CLIENT_URL=https://your-app.vercel.app
```

Then redeploy the backend.

---

## Local Development

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev   # runs on http://localhost:5001

# Terminal 2 — Frontend
cd client
npm install
npm run dev   # runs on http://localhost:5173
```

The Vite dev proxy forwards all `/api` requests to `localhost:5001` automatically — no `VITE_API_URL` needed locally.

---

## Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5001) |
| `MONGODB_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (use a long random string in production) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `CLIENT_URL` | Frontend URL for CORS (e.g. https://your-app.vercel.app) |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional — payments disabled if not set) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional) |

### Frontend (`client/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL in production (leave blank for local dev) |

---

## Health Check

Once deployed, verify:
- `GET https://dreamwave-api.onrender.com/health` → `{"status":"OK"}`
- `GET https://dreamwave-api.onrender.com/api/test` → `{"message":"Backend working"}`
