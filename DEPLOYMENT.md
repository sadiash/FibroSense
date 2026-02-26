# FibroSense Deployment Guide

Two services deployed:
- **Frontend** (Next.js) → Vercel: https://frontend-pi-mauve-90.vercel.app
- **Backend** (FastAPI) → Render: https://fibrosense-api.onrender.com

---

## Live URLs

| Service | URL |
|---|---|
| Frontend | https://frontend-pi-mauve-90.vercel.app |
| Backend API | https://fibrosense-api.onrender.com |
| Health Check | https://fibrosense-api.onrender.com/api/health |

---

## Architecture

```
Browser → Vercel (Next.js) → /api/* rewrite → Render (FastAPI) → SQLite
```

The frontend proxies all `/api/*` requests to the Render backend via Next.js rewrites.

---

## Backend (Render)

### Service Config

| Setting | Value |
|---|---|
| **Name** | `fibrosense-api` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3.12 |
| **Build Command** | `pip install . && python -m alembic upgrade head` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Persistent Disk** | Mounted at `/data` (1 GB) for SQLite |

### Environment Variables

| Variable | Required | Value | Description |
|---|---|---|---|
| `SECRET_KEY` | **Yes** | *(auto-generated)* | JWT signing key |
| `DATABASE_URL` | **Yes** | `sqlite+aiosqlite:////data/fibrosense.db` | 4 slashes = absolute path on disk |
| `CORS_ORIGINS` | **Yes** | `https://frontend-pi-mauve-90.vercel.app` | Allowed frontend origin |
| `ENVIRONMENT` | **Yes** | `production` | Enables secure cookies |
| `PYTHON_VERSION` | Yes | `3.12` | Render Python version |
| `OURA_API_KEY` | No | `""` | Oura Ring API token |
| `WEATHER_LATITUDE` | No | `40.7128` | Location for weather data |
| `WEATHER_LONGITUDE` | No | `-74.0060` | Location for weather data |

### Verify

```bash
curl https://fibrosense-api.onrender.com/api/health
# {"status":"healthy"}
```

---

## Frontend (Vercel)

### Project Config

| Setting | Value |
|---|---|
| **Project Name** | `frontend` |
| **Framework** | Next.js (auto-detected) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install --legacy-peer-deps` |

### Environment Variables

| Variable | Required | Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://fibrosense-api.onrender.com` | Backend API base URL |

### Deploy via CLI

```bash
cd frontend
vercel --prod
```

---

## Redeploying

### After code changes (push to main)

**Frontend** — redeploy via CLI:
```bash
cd frontend
vercel --prod
```

**Backend** — Render auto-deploys on push to main (if connected to GitHub). Or manually trigger via Render dashboard.

### After env var changes

- **Render**: auto-redeploys when env vars change
- **Vercel**: requires manual redeploy (`vercel --prod`) for `NEXT_PUBLIC_*` vars (baked at build time)

---

## Custom Domain (Optional)

### Vercel
1. Project Settings → **Domains** → Add your domain
2. Update DNS records as instructed by Vercel

### Render
1. Service Settings → **Custom Domain** → Add domain
2. Update DNS records as instructed by Render

### After adding custom domains
Update `CORS_ORIGINS` on Render to include the new domain:
```
https://yourdomain.com,https://www.yourdomain.com
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Login works but cookies aren't sent | `ENVIRONMENT` not set to `production` | Set `ENVIRONMENT=production` on Render |
| CORS error in browser console | Backend doesn't allow frontend origin | Update `CORS_ORIGINS` env var on Render |
| 502 on Render after deploy | App crashed on startup | Check Render logs — likely missing env var |
| Frontend shows blank page | `NEXT_PUBLIC_API_URL` not set | Add it in Vercel env vars and redeploy |
| Data lost after Render redeploy | No persistent disk | Add a Render disk mounted at `/data` |
| Backend cold start (~30s) | Render free tier spins down after 15min | Upgrade to $7/month for always-on |
| `alembic` command not found | Not in PATH after pip install | Use `python -m alembic upgrade head` |

---

## Cost

| Service | Tier | Cost |
|---|---|---|
| Render Web Service | Free | $0 (spins down after 15min inactivity) |
| Render Persistent Disk | Free | $0 (1 GB) |
| Vercel | Hobby | $0 |
| **Total** | | **$0/month** |

> Note: Render free tier has cold starts (~30s). For always-on, upgrade to $7/month.
