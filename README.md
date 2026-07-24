# EcoVision AI

EcoVision AI is a full-stack waste classification platform. Upload a photo
of waste and it identifies the material type, estimates a risk score, and
assigns a cleanup priority — all backed by a real, deployed AI model and a
live database, not a mock or a demo script.

It was built for Idea2Impact 2026 (Theme 2 — Clean & Green Technology), with
an eye toward staying useful as a real tool beyond the hackathon itself.

## What it does

You upload an image on the AI Detection page, and the backend runs it
through a computer vision model trained to recognize six waste categories:
cardboard, glass, metal, paper, plastic, and trash. It returns a confidence
score for each category, a risk level, and a cleanup priority, and saves the
result to a Postgres database. From there, the Dashboard, Analytics, and AI
Insights pages all pull from that same real detection history — nothing on
those pages is placeholder data.

Two pages, Smart Bins and Fleet, are honestly labeled as derived from real
detection counts rather than live sensor data, since there's no physical
IoT or GPS hardware deployed yet. They're clearly marked as such in the UI
itself, so there's no ambiguity about what's live versus illustrative.

## How the AI model works

The classifier is based on `prithivMLmods/Trash-Net`, a SigLIP vision
transformer fine-tuned for waste classification. Hosting a model like this
affordably turned out to be the hardest engineering problem in this
project, and it's worth explaining honestly:

- Hugging Face's free hosted Inference API doesn't support this model on
  their serverless provider, so that route wasn't usable.
- Loading the original PyTorch model directly in the backend consistently
  ran out of memory on a free-tier server (512MB RAM), even after dynamic
  quantization.
- The working solution was to export the model to ONNX format, quantize it
  to int8 for a smaller footprint, and serve it with ONNX Runtime instead
  of PyTorch. This dropped the memory footprint enough to run reliably on a
  free-tier instance.
- Full int8 quantization on every layer noticeably hurt accuracy on some
  images, particularly the model's final classification layer. The current
  version keeps that final layer (and the layer feeding into it) in full
  precision while quantizing the rest, which meaningfully improved
  real-world accuracy while keeping almost all of the original size
  savings.

The model itself only recognizes the six categories it was trained on. It
has no "organic" or "food waste" category, so a photo of something like
food scraps will always be misclassified into one of the six trained
categories — that's a limitation of the underlying pretrained model, not a
bug in this app.

## Project structure

```
ecovision-ai-project/
├── frontend/     React + Vite, JavaScript
│   └── src/
│       ├── pages/          Route-level pages: Home, Dashboard, Detection,
│       │                   Analytics, Reports, AI Insights, Smart Bins,
│       │                   Fleet, Settings, About
│       ├── components/
│       │   ├── ui/         Small reusable primitives (Button, Card, Badge)
│       │   ├── layout/     Navbar, Sidebar, page layouts
│       │   └── dashboard/  KPI cards, charts, tables
│       ├── hooks/           useStats, useTheme
│       └── lib/             API client, small utilities
└── backend/      FastAPI + ONNX Runtime + Postgres (SQLModel)
```

**Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Router,
Recharts, Lucide icons, Axios, jsPDF for report export.

**Backend:** FastAPI, ONNX Runtime, Postgres via SQLModel, Hugging Face Hub
(used only to download the model file at startup).

## Running it locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# add your DATABASE_URL to .env
uvicorn main:app --reload --port 8000
```

The first request downloads the quantized ONNX model from Hugging Face
(about 80MB) and caches it locally. Check that everything is working:

```bash
curl http://localhost:8000/api/health
# should return "database_connected": true and "model_loaded": true

curl -X POST http://localhost:8000/api/detect -F "file=@/path/to/photo.jpg"
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens at `http://localhost:5173`. With the backend running locally too,
upload a photo on the AI Detection page and confirm you get real confidence
scores back, not placeholder numbers.

## Deployment

The live version runs the backend on Render and the frontend on Vercel.
The backend downloads its model from a public Hugging Face model repo at
startup rather than bundling it, which keeps the deployed image small and
avoids re-uploading an 80MB file on every deploy.

## Honest limitations

This section exists on purpose, since it's better for judges (or anyone
else) to hear these from us directly:

- Smart Bins and Fleet show numbers derived from real detection data, not
  live sensor or GPS telemetry — that hardware doesn't exist yet.
- The model doesn't recognize organic/food waste as a category, so photos
  of food scraps get forced into one of the six trained categories with no
  correct answer available.
- The model can misclassify heavily weathered, crumpled, or dirt-covered
  plastic litter as paper. We verified this is a genuine characteristic of
  the underlying pretrained model itself, not a bug in our pipeline — the
  exact same result occurs when running the original, unmodified model
  directly, with no ONNX conversion or quantization involved. Clean, less
  cluttered photos of plastic items (e.g. an aluminum can, correctly
  classified as metal at 99%+ confidence) are classified accurately; it's
  specifically the crinkled, sun-bleached texture of outdoor plastic litter
  that appears to visually resemble paper to this model. Improving this
  would require fine-tuning the model on more real-world weathered litter
  photos, which is a natural next step beyond this build.
- It runs on free-tier hosting, so the very first request after a period of
  inactivity can take longer than usual while the server spins back up.
