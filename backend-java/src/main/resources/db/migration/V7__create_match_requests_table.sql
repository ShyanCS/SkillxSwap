CREATE TABLE match_requests (
    id                                BIGSERIAL PRIMARY KEY,
    sender_id                        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id                      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status                            VARCHAR(20) NOT NULL DEFAULT 'Pending'
                                        CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    -- Sender's own OFFER-type user_skills.id values -- skills the sender will teach.
    sender_offered_user_skill_ids     BIGINT[]    NOT NULL DEFAULT '{}',
    -- Receiver's own OFFER-type user_skills.id values -- skills the receiver will teach.
    receiver_offered_user_skill_ids   BIGINT[]    NOT NULL DEFAULT '{}',
    created_at                        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_requests_sender_id ON match_requests(sender_id);
CREATE INDEX idx_match_requests_receiver_id ON match_requests(receiver_id);
