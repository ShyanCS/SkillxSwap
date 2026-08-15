CREATE TABLE reports (
    id               BIGSERIAL PRIMARY KEY,
    reporter_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason           TEXT        NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);
