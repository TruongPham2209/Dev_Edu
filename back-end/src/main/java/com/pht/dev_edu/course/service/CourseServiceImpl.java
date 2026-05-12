package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.*;
import com.pht.dev_edu.course.dto.CourseDetailProjection;
import com.pht.dev_edu.course.dto.CoursePageRequest;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.entity.CourseEntity;
import com.pht.dev_edu.course.entity.CourseLecturerEntity;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import com.pht.dev_edu.course.mapper.CourseMapper;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.enrollment.repo.CourseDiscountRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {
    CourseRepository courseRepository;
    CourseLecturerRepository courseLecturerRepository;
    EnrollmentRepository enrollmentRepository;
    UserRepository userRepository;
    CourseDiscountRepository courseDiscountRepository;

    FileService fileService;
    CategoryService categoryService;

    CourseMapper courseMapper;
    Executor executor;

    @Override
    public CourseResponse getCourseDetails(UUID courseId) {
        var courseDetail = courseRepository.findCourseDetail(courseId);
        if (courseDetail == null) {
            throw new DataNotFoundException("Course not found");
        }

        var globalDiscount = getGlobalDiscountPercentage();
        var res = convertProjectionToRes(courseDetail, globalDiscount);

        var lecturers = courseLecturerRepository.findAllByIdCourseId(courseId).stream()
                .map(cl -> cl.getId().getLecturerUsername())
                .toList();
        res.setLecturers(lecturers);

        return res;
    }

    @Override
    public CourseResponse getCourseById(UUID courseId) {
        var courseEntity = getCourseEntityById(courseId);
        if (courseEntity == null) {
            log.error("Course with ID {} not found.", courseId);
            throw new DataNotFoundException("Course not found.");
        }

        if (courseEntity.getDeletedAt() != null) {
            log.warn("Course with ID {} is deleted.", courseId);
            throw new DataNotFoundException("Course not found.");
        }

        return courseMapper.entityToRes(courseEntity);
    }

    @Override
    public CustomPaging<CourseResponse> getCourses(UUID categoryId, String keyword, CoursePageRequest req) {
        Function<TimeStampCursor, Page<CourseDetailProjection>> queryFn;
        if (categoryId != null) {
            queryFn = cursor -> switch (req.getStatus()) {
                case ACTIVE ->
                        courseRepository.findActiveCoursesByCategoryIdAndCursor(categoryId, cursor.getId(), cursor.getTimeStamp(), req.toPageable());
                case DELETED ->
                        courseRepository.findDeletedCoursesByCategoryIdAndCursor(categoryId, cursor.getId(), cursor.getTimeStamp(), req.toPageable());
                case ALL ->
                        courseRepository.findByCategoryIdAndCursor(categoryId, cursor.getId(), cursor.getTimeStamp(), req.toPageable());
            };
        } else if (keyword != null) {
            queryFn = cursor -> switch (req.getStatus()) {
                case ACTIVE ->
                        courseRepository.searchActiveCoursesByCursor(keyword, cursor.getId(), cursor.getTimeStamp(), req.toPageable());
                case DELETED ->
                        courseRepository.searchDeletedCoursesByCursor(keyword, cursor.getId(), cursor.getTimeStamp(), req.toPageable());
                case ALL ->
                        courseRepository.searchCoursesByCursor(keyword, cursor.getId(), cursor.getTimeStamp(), req.toPageable());
            };
        } else {
            queryFn = cursor -> switch (req.getStatus()) {
                case ACTIVE ->
                        courseRepository.findActiveCoursesByCursor(cursor.getId(), cursor.getTimeStamp(), req.toPageable());
                case DELETED ->
                        courseRepository.findDeletedCoursesByCursor(cursor.getId(), cursor.getTimeStamp(), req.toPageable());
                case ALL -> courseRepository.findByCursor(cursor.getId(), cursor.getTimeStamp(), req.toPageable());
            };
        }


        return executeCoursePaging(req, queryFn);
    }

    private CustomPaging<CourseResponse> executeCoursePaging(
            CoursePageRequest pageRequest,
            Function<TimeStampCursor, Page<CourseDetailProjection>> queryFn
    ) {
        var cursor = resolveCursor(pageRequest.getNextCursor());
        var coursePage = queryFn.apply(cursor);

        var globalDiscount = getGlobalDiscountPercentage();

        var pageResult = PagingUtils.getPagedWithCursor(
                coursePage,
                c -> convertProjectionToRes(c, globalDiscount),
                CourseDetailProjection::getCreatedAt,
                CourseDetailProjection::getId
        );

        if (StringUtils.hasText(pageRequest.getNextCursor())) {
            pageResult.setCurrentPage(pageRequest.getPage());
        }

        return pageResult;
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
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

        validateLecturerUsername(course.getLecturerUsernames());

        // Convert course here
        var courseEntity = courseMapper.reqToEntity(course);
        var thumbnailUrl = getThumbnailUrl(author, course.getThumbnailObjectKey());
        courseEntity.setThumbnailUrl(thumbnailUrl);
        courseEntity.setCreatedBy(author);
        courseRepository.save(courseEntity);

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

        return courseMapper.entityToRes(courseEntity);
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

        validateLecturerUsername(course.getLecturerUsernames());

        var updatedCourse = courseMapper.reqToEntity(course);
        boolean isNewThumbnail = existingCourse.getThumbnailObjectKey().equals(course.getThumbnailObjectKey());
        String thumbnailUrl = isNewThumbnail
                ? existingCourse.getThumbnailUrl()
                : getThumbnailUrl(author, course.getThumbnailObjectKey());
        updatedCourse.setThumbnailUrl(thumbnailUrl);
        updatedCourse.setCreatedBy(existingCourse.getCreatedBy());
        courseRepository.save(updatedCourse);

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
        RedisUtils.invalidateCache(RedisPrefixConstant.COURSE_PREFIX + course.getId());

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .username(author)
                    .aggregateId(existingCourse.getId())
                    .action(EventTrackingConstant.COURSE_UPDATED)
                    .details("Course updated with id: " + existingCourse.getId())
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);

        RedisUtils.invalidateCache(RedisPrefixConstant.COURSE_PREFIX + course.getId());

        var updatedCourses = courseMapper.entityToRes(updatedCourse);
        updatedCourses.setLecturers(course.getLecturerUsernames());

        return updatedCourses;
    }

    @Override
    @Transactional
    public void deleteCourse(String actor, UUID courseId) {
        var existingCourse = getCourseEntityById(courseId);
        if (existingCourse == null) {
            log.error("Course with ID {} not found.", courseId);
            throw new DataNotFoundException("Course not found.");
        }

        if (existingCourse.getDeletedAt() != null) {
            log.warn("Course with ID {} is already deleted.", courseId);
            return;
        }

        if (enrollmentRepository.existsByCourseId(courseId)) {
            log.error("Cannot delete course with ID {} because it has enrollments.", courseId);
            throw new BadRequestException("Cannot delete course with enrollments.");
        }

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .username(actor)
                    .aggregateId(existingCourse.getId())
                    .action(EventTrackingConstant.COURSE_DELETED)
                    .details("Course deleted with id: " + existingCourse.getId())
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);

        existingCourse.setDeletedAt(LocalDateTime.now());
        courseRepository.save(existingCourse);
        RedisUtils.invalidateCache(RedisPrefixConstant.COURSE_PREFIX + courseId);
    }

    private CourseEntity getCourseEntityById(UUID courseId) {
        String cachedKey = RedisPrefixConstant.COURSE_PREFIX + courseId;
        return RedisUtils.getOptionalDataFromCacheOrDb(
                cachedKey,
                CourseEntity.class,
                () -> courseRepository.findById(courseId),
                RedisDurationConstant.COURSE_DATA_DURATION
        );
    }

    private String getThumbnailUrl(String author, String thumbnailObjectKey) {
        var thumbnailInfo = fileService.getFileInfo(author, thumbnailObjectKey);
        boolean isImage = FileContentTypeUtils.isValidContentType(thumbnailInfo.getContentType(), FileContentTypeUtils.FileType.IMAGE);
        if (!StringUtils.hasText(thumbnailInfo.getPublicUrl()) || !isImage) {
            KafkaUtils.sendDeleteFileEvent(thumbnailObjectKey);
            log.error("Thumbnail with object key {} does not have a public URL", thumbnailObjectKey);
            throw new BadRequestException("Thumbnail is not accessible.");
        }
        return thumbnailInfo.getPublicUrl();
    }

    private void validateLecturerUsername(List<String> lecturerUsernames) {
        var totalValidLecturer = userRepository.countByUsernamesAndRole(lecturerUsernames, RoleEnum.LECTURER.name());
        if (totalValidLecturer != lecturerUsernames.size()) {
            log.error("One or more lecturer usernames are invalid: {}", lecturerUsernames);
            throw new BadRequestException("One or more lecturer usernames are invalid.");
        }
    }

    private CourseResponse convertProjectionToRes(CourseDetailProjection projection, BigDecimal globalDiscount) {
        if (projection.getOriginalPrice().compareTo(BigDecimal.ZERO) == 0) {
            var res = courseMapper.projectionToRes(projection);
            res.setDiscountedPercentage(BigDecimal.ZERO);
            res.setDiscountedPrice(BigDecimal.ZERO);
            return res;
        }

        var courseDiscountPercentage = projection.getDiscountedPercentage() == null
                ? BigDecimal.ZERO
                : projection.getDiscountedPercentage();
        var discountPercentage = globalDiscount.max(courseDiscountPercentage);
        var discountRate = discountPercentage
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        var discountedPrice = projection.getOriginalPrice()
                .multiply(BigDecimal.ONE.subtract(discountRate))
                .setScale(2, RoundingMode.HALF_UP);
        var res = courseMapper.projectionToRes(projection);
        res.setDiscountedPercentage(discountPercentage);
        res.setDiscountedPrice(discountedPrice);

        return res;
    }

    private BigDecimal getGlobalDiscountPercentage() {
        LocalDateTime now = LocalDateTime.now();

        var globalDiscountEntity = courseDiscountRepository.getGlobalActiveDiscount(now)
                .orElse(null);
        return globalDiscountEntity == null
                ? BigDecimal.ZERO
                : globalDiscountEntity.getDiscountPercentage();
    }
}
