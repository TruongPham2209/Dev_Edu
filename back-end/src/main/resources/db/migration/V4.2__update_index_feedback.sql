ALTER TABLE submission_feedback
    DROP COLUMN IF EXISTS submission_id;

ALTER TABLE submission_feedback
    ADD COLUMN IF NOT EXISTS assignment_id UUID;

ALTER TABLE submission_feedback
    ADD COLUMN IF NOT EXISTS student_username VARCHAR(255);

UPDATE submission_feedback
SET assignment_id = gen_random_uuid()
WHERE assignment_id IS NULL;

UPDATE submission_feedback
SET student_username = ''
WHERE student_username IS NULL;

ALTER TABLE submission_feedback
    ALTER COLUMN assignment_id SET NOT NULL;

ALTER TABLE submission_feedback
    ALTER COLUMN student_username SET NOT NULL;