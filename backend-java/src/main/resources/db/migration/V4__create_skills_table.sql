CREATE TABLE skills (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    category_id BIGINT       NOT NULL REFERENCES skill_categories(id) ON DELETE RESTRICT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_category_id ON skills(category_id);
