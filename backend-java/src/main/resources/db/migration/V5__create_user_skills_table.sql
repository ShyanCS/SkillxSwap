CREATE TABLE user_skills (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id            BIGINT       NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    type                VARCHAR(10)  NOT NULL CHECK (type IN ('offer', 'request')),
    description         TEXT,
    proficiency_level   VARCHAR(20), -- offered skills: Beginner | Intermediate | Advanced
    desired_proficiency VARCHAR(20), -- requested skills: Beginner | Intermediate | Advanced
    urgency             VARCHAR(10), -- requested skills: Low | Medium | High
    availability        TEXT[],      -- offered skills: e.g. {"Monday AM","Tuesday PM"}
    status              VARCHAR(20)  NOT NULL DEFAULT 'Active',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id_type ON user_skills(skill_id, type);
