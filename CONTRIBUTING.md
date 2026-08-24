# Contributing to SkillSwap

Thanks for looking at the project. This document covers how to get a working
environment and the conventions that keep the codebase reviewable.

## Getting started

Prerequisites: **Java 17**, **Node.js 20+**, and **Docker**.

```bash
# 1. Infrastructure only (Postgres + Mailpit)
cd backend-java && docker compose up -d

# 2. API on :8080
./mvnw spring-boot:run

# 3. Frontend on :5173
cd ../frontend && npm ci && npm run dev
```

No `.env` is needed locally — dev defaults live in
`backend-java/src/main/resources/application-dev.yml`. OTP emails are captured
by Mailpit at http://localhost:8025.

Prefer not to install anything? The whole product runs with one command:

```bash
docker compose -f docker-compose.dev.yml up --build   # app on :3000
```

## Running the checks

Everything below must pass before you push; CI runs all of it.

| Scope | Command | What it enforces |
|---|---|---|
| Backend build + tests | `cd backend-java && ./mvnw verify` | Unit/integration tests against real Postgres (Docker required), Spotless formatting, JaCoCo report |
| Java formatting | `./mvnw spotless:apply` | Palantir style, import order, no unused imports |
| Migration integrity | `./mvnw -B -Duser.timezone=UTC org.flywaydb:flyway-maven-plugin:11.7.2:migrate org.flywaydb:flyway-maven-plugin:11.7.2:validate "-Dflyway.url=jdbc:postgresql://localhost:55432/check" ...` | Full chain applies + validates from empty |
| Frontend lint | `cd frontend && npm run lint` | ESLint incl. `no-console` (use `src/lib/logger`) |
| Frontend format | `npm run format` | Prettier (`format:check` in CI) |
| Frontend tests | `npm test` / `npm run test:coverage` | Vitest + Testing Library, coverage floor |

## Commit conventions

- **One concern per commit**, and it ships together with the tests that pin
  its behavior. A feature without its test is an unfinished commit.
- Keep mechanical changes isolated: a formatting-only commit should contain
  nothing else.
- Write commit subjects as imperative sentences with a body explaining *why*
  when the reason isn't obvious from the diff.

## Database changes

- Schema lives only in Flyway migrations under
  `backend-java/src/main/resources/db/migration/`. Never edit an applied
  migration — add `V<n+1>__<description>.sql`.
- Declare CHECK/FK/UNIQUE constraints in SQL (the database is the authority),
  and add the invariant test that would catch its regression in the same
  commit. Conventions and lineage live in that folder's README.

## Frontend conventions

- All client-side validation rules belong in `src/lib/validation.js`
  (zod schemas); pages consume them via `validate()` and never hand-roll regexes.
- Errors are state, not popups: use `components/common/ErrorBanner.jsx`.
- Logging goes through `src/lib/logger`; direct `console.*` calls fail lint.
- New UI logic worth keeping is worth a test — extract hooks/components so they
  can be tested without provider mocks where practical.

## Security notes

- Never commit secrets. Configuration comes from environment variables;
  `.env.example` documents every supported variable.
- The production profile refuses unsafe configuration (weak/missing JWT
  secret, wildcard CORS) instead of booting insecurely.
- Dependency CVEs surface via Dependabot PRs and CI audit steps; address or
  explicitly justify deviations in the PR description.
