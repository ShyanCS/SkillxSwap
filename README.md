# SkillSwap

A peer-to-peer skill exchange platform: members teach a skill they know and learn a skill they want, matched by a rule-based recommendation engine and coordinated through a non-monetary Skill Credit economy instead of payment.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS, served by nginx in production |
| Backend | Spring Boot 4.1 (Java 17), Spring Security (JWT), Spring Data JPA/Hibernate |
| Database | PostgreSQL, schema versioned with Flyway |
| Realtime | WebSocket push (`/ws`), authenticated by the same JWT cookie as the REST API |
| Redis | Optional — only needed to run multiple API replicas (shared rate limits + WebSocket fan-out) |
| Email | JavaMail over SMTP (Mailpit locally, any provider in production) |
| AI assistant | Google Gemini (optional — the feature degrades gracefully when unconfigured) |
| Photo storage | Cloudinary (optional, signed uploads) |
| Tests | JUnit 5 + Testcontainers (real PostgreSQL) |

## Features

- **Auth** — registration with email OTP verification, login, password reset, JWT httpOnly-cookie sessions, role-based access (user/admin), account suspension
- **Profiles** — bio, region, timezone, photo, public profile pages with ratings and reviews
- **Skill Marketplace** — categorized skill catalog; add/edit/remove skills you offer or want
- **Matching Engine** — reciprocal skill matching with a normalized 0–100% compatibility score weighted by shared free time; send/accept/reject match requests
- **Availability** — weekly recurring windows per user, stored in their own timezone and compared as real instants, so partners in different zones see genuinely overlapping hours
- **Sessions** — schedule, list, cancel, and complete teaching sessions, validated against both participants' availability and existing bookings
- **Credit Wallet** — starter balance, automatic credit transfer from learner to teacher on session completion, append-only transaction ledger
- **Ratings & Reviews** — post-session reviews gated on completion, feeding a real average rating
- **Messaging** — one-to-one chat between matched users with live WebSocket delivery, unread counts, read receipts, and paged history
- **Notifications** — in-app and email alerts for match requests, sessions, reviews, and messages, pushed to open tabs in real time
- **Study Assistant** — Gemini-backed help with study plans and session prep, scoped to your own skills
- **Admin Panel** — platform stats, user suspend/activate, skill catalog management, user reports

## Running Locally

**Prerequisites:** Java 17, Node.js, Docker.

### One-command full stack

A fresh clone becomes a running product with zero configuration:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Then open **http://localhost:3000** (app), http://localhost:8080/actuator/health
(API health), and http://localhost:8025 (Mailpit — OTP codes land here). This
mode builds container images, so iteration is slower than the native setup
below; it exists for evaluation and smoke testing.

### Native development (fast rebuilds)

```bash
# 1. Start PostgreSQL + Mailpit
cd backend-java && docker compose up -d

# 2. Start the API (http://localhost:8080)
./mvnw spring-boot:run

# 3. Start the frontend (http://localhost:5173)
cd ../frontend && npm ci && npm run dev
```

Flyway applies all migrations on startup. Since there's no real mail server locally, OTP and notification emails are captured by [Mailpit](https://mailpit.axllent.org/) — read them at **http://localhost:8025**.

Local defaults live in `application-dev.yml` and require no configuration. To enable the optional AI assistant locally:

```bash
AI_ENABLED=true GEMINI_API_KEY=your-key ./mvnw spring-boot:run
```

## Testing

```bash
# Backend: unit + integration tests against a real PostgreSQL container,
# plus Spotless formatting checks and the JaCoCo coverage report
cd backend-java && ./mvnw verify

# Frontend: Vitest component/hook suite with coverage thresholds
cd frontend && npm test

# Formatting (frontend)
cd frontend && npm run format:check   # or `npm run format` to fix
```

Backend tests run via Testcontainers, so **Docker must be running**. They apply
the actual Flyway migrations with `ddl-auto: validate` on — a JPA entity
drifting from a migration fails the build. Coverage focuses on the invariants
that matter most:

- **Credit ledger** — transfers happen exactly once and stay balanced.
- **Access control** — role boundaries, suspension, and cookie flags.
- **Scheduling** — availability and double-booking, including the cross-timezone cases that look correct when everyone is tested in UTC and break in production.

## Production Deployment

```bash
cp .env.example .env      # fill in real values
docker compose -f docker-compose.prod.yml up -d --build
```

This builds both images and starts Postgres, the API, and the nginx-served frontend. Postgres is not published to the host — it's reachable only on the internal compose network.

**Put a TLS-terminating reverse proxy in front of it.** Production forces `Secure` cookies, so the app will not work over plaintext HTTP.

The backend refuses to start when production config is unsafe rather than booting insecurely. It will exit on a missing or weak `JWT_SECRET`, a leftover development secret, a missing database password, or a wildcard/plaintext CORS origin. All required variables are documented in `.env.example`.

A few things worth knowing:

- `VITE_API_BASE_URL` is baked into the frontend bundle at **build** time, so changing it requires a rebuild, not just a restart.
- `COOKIE_SAME_SITE` defaults to `Lax`, which is correct when the frontend and API share a registrable domain (`app.example.com` + `api.example.com`). Set it to `None` only if they're on genuinely different domains.
- **Your reverse proxy must forward WebSocket upgrades** to `/ws` (`Upgrade` and `Connection` headers). Without that, chat silently falls back to polling — it keeps working, just not instantly.
- Set `ADMIN_BOOTSTRAP_EMAIL` to an account that has already registered; it is granted ADMIN on the next start. Leaving it set is harmless once applied.

### Running more than one API replica

Set `REDIS_ENABLED=true` and start the stack with the `scale` profile:

```bash
docker compose -f docker-compose.prod.yml --profile scale up -d --build
```

Redis is genuinely optional below that point, and enabling it on a single instance buys nothing. Above it, it is required for two reasons:

- **Rate limits** are otherwise per-process, so the effective limit multiplies by the replica count — five replicas turn a 5/hour OTP limit into 25/hour.
- **WebSocket delivery** is otherwise per-process. A load balancer will rarely put the sender's HTTP request and the recipient's socket on the same replica, so pushes would be silently dropped for most users while appearing to work in single-instance testing.

If Redis becomes unreachable at runtime the app degrades to per-instance behaviour and logs it, rather than failing requests outright — a cache outage should not become an authentication outage.

Container health is exposed at `/actuator/health` (with `/readiness` and `/liveness` probes) for orchestrators.

## Project Structure

```
frontend/                   React SPA (Vite) + nginx config + Dockerfile
backend-java/               Spring Boot API + Dockerfile
  src/main/java/com/skillswap/backend/
    auth/                     registration, login, JWT, OTP
    profile/                  profile updates, public profiles, photo upload
    skill/                    skill catalog, offered/wanted skills
    matching/                 matching engine, match requests
    availability/             weekly availability + timezone-aware overlap
    session/                  session scheduling
    realtime/                 WebSocket push (local and Redis-backed)
    wallet/                   credit wallet & transaction ledger
    review/                   ratings & reviews
    messaging/                conversations & messages
    notification/             in-app + email notifications
    dashboard/                aggregated dashboard summary
    ai/                       Gemini study assistant
    admin/ report/            admin panel and user reports
    common/                   rate limiting, logging, mail, error handling
  src/main/resources/db/migration/   Flyway SQL migrations
  src/test/                   integration tests (Testcontainers)
docker-compose.prod.yml     production stack
.env.example                every supported environment variable
```

## Known Limitations

- Session reminders are not sent; notifications fire on events (match, booking, message, review), not ahead of a scheduled session.
- Availability is a weekly recurring pattern only. There is no way to block out a one-off date, so a user going on holiday has to clear the affected windows.
- Skill search is a plain `LIKE` over name and email in the admin panel; there is no full-text or fuzzy search over the skill catalogue.
- Deleting an account is not exposed in the UI.
