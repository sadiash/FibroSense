# FibroSense

Privacy-first, self-hosted health tracking for fibromyalgia. Track symptoms, correlate with biometrics and weather, and discover your personal patterns.

## Features

- **Symptom Logger** — Log pain, fatigue, brain fog, and mood in under 60 seconds
- **Oura Ring Integration** — Automatic daily sync of sleep, HRV, heart rate, and activity
- **Weather Tracking** — Barometric pressure, temperature, and humidity via Open-Meteo
- **Correlation Analysis** — Discover relationships between symptoms and environmental/biometric factors
- **Data Export** — Download your data as CSV or JSON
- **Fully Self-Hosted** — Your health data never leaves your machine

## Quickstart

```bash
# 1. Clone the repo
git clone https://github.com/sadiash/FibroSense.git
cd FibroSense

# 2. Copy environment config
cp .env.example .env
# Edit .env with your Oura API key and location

# 3. Start the stack
docker compose up

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

## Development Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend
cd backend && pytest --cov=app

# Frontend
cd frontend && npx vitest run
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, SQLite |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Charts | Recharts, D3.js |
| Analytics | pandas, SciPy, NumPy |
| Integrations | Oura API v2, Open-Meteo |

## License

AGPLv3 — see [LICENSE](LICENSE) for details.
