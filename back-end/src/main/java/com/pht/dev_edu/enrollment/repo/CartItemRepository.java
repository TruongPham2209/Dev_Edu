package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.CourseDiscountProjection;
import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import com.pht.dev_edu.enrollment.entity.CartItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {
    @Modifying
    void deleteByUsernameAndItemTypeAndItemIdIn(String username, PurchaseEntityType itemType, List<UUID> itemId);

    @Query(value = """
                        SELECT  c.id                        AS courseId,
                                c.title                     AS courseTitle,
                                c.description               AS courseDescription,
                                c.price                     AS originalPrice,
                                c.thumbnail_url             AS courseThumbnailUrl,

                                ci.id                       AS id,
                                cd.discount_percentage      AS discountPercentage,
                                ci.added_at                 AS createdAt
                        FROM cart_item ci
                        LEFT JOIN course c
                            ON  c.id = ci.item_id
                            AND ci.item_type = 'COURSE'
                        LEFT JOIN course_discount cd
                            ON  cd.course_id    = c.id
                            AND cd.valid_from   <= NOW()
                            AND cd.valid_to     >= NOW()
                        WHERE   ci.username             = :studentUsername
                        AND     (ci.added_at, ci.id)    < (:lastUpdatedAt, :lastId)
                        AND     c.id                    IS NOT NULL
                        AND     c.deleted_at            IS NULL
            """, countQuery = """
                        SELECT COUNT(ci.id)
                        FROM cart_item ci
                        WHERE ci.username   = :studentUsername
                        AND   ci.item_type  = 'COURSE'
            """,
            nativeQuery = true)
    Page<CourseDiscountProjection> findCoursesInCartByStudentUsernameAndCursor(String studentUsername, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);

    @Modifying
    @Query(value = """
                INSERT INTO cart_item (id, username, item_type, item_id)
                VALUES (:id, :username, :itemType, :itemId)
                ON CONFLICT (username, item_type, item_id) DO NOTHING
            """, nativeQuery = true)
    void insertCartItemWithoutConstraintCheck(UUID id, String username, PurchaseEntityType itemType, UUID itemId);

    @Modifying
    @Query(value = """
            DELETE FROM cart_item ci
            WHERE EXISTS(
                SELECT 1
                FROM course c
                WHERE   ci.item_id = c.id
                AND     ci.item_type = 'COURSE'
                AND     c.deleted_at IS NOT NULL
            )
            """, nativeQuery = true)
    List<UUID> deleteInvalidCourseCartItems();
}