CREATE TABLE conversations (
    id         BIGSERIAL PRIMARY KEY,
    user1_id   BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id   BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (user1_id < user2_id),
    UNIQUE (user1_id, user2_id)
);

CREATE TABLE messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT      NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body            TEXT        NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at         TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
