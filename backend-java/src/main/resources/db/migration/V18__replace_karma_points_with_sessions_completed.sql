-- karma_points was seeded to 0 and never incremented by any code path: the
-- wallet ledger became the real credit economy, leaving this column as a
-- permanently-zero number the UI still rendered as "0 karma".
--
-- Replace it with a counter that is actually maintained -- completed sessions,
-- a trust signal alongside average_rating -- and backfill it from the sessions
-- already in the table so existing users don't reset to zero.

ALTER TABLE users ADD COLUMN sessions_completed INTEGER NOT NULL DEFAULT 0;

-- WHERE EXISTS narrows this to users who actually have a completed session;
-- everyone else already got sessions_completed = 0 from the DEFAULT above, so
-- writing 0 over 0 again would just be unnecessary I/O on every existing row.
UPDATE users u
SET sessions_completed = (
    SELECT COUNT(*)
    FROM sessions s
    WHERE s.status = 'Completed'
      AND (s.teacher_id = u.id OR s.learner_id = u.id)
)
WHERE EXISTS (
    SELECT 1
    FROM sessions s
    WHERE s.status = 'Completed'
      AND (s.teacher_id = u.id OR s.learner_id = u.id)
);

ALTER TABLE users DROP COLUMN karma_points;
