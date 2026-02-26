# FibroSense Deployment Guide

Two services to deploy:
- **Frontend** (Next.js) → Vercel
- **Backend** (FastAPI) → Render

Deploy the backend first — the frontend needs the backend URL.

---

## Step 1: Deploy Backend on Render

### 1.1 Create the service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo (`sadiash/FibroSense`)
3. Configure:
   - **Name**: `fibrosense-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install .`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 1.2 Add a persistent disk (for SQLite)

1. In the Render service dashboard → **Disks** → **Add Disk**
2. Configure:
   - **Name**: `fibrosense-data`
   - **Mount Path**: `/data`
   - **Size**: 1 GB (free tier available)

### 1.3 Set environment variables

In the Render service dashboard → **Environment**:

| Variable | Value | Notes |
|---|---|---|
| `SECRET_KEY` | *(generate a random 64-char string)* | `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | `sqlite+aiosqlite:////data/fibrosense.db` | Note: 4 slashes = absolute path on the disk |
| `CORS_ORIGINS` | `https://fibrosense.vercel.app` | Update after Vercel deploy with your actual URL |
| `PYTHON_VERSION` | `3.12` | |
| `OURA_API_KEY` | *(your key, or leave empty)* | Optional — Oura sync won't work without it |
| `WEATHER_LATITUDE` | *(your latitude)* | Optional — defaults to NYC |
| `WEATHER_LONGITUDE` | *(your longitude)* | Optional — defaults to NYC |

### 1.4 Deploy

Hit **Create Web Service**. Render will build and deploy. Note the URL — it will be something like:
```
https://fibrosense-api-xxxx.onrender.com
```

### 1.5 Verify

```bash
curl https://fibrosense-api-xxxx.onrender.com/api/health
# Should return: {"status":"healthy"}
```

---

## Step 2: Pre-deploy code fixes

Before deploying the frontend, two things need fixing in code.

### 2.1 Make cookie `secure` flag environment-aware

In `backend/app/routers/auth.py`, the refresh token cookie has `secure=False` hardcoded. In production (HTTPS), this must be `True` or browsers won't send the cookie.

**Current** (line 29):
```python
secure=False,  # Set True in production with HTTPS
```

**Should be**:
```python
secure=not settings.database_url.startswith("sqlite"),
```

Or simpler — add an env var `ENVIRONMENT=production` and check that.

### 2.2 Run Alembic migrations

After the backend is deployed, run migrations via Render shell (or add to build command):

```bash
# Option A: Add to Render build command
pip install . && alembic upgrade head

# Option B: Run via Render Shell tab
alembic upgrade head
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create the project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo (`sadiash/FibroSense`)
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install --legacy-peer-deps`

### 3.2 Set environment variables

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://fibrosense-api-xxxx.onrender.com` | Your Render backend URL from Step 1 |

### 3.3 Deploy

Hit **Deploy**. Vercel will build and deploy. Note the URL:
```
https://fibrosense-xxxx.vercel.app
```

### 3.4 Update backend CORS

Go back to Render → **Environment** → Update `CORS_ORIGINS`:
```
https://fibrosense-xxxx.vercel.app
```

Render will auto-redeploy with the new CORS setting.

---

## Step 4: Verify end-to-end

1. Visit your Vercel URL
2. You should see the **login page**
3. Click **Create one** to register
4. After registration, you land on the dashboard (empty)
5. Go to the demo data section to seed sample data

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | **Yes** | `dev-only-change-me-in-production` | JWT signing key — MUST change |
| `DATABASE_URL` | **Yes** | `sqlite+aiosqlite:///./fibrosense.db` | Database connection string |
| `CORS_ORIGINS` | **Yes** | `http://localhost:3000` | Comma-separated allowed origins |
| `PYTHON_VERSION` | Yes | — | `3.12` for Render |
| `OURA_API_KEY` | No | `""` | Oura Ring API token |
| `WEATHER_LATITUDE` | No | `40.7128` | Location for weather data |
| `WEATHER_LONGITUDE` | No | `-74.0060` | Location for weather data |

### Frontend (Vercel)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:8000` | Backend API base URL |

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
| Login works but cookies aren't sent | `secure=False` on HTTPS | Set `secure=True` in auth.py or via env toggle |
| CORS error in browser console | Backend doesn't allow frontend origin | Update `CORS_ORIGINS` env var on Render |
| 502 on Render after deploy | App crashed on startup | Check Render logs — likely missing env var |
| Frontend shows blank page | `NEXT_PUBLIC_API_URL` not set | Add it in Vercel env vars and redeploy |
| Data lost after Render redeploy | No persistent disk | Add a Render disk mounted at `/data` |
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
