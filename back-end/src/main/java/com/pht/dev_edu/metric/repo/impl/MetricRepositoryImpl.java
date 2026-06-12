package com.pht.dev_edu.metric.repo.impl;

import com.pht.dev_edu.metric.dto.*;
import com.pht.dev_edu.metric.repo.MetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class MetricRepositoryImpl implements MetricRepository {
    NamedParameterJdbcTemplate jdbcTemplate;

    @Override
    public long countTotalUsers() {
        String sql = "SELECT COUNT(*) FROM \"user\"";
        Long result = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public long countTotalCourses() {
        String sql = "SELECT COUNT(*) FROM course WHERE deleted_at IS NULL";
        Long result = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public long countTotalLectures() {
        String sql = "SELECT COUNT(*) FROM lecture WHERE deleted_at IS NULL";
        Long result = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public long countTotalAssignments() {
        String sql = "SELECT COUNT(*) FROM assignment WHERE deleted_at IS NULL";
        Long result = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public long countTotalEnrollments() {
        String sql = "SELECT COUNT(*) FROM enrollment";
        Long result = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public BigDecimal calculateTotalRevenue() {
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM payment_history WHERE status = 'COMPLETED'";
        BigDecimal result = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), BigDecimal.class);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public double calculateCourseCompletionRate() {
        String sql = """
            WITH course_lecture_count AS (
                SELECT course_id, COUNT(*) as total_lectures
                FROM lecture
                WHERE deleted_at IS NULL
                GROUP BY course_id
            ),
            student_lecture_progress AS (
                SELECT l.course_id, lp.student, COUNT(*) as completed_lectures
                FROM lecture_progress lp
                JOIN lecture l ON lp.lecture_id = l.id
                WHERE l.deleted_at IS NULL
                GROUP BY l.course_id, lp.student
            ),
            enrollment_status AS (
                SELECT 
                    e.course_id, 
                    e.student_username,
                    COALESCE(clc.total_lectures, 0) as total_lectures,
                    COALESCE(slp.completed_lectures, 0) as completed_lectures
                FROM enrollment e
                LEFT JOIN course_lecture_count clc ON e.course_id = clc.course_id
                LEFT JOIN student_lecture_progress slp ON e.course_id = slp.course_id AND e.student_username = slp.student
            )
            SELECT 
                COUNT(*) as total_enrollments,
                SUM(CASE WHEN total_lectures > 0 AND completed_lectures >= total_lectures THEN 1 ELSE 0 END) as completed_enrollments
            FROM enrollment_status
        """;

        return jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), (rs, rowNum) -> {
            long total = rs.getLong("total_enrollments");
            long completed = rs.getLong("completed_enrollments");
            if (total == 0) return 0.0;
            return (double) completed / total * 100.0;
        });
    }

    @Override
    public List<GrowthDataDto> getUserGrowth(GrowthPeriod period, LocalDateTime since) {
        String truncUnit = getTruncUnit(period);
        String sql = String.format("""
            SELECT DATE_TRUNC('%s', created_at) as date_grp, COUNT(*) as count
            FROM "user"
            WHERE created_at >= :since
            GROUP BY date_grp
            ORDER BY date_grp ASC
        """, truncUnit);
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("since", since);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> GrowthDataDto.builder()
                .date(rs.getTimestamp("date_grp").toLocalDateTime().toLocalDate())
                .count(rs.getLong("count"))
                .build());
    }

    @Override
    public List<GrowthDataDto> getCourseGrowth(GrowthPeriod period, LocalDateTime since) {
        String truncUnit = getTruncUnit(period);
        String sql = String.format("""
            SELECT DATE_TRUNC('%s', created_at) as date_grp, COUNT(*) as count
            FROM course
            WHERE deleted_at IS NULL AND created_at >= :since
            GROUP BY date_grp
            ORDER BY date_grp ASC
        """, truncUnit);
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("since", since);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> GrowthDataDto.builder()
                .date(rs.getTimestamp("date_grp").toLocalDateTime().toLocalDate())
                .count(rs.getLong("count"))
                .build());
    }

    @Override
    public List<RevenueGrowthDto> getRevenueGrowth(GrowthPeriod period, LocalDateTime since) {
        String truncUnit = getTruncUnit(period);
        String sql = String.format("""
            SELECT DATE_TRUNC('%s', payment_time) as date_grp, SUM(amount) as amount
            FROM payment_history
            WHERE status = 'COMPLETED' AND payment_time >= :since
            GROUP BY date_grp
            ORDER BY date_grp ASC
        """, truncUnit);
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("since", since);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> RevenueGrowthDto.builder()
                .date(rs.getTimestamp("date_grp").toLocalDateTime().toLocalDate())
                .amount(rs.getBigDecimal("amount"))
                .build());
    }

    @Override
    public long countDailyActiveUsers(LocalDateTime since) {
        String sql = "SELECT COUNT(DISTINCT username) FROM log_request WHERE timestamp >= :since";
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("since", since);
        Long result = jdbcTemplate.queryForObject(sql, params, Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public long countTotalRequests(LocalDateTime since) {
        String sql = "SELECT COUNT(*) FROM log_request WHERE timestamp >= :since";
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("since", since);
        Long result = jdbcTemplate.queryForObject(sql, params, Long.class);
        return result != null ? result : 0L;
    }

    @Override
    public List<RecentActivityDto> getRecentActivities(int limit) {
        String sql = """
            SELECT username, action, details, created_at
            FROM log_tracking
            ORDER BY created_at DESC
            LIMIT :limit
        """;
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> RecentActivityDto.builder()
                .username(rs.getString("username"))
                .action(rs.getString("action"))
                .details(rs.getString("details"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .build());
    }

    @Override
    public Map<String, Long> getActionDistribution(LocalDateTime since) {
        String sql = """
            SELECT action, COUNT(*) as count
            FROM log_tracking
            WHERE created_at >= :since
            GROUP BY action
        """;
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("since", since);
        Map<String, Long> distribution = new HashMap<>();
        jdbcTemplate.query(sql, params, rs -> {
            distribution.put(rs.getString("action"), rs.getLong("count"));
        });
        return distribution;
    }

    @Override
    public List<TopCourseDto> getTopCourses(int limit) {
        String sql = """
            SELECT 
                c.id, 
                c.title, 
                c.price, 
                c.created_by,
                c.created_at,
                (SELECT COUNT(*) FROM enrollment e WHERE e.course_id = c.id) as enrollment_count,
                (SELECT COALESCE(AVG(cr.rating), 0.0) FROM course_review cr WHERE cr.course_id = c.id) as average_rating,
                (SELECT COUNT(*) FROM course_review cr WHERE cr.course_id = c.id) as review_count,
                (SELECT COALESCE(SUM(oi.discounted_price), 0.0) FROM order_item oi JOIN "order" o ON oi.order_id = o.id WHERE oi.item_id = c.id AND oi.item_type = 'course' AND o.status = 'COMPLETED') as total_revenue
            FROM course c
            WHERE c.deleted_at IS NULL
            ORDER BY enrollment_count DESC, total_revenue DESC
            LIMIT :limit
        """;
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> TopCourseDto.builder()
                .id(rs.getObject("id", UUID.class))
                .title(rs.getString("title"))
                .price(rs.getBigDecimal("price"))
                .createdBy(rs.getString("created_by"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .enrollmentCount(rs.getLong("enrollment_count"))
                .averageRating(rs.getDouble("average_rating"))
                .reviewCount(rs.getLong("review_count"))
                .totalRevenue(rs.getBigDecimal("total_revenue"))
                .build());
    }

    @Override
    public List<TopStudentDto> getTopStudents(int limit) {
        String sql = """
            SELECT 
                u.username,
                u.full_name,
                u.email,
                (SELECT COUNT(*) FROM enrollment e WHERE e.student_username = u.username) as enrollment_count,
                (SELECT COALESCE(SUM(o.total_amount), 0.0) FROM "order" o WHERE o.username = u.username AND o.status = 'COMPLETED') as total_spent
            FROM "user" u
            ORDER BY enrollment_count DESC, total_spent DESC
            LIMIT :limit
        """;
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> TopStudentDto.builder()
                .username(rs.getString("username"))
                .fullName(rs.getString("full_name"))
                .email(rs.getString("email"))
                .enrollmentCount(rs.getLong("enrollment_count"))
                .totalSpent(rs.getBigDecimal("total_spent"))
                .build());
    }

    @Override
    public List<TopContributorDto> getTopContributors(int limit) {
        String sql = """
            SELECT 
                u.username,
                u.full_name,
                (SELECT COUNT(*) FROM forum_post fp WHERE fp.author = u.username AND fp.deleted_at IS NULL) as post_count,
                (SELECT COUNT(*) FROM forum_comment fc WHERE fc.author = u.username AND fc.deleted_at IS NULL) as comment_count
            FROM "user" u
            ORDER BY post_count DESC, comment_count DESC
            LIMIT :limit
        """;
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("limit", limit);
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> TopContributorDto.builder()
                .username(rs.getString("username"))
                .fullName(rs.getString("full_name"))
                .postCount(rs.getLong("post_count"))
                .commentCount(rs.getLong("comment_count"))
                .build());
    }

    private String getTruncUnit(GrowthPeriod period) {
        return switch (period) {
            case DAILY -> "day";
            case WEEKLY -> "week";
            case MONTHLY -> "month";
            case YEARLY -> "year";
        };
    }
}
