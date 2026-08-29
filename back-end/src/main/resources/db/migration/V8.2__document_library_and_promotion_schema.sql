CREATE TABLE IF NOT EXISTS document_upload_audits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by         VARCHAR(150) NOT NULL,
    user_role           VARCHAR(50) NOT NULL,
    file_name           VARCHAR(255) NOT NULL,
    file_size           BIGINT,
    content_hash        VARCHAR(64) NOT NULL,
    quiz_id             UUID,
    course_id           UUID NOT NULL,
    generation_job_id   UUID NOT NULL,
    requested_save      BOOLEAN DEFAULT false,
    is_promoted         BOOLEAN DEFAULT false,
    promotion_status    VARCHAR(50) NOT NULL,
    failure_reason      TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_audits_job_id ON document_upload_audits(generation_job_id);
CREATE INDEX IF NOT EXISTS idx_doc_audits_uploaded_by ON document_upload_audits(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_doc_audits_course_id ON document_upload_audits(course_id);
