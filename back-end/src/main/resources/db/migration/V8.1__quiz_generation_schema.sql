CREATE TABLE IF NOT EXISTS course_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    file_name           VARCHAR(255) NOT NULL,
    file_object_key     VARCHAR(255) NOT NULL,
    file_size           BIGINT,
    content_hash        VARCHAR(64) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'UPLOADING',
    visibility          VARCHAR(50) NOT NULL DEFAULT 'TEMPORARY',
    is_promoted         BOOLEAN DEFAULT false,
    created_by          VARCHAR(150) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at          TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_course_docs_visibility ON course_documents(visibility);
CREATE INDEX IF NOT EXISTS idx_course_docs_status ON course_documents(status);
CREATE INDEX IF NOT EXISTS idx_course_docs_created_by ON course_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_course_docs_content_hash ON course_documents(content_hash);

CREATE TABLE IF NOT EXISTS document_knowledge_chunks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id         UUID NOT NULL REFERENCES course_documents(id) ON DELETE CASCADE,
    section_name        VARCHAR(255),
    page_number         INTEGER,
    chunk_index         INTEGER NOT NULL,
    content             TEXT NOT NULL,
    content_hash        VARCHAR(64) NOT NULL,
    embedding           vector(1536) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc_id ON document_knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_vector ON document_knowledge_chunks USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS quiz_generation_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    document_id         UUID REFERENCES course_documents(id) ON DELETE SET NULL,
    document_object_key VARCHAR(255),
    document_name       VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    current_step        VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requested_total     INTEGER NOT NULL,
    requested_config    JSONB NOT NULL,
    usable_capacity     INTEGER DEFAULT 0,
    processed_count     INTEGER DEFAULT 0,
    accepted_count      INTEGER DEFAULT 0,
    rejected_count      INTEGER DEFAULT 0,
    rejection_reasons   JSONB,
    result_quiz_id      UUID REFERENCES quizzes(id) ON DELETE SET NULL,
    error_message       TEXT,
    token_usage         INTEGER DEFAULT 0,
    execution_time_ms   BIGINT DEFAULT 0,
    created_by          VARCHAR(150) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_gen_jobs_course_id ON quiz_generation_jobs(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_gen_jobs_status ON quiz_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_quiz_gen_jobs_created_by ON quiz_generation_jobs(created_by);

CREATE TABLE IF NOT EXISTS quiz_question_source_trace (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id         UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    generation_job_id   UUID NOT NULL REFERENCES quiz_generation_jobs(id) ON DELETE CASCADE,
    document_id         UUID REFERENCES course_documents(id) ON DELETE SET NULL,
    chunk_id            UUID REFERENCES document_knowledge_chunks(id) ON DELETE SET NULL,
    section_name        VARCHAR(255),
    page_number         INTEGER,
    model_name          VARCHAR(50),
    prompt_version      VARCHAR(20),
    attempt_count       INTEGER DEFAULT 1,
    validation_metrics  JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_source_trace_question_id ON quiz_question_source_trace(question_id);
CREATE INDEX IF NOT EXISTS idx_source_trace_job_id ON quiz_question_source_trace(generation_job_id);
