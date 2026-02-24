# FibroSense — Tech Stack Proposal

## Guiding Principles

The technology choices below are driven by the design principles in the concept note:

| Principle | Implication |
|---|---|
| **Privacy-first, local-first** | Self-hostable, no cloud dependency, data stays on-device |
| **Single user (n-of-1)** | Lightweight storage, no multi-tenancy overhead |
| **Heavy data analysis** | First-class statistics and ML ecosystem |
| **Minimal friction** | Fast, responsive UI for sub-60-second symptom logging |
| **Open & extensible** | Modular design, easy to swap wearable sources later |
| **Open-source (AGPLv3)** | Contributor-friendly tech choices, zero-config setup, self-host model |

---

## Recommended Stack

### Backend — Python 3.12+ / FastAPI

| Component | Choice | Rationale |
|---|---|---|
| **Language** | Python 3.12+ | Dominant ecosystem for data science (pandas, scipy, scikit-learn). Natural fit for the analytics-heavy pattern engine and future ML prediction phase. |
| **Web framework** | FastAPI | Async-native, automatic OpenAPI docs, excellent type safety with Pydantic. Lightweight enough for a single-user app, powerful enough to grow. |
| **HTTP client** | httpx | Async HTTP client for Oura Ring API and weather API calls. |
| **Task scheduling** | APScheduler | Scheduled daily pulls from Oura and weather APIs. Runs in-process — no separate broker/worker infrastructure needed (unlike Celery). Appropriate for single-user scale. |
| **ORM** | SQLAlchemy 2.0 | Mature, well-documented. Supports SQLite natively. Async session support pairs well with FastAPI. |
| **Migrations** | Alembic | Standard migration tool for SQLAlchemy. Keeps the schema evolvable as new data streams are added. |

### Database — SQLite

| Aspect | Detail |
|---|---|
| **Why SQLite** | Zero-config, serverless, file-based. Perfect for local-first single-user storage. Backup = copy one file. No running daemon. |
| **Time-series fit** | With proper indexing on timestamp columns and WAL mode enabled, SQLite handles the expected data volume (dozens of rows/day across a few tables) with no performance concern. |
| **Future option** | If multi-user or remote deployment becomes relevant post-MVP, migrating to PostgreSQL (with TimescaleDB for time-series) is straightforward via SQLAlchemy's dialect abstraction. |

### Frontend — Next.js (React) + Tailwind CSS

| Component | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | React-based with file-system routing, server components for fast initial loads, and API route handlers if any frontend-specific endpoints are needed. |
| **Styling** | Tailwind CSS | Utility-first CSS for rapid UI development. No context-switching between style files. |
| **Component library** | shadcn/ui | Accessible, copy-paste component primitives built on Radix UI. No heavy dependency — components live in the project and are fully customizable. |
| **Charting** | Recharts + D3 (heatmaps) | Recharts for standard line/bar/area charts (sleep trends, pain over time). D3.js directly for the correlation heatmap and any custom visualizations not covered by Recharts. |
| **State management** | TanStack Query (React Query) | Server-state caching and synchronization. Handles loading/error states and background refetching for the dashboard. No need for a global store like Redux at this scale. |
| **Date handling** | date-fns | Lightweight, tree-shakeable date utility library for formatting timestamps across the UI. |

### Analytics & Data Science — Python Libraries

| Component | Choice | Role |
|---|---|---|
| **pandas** | Data manipulation | Time-series alignment, rolling windows, resampling, merging biometric + symptom data. |
| **NumPy** | Numerical computation | Array operations underlying all analytics. |
| **SciPy** | Statistical analysis | `scipy.stats` for Pearson/Spearman correlations, lagged cross-correlation, significance testing. |
| **scikit-learn** | ML (Phase 3+) | Classification models for flare prediction (Random Forest, Gradient Boosting). Feature importance for identifying personal flare signatures. |
| **statsmodels** | Time-series analysis | Granger causality tests, autocorrelation analysis, seasonal decomposition — useful for discovering lagged biometric-symptom relationships. |

### External API Integrations

| Service | API | Purpose |
|---|---|---|
| **Oura Ring** | [Oura API v2](https://cloud.ouraring.com/v2/docs) (OAuth 2.0) | Sleep, HRV, heart rate, temperature, activity, SpO2. Daily automated pull. |
| **Weather** | [Open-Meteo](https://open-meteo.com/) | Barometric pressure, temperature, humidity. Free, no API key required, open-source. Preferred over OpenWeatherMap for simplicity and zero cost. |

### DevOps & Tooling

| Component | Choice | Rationale |
|---|---|---|
| **Containerization** | Docker + Docker Compose | Single `docker compose up` to run the full stack (backend + frontend + SQLite volume). Easy self-hosting on any machine. |
| **Backend testing** | pytest + pytest-asyncio | Standard Python testing. Async support for testing FastAPI endpoints. |
| **Frontend testing** | Vitest + Testing Library | Fast, Vite-native test runner. Component testing with React Testing Library. |
| **Linting/formatting** | Ruff (Python), ESLint + Prettier (JS/TS) | Ruff is a single fast tool replacing flake8, isort, and black. |
| **Type checking** | mypy (Python), TypeScript strict mode (frontend) | Catch errors early. Particularly important for data pipeline correctness. |
| **CI** | GitHub Actions | Lint, type-check, test on every push. Lightweight pipeline. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Symptom  │  │  Dashboard   │  │  Correlation &    │  │
│  │ Logger   │  │  (Recharts)  │  │  Heatmap Views    │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                    │             │
└───────┼───────────────┼────────────────────┼─────────────┘
        │               │                    │
        ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                 FastAPI Backend                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Symptom  │  │  Data Sync   │  │  Analytics        │  │
│  │ CRUD API │  │  (Oura,      │  │  Engine           │  │
│  │          │  │   Weather)   │  │  (pandas/scipy)   │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                    │             │
│       ▼               ▼                    ▼             │
│  ┌─────────────────────────────────────────────────┐     │
│  │              SQLAlchemy ORM                      │     │
│  └──────────────────────┬──────────────────────────┘     │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   SQLite DB  │
                   │  (WAL mode)  │
                   └──────────────┘
```

---

## Data Model (Conceptual)

```
biometric_readings
  ├── date (PK)
  ├── sleep_duration, sleep_efficiency, deep_sleep_pct, rem_sleep_pct
  ├── hrv_rmssd, resting_hr
  ├── temperature_deviation
  ├── activity_score, activity_calories
  └── spo2

symptom_logs
  ├── id (PK)
  ├── date
  ├── pain_severity (0-10), pain_locations (JSON array)
  ├── fatigue_severity (0-10)
  ├── brain_fog (0-10)
  ├── mood (0-10)
  └── is_flare (bool), flare_severity (nullable)

contextual_data
  ├── date (PK)
  ├── barometric_pressure, temperature, humidity
  ├── menstrual_phase (nullable)
  ├── stress_event (nullable text)
  ├── medication_change (nullable text)
  └── exercise_type (nullable), exercise_rpe (nullable)

correlation_cache
  ├── id (PK)
  ├── computed_at
  ├── metric_a, metric_b
  ├── lag_days
  ├── correlation_coefficient, p_value
  └── sample_size
```

---

## Why Not Alternatives?

| Alternative | Why not (for this project) |
|---|---|
| **Django** | Heavier than needed. Admin panel and ORM are powerful but add complexity unnecessary for a single-user app. FastAPI's async-first model is a better fit for API-call-heavy data sync. |
| **Flask** | Viable, but lacks built-in async support, automatic OpenAPI docs, and Pydantic validation that FastAPI provides out of the box. |
| **Streamlit / Dash** | Tempting for rapid prototyping, but limited UI customization. The symptom logger needs a polished, mobile-friendly form — hard to achieve in Streamlit. Dash is closer but locks you into Plotly's ecosystem. A real React frontend gives full control. |
| **PostgreSQL** | Overkill for single-user local deployment. Requires a running server process. SQLite is sufficient for the expected data volume and can be migrated later if needed. |
| **MongoDB** | Schema-less storage is unnecessary here — the data model is well-defined and relational (biometrics ↔ symptoms ↔ dates). |
| **Vue / Svelte** | Both are excellent, but React has the largest ecosystem of charting and UI component libraries, which matters for dashboard-heavy apps. Next.js adds SSR/SSG for performance. |

---

## MVP Development Phases Mapped to Stack

| Phase | Stack Components Used |
|---|---|
| **Foundation (Wk 1-2)** | FastAPI, httpx (Oura API), SQLite + SQLAlchemy, Alembic, APScheduler, Next.js scaffold, symptom logger form (shadcn/ui) |
| **Visualization (Wk 3-4)** | Recharts (line/bar charts), D3 (heatmaps), TanStack Query, dashboard layout (Tailwind) |
| **Analytics (Wk 5-8)** | pandas, SciPy (correlations), statsmodels (lagged analysis), correlation cache table, analytics API endpoints |
| **Prediction (Wk 12+)** | scikit-learn (classifiers), risk score API endpoint, early warning UI component |

---

## Open-Source Considerations

### License — AGPLv3

FibroSense is licensed under the **GNU Affero General Public License v3.0**. This means:

- Anyone can use, modify, and self-host FibroSense freely
- Any modified version that is deployed (even as a network service) **must** share its source code under the same license
- This ensures the project and all derivatives remain open-source, protecting the fibromyalgia community's interests

### Deployment Model — Self-Hosted Instances

Each user runs their own FibroSense instance. This is the ideal model because:

- **No shared server** — No one hosts other people's health data, avoiding liability and privacy concerns
- **No account system needed** — Eliminates auth complexity and attack surface
- **SQLite shines here** — Zero-config, no database server to install. Clone + `docker compose up` = running
- **AGPL compliance is simple** — Each user controls their own instance; no SaaS concerns

### Contributor Experience

| Aspect | Approach |
|---|---|
| **Onboarding** | Single `docker compose up` to run the full stack. No manual database setup, no external service dependencies for local dev. |
| **Language accessibility** | Python and React/TypeScript are the two most widely known languages in open-source. Low barrier to contribution. |
| **Configuration** | All user-specific settings via `.env` file (Oura API credentials, location for weather, data directory). FastAPI's `pydantic-settings` validates config at startup with clear error messages. |
| **Code quality gates** | GitHub Actions CI runs Ruff, mypy, ESLint, Prettier, and tests on every PR. Contributors get fast feedback. |
| **Documentation** | `CONTRIBUTING.md` with setup instructions, architecture overview, and coding standards. Issue templates for bugs and feature requests. |

### Repository Structure (Recommended)

```
FibroSense/
├── LICENSE                  (AGPLv3)
├── README.md
├── CONTRIBUTING.md
├── docker-compose.yml
├── .env.example             (template — never commit real credentials)
├── .github/
│   ├── workflows/ci.yml
│   └── ISSUE_TEMPLATE/
├── backend/
│   ├── pyproject.toml
│   ├── alembic/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/       (Oura sync, weather sync, analytics)
│   │   └── config.py       (pydantic-settings)
│   └── tests/
└── frontend/
    ├── package.json
    ├── src/
    │   ├── app/
    │   ├── components/
    │   └── lib/
    └── tests/
```

---

## Getting Started (Next Steps)

1. **Initialize project structure** — Monorepo with `backend/` and `frontend/` directories
2. **Set up Docker Compose** — Python backend + Next.js frontend + SQLite volume
3. **Oura API OAuth flow** — Register app, implement token exchange and storage
4. **Database schema + migrations** — Define models, run initial Alembic migration
5. **Symptom logger endpoint + UI** — First vertical slice: log a symptom entry and see it persisted
6. **Community scaffolding** — `README.md`, `CONTRIBUTING.md`, `.env.example`, GitHub issue templates, CI workflow
