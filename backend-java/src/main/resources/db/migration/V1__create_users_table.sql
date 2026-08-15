CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(120)  NOT NULL,
    email               VARCHAR(255)  NOT NULL UNIQUE,
    password_hash       VARCHAR(255)  NOT NULL,
    bio                 TEXT,
    region              VARCHAR(120),
    timezone            VARCHAR(60),
    profile_picture_url VARCHAR(500),
    karma_points        INTEGER       NOT NULL DEFAULT 0,
    role                VARCHAR(20)   NOT NULL DEFAULT 'USER',
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);
