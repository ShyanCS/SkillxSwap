CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    session_id  BIGINT      NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    reviewer_id BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
