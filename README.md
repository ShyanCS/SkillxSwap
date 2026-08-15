# SkillSwap

A peer-to-peer skill exchange platform: members teach a skill they know and learn a skill they want, matched by a rule-based recommendation engine and coordinated through a non-monetary Skill Credit economy instead of payment.

Built as an IGNOU MCA (MCSP-232) project. Full gap analysis and build history: [PROJECT_TRACKER.md](PROJECT_TRACKER.md).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Spring Boot 4.1 (Java 17), Spring Security (JWT), Spring Data JPA/Hibernate |
| Database | PostgreSQL, schema versioned with Flyway |
| Email | JavaMail over SMTP (Mailpit in dev, catches mail locally instead of sending) |
| Photo storage | Cloudinary (signed uploads) |

`backend/` (Node.js/Express/MongoDB) is the original prototype backend and is no longer used — every frontend request now goes to `backend-java/`. It's kept in the repo for reference only.

## Features

- **Auth** — registration with email OTP verification, login, password reset, JWT (httpOnly cookie) sessions, role-based access (user/admin)
- **Profiles** — bio, region, timezone, profile photo
- **Skill Marketplace** — a categorized skill catalog; add/edit/remove skills you offer or want to learn
- **Matching Engine** — reciprocal skill matching (mutual offer/want overlap) with a normalized 0–100% compatibility score; send/accept/reject match requests
- **Sessions** — schedule, list, cancel, and complete teaching sessions with a matched partner
- **Credit Wallet** — every user starts with a small credit balance; completing a session transfers credits from learner to teacher, tracked in an append-only ledger
- **Ratings & Reviews** — leave a review after a completed session; feeds a real average rating per user
- **Messaging** — one-to-one chat with matched users, unread counts, read receipts
- **Notifications** — in-app + email alerts for match requests, sessions, reviews, and messages
- **Admin Panel** — platform stats, suspend/activate users, manage the skill catalog, review and resolve user reports

## Running Locally

### Prerequisites

- Java 17, Maven
- Node.js + npm
- Docker (for PostgreSQL + Mailpit)

### 1. Start PostgreSQL and Mailpit

```bash
cd backend-java
docker compose up -d
```

This starts Postgres on `localhost:5433` and [Mailpit](https://mailpit.axllent.org/) (a local SMTP catcher) on `localhost:1025`, with a web UI at [http://localhost:8025](http://localhost:8025) to view OTP and notification emails without needing a real mail provider.

### 2. Start the backend

```bash
cd backend-java
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. Flyway applies all schema migrations automatically on startup. Health check: `GET /api/health`.

Optional environment variables (all have sensible local-dev defaults — see `src/main/resources/application.yml`):

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Signing key for auth tokens |
| `MAIL_HOST` / `MAIL_PORT` | SMTP server (defaults to Mailpit) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Required only for profile photo uploads |

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. It reads the backend URL from `frontend/.env` (`VITE_API_BASE_URL`, defaults to `http://127.0.0.1:8080`).

## Project Structure

```
frontend/       React SPA (Vite)
backend-java/   Spring Boot API — the active backend
  src/main/java/com/skillswap/backend/
    auth/         registration, login, JWT, OTP
    profile/      profile updates, photo upload
    skill/        skill catalog, offered/wanted skills
    matching/     matching engine, match requests
    session/      session scheduling
    wallet/       credit wallet & transaction ledger
    review/       ratings & reviews
    messaging/    conversations & messages
    notification/ in-app + email notifications
    admin/        admin panel
    report/       user complaints/reports
  src/main/resources/db/migration/   Flyway SQL migrations
backend/        legacy Node.js prototype backend (unused, kept for reference)
```

## Notes

- No test suite exists yet for either the backend or frontend.
- Diagrams (ERD, DFD, UML, architecture) are tracked separately as project-report deliverables, not part of the codebase — see [PROJECT_TRACKER.md](PROJECT_TRACKER.md).
- The first admin user must currently be promoted manually: `UPDATE users SET role = 'ADMIN' WHERE email = '...';`
