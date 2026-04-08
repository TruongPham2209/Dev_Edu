package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TrackingEvent;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtil;
import com.pht.dev_edu.course.dto.CoursePageRequest;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.entity.CourseEntity;
import com.pht.dev_edu.course.entity.CourseLecturerEntity;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.course.repo.EnrollmentRepository;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {
    CourseRepository courseRepository;
    CourseLecturerRepository courseLecturerRepository;
    EnrollmentRepository enrollmentRepository;

    FileService fileService;
    UserService userService;
    CategoryService categoryService;

    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public CourseResponse getCourseById(UUID courseId) {
        var courseEntity = getCourseEntityById(courseId);
        if (courseEntity == null) {
            log.error("Course with ID {} not found.", courseId);
            throw new DataNotFoundException("Course not found.");
        }

        return null;
    }

    @Override
    public CustomPaging<CourseResponse> getCourses(UUID categoryId, String keyword, CoursePageRequest req) {
        if (categoryId != null) {
            return getCoursesByCategory(categoryId, req);
        }

        if (keyword != null) {
            return searchCourses(keyword, req);
        }

        return getAllCourses(req);
    }

    private CustomPaging<CourseResponse> getAllCourses(CoursePageRequest pageRequest) {
        Page<CourseEntity> coursePage;
        if (pageRequest.getLastItemId() == null) {
            coursePage = switch (pageRequest.getStatus()) {
                case ACTIVE -> courseRepository.findByDeletedAtIsNull(pageRequest.toPageable());
                case DELETED -> courseRepository.findByDeletedAtIsNotNull(pageRequest.toPageable());
                case ALL -> courseRepository.findAll(pageRequest.toPageable());
            };
        } else {
            coursePage = switch (pageRequest.getStatus()) {
                case ACTIVE ->
                        courseRepository.findActiveCoursesByCursor(pageRequest.getLastItemId(), pageRequest.toPageable());
                case DELETED ->
                        courseRepository.findDeletedCoursesByCursor(pageRequest.getLastItemId(), pageRequest.toPageable());
                case ALL -> courseRepository.findByCursor(pageRequest.getLastItemId(), pageRequest.toPageable());
            };
        }

        var courseResponses = new CustomPaging<>(coursePage, c -> CourseResponse.builder().build());
        if (pageRequest.getLastItemId() == null) {
            courseResponses.setCurrentPage(pageRequest.getPage());
        }
        return courseResponses;
    }

    private CustomPaging<CourseResponse> getCoursesByCategory(UUID categoryId, CoursePageRequest pageRequest) {
        Page<CourseEntity> coursePage;
        if (pageRequest.getLastItemId() == null) {
            coursePage = switch (pageRequest.getStatus()) {
                case ACTIVE ->
                        courseRepository.findByCategoryIdAndDeletedAtIsNull(categoryId, pageRequest.toPageable());
                case DELETED ->
                        courseRepository.findByCategoryIdAndDeletedAtIsNotNull(categoryId, pageRequest.toPageable());
                case ALL -> courseRepository.findByCategoryId(categoryId, pageRequest.toPageable());
            };
        } else {
            coursePage = switch (pageRequest.getStatus()) {
                case ACTIVE ->
                        courseRepository.findActiveCoursesByCategoryIdAndCursor(categoryId, pageRequest.getLastItemId(), pageRequest.toPageable());
                case DELETED ->
                        courseRepository.findDeletedCoursesByCategoryIdAndCursor(categoryId, pageRequest.getLastItemId(), pageRequest.toPageable());
                case ALL ->
                        courseRepository.findByCategoryIdAndCursor(categoryId, pageRequest.getLastItemId(), pageRequest.toPageable());
            };
        }

        var courseResponses = new CustomPaging<>(coursePage, c -> CourseResponse.builder().build());
        if (pageRequest.getLastItemId() == null) {
            courseResponses.setCurrentPage(pageRequest.getPage());
        }
        return courseResponses;
    }

    private CustomPaging<CourseResponse> searchCourses(String keyword, CoursePageRequest pageRequest) {
        Page<CourseEntity> coursePage;
        if (pageRequest.getLastItemId() == null) {
            coursePage = switch (pageRequest.getStatus()) {
                case ACTIVE -> courseRepository.searchActiveCourses(keyword, pageRequest.toPageable());
                case DELETED -> courseRepository.searchDeletedCourses(keyword, pageRequest.toPageable());
                case ALL -> courseRepository.searchCourses(keyword, pageRequest.toPageable());
            };
        } else {
            coursePage = switch (pageRequest.getStatus()) {
                case ACTIVE ->
                        courseRepository.searchActiveCoursesByCursor(keyword, pageRequest.getLastItemId(), pageRequest.toPageable());
                case DELETED ->
                        courseRepository.searchDeletedCoursesByCursor(keyword, pageRequest.getLastItemId(), pageRequest.toPageable());
                case ALL ->
                        courseRepository.searchCoursesByCursor(keyword, pageRequest.getLastItemId(), pageRequest.toPageable());
            };
        }

        var courseResponses = new CustomPaging<>(coursePage, c -> CourseResponse.builder().build());
        if (pageRequest.getLastItemId() == null) {
            courseResponses.setCurrentPage(pageRequest.getPage());
        }
        return courseResponses;
    }

    @Override
    @Transactional
    public CourseResponse createCourse(String author, CourseRequest course) {
        if (getCourseEntityById(course.getId()) != null) {
            log.error("Course with ID {} already exists.", course.getId());
            throw new BadRequestException("Course already exists.");
        }

        if (categoryService.getCategoryById(course.getCategoryId()) == null) {
            log.error("Category with ID {} not found.", course.getCategoryId());
            throw new DataNotFoundException("Category not found.");
        }

        // Convert course here
        var thumbnailUrl = getThumbnailUrl(author, course.getThumbnailObjectKey());

        // Convert here and save here
        var courseLecturers = course.getLecturerUsernames().stream()
                .map(lecturerUsername -> CourseLecturerEntity.builder()
                        .id(
                                CourseLecturerId.builder()
                                        .courseId(course.getId())
                                        .lecturerUsername(lecturerUsername)
                                        .build()
                        )
                        .build()
                )
                .toList();
        courseLecturerRepository.saveAll(courseLecturers);

        return null;
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(String author, CourseRequest course) {
        var existingCourse = getCourseEntityById(course.getId());
        if (existingCourse == null || existingCourse.getDeletedAt() != null) {
            log.error("Course with ID {} not found or already deleted.", course.getId());
            throw new DataNotFoundException("Course not found.");
        }

        if (categoryService.getCategoryById(course.getCategoryId()) == null) {
            log.error("Category with ID {} not found.", course.getCategoryId());
            throw new DataNotFoundException("Category not found.");
        }

        // Convert here
        String thumbnailUrl = getThumbnailUrl(author, course.getThumbnailObjectKey());
        existingCourse.setThumbnailUrl(thumbnailUrl);
        courseRepository.save(existingCourse);

        courseLecturerRepository.deleteByIdCourseId(course.getId());

        var courseLecturers = course.getLecturerUsernames().stream()
                .map(lecturerUsername -> CourseLecturerEntity.builder()
                        .id(
                                CourseLecturerId.builder()
                                        .courseId(course.getId())
                                        .lecturerUsername(lecturerUsername)
                                        .build()
                        )
                        .build()
                )
                .toList();
        courseLecturerRepository.saveAll(courseLecturers);
        RedisUtil.invalidateCache(RedisPrefixConstant.COURSE_PREFIX + course.getId());

        var tracking = TrackingEvent.builder()
                .username(author)
                .aggregateId(existingCourse.getId())
                .action(EventTrackingConstant.COURSE_UPDATED)
                .details("Course updated with id: " + existingCourse.getId())
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);

        return null;
    }

    @Override
    @Transactional
    public void deleteCourse(String actor, UUID courseId) {
        var existingCourse = getCourseEntityById(courseId);
        if (existingCourse == null || existingCourse.getDeletedAt() != null) {
            log.error("Course with ID {} not found or already deleted.", courseId);
            throw new DataNotFoundException("Course not found.");
        }

        if (enrollmentRepository.existsByCourseId(courseId)) {
            log.error("Cannot delete course with ID {} because it has enrollments.", courseId);
            throw new BadRequestException("Cannot delete course with enrollments.");
        }

        var tracking = TrackingEvent.builder()
                .username(actor)
                .aggregateId(existingCourse.getId())
                .action(EventTrackingConstant.COURSE_DELETED)
                .details("Course deleted with id: " + existingCourse.getId())
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);

        existingCourse.setDeletedAt(LocalDateTime.now());
        courseRepository.save(existingCourse);
        RedisUtil.invalidateCache(RedisPrefixConstant.COURSE_PREFIX + courseId);
    }

    @Override
    public List<String> getLecturersForCourse(UUID courseId) {
        return courseLecturerRepository.findAllByIdCourseId(courseId).stream()
                .map(cl -> cl.getId().getLecturerUsername())
                .toList();
    }

    private CourseEntity getCourseEntityById(UUID courseId) {
        String cachedKey = RedisPrefixConstant.COURSE_PREFIX + courseId;
        return RedisUtil.getDataFromCacheOrDb(
                cachedKey,
                CourseEntity.class,
                () -> courseRepository.findById(courseId),
                RedisDurationConstant.COURSE_DATA_DURATION
        );
    }

    private String getThumbnailUrl(String author, String thumbnailObjectKey) {
        var thumbnailInfo = fileService.getFileInfo(author, thumbnailObjectKey);
        if (!StringUtils.hasText(thumbnailInfo.getPublicUrl())) {
            var deleteFileEvent = FileDeleteEvent.builder()
                    .fullObjectKey(thumbnailObjectKey)
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.FILE_DELETE_TOPIC, deleteFileEvent);

            log.error("Thumbnail with object key {} does not have a public URL", thumbnailObjectKey);
            throw new BadRequestException("Thumbnail is not accessible.");
        }
        return thumbnailInfo.getPublicUrl();
    }
}
