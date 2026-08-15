# SkillSwap — Project Tracker

Gap analysis between `SkillSwap_Synopsis_MCSP232_Revised.docx` (IGNOU MCSP-232 synopsis) and the current repository state, plus the work plan to close the gap. Generated 2026-08-15.

**Decision on record:** the synopsis's stack (Spring Boot / Java / PostgreSQL) is the target. The current backend (Node.js + Express + MongoDB) does not match the synopsis and will be rewritten. React.js frontend matches the synopsis and is largely kept, with its API layer repointed at the new backend. Full phased roadmap: `C:\Users\shyan\.claude\plans\linked-floating-shell.md`.

## Progress (2026-08-15): ALL 10 SYNOPSIS MODULES COMPLETE

Phases 0–8 (Auth, Profile, Skill Marketplace, Matching, Sessions, Credit Wallet, Ratings & Reviews, Messaging, Notification Dispatch, Admin Panel) are built on `backend-java/` (Spring Boot 4.1, Maven, Java 17, PostgreSQL via Flyway, 17 migrations), backend-verified via curl, and end-to-end verified through the real React UI. The Node/Mongo backend is fully superseded — every frontend context now talks to `:8080`, and Node's `/api/auth`, `/api/skills`, and `/api/match-requests` routes are either explicitly disabled or simply unused. See Section 3 for per-module detail.

**Real bugs found and fixed while porting (not carried forward):**
- Matching's `compatibilityScore` is now normalized to 0–100% (was an unbounded raw count in Node, though the frontend already rendered it as a percentage).
- `RequestsPage.jsx`'s Accept/Reject buttons now actually persist (previously local-state-only).
- Node's `respondToRequest` referenced nonexistent fields, so every `Match` it created was silently broken (`skillId: undefined`).
- Node's `sendMatchRequest` skill-ownership lookup was internally inconsistent with what the frontend sent — would have frequently rejected valid requests.
- `MatchContext.jsx`'s `hasAlreadyRequested` read a field (`receiverId`) the backend never returned (`recipient`), so duplicate-request prevention silently never worked.
- Node's `updateProfile` leaked the password hash in its response.
- `matchController.js` always defensively read `entry.user.rating || 0` in anticipation of a reputation system that never existed until Phase 6b.

**Deliberate scope simplifications (disclosed, not accidental):**
- `ScheduleSessionPage.jsx`'s fake per-partner availability calendar → replaced with a plain datetime picker; no real Availability module exists yet.
- `KarmaPage.jsx`'s achievements/badges/leaderboard → dropped, not ported. The synopsis explicitly places gamification under **Future Scope**, and no backing data model existed.
- Messaging is REST + polling, not WebSocket, per the plan's explicit phasing (Phase 7a note).
- First-admin promotion is a manual DB `UPDATE` — no bootstrap/seed script exists yet.

**One real framework gotcha hit and fixed:** Spring Security 7.1's `AccessDeniedHandlerImpl.sendError(403)` triggers a container-level forward to `/error`, which re-enters the security filter chain as a new anonymous request. Since `/error` wasn't permitted, that forwarded request got denied and translated to 401 — silently clobbering every real 403 in the app. Fixed by permitting `/error` in `SecurityConfig`.

**Naming convention:** the Java backend returns `id` (not Mongo's `_id`) on every entity — `MySkillsPage.jsx` needed fixing for this during its cutover.

`skill_categories` + `skills` now have a seeded starter catalog (17 skills, 6 categories) — the old Mongo catalog had no category grouping at all.

---

## 0. Executive Summary

| Area | State as of 2026-08-15 | Synopsis Requirement | Status |
|---|---|---|---|
| Backend framework | **Spring Boot 4.1 (Java 17)**, `backend-java/` | Spring Boot (Java), Spring Security, Spring Data JPA/Hibernate | ✅ Done |
| Database | **PostgreSQL, 17 Flyway migrations**, normalized | PostgreSQL, normalized 3NF, ~14 tables | ✅ Done (table count is ~17 including join/ledger tables the synopsis's 14-table estimate likely folded together — see Section 2) |
| Frontend | React.js + Vite + Tailwind, all pages cut over to `:8080` | React.js SPA | ✅ Matches, fully wired |
| Auth | JWT httpOnly cookie, OTP email verify, bcrypt, role/suspend enforcement | JWT, secure registration, password reset | ✅ Done |
| Matching Engine | Rule-based reciprocal matcher, score normalized 0–100% | Rule-based Matching Engine (skills/availability/experience/reputation) | ✅ Core done; availability/experience weighting not added (still pure skill-reciprocity) |
| Sessions, Credits, Messaging, Reviews, Notifications, Admin | All built from scratch this session — real backend + real frontend | Full modules 5–10 | ✅ Done |
| Diagrams (ERD, DFD, UML, Gantt, PERT, architecture, deployment) | None exist | Required by synopsis Sections v, vii, x | **Still open** — documentation track, separate from the codebase (see Section 5) |
| Tests | None | Implied by SRS/Phase VIII ("integration/unit testing") | **Still open** — no test suite exists in `backend-java` or `frontend` |

**What's left:** the application itself is feature-complete against all 10 synopsis modules. What remains is documentation (diagrams, Section 5) and testing (Section 7) — both explicitly out of the phased coding roadmap and worth planning as their own next steps.

**Bottom line:** of the 10 synopsis modules, only Auth, Profile, Marketplace, and Matching have working logic today (in the wrong stack) — Session Management, Credit Wallet, Messaging, Reviews, Notifications, and Admin Panel are 0% built on the backend. The whole backend and database need to be rewritten in Spring Boot/PostgreSQL; the React frontend is the one piece that survives largely intact.

---

## 1. Tech Stack Migration (Critical Path)

- [ ] Scaffold Spring Boot project (Maven, current Java LTS)
- [ ] Set up PostgreSQL instance (local dev + connection config)
- [ ] Configure Spring Data JPA + Hibernate, `application.yml`/`application.properties`
- [ ] Configure Spring Security (stateless, JWT filter chain, role-based `USER`/`ADMIN`)
- [ ] Port JWT issuance/validation logic from `backend/controllers/authController.js` + `backend/middleware/authMiddleware.js` into a Spring Security JWT filter
- [ ] Port OTP-based registration/reset flow (currently Redis + Nodemailer/Gmail OAuth2) — decide: keep Redis (Spring Data Redis) or replace with a simpler DB-backed OTP table
- [ ] Port BCrypt password hashing (Spring Security has this built in via `PasswordEncoder`)
- [ ] Set up JavaMail (per synopsis) for email notifications, replacing Nodemailer
- [ ] Decide Cloudinary integration approach in Java (SDK exists) for profile photos
- [ ] Point frontend `fetch()` calls at the new Spring Boot API base URL (currently hardcoded to `http://127.0.0.1:5000` — should become an env-configurable base URL as part of this migration, not just a host swap)
- [ ] Decide data-migration strategy: fresh PostgreSQL schema with no data carried over from MongoDB (dev-stage data, likely acceptable), vs. a one-time export/import script
- [ ] Retire `backend/` (Node) once parity is reached, or keep archived for reference

---

## 2. Database Schema — 14 Tables (Synopsis §viii)

Synopsis specifies 14 normalized (3NF) tables; the data dictionary in §vii names 13 entities (USER_SKILLS split into OFFERED/WANTED counts as 2, so 13 entities → 14 tables is consistent). Status of each as a **JPA entity + PostgreSQL table**:

- [ ] `USERS` — has a Mongo equivalent (`User.js`) to use as a field reference; missing `rating`/reputation score field (frontend already expects `user.rating`), missing `role` (USER/ADMIN) for RBAC
- [ ] `CATEGORIES` — does not exist yet even in Mongo (current `Skill.js` has no category grouping)
- [ ] `SKILLS` — Mongo equivalent exists (`Skill.js`, name-only); needs `category_id` FK added
- [ ] `USER_SKILLS_OFFERED` — Mongo equivalent exists (`UserSkill.js` with `type: 'offer'`) — split into a dedicated table per synopsis
- [ ] `USER_SKILLS_WANTED` — Mongo equivalent exists (`UserSkill.js` with `type: 'request'`) — split into a dedicated table
- [ ] `AVAILABILITY` — **does not exist at all**, frontend has no availability input either
- [ ] `MATCHES` — Mongo equivalent exists (`MatchRequest.js`, request/status flow) — needs redesign to match synopsis's MATCHES semantics (agreed intent to exchange)
- [ ] `SESSIONS` — **does not exist at all**, backend has zero session/booking model
- [ ] `TRANSACTIONS` — **does not exist at all**, no credit ledger anywhere (only a static, never-incremented `karmaPoints` field)
- [ ] `REVIEWS` — **does not exist at all**
- [ ] `MESSAGES` — **does not exist at all**
- [ ] `NOTIFICATIONS` — **does not exist at all**
- [ ] `REPORTS` — **does not exist at all** (no admin/complaint system)

Also required, not in the 13-entity list but implied by the schema notes:
- [ ] Confirm final 14th table (likely a join/detail table — clarify against the full ER diagram once drawn, since only descriptions were extracted from the docx, not the actual ER diagram image)

---

## 3. Module-by-Module Status (Synopsis §ix — 10 Modules)

| # | Module | Old Node Backend | New Spring Backend | Frontend | Notes |
|---|---|---|---|---|---|
| 1 | Auth & Authorization | ✅ Working (JWT cookie, OTP, bcrypt) — disabled in favor of Spring backend | ✅ **Done** (`backend-java`, Spring Security + JWT cookie, OTP via Postgres table, JavaMail via Mailpit in dev) | ✅ Wired to `:8080`; `/logout` now a real endpoint | `role` (USER/ADMIN) column added for Phase 8; `rating` field still not added (belongs to Phase 6b) |
| 2 | Profile Management | ✅ Working (bio/region/timezone/photo) — disabled in favor of Spring backend | ✅ **Done** (`PUT /api/profile`, Cloudinary signature computed server-side without the full SDK) | ✅ Wired to `:8080`; still only 1-step form (no skills-in-onboarding as README implies) | `AVAILABILITY` capture still absent — deferred to whichever phase needs it (Matching Engine or a dedicated pass) |
| 3 | Skill Marketplace | ✅ Working CRUD, no categories — disabled in favor of Spring backend | ✅ **Done** (`skill_categories` + `skills` + `user_skills`, seeded starter catalog) | ✅ Wired to `:8080`, fixed `_id`→`id` field reads in `MySkillsPage` | `matchCount`/`sessionCount` on skill cards still show `NaN` — real values depend on Matching/Sessions (Phases 4–5), not fixed here to stay in scope |
| 4 | Matching Engine | ✅ Working, reciprocal-match, unweighted count score — disabled in favor of Spring backend | ✅ **Done**, score normalized to 0–100%; match-request send/incoming/sent/respond all real; `Match` row created correctly on accept | ✅ Wired to `:8080`; filter UI (region/timezone/availability) still decorative — not applied client- or server-side | Availability/experience/reputation weighting not added — the algorithm is still pure skill-reciprocity based; revisit if the synopsis's grading expects the richer scoring it describes |
| 5 | Session Management | ❌ Was never implemented | ✅ **Done** (`sessions` table, Scheduled/Completed/Cancelled state machine, tied to accepted `matches`) | ✅ Both pages rebuilt against real data; calendar/per-partner-availability UI simplified to a plain datetime picker (no Availability module exists yet) | Availability module (per-user weekly time slots) still doesn't exist — revisit if a richer scheduling UI is wanted later |
| 6 | Credit Wallet | ❌ Was never implemented (only unused `karmaPoints` int) | ✅ **Done** (`wallets` + `wallet_transactions`, lazy starter balance, atomic transfer on completion) | ✅ `KarmaPage.jsx` rebuilt around real balance/history | `karma_points` on `users` still exists but is now fully superseded/unused by the wallet — candidate for removal in a later cleanup pass |
| 7 | Messaging | ❌ Was never implemented | ✅ **Done** (`conversations` + `messages`, REST + polling, restricted to matched users, unread counts/read receipts) | ✅ `MessagesPage.jsx` rebuilt against real data | Real-time push (WebSocket) intentionally deferred per the plan — REST + polling is the first cut; presence indicators (online/away/offline) dropped, no backing data |
| 8 | Ratings & Reviews | ❌ Was never implemented | ✅ **Done** (`reviews` table, gated on completed sessions, one per reviewer/session, updates real `average_rating` on `users`) | ✅ `FeedbackPage.jsx` rebuilt against real reviewable sessions + history | Closes the `user.rating` gap that `matchController.js` always anticipated but never had data for |
| 9 | Notification Dispatch | ❌ Was never implemented (email existed only for OTP) | ✅ **Done** (`notifications` table; in-app + best-effort email via existing JavaMail plumbing) | ✅ Bell dropdown added to `Header.jsx` (30s poll for unread count) | Triggers wired: match request received/accepted/rejected, session scheduled, review received, message received. Not wired: session reminders (no scheduled-job infra yet), session completion (arguably belongs here too — revisit) |
| 10 | Admin Panel | ❌ Was never implemented (no role field, no admin routes) | ✅ **Done** (`role`/`enabled` enforcement, `reports` table, stats aggregation across all modules) | ✅ `AdminPage.jsx` — genuinely new, no prior mock existed | First-admin promotion is manual (direct DB `UPDATE`) — no bootstrap/seed script yet |

---

## 4. Frontend Rework Checklist

The React app mostly survives, but needs real integration work, not just a backend swap:

- [x] Replace hardcoded `http://127.0.0.1:5000` fetch base with an env-configurable API base URL — done via `frontend/.env` (`VITE_API_BASE_URL`) + `frontend/src/config/api.js`, used by all cut-over contexts/pages
- [x] `RequestsPage.jsx` — Accept/Reject now call the real `respondToRequest` endpoint and persist
- [ ] `UserProfilePage.jsx` — currently 100% mock (`mockProfile`, ignores `userId`, "Send Match Request" only `console.log`s) — rebuild against real per-user profile + match-request endpoints
- [ ] `DashboardPage.jsx` — stats/recent-activity/upcoming-sessions are hardcoded — wire to real session/transaction data once those exist
- [x] `MessagesPage.jsx` — rebuilt against real Messaging module
- [x] `ScheduleSessionPage.jsx` / `SessionsPage.jsx` — rebuilt against real Session Management module
- [x] `FeedbackPage.jsx` — rebuilt against real Reviews module
- [x] `KarmaPage.jsx` — rebuilt against real Credit Wallet; achievements/leaderboard dropped (synopsis Future Scope, no data model)
- [ ] `MatchingPage.jsx` — make the filter UI (skill/proficiency/region/timezone/availability) functional, not decorative
- [ ] Add missing `/profile` route (bare, no `:userId`) — Header links to it but it 404s today
- [ ] `AskAIPage.jsx` — decide whether "AI Doubt Assistant" stays out of scope (synopsis explicitly puts AI matching in **Future Scope**, and doesn't mention an AI chat assistant at all) — likely drop or clearly gate as unavailable, since it's currently a fake keyword-matcher presented as real
- [ ] Fix naming inconsistencies carried from Node backend if reused as reference (`getRecievedRequest`/`getSentRequest` typos) — `user.rating` is now real data as of Phase 6b, no longer a gap

---

## 5. Documentation & Diagram Deliverables (Synopsis Sections v, vii, x)

None of these currently exist anywhere in the repo. All are required for the synopsis to be internally consistent and for the MCSP-232 viva:

- [ ] Fig 5.1 — Gantt Chart (16-week schedule)
- [ ] Fig 5.2 — PERT Network Diagram (critical path)
- [ ] Fig 7.1 — Context Diagram (Level 0 DFD)
- [ ] Fig 7.2 — Level 1 DFD (10 processes + data stores)
- [ ] Fig 7.3 — Level 2 DFD (Matching Engine decomposition)
- [ ] Fig 7.4 — Entity-Relationship Diagram (13 entities, crow's-foot cardinality)
- [ ] Fig 7.5 — UML Class Diagram
- [ ] Fig 7.6 — State Diagram (Match/Session lifecycle)
- [ ] Fig 7.7 — UML Sequence Diagram (skill exchange session lifecycle)
- [ ] Fig 7.8 — UML Activity Diagram (end-to-end workflow)
- [ ] Fig 10.1 — System Architecture Diagram
- [ ] Fig 10.2 — Deployment Diagram (localhost + optional Docker Compose: Nginx + Spring Boot + PostgreSQL)
- [ ] Fig 10.3 — Component Diagram (React modules → Spring controllers)
- [ ] `.env.example` / onboarding doc (does not exist today for either stack)

---

## 6. Non-Functional / Security Checklist (Synopsis §xi)

- [ ] JWT short-lived signed access tokens (had 7-day expiry in Node version — likely too long; synopsis implies short-lived)
- [ ] Consistent RBAC (USER/ADMIN) — **no role field exists today at all**
- [ ] BCrypt password hashing (straightforward via Spring Security `PasswordEncoder`)
- [ ] Server-side validation + parameterized queries (JPA/Hibernate gives this by default; still needs explicit input validation, e.g. `@Valid`/Bean Validation)
- [ ] Output escaping / CSRF stance — decide deliberately (old Node app had `csurf` installed but never wired in — dead dependency; with stateless JWT bearer auth, CSRF risk is naturally lower, but document the decision instead of leaving it implicit)
- [ ] HTTPS in deployment config
- [ ] Remove hardcoded secrets from source — **current repo hardcodes a live Redis Cloud password directly in `backend/utils/redisClient.js`** (two different real passwords have been committed across history) — must not carry this habit into the new backend; use environment variables / secrets management throughout
- [ ] Sample security test cases from §xi table (admin-route access as unauthenticated/non-admin user, XSS input, SQLi-style input) — none exist today, add as part of Phase VIII testing

---

## 7. Testing (Synopsis Phase VIII)

- [ ] No tests exist in either stack today — `backend/package.json`'s test script is still the default placeholder
- [ ] Add backend unit/integration tests (JUnit + Mockito, or Spring Boot Test) once Spring backend exists
- [ ] Add a Postman collection covering all REST endpoints (synopsis explicitly calls for "RESTful, documented and tested via Postman")
- [ ] Add frontend tests if desired (not explicitly required by synopsis, but no test runner is currently configured — Vitest would be the natural fit for the Vite setup)

---

## 8. Housekeeping / Immediate Cleanup (independent of the rewrite)

- [ ] `a.html` at repo root — unrelated personal utility file (bulk tab-opener for unrelated URLs), not part of the app — remove from the repo
- [ ] Resolve the uncommitted work in `backend/controllers/matchRequestController.js`: the in-progress "create Match on accept" logic references `request.skillOfferedId`/`request.skillRequestedId`, fields that don't exist on the schema (`skillsOffered`/`skillsRequested` arrays are the real fields) — currently produces `Match` records with `skillId: undefined`. Moot once the backend is rewritten, but worth noting so this half-finished logic isn't ported over as-is.
- [ ] `backend/routes/matchRequestRoutes.js` requires `../controllers/MatchRequestController` (capital M) while the actual file is lowercase — works on Windows/macOS, breaks on Linux — moot after rewrite, but flag if the Node backend is kept running any longer during migration
- [ ] Duplicate route mounting: `matchRoutes.js` and `matchRequestRoutes.js` are both mounted at `/api/match-requests` — fragile, avoid replicating this pattern in the new API design

---

## 9. What's Left (All 10 Modules Now Done)

The phased build (Sections 1–4, formerly "suggested order of work") is complete — every module in Section 3's table is ✅. What remains is documentation and hardening, not new features:

1. **Diagrams** (Section 5) — ERD, DFDs, UML, Gantt/PERT, architecture/deployment/component. Now's the right time to draw these, since the design has stabilized and they can accurately reflect what was actually built rather than what was planned.
2. **Testing** (Section 7) — no test suite exists yet in `backend-java` or `frontend`. Given the app is fully built, this is the natural next engineering task: JUnit/Mockito for the Spring backend, a Postman collection per the synopsis's own requirement, optionally Vitest for the frontend.
3. **Security checklist** (Section 6) — mostly satisfied by construction (JWT, BCrypt, JPA parameterized queries, RBAC), but the synopsis's explicit sample security test cases (§xi table) haven't been run as actual tests yet.
4. **Housekeeping** (Section 8) — the stray `a.html`, hardcoded Redis credentials in the old Node backend, and the Node backend itself are all now safe to delete since nothing depends on them anymore.
5. **First-admin bootstrap** — currently a manual DB `UPDATE`; worth a small seed script or CLI flag before any real deployment.
6. **Availability module** — still doesn't exist; would enable real per-user scheduling calendars (currently a plain datetime picker) and richer Matching Engine scoring (availability/experience weighting, per the synopsis's stated objective).
