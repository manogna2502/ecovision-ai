# EcoVision AI

AI-powered waste triage — upload a photo, get real computer vision waste
classification plus a rule-based risk/priority score, backed by a real
Postgres database. Built for Idea2Impact 2026 (Theme 2 · Clean & Green
Technology), architected to keep going as a real product afterward.

```
ecovision-project/
├── frontend/     React + Vite, JavaScript only (no TypeScript)
│   └── src/
│       ├── pages/          Route-level pages (Home, Dashboard, Detection, Analytics, Reports, About)
│       ├── components/
│       │   ├── ui/         shadcn-style primitives (Button, Card, Badge, Skeleton) — plain JS
│       │   ├── layout/     Navbar, Sidebar, Footer, page layouts
│       │   ├── landing/    Hero, Features, Stats, Insights, etc.
│       │   └── dashboard/  KPI cards, charts, tables, alerts
│       ├── hooks/           useStats, useTheme
│       └── lib/             axios API client, cn() utility
└── backend/      FastAPI + SigLIP classifier + Postgres (SQLModel)
```

**Stack:** React + Vite, JavaScript (no TypeScript anywhere), Tailwind CSS,
hand-written shadcn-style components, Framer Motion, React Router, Recharts,
Lucide icons, Axios.

**Honesty note:** feature cards on the landing page are labeled "Live" or
"Planned." Live means wired to the real model and real database — try it.
Planned means UI-shell only (IoT bin sensors, fleet GPS, the AI chat
assistant) — infrastructure this build doesn't have yet. Worth saying
plainly in your submission rather than letting judges find the gap.

The landing page's Hero, Stats, and AI Insights sections pull live from
`/api/stats` and reflect your actual detection history — they show an
honest "no data yet" state until you've run at least one image through AI
Detection. Two sections that would have needed fabricated numbers
(a sustainability-impact infographic, and testimonials attributed to
invented personas) were removed rather than dressed up as "illustrative."

## Today's checklist (deploy day)

- [ ] 1. Set up Supabase database (free tier)
- [ ] 2. Test backend locally, confirm DB connects
- [ ] 3. Test frontend locally, pointed at local backend
- [ ] 4. Push to a public GitHub repo
- [ ] 5. Deploy backend (Render or HF Spaces), with DATABASE_URL set
- [ ] 6. Deploy frontend (Vercel), pointed at the deployed backend
- [ ] 7. Test the live deployed link from your phone or another device
- [ ] 8. Fill README with setup instructions for judges

---

## 1. Set up the database

See `backend/README.md` section "1. Set up the database" for the full
Supabase walkthrough (~5 min, free tier). You'll end up with a
`DATABASE_URL` connection string — keep it handy for the next two steps.

## 2. Run the backend locally

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# paste your Supabase DATABASE_URL into .env
uvicorn main:app --reload --port 8000
```

First request downloads the model (~350MB) — wait for it to finish. Test:

```bash
curl http://localhost:8000/api/health
# should show "database_connected": true
curl -X POST http://localhost:8000/api/detect -F "file=@/path/to/any/trash/photo.jpg"
curl http://localhost:8000/api/stats
```

You must see `database_connected: true` and real JSON with predictions
before moving on — if the DB isn't connected, fix that first.

## 3. Run the frontend locally

```bash
cd frontend
npm install
cp .env.example .env    # defaults to localhost:8000, fine for local dev
npm run dev
```

Opens at `http://localhost:5173`. It defaults to calling
`http://localhost:8000` for detection, so with the backend running in another
terminal, upload an image on the AI Detection page and confirm you see real
confidence bars (not instant/fake results).

## 4. Push to GitHub

```bash
cd ecovision-project
git init
git add .
git commit -m "EcoVision AI - initial build"
```

Then on github.com: create a **new public repository** (no README/license —
you already have one), copy the commands it shows you, e.g.:

```bash
git remote add origin https://github.com/<your-username>/ecovision-ai.git
git branch -M main
git push -u origin main
```

Keep this repo public through 23 July (evaluation window) per the hackathon rules.

## 5. Deploy the backend

**Render (recommended, simplest for FastAPI):**
1. https://render.com → New → Web Service → connect your GitHub repo
2. Root directory: `backend`
3. Runtime: Docker (it will pick up `backend/Dockerfile` automatically)
4. **Environment → Add Environment Variable**: `DATABASE_URL` = your Supabase
   connection string from step 1 (same value you put in `backend/.env`)
5. Instance type: Free is fine for a demo
6. Deploy — first build takes a few minutes. Copy the resulting URL, e.g.
   `https://ecovision-ai-xxxx.onrender.com`
7. Confirm it works: `curl https://ecovision-ai-xxxx.onrender.com/api/health`
   — check for `"database_connected": true`

Note: Render's free tier spins down when idle and takes ~30-60s to wake up
on the first request after sleeping. Mention this in your demo video if the
detection call is slow on first click — it's expected, not a bug.

**Alternative — Hugging Face Spaces:** create a new Space, SDK = Docker,
upload the contents of `backend/`. Good option since the model itself is
already hosted on HF.

## 6. Deploy the frontend

**Vercel:**
1. https://vercel.com → Add New → Project → import the same GitHub repo
2. Root directory: `frontend`
3. Framework preset: Vite (should auto-detect)
4. Environment variable: `VITE_API_URL` = your backend URL from step 4
   (e.g. `https://ecovision-ai-xxxx.onrender.com`)
5. Deploy — you'll get a URL like `https://ecovision-ai.vercel.app`

## 7. Test from a different device

Open the Vercel URL on your phone (not the same wifi/laptop you built on).
Upload a real photo on the AI Detection page. If it works here, it'll work
for judges. This step catches CORS issues, sleeping backends, and env
variable typos before submission — don't skip it.

## 8. Submission checklist

- [ ] GitHub repo public, README explains setup + tech stack
- [ ] Deployed link works from a different device, no login required
- [ ] Problem statement doc (1-2 pages) written
- [ ] 2-3 min demo video recorded: problem → solution → AI in action → impact
- [ ] All 5 items filled into the Submission Form before 19 July 11:59 PM