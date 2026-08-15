CREATE TABLE otp_verifications (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,
    otp_code     VARCHAR(6)   NOT NULL,
    purpose      VARCHAR(20)  NOT NULL,
    verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at   TIMESTAMPTZ  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_email_purpose ON otp_verifications(email, purpose);
