CREATE INDEX idx_user_username_unaccent
    ON      "user"
    USING   gin (immutable_unaccent("user".username) gin_trgm_ops);

CREATE INDEX idx_user_full_name_unaccent
    ON      "user"
    USING   gin (immutable_unaccent("user".full_name) gin_trgm_ops);