CREATE TABLE wallet_transactions (
    id          BIGSERIAL PRIMARY KEY,
    wallet_id   BIGINT      NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    session_id  BIGINT      REFERENCES sessions(id) ON DELETE SET NULL,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('EARN', 'SPEND', 'REFUND', 'ADMIN_CREDIT')),
    amount      INTEGER     NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
