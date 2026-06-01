package com.pht.dev_edu.forum.repo.impl;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.forum.dto.PostInfoProjection;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.repo.PostQueryRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostQueryRepositoryImpl implements PostQueryRepository {
    NamedParameterJdbcTemplate jdbcTemplate;

    @Override
    public Page<PostInfoProjection> getPostedPosts(String username, PostStatus status, LocalDateTime lastUpdatedAt, UUID lastId, int limit) {
        String whereStatus = switch (status) {
            case PENDING -> "AND pv.status = 'PENDING'";
            case REJECTED, SUPERSEDED -> "AND pv.status IN ('REJECTED', 'SUPERSEDED')";
            default -> throw new BadRequestException("Invalid post status: " + status);
        };
        String postedPostCTE = """
                    WITH ranked AS (
                        SELECT  pv.*,
                                ROW_NUMBER() OVER (
                                    PARTITION BY pv.post_id
                                    ORDER BY pv.version_number DESC
                                )           AS rn,
                                p.author    AS author
                        FROM forum_post_version pv
                        LEFT JOIN forum_post p
                            ON  p.id            = pv.post_id
                        WHERE   p.author        = :username
                        %s
                        AND     p.deleted_at    IS NULL
                    )
                """.formatted(whereStatus);

        String selectClause = """
                    SELECT  pv.id                       AS id,
                            pv.title                    AS title,
                            pv.short_description        AS shortDescription,
                            pv.content                  AS content,
                            pv.thumb_url                AS thumbUrl,
                            pv.status                   AS status,
                            0                           AS views,
                            0                           AS comments,
                            pv.created_at               AS createdAt,
                            pv.updated_at               AS updatedAt,
                            u.username                  AS authorUsername,
                            u.full_name                 AS authorFullName,
                            u.avatar_url                AS authorAvatarUrl
                """;

        String joinQuery = """
                    FROM ranked pv
                    LEFT JOIN "user" u
                        ON pv.author = u.username
                    WHERE   pv.rn = 1
                    AND     (pv.updated_at, pv.id)    < (:lastUpdatedAt, :lastId)
                    ORDER BY pv.updated_at DESC, pv.id DESC
                    LIMIT :limit
                """;

        String contentQuery = """
                    %s
                    %s
                    %s
                """.formatted(
                postedPostCTE,
                selectClause,
                joinQuery
        );

        String countQuery = """
                    %s
                    SELECT COUNT(*)
                    FROM ranked
                    WHERE rn = 1
                """.formatted(postedPostCTE);

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("username", username)
                .addValue("lastUpdatedAt", lastUpdatedAt)
                .addValue("lastId", lastId)
                .addValue("limit", limit);

        List<PostInfoProjection> content = jdbcTemplate.query(
                contentQuery,
                params,
                postInfoRowMapper()
        );

        var pageable = PageRequest.of(0, limit);
        Long total = jdbcTemplate.queryForObject(
                countQuery,
                params,
                Long.class
        );

        return new PageImpl<>(
                content,
                pageable,
                total == null ? 0 : total
        );
    }

    private RowMapper<PostInfoProjection> postInfoRowMapper() {
        return (rs, rowNum) -> new PostInfoProjection(
                UUID.fromString(rs.getString("id")),
                rs.getString("authorUsername"),
                rs.getString("authorFullName"),
                rs.getString("authorAvatarUrl"),
                rs.getString("thumbUrl"),
                rs.getString("title"),
                rs.getString("shortDescription"),
                rs.getString("content"),
                rs.getInt("views"),
                rs.getInt("comments"),
                PostStatus.valueOf(rs.getString("status")),
                rs.getTimestamp("updatedAt").toLocalDateTime(),
                rs.getTimestamp("createdAt").toLocalDateTime()
        );
    }
}
