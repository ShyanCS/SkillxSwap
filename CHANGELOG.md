# Changelog

All notable changes to SkillSwap are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Leveled frontend logger (`VITE_LOG_LEVEL`); all console usage routes through
  it, enforced by an ESLint `no-console` error rule with a single exemption.
- Shared `ErrorBanner` component; every blocking `alert()` replaced with
  inline, dismissible feedback (error/warning/success tones).
- Structured JSON logging for the backend in production via `logback-spring.xml`
  (readable console in dev; MDC `requestId` flows into every prod log line).
- Frontend test suite: Vitest + Testing Library + jsdom, coverage thresholds,
  47 specs covering logger, ErrorBanner, validation schemas, SkillCard,
  SkillFormModal, useScheduleWizard, SessionsPage, and RequestsPage.
- JaCoCo coverage reporting for the backend, published as a CI artifact.
- Prettier with a committed config (`format` / `format:check` scripts).
- Spotless (Palantir format) enforced at Maven `validate` for all Java sources.
- Component extraction: `SkillFormModal`, `SkillCard`, `useScheduleWizard`;
  no frontend file exceeds ~403 LOC (largest was 643).
- Zod validation schemas as the single source of client-side form rules;
  registration payload strips `confirmPassword` at parse time.
- Dependabot for npm, Maven, and GitHub Actions; npm audit gate (critical) and
  OWASP dependency-check scan in CI.
- Explicit Flyway migrate+validate CI gate against a scratch database;
  migration lineage documented in `db/migration/README.md`.
- Wallet schema invariant tests (single wallet per user, ledger CHECKs,
  cascade cleanup, transfer balance symmetry).
- One-command full-stack evaluation: `docker compose -f docker-compose.dev.yml up --build`.
- `.gitattributes` enforcing LF across platforms.

### Fixed

- MySkillsPage save errors were unhandled promise rejections that left the
  modal silently stuck open.
- Form labels were not programmatically associated with their inputs
  (screen-reader accessibility) in skill and scheduling forms.
- CRLF blobs from Windows commits broke Spotless on Linux CI; line endings are
  now normalized repository-wide.
- Copy-pasted log messages ("Failed to fetch skills" on match endpoints);
  leftover debug `console.log`s dumping API payloads removed.
- Icon-only edit/delete buttons had no accessible names.

## [1.0.0] - 2026-08-24

### Added

- Complete rewrite of the backend from Node.js/Express/MongoDB to
  Spring Boot 4.1 / PostgreSQL (19 Flyway migrations), matching the MCSP-232
  synopsis stack decision.
- All ten synopsis modules: auth (JWT httpOnly cookie + email OTP), profiles,
  categorized skill marketplace, reciprocal matching engine with 0-100%
  compatibility score, timezone-aware weekly availability, session scheduling
  with double-booking prevention, credit wallet with append-only ledger,
  post-session reviews feeding real average ratings, WebSocket messaging with
  read receipts, notification dispatch (in-app + email), Gemini study
  assistant (optional), admin panel with reports and suspension.
- React SPA (Vite + Tailwind), fully wired to the Spring API.
- Testcontainers-based integration suite against real PostgreSQL.
- Production deployment stack (`docker-compose.prod.yml`) with fail-fast
  configuration validation, health probes, and optional Redis-backed scaling.
