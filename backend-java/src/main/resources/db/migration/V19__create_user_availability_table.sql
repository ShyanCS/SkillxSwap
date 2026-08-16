-- Weekly recurring availability, so scheduling can be checked against when
-- people are actually free instead of accepting any date the picker allows.
--
-- Times are minutes from midnight in the OWNING USER'S timezone (users.timezone),
-- not UTC. A person's "free on Tuesday evenings" is a fact about their local
-- week: storing it in UTC would silently shift it when their offset changed at a
-- DST boundary. Conversion to a real instant happens at comparison time.

CREATE TABLE user_availability (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- ISO-8601 day numbering (1 = Monday .. 7 = Sunday) to match java.time.DayOfWeek.
    day_of_week  SMALLINT    NOT NULL,
    start_minute SMALLINT    NOT NULL,
    end_minute   SMALLINT    NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_availability_day   CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT chk_availability_start CHECK (start_minute BETWEEN 0 AND 1439),
    -- 1440 == midnight at the end of the day, so a slot can run to end of day.
    CONSTRAINT chk_availability_end   CHECK (end_minute BETWEEN 1 AND 1440),
    CONSTRAINT chk_availability_order CHECK (end_minute > start_minute)
);

CREATE INDEX idx_user_availability_user ON user_availability(user_id);

-- Double-booking checks scan a user's sessions in a time range on every
-- scheduling attempt; without these each attempt is a full table scan.
CREATE INDEX idx_sessions_teacher_scheduled ON sessions(teacher_id, scheduled_at);
CREATE INDEX idx_sessions_learner_scheduled ON sessions(learner_id, scheduled_at);
