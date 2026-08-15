CREATE TABLE skill_categories (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
