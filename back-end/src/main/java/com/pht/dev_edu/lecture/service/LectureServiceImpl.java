package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.TrackingEvent;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.RedisUtil;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.mapper.LectureMapper;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return List.of();
    }

    @Override
    public LectureResponse getLecture(Set<String> authorities, String actor, UUID lectureId) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, actor, lectureId);
        var lecture = lectureRepository.findLectureDetailByIdAndUsername(lectureId, actor).orElseThrow(
                () -> new RuntimeException("Lecture not found or you don't have permission to view it")
        );
//        return lectureMapper.entityToResponse(lecture);
        return null;
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
        validateVideoObjectKey(actor, req.getVideoObjectKey());

//        if ()

        var newLecture = lectureMapper.reqToEntity(req);
        newLecture.setLectureOrder(nextOrder);
        newLecture.setCreatedBy(actor);
        lectureRepository.save(newLecture);

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

        validateVideoObjectKey(actor, req.getVideoObjectKey());
        sendDeleteFileEvent(existingLecture.getVideoObjectKey());

        var updatedLecture = lectureMapper.reqToEntity(req);
        updatedLecture.setId(existingLecture.getId());
        updatedLecture.setCreatedBy(existingLecture.getCreatedBy());
        updatedLecture.setUploadedAt(existingLecture.getUploadedAt());
        updatedLecture.setVideoObjectKey(req.getVideoObjectKey());
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

    private void validateVideoObjectKey(String author, String videoObjectKey) {
        var fileInfo = fileService.getFileInfo(author, videoObjectKey);
        if (fileInfo == null || !fileInfo.getContentType().startsWith("video/")) {
            sendDeleteFileEvent(videoObjectKey);

            log.error("Invalid video object key: {}", videoObjectKey);
            throw new BadRequestException("Invalid video file.");
        }
    }

    private void sendDeleteFileEvent(String videoObjectKey) {
        var deleteFileEvent = FileDeleteEvent.builder()
                .fullObjectKey(videoObjectKey)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.FILE_DELETE_TOPIC, deleteFileEvent);
    }
}
