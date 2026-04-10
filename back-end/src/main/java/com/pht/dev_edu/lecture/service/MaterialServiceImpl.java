package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.dto.TrackingEvent;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.lecture.dto.MaterialRequest;
import com.pht.dev_edu.lecture.dto.MaterialResponse;
import com.pht.dev_edu.lecture.repo.LectureMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class MaterialServiceImpl implements MaterialService {
    LectureMaterialRepository lectureMaterialRepository;

    LecturePermissionService lecturePermissionService;
    LectureService lectureService;
    FileService fileService;

    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public List<MaterialResponse> getMaterialsByLecture(Set<String> authorities, String actor, UUID lectureId) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, actor, lectureId);
        var materials = lectureMaterialRepository.findAllByLectureIdAndDeletedAtIsNull(lectureId);
        return List.of();
    }

    @Override
    @Transactional
    public MaterialResponse create(Set<String> authorities, String actor, MaterialRequest req) {
        lecturePermissionService.checkModifyPermissionByLecture(authorities, actor, req.getLectureId());
        validateMaterialObjectKey(actor, req.getFileObjectKey());
        return null;
    }

    @Override
    @Transactional
    public void delete(Set<String> authorities, String actor, UUID materialId) {
        var material = lectureMaterialRepository.findById(materialId)
                .orElseThrow(() -> new BadRequestException("Material not found."));
        lecturePermissionService.checkModifyPermissionByLecture(authorities, actor, material.getLectureId());

        if (material.getDeletedAt() != null) {
            log.warn("Material already deleted: {}", materialId);
            return;
        }

        material.setDeletedAt(LocalDateTime.now());
        lectureMaterialRepository.save(material);

        var tracking = TrackingEvent.builder()
                .username(actor)
                .aggregateId(materialId)
                .action(EventTrackingConstant.LECTURE_MATERIAL_DELETED)
                .details("Lecture material deleted with ID: " + materialId)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);
    }

    // Change valid content types
    private void validateMaterialObjectKey(String author, String objectKey) {
        var fileInfo = fileService.getFileInfo(author, objectKey);
        if (fileInfo == null || !fileInfo.getContentType().startsWith("video/")) {
            sendDeleteFileEvent(objectKey);

            log.error("Invalid video object key: {}", objectKey);
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
