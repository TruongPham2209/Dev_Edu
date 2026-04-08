package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {
    Page<CourseEntity> findByCategoryIdAndDeletedAtIsNull(UUID categoryId, Pageable pageable);

    Page<CourseEntity> findByCategoryIdAndDeletedAtIsNotNull(UUID categoryId, Pageable pageable);

    Page<CourseEntity> findByCategoryId(UUID categoryId, Pageable pageable);

    Page<CourseEntity> findByDeletedAtIsNull(Pageable pageable);

    Page<CourseEntity> findByDeletedAtIsNotNull(Pageable pageable);

    @Query(value = """
            SELECT  c
            FROM    CourseEntity c
            WHERE   c.id > :lastId
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    CourseEntity c
            """)
    Page<CourseEntity> findByCursor(UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  c
            FROM    CourseEntity c
            WHERE   c.id > :lastId
            AND    c.deletedAt IS NULL
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    CourseEntity c
            WHERE   c.deletedAt IS NULL
            """)
    Page<CourseEntity> findActiveCoursesByCursor(UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  c
            FROM    CourseEntity c
            WHERE   c.id > :lastId
            AND     c.deletedAt IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    CourseEntity c
            WHERE   c.deletedAt IS NOT NULL
            """)
    Page<CourseEntity> findDeletedCoursesByCursor(UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  c
            FROM    CourseEntity c
            WHERE   c.categoryId = :categoryId
            AND     c.id > :lastId
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    CourseEntity c
            WHERE   c.categoryId = :categoryId
            """)
    Page<CourseEntity> findByCategoryIdAndCursor(UUID categoryId, UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  c
            FROM    CourseEntity c
            WHERE   c.id > :lastId
            AND     c.categoryId = :categoryId
            AND     c.deletedAt IS NULL
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    CourseEntity c
            WHERE   c.categoryId = :categoryId
            AND     c.deletedAt IS NULL
            """)
    Page<CourseEntity> findActiveCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  c
            FROM    CourseEntity c
            WHERE   c.id > :lastId
            AND     c.categoryId = :categoryId
            AND     c.deletedAt IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    CourseEntity c
            WHERE   c.categoryId = :categoryId
            AND     c.deletedAt IS NOT NULL
            """)
    Page<CourseEntity> findDeletedCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, Pageable pageable);

    @Query(value = """
                    SELECT  *
                    FROM    course c
                    WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            """, nativeQuery = true)
    Page<CourseEntity> searchCourses(String keyword, Pageable pageable);

    @Query(value = """
                    SELECT  *
                    FROM    course c
                    WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
                    AND     c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchActiveCourses(String keyword, Pageable pageable);

    @Query(value = """
                    SELECT  *
                    FROM    course c
                    WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
                    AND     c.deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchDeletedCourses(String keyword, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.id > :lastId
            """, countQuery = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            """, nativeQuery = true)
    Page<CourseEntity> searchCoursesByCursor(String keyword, UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.id > :lastId
            AND     c.deleted_at IS NULL
            """, countQuery = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchActiveCoursesByCursor(String keyword, UUID lastId, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.id > :lastId
            AND     c.deleted_at IS NOT NULL
            """, countQuery = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchDeletedCoursesByCursor(String keyword, UUID lastId, Pageable pageable);
}
