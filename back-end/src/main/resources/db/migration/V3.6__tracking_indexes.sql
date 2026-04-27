-- submission tracking
CREATE INDEX IF NOT EXISTS idx_tracking_assignment_id_actor_updated_at
    ON "submission_tracking" (assignment_id, actor, updated_at DESC);


-- cronjob log
CREATE INDEX IF NOT EXISTS idx_log_cronjob_name_started_at
    ON "log_cronjob" (name, started_at DESC);


-- log tracking
CREATE INDEX IF NOT EXISTS idx_log_tracking_action_created_at
    ON "log_tracking" (action, created_at DESC);


-- request log
CREATE INDEX IF NOT EXISTS idx_log_request_username_timestamp
    ON "log_request" (username, timestamp DESC);