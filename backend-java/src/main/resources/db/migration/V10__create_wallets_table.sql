CREATE TABLE wallets (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance    INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
