INSERT INTO skill_categories (name) VALUES
    ('Programming'), ('Design'), ('Languages'), ('Music'), ('Business'), ('Cooking');

INSERT INTO skills (name, category_id) VALUES
    ('JavaScript', (SELECT id FROM skill_categories WHERE name = 'Programming')),
    ('Python', (SELECT id FROM skill_categories WHERE name = 'Programming')),
    ('React', (SELECT id FROM skill_categories WHERE name = 'Programming')),
    ('Java', (SELECT id FROM skill_categories WHERE name = 'Programming')),
    ('SQL', (SELECT id FROM skill_categories WHERE name = 'Programming')),
    ('UI/UX Design', (SELECT id FROM skill_categories WHERE name = 'Design')),
    ('Graphic Design', (SELECT id FROM skill_categories WHERE name = 'Design')),
    ('Figma', (SELECT id FROM skill_categories WHERE name = 'Design')),
    ('Spanish', (SELECT id FROM skill_categories WHERE name = 'Languages')),
    ('French', (SELECT id FROM skill_categories WHERE name = 'Languages')),
    ('Mandarin', (SELECT id FROM skill_categories WHERE name = 'Languages')),
    ('Guitar', (SELECT id FROM skill_categories WHERE name = 'Music')),
    ('Piano', (SELECT id FROM skill_categories WHERE name = 'Music')),
    ('Public Speaking', (SELECT id FROM skill_categories WHERE name = 'Business')),
    ('Project Management', (SELECT id FROM skill_categories WHERE name = 'Business')),
    ('Baking', (SELECT id FROM skill_categories WHERE name = 'Cooking')),
    ('Italian Cooking', (SELECT id FROM skill_categories WHERE name = 'Cooking'));
