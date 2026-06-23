# 🚀 AA Dream Wave — Deploy to Render + Netlify
**Production deployment guide — step by step**

---

## OVERVIEW

```
GitHub Repo
    ├── server/  → Render (Node.js backend API)
    └── client/  → Netlify (React frontend)
```

---

## STEP 1 — Push to GitHub

1. Go to **github.com** → New repository
2. Name it: `aa-dream-wave`
3. Set to **Private** (recommended)
4. DO NOT initialize with README

Then push your code:

```bash
# Open Terminal, navigate to project folder
cd "/Volumes/HP USB321FD/DREAM WAVE/AA_DREAM_WAVE/MJ_DREAM_WAVE"

# Initialize git (if not already done)
git init
git add .
git commit -m "AA Dream Wave — Production Ready"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/aa-dream-wave.git
git branch -M main
git push -u origin main
```

> **Note:** If Xcode CLI tools prompt appears, click "Install" and wait ~15 minutes, then retry.

---

## STEP 2 — Deploy Backend on Render

1. Go to **render.com** → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → select `aa-dream-wave` repo
4. Set these settings:

| Setting | Value |
|---------|-------|
| Name | `aa-dream-wave-api` |
| Root Directory | `server` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | `Free` |

5. Scroll to **Environment Variables** → Add all of these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URL` | `mongodb+srv://dreamadmin:Aashu2102@aadreamwave.fh06ya6.mongodb.net/dreamwave?retryWrites=true&w=majority&appName=AaDreamWave` |
| `JWT_SECRET` | `dreamwave_jwt_secret_2025_min64chars_xyzabcdef1234567890abcdef1234567890` |
| `OPENAI_API_KEY` | `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` |
| `CLIENT_URL` | *(leave blank for now — fill in after Netlify step)* |

6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment
8. Copy your Render URL: `https://aa-dream-wave-api.onrender.com`
9. Test it: open `https://aa-dream-wave-api.onrender.com/health` in browser
   - Should return: `{"status":"OK",...}`

---

## STEP 3 — Deploy Frontend on Netlify

1. Go to **netlify.com** → Sign up / Log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub → select `aa-dream-wave` repo
4. Set these build settings:

| Setting | Value |
|---------|-------|
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |

5. Click **"Show advanced"** → **"New variable"** → Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://aa-dream-wave-api.onrender.com/api` |

*(Replace `aa-dream-wave-api` with your actual Render service name)*

6. Click **"Deploy site"**
7. Wait 2-3 minutes
8. Copy your Netlify URL: `https://YOUR-SITE.netlify.app`

---

## STEP 4 — Connect Frontend → Backend (CORS)

1. Go back to **Render** → your service → **Environment**
2. Add / update:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://YOUR-SITE.netlify.app` |

3. Click **"Save Changes"** → Render will redeploy automatically

---

## STEP 5 — Verify Everything Works

Open your Netlify URL in browser. Test each feature:

- [ ] **Signup / Login** — creates account
- [ ] **Dashboard** — loads with AI insight
- [ ] **AI Mentor** — chat response within 10s
- [ ] **AI Lesson** — generates lesson (30-60s)
- [ ] **Animated Video** — plays on Learn page
- [ ] **Roadmap** — generates with Skill Galaxy
- [ ] **R&D Report** — generates full report

---

## TROUBLESHOOTING

### Backend shows "503 Service Unavailable"
Render free tier **spins down** after 15 minutes of inactivity.
First request after sleep takes 30-60 seconds. This is normal on free plan.

**Fix:** Upgrade to Render Starter ($7/mo) for always-on, OR add a cron job to ping `/health` every 10 minutes.

### "Failed to fetch" on Netlify
- Check `VITE_API_URL` is set correctly in Netlify environment variables
- Make sure it ends with `/api` — example: `https://aa-dream-wave-api.onrender.com/api`
- Redeploy Netlify after adding env var

### CORS error in browser console
- Make sure `CLIENT_URL` on Render matches **exactly** your Netlify URL
- No trailing slash: ✅ `https://YOUR-SITE.netlify.app` ❌ `https://YOUR-SITE.netlify.app/`

### MongoDB connection fails on Render
- Go to MongoDB Atlas → Network Access → **Add IP: 0.0.0.0/0** (allow all)
- Make sure `MONGODB_URL` is the full connection string including username/password

### OpenAI errors (401)
- The API key in `.env` is valid and tested
- If it stops working, generate a new key at platform.openai.com/api-keys

---

## OPTIONAL: Custom Domain

1. Buy a domain (e.g., `aadreamwave.com`) on Namecheap / GoDaddy
2. In Netlify → **Domain management** → **Add custom domain**
3. Point DNS to Netlify (they give you the nameservers)
4. Update `CLIENT_URL` on Render to your custom domain

---

## DEPLOY CHECKLIST

**Render (Backend)**
- [ ] Root directory: `server`
- [ ] Start command: `node server.js`
- [ ] NODE_ENV = production
- [ ] MONGODB_URL set
- [ ] JWT_SECRET set
- [ ] OPENAI_API_KEY set
- [ ] CLIENT_URL set (your Netlify URL)
- [ ] Health check `/health` returns 200

**Netlify (Frontend)**
- [ ] Base directory: `client`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `client/dist`
- [ ] VITE_API_URL = `https://YOUR-RENDER-URL.onrender.com/api`
- [ ] Site loads without errors

---

## YOUR CURRENT CREDENTIALS

Keep these safe — needed for deployment:

```
MongoDB: mongodb+srv://dreamadmin:Aashu2102@aadreamwave.fh06ya6.mongodb.net/dreamwave
OpenAI:  sk-proj-0k9A4US7...K3gA  (active key)
JWT:     dreamwave_jwt_secret_2025_min64chars_xyzabcdef1234567890abcdef1234567890
```

---

## ESTIMATED DEPLOY TIME

| Step | Time |
|------|------|
| Push to GitHub | 5 min |
| Render deploy | 5-8 min |
| Netlify deploy | 3-5 min |
| Testing | 5 min |
| **Total** | **~20 min** |

---

*Built with: React 18 + Vite + Framer Motion (Netlify) + Express + MongoDB + OpenAI (Render)*
