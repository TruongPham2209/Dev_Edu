package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.CourseDiscountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CourseDiscountRepository extends JpaRepository<CourseDiscountEntity, UUID> {
    // TODO: native query get all scheduled include all and specific course, order by createdAt desc, id desc with paging

    // TODO: native query get all scheduled by course id, order by createdAt desc, id desc
}