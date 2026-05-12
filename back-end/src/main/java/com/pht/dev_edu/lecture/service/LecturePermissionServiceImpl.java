package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.security.AccessDeniedException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.course.service.CourseService;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LecturePermissionServiceImpl implements LecturePermissionService {
    LectureRepository lectureRepository;
    CourseLecturerRepository courseLecturerRepository;
    EnrollmentRepository enrollmentRepository;
    CourseService courseService;

    @Override
    public void checkViewPermissionByLecture(Set<String> authorities, String actor, UUID lectureId) {
        var lecture = getLectureById(lectureId);
        if (authorities.contains(RoleEnum.ADMIN.name())) {
            return;
        }

        if (authorities.contains(RoleEnum.LECTURER.name())) {
            canAccessCourseByLecturer(actor, lecture.getCourseId());
            return;
        }

        canAccessCourseByStudent(actor, lecture.getCourseId());
    }

    @Override
    public void checkModifyPermissionByLecture(Set<String> authorities, String actor, UUID lectureId) {
        var lecture = getLectureById(lectureId);
        if (authorities.contains(RoleEnum.ADMIN.name())) {
            return;
        }

        if (!authorities.contains(RoleEnum.LECTURER.name())) {
            throw new AccessDeniedException("Only lecturers can modify lectures");
        }

        canAccessCourseByLecturer(actor, lecture.getCourseId());
    }

    @Override
    public void checkModifyPermissionByCourse(Set<String> authorities, String actor, UUID courseId) {
        var course = courseService.getCourseById(courseId);
        if (course == null) {
            log.error("Course with id {} not found", courseId);
            throw new DataNotFoundException("Course not found");
        }

        if (authorities.contains(RoleEnum.ADMIN.name())) {
            return;
        }

        if (!authorities.contains(RoleEnum.LECTURER.name())) {
            throw new AccessDeniedException("Only lecturers can modify courses");
        }

        canAccessCourseByLecturer(actor, course.getId());
    }

    private void canAccessCourseByLecturer(String lecturer, UUID courseId) {
        CourseLecturerId courseLecturerId = CourseLecturerId.builder()
                .courseId(courseId)
                .lecturerUsername(lecturer)
                .build();
        if (!courseLecturerRepository.existsById(courseLecturerId)) {
            throw new AccessDeniedException("Course not found");
        }
    }

    private void canAccessCourseByStudent(String student, UUID courseId) {
        if (!enrollmentRepository.existsByStudentUsernameAndCourseId(student, courseId)) {
            throw new AccessDeniedException("Course not found");
        }
    }

    private LectureEntity getLectureById(UUID lectureId) {
        var lecture = RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_PREFIX + lectureId,
                LectureEntity.class,
                () -> lectureRepository.findById(lectureId),
                RedisDurationConstant.LECTURE_DATA_DURATION
        );

        if (lecture == null) {
            log.error("Lecture with id {} not found", lectureId);
            throw new DataNotFoundException("Lecture not found");
        }

        if (lecture.getDeletedAt() != null) {
            log.warn("Lecture with id {} is deleted and cannot be accessed", lectureId);
            throw new DataNotFoundException("Lecture not found");
        }
        return lecture;
    }
}
