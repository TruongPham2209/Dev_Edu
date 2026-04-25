-- forum post
CREATE INDEX IF NOT EXISTS idx_forum_post_author
    ON "forum_post" (author);


-- forum post version
CREATE INDEX IF NOT EXISTS idx_post_version_cursor
	ON "forum_post_version" (updated_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_post_version_post_id_status
	ON "forum_post_version" (post_id, status, version_number DESC);


-- forum comment
CREATE INDEX idx_fc_post_root_cursor
    ON      forum_comment (post_id, created_at DESC, id DESC)
    WHERE   deleted_at IS NULL
    AND     root_comment_id IS NULL;

CREATE INDEX idx_fc_reply_cursor
    ON      forum_comment (root_comment_id, created_at DESC, id DESC)
    WHERE   deleted_at IS NULL;


-- saved post
CREATE INDEX IF NOT EXISTS idx_saved_post_username
    ON "saved_post" (username, saved_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_saved_post_username
    ON "saved_post" (post_id, username);