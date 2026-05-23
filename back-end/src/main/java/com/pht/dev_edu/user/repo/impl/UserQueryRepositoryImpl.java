package com.pht.dev_edu.user.repo.impl;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.user.dto.UserInfoProjection;
import com.pht.dev_edu.user.repo.UserQueryRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserQueryRepositoryImpl implements UserQueryRepository {
    NamedParameterJdbcTemplate jdbcTemplate;

    @Override
    public Page<UserInfoProjection> searchUsers(String keyword, RoleEnum role, Pageable pageable) {
        boolean hasKeyword = StringUtils.hasText(keyword);

        String cteQuery = buildCTEQuery(hasKeyword);
        String selectQuery = selectQuery(role);

        String joinQuery = """
                    FROM user_role ur
                    JOIN "role" r
                        ON ur.role_id = r.id
                    JOIN filtered_users u
                        ON ur.user_id = u.id
                    WHERE r.name = :role
                """;
        String offsetQuery = """
                    ORDER BY u.id DESC
                    LIMIT :limit OFFSET :offset
                """;

        String contentQuery = """
                    %s
                    %s
                    %s
                    %s
                """.formatted(
                cteQuery,
                selectQuery,
                joinQuery,
                offsetQuery
        );

        String countQuery = """
                    %s
                    SELECT COUNT(*)
                    %s
                """.formatted(
                cteQuery,
                joinQuery
        );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("role", role.name())
                .addValue("limit", pageable.getPageSize())
                .addValue("offset", pageable.getOffset());

        if (hasKeyword) {
            params.addValue("keyword", keyword.trim());
        }

        List<UserInfoProjection> content = jdbcTemplate.query(
                contentQuery,
                params,
                userInfoRowMapper()
        );

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

    private String selectQuery(RoleEnum role) {
        String courseCountQuery = switch (role) {
            case ADMIN -> "0 AS courseCount";
            case STUDENT -> """
                        (
                            SELECT COUNT(id)
                            FROM enrollment e
                            WHERE   e.student_username  = u.username
                        ) AS courseCount
                    """;
            case LECTURER -> """
                        (
                            SELECT COUNT(course_id)
                            FROM course_lecturer cl
                            WHERE   cl.lecturer_username  = u.username
                        ) AS courseCount
                    """;
        };
        String baseJoinQuery = """
                    SELECT  u.id            AS id,
                            u.username      AS username,
                            u.full_name     AS fullName,
                            u.email         AS email,
                            u.avatar_url    AS avatarUrl,
                            %s,
                            (
                                SELECT COUNT(id)
                                FROM forum_post p
                                WHERE   p.author        = u.username
                                AND     p.deleted_at    IS NULL
                            )               AS postedPosts
                """;

        return baseJoinQuery.formatted(courseCountQuery);
    }

    private String buildCTEQuery(boolean hasKeyword) {
        if (hasKeyword) {
            return """
                        WITH filtered_users AS (
                            SELECT DISTINCT ON (id) *
                            FROM (
                                SELECT  id,
                                        username,
                                        full_name,
                                        avatar_url,
                                        email
                                FROM "user"
                                WHERE immutable_unaccent(username) ILIKE immutable_unaccent(CONCAT('%', :keyword, '%'))
                    
                                UNION ALL
                    
                                SELECT  id,
                                        username,
                                        full_name,
                                        avatar_url,
                                        email
                                FROM "user"
                                WHERE immutable_unaccent(full_name) ILIKE immutable_unaccent(CONCAT('%', :keyword, '%'))
                            )
                            ORDER BY id DESC
                        )
                    """;
        } else {
            return """
                        WITH filtered_users AS (
                            SELECT  id,
                                    username,
                                    full_name,
                                    avatar_url,
                                    email
                            FROM "user"
                        )
                    """;
        }
    }

    private RowMapper<UserInfoProjection> userInfoRowMapper() {
        return (rs, rowNum) -> new UserInfoProjection(
                rs.getObject("id", UUID.class),
                rs.getString("username"),
                rs.getString("fullName"),
                rs.getString("avatarUrl"),
                rs.getString("email"),
                rs.getInt("courseCount"),
                rs.getInt("postedPosts")
        );
    }
}
