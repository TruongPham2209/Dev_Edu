package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.FileContentTypeUtil;
import com.pht.dev_edu.common.util.KafkaUtil;
import com.pht.dev_edu.common.util.RedisUtil;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.mapper.LectureMapper;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import com.pht.dev_edu.tracking.dto.GetVideoDurationEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LectureServiceImpl implements LectureService {
    LectureRepository lectureRepository;

    LecturePermissionService lecturePermissionService;
    FileService fileService;

    LectureMapper lectureMapper;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public List<LectureResponse> getLecturesByCourse(Set<String> authorities, String actor, UUID courseId) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, actor, courseId);
        var lectures = lectureRepository.findLectureDetailsByCourseIdAndUsername(courseId, actor);
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
        return lectureMapper.projectionToResponse(lecture);
    }

    @Override
    public LectureEntity getLectureById(UUID lectureId) {
        return RedisUtil.getDataFromCacheOrDb(
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

        var updatedLecture = lectureMapper.reqToEntity(req);
        updatedLecture.setId(existingLecture.getId());
        updatedLecture.setCreatedBy(existingLecture.getCreatedBy());
        updatedLecture.setUploadedAt(existingLecture.getUploadedAt());
        updatedLecture.setVideoObjectKey(existingLecture.getVideoObjectKey());

        lectureRepository.save(updatedLecture);

        var tracking = TrackingEvent.builder()
                .username(actor)
                .aggregateId(existingLecture.getId())
                .action(EventTrackingConstant.LECTURE_UPDATED)
                .details("Lecture updated with id: " + existingLecture.getId())
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);

        RedisUtil.invalidateCache(RedisPrefixConstant.LECTURE_PREFIX + existingLecture.getId());
        return lectureMapper.entityToResponse(updatedLecture);
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

        var tracking = TrackingEvent.builder()
                .username(actor)
                .aggregateId(lectureId)
                .action(EventTrackingConstant.LECTURE_DELETED)
                .details("Lecture deleted with id: " + lectureId)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);

        RedisUtil.invalidateCache(RedisPrefixConstant.LECTURE_PREFIX + lectureId);
    }

    @Override
    public void deleteById(UUID lectureId) {

    }

    private void validateVideoObjectKey(String author, String videoObjectKey) {
        var fileInfo = fileService.getFileInfo(author, videoObjectKey);
        if (fileInfo == null) {
            KafkaUtil.sendDeleteFileEvent(videoObjectKey);

            log.error("Invalid video object key: {}", videoObjectKey);
            throw new BadRequestException("Invalid video file.");
        }

        boolean isVideoContentType = FileContentTypeUtil.isValidContentType(fileInfo.getContentType(), FileContentTypeUtil.FileType.VIDEO);
        if (!isVideoContentType) {
            KafkaUtil.sendDeleteFileEvent(videoObjectKey);

            log.error("Invalid video content type for object key {}: {}", videoObjectKey, fileInfo.getContentType());
            throw new BadRequestException("Invalid video file.");
        }
    }

    private void sendGetDurationEvent(String videoObjectKey, UUID lectureId) {
        if (!StringUtils.hasText(videoObjectKey)) {
            return;
        }

        var getDurationEvent = GetVideoDurationEvent.builder()
                .objectKey(videoObjectKey)
                .entityId(lectureId)
                .videoType(GetVideoDurationEvent.VideoType.LECTURE)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.VIDEO_DURATION_EVENT_TOPIC, getDurationEvent);
    }
}
