# SkillSwap

A peer-to-peer skill exchange platform: members teach a skill they know and learn a skill they want, matched by a rule-based recommendation engine and coordinated through a non-monetary Skill Credit economy instead of payment.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS, served by nginx in production |
| Backend | Spring Boot 4.1 (Java 17), Spring Security (JWT), Spring Data JPA/Hibernate |
| Database | PostgreSQL, schema versioned with Flyway |
| Email | JavaMail over SMTP (Mailpit locally, any provider in production) |
| AI assistant | Google Gemini (optional — the feature degrades gracefully when unconfigured) |
| Photo storage | Cloudinary (optional, signed uploads) |
| Tests | JUnit 5 + Testcontainers (real PostgreSQL) |

## Features

- **Auth** — registration with email OTP verification, login, password reset, JWT httpOnly-cookie sessions, role-based access (user/admin), account suspension
- **Profiles** — bio, region, timezone, photo, public profile pages with ratings and reviews
- **Skill Marketplace** — categorized skill catalog; add/edit/remove skills you offer or want
- **Matching Engine** — reciprocal skill matching with a normalized 0–100% compatibility score; send/accept/reject match requests
- **Sessions** — schedule, list, cancel, and complete teaching sessions with a matched partner
- **Credit Wallet** — starter balance, automatic credit transfer from learner to teacher on session completion, append-only transaction ledger
- **Ratings & Reviews** — post-session reviews gated on completion, feeding a real average rating
- **Messaging** — one-to-one chat between matched users, unread counts, read receipts
- **Notifications** — in-app and email alerts for match requests, sessions, reviews, and messages
- **Study Assistant** — Gemini-backed help with study plans and session prep, scoped to your own skills
- **Admin Panel** — platform stats, user suspend/activate, skill catalog management, user reports

## Running Locally

**Prerequisites:** Java 17, Node.js, Docker.

```bash
# 1. Start PostgreSQL + Mailpit
cd backend-java && docker compose up -d

# 2. Start the API (http://localhost:8080)
./mvnw spring-boot:run

# 3. Start the frontend (http://localhost:5173)
cd ../frontend && npm install && npm run dev
```

Flyway applies all migrations on startup. Since there's no real mail server locally, OTP and notification emails are captured by [Mailpit](https://mailpit.axllent.org/) — read them at **http://localhost:8025**.

Local defaults live in `application-dev.yml` and require no configuration. To enable the optional AI assistant locally:

```bash
AI_ENABLED=true GEMINI_API_KEY=your-key ./mvnw spring-boot:run
```

## Testing

```bash
cd backend-java && ./mvnw verify
```

Tests run against a real PostgreSQL container via Testcontainers (Docker must be running), with the actual Flyway migrations applied and `ddl-auto: validate` on — so a JPA entity drifting from a migration fails the build. Coverage focuses on the invariants that matter most: credit-ledger correctness (transfers happen exactly once and stay balanced) and access-control boundaries.

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
- Rate limits are in-memory and therefore per-instance; running multiple API replicas multiplies the effective limit. Move the buckets to Redis before scaling horizontally.
- The first admin must be promoted manually: `UPDATE users SET role = 'ADMIN' WHERE email = '...';`

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
    session/                  session scheduling
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

- List endpoints (messages, notifications, admin users) are not paginated yet and return full result sets.
- Messaging is REST + polling; there is no WebSocket push.
- There is no per-user availability model, so session scheduling uses a plain date/time picker rather than matching on free slots.
- Rate limiting and notification delivery are in-process, so both assume a single API instance.
