# FibroSense V2 Roadmap

Tracked improvements from the codebase audit against production-readiness standards.

---

## Critical Priority

### Rate Limiting on Auth Endpoints
- [ ] Add `slowapi` or similar rate limiter
- [ ] Stricter limits on `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- [ ] Global baseline rate limit on all endpoints
- [ ] Return `429 Too Many Requests` with `Retry-After` header

### Security Headers
- [ ] Add middleware for: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [ ] Or configure via reverse proxy (Nginx/Caddy) in production

### Secret Key Validation
- [ ] Fail-fast on startup if `SECRET_KEY` is the default dev value
- [ ] Fail-fast if critical env vars are missing in production (`ENVIRONMENT=production`)
- [ ] Toggle `secure=True` on cookies based on environment

---

## High Priority

### Pagination
- [ ] Add `limit` and `offset` (or cursor-based) query params to all list endpoints
- [ ] Default limit (e.g., 50), max limit (e.g., 200)
- [ ] Return pagination metadata in response (`total`, `has_more`, `next_cursor`)
- [ ] Affected: `/api/symptoms`, `/api/biometrics`, `/api/contextual`, `/api/medications`, `/api/correlations`, `/api/settings`

### Background Jobs Out of Web Server
- [ ] Move APScheduler jobs (weather sync, oura sync, correlations) to a separate worker process
- [ ] Use external job store (Redis/DB) to prevent duplicate execution on horizontal scale
- [ ] Add job timeouts

### Observability
- [ ] Structured JSON logging (Python `structlog` or similar)
- [ ] Request ID middleware — generate at edge, propagate through layers, return in `X-Request-ID` header
- [ ] Request/response timing middleware (log method, path, status, duration)
- [ ] Meaningful log levels: ERROR = pages someone, WARN = investigate, INFO = normal, DEBUG = dev only

### Service Layer Completion
- [ ] Create `SymptomService` — extract pain severity calculation + contextual auto-upsert from router
- [ ] Create `AuthService` — extract user CRUD + token logic from router
- [ ] Create `MedicationService`, `BiometricService`, `ContextualService`, `SettingsService`
- [ ] Create `DemoDataService` — extract 7-table cascade delete from router
- [ ] Routes become thin: parse request → call service → return response

---

## Medium Priority

### API Response Envelope
- [ ] Define `BaseResponse[T]`: `{ success, data, error, meta }`
- [ ] Error responses include machine-readable code (`AUTH_EMAIL_TAKEN`, `RATE_LIMIT_EXCEEDED`) + human message
- [ ] Apply consistently across all endpoints

### API Versioning
- [ ] Prefix all routes with `/api/v1/`
- [ ] Update frontend proxy rewrite in `next.config.mjs`

### CORS Tightening
- [ ] Replace `allow_methods=["*"]` with explicit list (`GET, POST, PUT, DELETE, OPTIONS`)
- [ ] Replace `allow_headers=["*"]` with explicit list (`Authorization, Content-Type`)

### Reliability
- [ ] Circuit breakers on Oura and Weather API calls
- [ ] Retry with exponential backoff + jitter on transient HTTP failures
- [ ] Graceful shutdown handler: drain connections, finish in-flight requests, stop scheduler
- [ ] Separate `/health/live` (process up) and `/health/ready` (DB + dependencies reachable)

### Cache-Control Headers
- [ ] Add `Cache-Control: private, no-cache` on authenticated data endpoints
- [ ] Add `Cache-Control: public, max-age=3600` on static/public endpoints (health)

### Docker Hardening
- [ ] Multistage builds — separate build and runtime stages
- [ ] Remove dev dependencies from production images
- [ ] Add frontend `npm run build` step; serve with `next start`, not dev server

---

## Low Priority

### Testability
- [ ] Add pure unit tests for business logic (no DB, no HTTP)
- [ ] Enforce coverage thresholds in CI (70% lines, 60% branches)
- [ ] Add a11y testing with `jest-axe` for frontend components
- [ ] Add frontend build step to CI pipeline

### Code Quality Tooling
- [ ] Add Prettier config and format codebase
- [ ] Add pre-commit hooks (husky + lint-staged) for lint + format on commit

### Frontend Enhancements
- [ ] Optimistic UI with rollback on mutations (TanStack Query `onMutate`)
- [ ] Machine-readable error codes parsed on frontend for better UX messages
- [ ] Skip-to-content link for accessibility
- [ ] Automated a11y regression testing

### Recoverability
- [ ] Automated database backup strategy (cron + off-site copy)
- [ ] Audit trail for destructive operations (who deleted what, when)
- [ ] Idempotency keys on POST endpoints to allow safe retries

### Observability (Extended)
- [ ] Metrics collection (Prometheus / StatsD) — request rate, error rate, latency percentiles
- [ ] Distributed tracing (OpenTelemetry) for cross-service request tracking
- [ ] Error tracking service integration (Sentry or similar) with deduplication
