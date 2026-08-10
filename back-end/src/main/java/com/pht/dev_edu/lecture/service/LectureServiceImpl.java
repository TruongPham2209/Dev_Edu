package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.assignment.service.AssignmentService;
import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.FileContentTypeUtils;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.mapper.LectureMapper;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;
import com.pht.dev_edu.lecture.repo.LectureMaterialRepository;
import com.pht.dev_edu.lecture.repo.LectureProgressRepository;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import com.pht.dev_edu.notification.dto.NotificationEvent;
import com.pht.dev_edu.notification.dto.NotificationTargetType;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.service.NotificationPersonalService;
import com.pht.dev_edu.tracking.dto.GetVideoDurationEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LectureServiceImpl implements LectureService {
    LectureRepository lectureRepository;
    CourseLecturerRepository courseLecturerRepository;
    LectureMaterialRepository lectureMaterialRepository;
    LectureProgressRepository lectureProgressRepository;
    LectureCommentRepository lectureCommentRepository;
    AssignmentRepository assignmentRepository;

    Executor executor;
    NotificationPersonalService notificationPersonalService;
    LecturePermissionService lecturePermissionService;
    AssignmentService assignmentService;
    FileService fileService;

    KafkaTemplate<String, Object> kafkaTemplate;
    LectureMapper lectureMapper;

    @Override
    public List<LectureResponse> getLecturesByCourse(Set<String> authorities, String actor, UUID courseId) {
        var canSeeDetail = authorities.contains(RoleEnum.ADMIN.name());

        if (!canSeeDetail && authorities.contains(RoleEnum.LECTURER.name())) {
            var id = CourseLecturerId.builder()
                    .courseId(courseId)
                    .lecturerUsername(actor)
                    .build();
            canSeeDetail = courseLecturerRepository.existsById(id);
        }

        var lectures = canSeeDetail
                ? lectureRepository.findLectureDetailsByCourseId(courseId)
                : lectureRepository.findLectureDetailsByCourseIdAndUsername(courseId, actor);
        return lectures.stream()
                .map(lectureMapper::projectionToResponse)
                .toList();
    }

    @Override
    public LectureResponse getLecture(Set<String> authorities, String actor, UUID lectureId) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, actor, lectureId);
        var lecture = lectureRepository.findLectureDetailByIdAndUsername(lectureId, actor).orElseThrow(
                () -> new RuntimeException("Lecture not found or you don't have permission to view it")
        );

        if (authorities.contains(RoleEnum.STUDENT.name()) && !lectureRepository.hasCompletedAllPreviousLectures(lecture.getCourseId(), lecture.getLectureOrder(), actor)) {
            throw new BadRequestException("You must complete all previous lectures to access this lecture.");
        }

        return lectureMapper.projectionToResponse(lecture);
    }

    @Override
    public LectureEntity getLectureById(UUID lectureId) {
        return RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_PREFIX + lectureId,
                LectureEntity.class,
                () -> lectureRepository.findById(lectureId),
                RedisDurationConstant.LECTURE_DATA_DURATION
        );
    }

    @Override
    @Transactional
    public LectureResponse createLecture(Set<String> authorities, String actor, LectureRequest req) {
        lecturePermissionService.checkModifyPermissionByCourse(authorities, actor, req.getCourseId());
        var nextOrder = lectureRepository.getMaxOrderByCourseId(req.getCourseId()) + 1;
        if (req.getVideoObjectKey() != null) {
            validateVideoObjectKey(actor, req.getVideoObjectKey());
        }

        var newLecture = lectureMapper.reqToEntity(req);
        newLecture.setLectureOrder(nextOrder);
        newLecture.setCreatedBy(actor);
        if (req.getVideoObjectKey() == null) {
            newLecture.setDurationInSeconds(0);
        }

        lectureRepository.save(newLecture);
        sendGetDurationEvent(req.getVideoObjectKey(), newLecture.getId());

        TransactionUtils.runAfterCommitAsync(() -> {
            Map<NotificationTargetType, String> targetData = new HashMap<>();
            targetData.put(NotificationTargetType.COURSE, newLecture.getCourseId().toString());
            targetData.put(NotificationTargetType.LECTURE, newLecture.getId().toString());
            PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                    .event(NotificationEvent.COURSE_NEW_LECTURE)
                    .targetData(targetData)
                    .content(newLecture.getTitle())
                    .build();
            notificationPersonalService.publishNotification(event);
        }, executor);

        return lectureMapper.entityToResponse(newLecture);
    }

    @Override
    @Transactional
    public LectureResponse updateLecture(Set<String> authorities, String actor, LectureRequest req) {
        lecturePermissionService.checkModifyPermissionByCourse(authorities, actor, req.getCourseId());
        var existingLecture = getLectureById(req.getId());
        if (existingLecture == null) {
            log.error("Lecture with id {} not found for update", req.getId());
            throw new BadRequestException("Lecture not found.");
        }

        if (existingLecture.getDeletedAt() != null) {
            log.warn("Lecture with id {} is deleted and cannot be updated", req.getId());
            throw new BadRequestException("Lecture not found.");
        }

        existingLecture.setTitle(req.getTitle());
        existingLecture.setSummary(req.getSummary());
        existingLecture.setContent(req.getContent());

        lectureRepository.save(existingLecture);

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .username(actor)
                    .aggregateId(existingLecture.getId())
                    .action(EventTrackingConstant.LECTURE_UPDATED)
                    .details("Lecture updated with id: " + existingLecture.getId())
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);

        RedisUtils.invalidateCache(RedisPrefixConstant.LECTURE_PREFIX + existingLecture.getId());
        return lectureMapper.entityToResponse(existingLecture);
    }

    @Override
    @Transactional
    public void deleteLecture(Set<String> authorities, String actor, UUID lectureId) {
        lecturePermissionService.checkModifyPermissionByLecture(authorities, actor, lectureId);
        var existingLecture = getLectureById(lectureId);
        if (existingLecture == null) {
            log.error("Lecture with id {} not found for deletion", lectureId);
            throw new BadRequestException("Lecture not found.");
        }

        if (existingLecture.getDeletedAt() != null) {
            log.warn("Lecture with id {} is already deleted", lectureId);
            return;
        }

        existingLecture.setDeletedAt(java.time.LocalDateTime.now());
        lectureRepository.save(existingLecture);

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .username(actor)
                    .aggregateId(lectureId)
                    .action(EventTrackingConstant.LECTURE_DELETED)
                    .details("Lecture deleted with id: " + lectureId)
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);

        RedisUtils.invalidateCache(RedisPrefixConstant.LECTURE_PREFIX + lectureId);
    }

    @Override
    @Transactional
    public void deleteById(UUID lectureId) {
        // lecture_material (*) -> lecture_progress -> lecture_comment -> assignment
        List<String> objectKeys = new ArrayList<>();
        var lecture = getLectureById(lectureId);
        if (lecture != null) {
            lectureRepository.delete(lecture);
            objectKeys.add(lecture.getVideoObjectKey());
        }

        var materialObjectKeys = lectureMaterialRepository.deleteMaterialsByLectureIdThenReturnObjectKey(lectureId);
        objectKeys.addAll(materialObjectKeys);

        lectureProgressRepository.deleteByLectureId(lectureId);
        lectureCommentRepository.deleteByLectureId(lectureId);

        var assignmentIds = assignmentRepository.findIdsByLectureId(lectureId);
        assignmentService.deleteByIds(assignmentIds);

        TransactionUtils.runAfterCommitAsync(
                () -> objectKeys.forEach(KafkaUtils::sendDeleteFileEvent), executor
        );
    }

    private void validateVideoObjectKey(String author, String videoObjectKey) {
        var fileInfo = fileService.getFileInfo(author, videoObjectKey);
        if (fileInfo == null) {
            KafkaUtils.sendDeleteFileEvent(videoObjectKey);

            log.error("Invalid video object key: {}", videoObjectKey);
            throw new BadRequestException("Invalid video file.");
        }

        boolean isVideoContentType = FileContentTypeUtils.isValidContentType(fileInfo.getContentType(), FileContentTypeUtils.FileType.VIDEO);
        if (!isVideoContentType) {
            KafkaUtils.sendDeleteFileEvent(videoObjectKey);

            log.error("Invalid video content type for object key {}: {}", videoObjectKey, fileInfo.getContentType());
            throw new BadRequestException("Invalid video file.");
        }
    }

    private void sendGetDurationEvent(String videoObjectKey, UUID lectureId) {
        if (!StringUtils.hasText(videoObjectKey)) {
            return;
        }

        TransactionUtils.runAfterCommitAsync(() -> {
            var getDurationEvent = GetVideoDurationEvent.builder()
                    .objectKey(videoObjectKey)
                    .entityId(lectureId)
                    .videoType(GetVideoDurationEvent.VideoType.LECTURE)
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.VIDEO_DURATION_EVENT_TOPIC, getDurationEvent);
        }, executor);
    }
}
