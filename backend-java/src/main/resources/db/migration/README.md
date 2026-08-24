# Database Migrations

Flyway-managed PostgreSQL schema. Applied automatically on application
startup (`spring.flyway` defaults); `ddl-auto: validate` runs afterwards so
a JPA entity drifting from the migrated schema fails the boot, not
production.

## Conventions

- **Filename:** `V<version>__<snake_case_description>.sql`, two underscores.
  Versions are strictly increasing integers with no gaps in meaning — a
  migration is immutable history, never edited after being committed.
- **Corrections** happen as new migrations (`V18__replace_...` drops and
  backfills rather than rewriting `V1`).
- **Idempotency:** Flyway guarantees each version applies once per database;
  scripts are therefore written as plain DDL without `IF NOT EXISTS` guards,
  which keeps intent explicit.
- **Constraints live in SQL**, not only in entities: CHECKs, FKs, UNIQUEs,
  and cascades are declared here so the database is the final authority.

## Table-to-feature lineage

| Migration | Table(s) / change | Owning module | Notes |
|---|---|---|---|
| V1 | `users` | auth | identity, bcrypt hash, role |
| V2 | `otp_verifications` | auth | email OTP for register/reset; TTL columns |
| V3 | `skill_categories` | skill | catalog grouping (6 seeded rows) |
| V4 | `skills` | skill | canonical catalog names (17 seeded via V6) |
| V5 | `user_skills` | skill | a user's offered/wanted entries referencing catalog ids |
| V6 | seed data | skill | starter catalog: 17 skills across 6 categories |
| V7 | `match_requests` | matching | pending/accepted/rejected request lifecycle |
| V8 | `matches` | matching | created when a request is accepted |
| V9 | `sessions` | session | scheduled/completed/cancelled state machine, FK to matches |
| V10 | `wallets` | wallet | one row per user (UNIQUE), credit balance |
| V11 | `wallet_transactions` | wallet | append-only ledger; type CHECK, amount > 0, FK cascade from wallets |
| V12 | `users.rating` | review | denormalized average maintained by ReviewService |
| V13 | `reviews` | review | one per reviewer/session pair; gated on completed sessions |
| V14 | `conversations`, `messages` | messaging | 1:1 chat between matched users; read receipts |
| V15 | `notifications` | notification | in-app feed + email mirror flag |
| V16 | `users.enabled` | admin | suspension switch enforced at authentication |
| V17 | `reports` | report/admin | user-submitted complaints with resolution state |
| V18 | drop `users.karma_points` | wallet | superseded by the wallet ledger; replaced with `sessions_completed` counter |
| V19 | `user_availability` | availability | weekly recurring windows stored in the user's timezone |

## Invariants pinned by tests

The integration suite (`src/test`) exercises these guarantees against a real
PostgreSQL container:

- Wallet transfers move credits atomically and exactly once; sender balance
  never goes negative (`WalletCreditTransferTest`).
- The `wallet_transactions` CHECK constraints reject zero/negative amounts
  and unknown types (`MigrationInvariantTest`).
- A user cannot hold more than one wallet (`MigrationInvariantTest`,
  UNIQUE on `wallets.user_id`).

When adding a schema-level guarantee, add the test that would catch its
regression in the same commit as the migration itself.

## Validating outside app startup

```bash
docker compose up -d db          # any empty Postgres works
./mvnw -B flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/skillswap \
    -Dflyway.user=postgres -Dflyway.password=postgres
```
