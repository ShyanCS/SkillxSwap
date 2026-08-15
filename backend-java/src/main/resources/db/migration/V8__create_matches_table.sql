CREATE TABLE matches (
    id                BIGSERIAL PRIMARY KEY,
    match_request_id  BIGINT      NOT NULL UNIQUE REFERENCES match_requests(id) ON DELETE CASCADE,
    user1_id          BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id          BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compatibility_score INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
