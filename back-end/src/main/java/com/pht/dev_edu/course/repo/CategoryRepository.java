package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findAllByDeletedAtIsNull();

    List<CategoryEntity> findAllByDeletedAtIsNotNull();

    @Modifying
    @Query(value = """
            DELETE FROM category
            WHERE   deleted_at  IS NOT NULL
            AND     deleted_at  < :cutoffTime
            RETURNING thumbnail_object_key
            """, nativeQuery = true)
    List<String> deleteCategoriesBeforeCutoffTimeThenReturnObjectKey(LocalDateTime cutoffTime);
}
