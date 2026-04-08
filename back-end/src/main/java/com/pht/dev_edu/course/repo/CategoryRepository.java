package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findAllByDeletedAtIsNull();

    List<CategoryEntity> findAllByDeletedAtIsNotNull();
}
