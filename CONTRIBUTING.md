# Contributing to FibroSense

Thank you for your interest in contributing! FibroSense is an open-source project that helps people with fibromyalgia track and understand their symptoms.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/FibroSense.git`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `docker compose up` to start the full stack

## Project Structure

```
FibroSense/
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   ├── models/   # SQLAlchemy models
│   │   ├── routers/  # API endpoints
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── tests/
├── frontend/         # Next.js frontend
│   └── src/
│       ├── app/      # Pages (App Router)
│       ├── components/
│       └── lib/      # Utilities, hooks, types
└── docker-compose.yml
```

## Development Workflow

1. Create a branch from `main`: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests before committing:
   - Backend: `cd backend && pytest`
   - Frontend: `cd frontend && npx vitest run`
4. Run linters:
   - Backend: `cd backend && ruff check . && mypy app`
   - Frontend: `cd frontend && npm run lint`
5. Commit with a descriptive message
6. Open a Pull Request against `main`

## Coding Standards

### Python (Backend)
- Format with **Ruff** (configured in `pyproject.toml`)
- Type hints on all function signatures
- Async functions for all database and HTTP operations
- Tests for every router endpoint and service method

### TypeScript (Frontend)
- Strict TypeScript — no `any` types
- Components use function declarations
- Tailwind CSS for styling (no CSS modules)
- shadcn/ui for base components

## Reporting Issues

Use the GitHub issue templates for:
- **Bug reports** — Include steps to reproduce, expected vs actual behavior
- **Feature requests** — Describe the use case and proposed solution
