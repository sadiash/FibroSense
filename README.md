# FibroSense

**Track your fibromyalgia. Discover your patterns. Take back control.**

FibroSense is an open-source health tracker built specifically for people living with fibromyalgia. It brings together symptom logging, wearable data, and environmental factors into one place — then finds the hidden connections between them.

---

## Why

Fibromyalgia is invisible, unpredictable, and deeply personal. What triggers a flare for one person means nothing to another. Doctors appointments are short. Pain diaries are vague. And generic health apps don't understand that a barometric pressure drop or a bad night of deep sleep can wreck your entire week.

FibroSense exists because people with fibromyalgia deserve a tool that:
- **Learns their body**, not a generic checklist
- **Connects the dots** between sleep, weather, stress, and pain
- **Keeps their data private** — your health data stays yours
- **Takes 60 seconds**, not 10 minutes, to log a day

---

## What

### Symptom Logging
Log pain (with a full body map), fatigue, brain fog, mood, and flare status. Contextual factors like stress events, exercise, menstrual phase, and diet are captured alongside symptoms — no separate forms.

### Wearable Integration
Automatic daily sync from **Oura Ring** — sleep duration, deep/REM sleep, HRV, resting heart rate, temperature deviation, and activity score. Your biometric data appears alongside your symptoms automatically.

### Weather Tracking
Barometric pressure, temperature, and humidity pulled from **Open-Meteo** for your location. Many fibromyalgia patients report weather sensitivity — now you can prove (or disprove) it with your own data.

### Correlation Engine
Statistical analysis (Pearson, Spearman, Kendall) across all your metrics — symptoms, biometrics, and environment. Lagged correlations reveal delayed effects (e.g., "low HRV today predicts a flare in 2 days"). The heatmap makes patterns visible at a glance.

### Multi-User Support
Full authentication with JWT tokens. Each user's data is completely isolated — multiple people can use the same instance without seeing each other's information.

### Data Export
Download everything as CSV or JSON. Your data is never locked in.

---

## How

### Quick Start (Docker)

```bash
git clone https://github.com/sadiash/FibroSense.git
cd FibroSense
cp .env.example .env    # Edit with your Oura API key and location
docker compose up
```

Open **http://localhost:3000**, register an account, and start tracking.

### Development Setup

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Run tests:**
```bash
# Backend
cd backend && pytest --cov=app

# Frontend
cd frontend && npx vitest run
```

### Deploy to Production

FibroSense runs on **Render** (backend) + **Vercel** (frontend) for $0/month on free tiers. See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), SQLite |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Auth | JWT access tokens + httpOnly refresh cookies, bcrypt |
| Charts | Recharts |
| Analytics | pandas, SciPy, NumPy |
| Animations | Framer Motion |
| Icons | Phosphor Icons (duotone) |
| Integrations | Oura Ring API v2, Open-Meteo |
| CI | GitHub Actions (lint, typecheck, test) |

---

## Project Structure

```
FibroSense/
├── backend/
│   ├── app/
│   │   ├── auth.py            # JWT + bcrypt authentication
│   │   ├── config.py          # Environment-based settings
│   │   ├── database.py        # Async SQLAlchemy engine
│   │   ├── models/            # SQLAlchemy models (user, symptom, biometric, etc.)
│   │   ├── routers/           # API endpoints
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── services/          # Business logic (analytics, export, sync)
│   ├── alembic/               # Database migrations
│   ├── scripts/               # Seed scripts
│   └── tests/                 # pytest integration tests
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (app)/         # Protected pages (dashboard, log, correlations, settings)
│       │   └── (auth)/        # Public pages (login, register)
│       ├── components/        # UI components
│       └── lib/               # API client, auth context, hooks, types
├── DEPLOYMENT.md              # Production deployment guide
├── V2_ROADMAP.md              # Planned improvements
├── CONTRIBUTING.md            # Contribution guidelines
└── docker-compose.yml
```

---

## Screenshots

*Coming soon — the app uses a glassmorphic design system with purple gradients (the fibromyalgia awareness color) and a butterfly motif.*

---

## Roadmap

See [V2_ROADMAP.md](V2_ROADMAP.md) for planned improvements including:
- Rate limiting and security headers
- Pagination on all list endpoints
- Structured logging and observability
- Background job worker (separate from web server)
- API response envelope standardization

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[AGPLv3](LICENSE) — free to use, modify, and distribute. If you run a modified version as a service, you must share your changes.

---

*Purple is the color of fibromyalgia awareness. The butterfly symbolizes hope, transformation, and the tender points that define the condition. FibroSense is built with both in mind.*
