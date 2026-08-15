CREATE TABLE sessions (
    id                BIGSERIAL PRIMARY KEY,
    match_id          BIGINT      NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    skill_id          BIGINT      NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    teacher_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learner_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at      TIMESTAMPTZ NOT NULL,
    duration_minutes  INTEGER     NOT NULL,
    session_type      VARCHAR(20) NOT NULL CHECK (session_type IN ('online', 'in-person')),
    location          TEXT,
    notes             TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
                        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX idx_sessions_learner_id ON sessions(learner_id);
CREATE INDEX idx_sessions_match_id ON sessions(match_id);
